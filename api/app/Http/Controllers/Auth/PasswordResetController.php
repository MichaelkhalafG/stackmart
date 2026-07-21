<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Password reset (routes/auth.php) — forgot / reset via Laravel's Password broker
 * and the framework `ResetPassword` notification (mail = log driver in dev).
 *
 * Thin by design (Planning/09_Backend_Architecture.md). The broker uses the existing
 * `password_reset_tokens` table (no migration added). Shapes are the frozen contract
 * (Planning/12_API_Specification.md §Auth).
 */
class PasswordResetController extends Controller
{
    /**
     * POST /api/auth/forgot-password — email a reset link.
     *
     * The broker is always invoked, but the response is ALWAYS the same generic
     * message regardless of whether the address exists, so registered emails cannot
     * be enumerated through this endpoint.
     */
    public function forgot(ForgotPasswordRequest $request): JsonResponse
    {
        // Headless API + SPA: the reset link must target the FRONTEND page (which then
        // POSTs token+email+password back to /auth/reset-password), not a Laravel route.
        // Without this the framework notification calls the nonexistent `password.reset`
        // named route and throws — which would also leak "user exists" via a 500.
        ResetPassword::createUrlUsing(function (object $notifiable, string $token): string {
            $base = rtrim((string) (config('payments.frontend_url') ?: config('app.url')), '/');

            return $base.'/reset-password?token='.$token
                .'&email='.urlencode($notifiable->getEmailForPasswordReset());
        });

        Password::sendResetLink($request->validated());

        return response()->json([
            'message' => 'If the email exists, a reset link was sent.',
        ]);
    }

    /**
     * POST /api/auth/reset-password — set a new password from a valid token.
     *
     * On success the password is re-hashed (model `password => 'hashed'` cast) and the
     * remember-token rotated (invalidating other sessions), then `PasswordReset` fires.
     * An invalid or expired token (or unknown email) → 422.
     */
    public function reset(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->validated(),
            function ($user, string $password): void {
                $user->forceFill([
                    'password' => $password,
                    'remember_token' => Str::random(60),
                ])->save();

                // Revoke EVERY access token. Rotating remember_token alone means nothing to Bearer
                // auth, so before this a stolen token survived the reset — i.e. the one action a
                // compromised user takes to lock an attacker out did not lock them out. Unlike the
                // change-password path there is no "current" token to spare: this request is
                // unauthenticated, and the person resetting is presumed to be locked out anyway.
                $user->tokens()->delete();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return response()->json([
            'message' => 'Password has been reset.',
        ]);
    }
}
