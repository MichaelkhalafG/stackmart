<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\UpdatePasswordRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * The signed-in user's own profile (routes/auth.php) — Sanctum Bearer, CURRENT USER ONLY.
 *
 * Both endpoints act on `$request->user()` and never accept a user id from the request, so there is
 * no way to address another account. Responses reuse the frozen §Auth user block
 * ({id, name, email, is_admin}) so the frontend can drop the result straight into its auth store.
 */
class ProfileController extends Controller
{
    /**
     * PATCH /api/auth/profile — update the display name.
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $user->name = $request->validated()['name'];
        $user->save();

        return response()->json([
            'data' => $this->userPayload($user),
            'message' => 'Profile updated.',
        ]);
    }

    /**
     * PATCH /api/auth/password — change the password.
     *
     * The CURRENT password must be supplied and correct: a valid-but-stolen session alone must not
     * be enough to rotate the password and lock the real owner out. A wrong current password is a
     * 422 keyed on `current_password` (no user enumeration concerns — they're already signed in).
     *
     * On success every OTHER access token is revoked, so any session that was riding on the old
     * password is cut off. The token making THIS request survives, so the user isn't logged out of
     * the device they just changed it on.
     */
    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $validated = $request->validated();

        if (! Hash::check($validated['current_password'], (string) $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['That password is incorrect.'],
            ]);
        }

        // The model's `password => hashed` cast re-hashes on assignment.
        $user->password = $validated['password'];
        $user->save();

        // Cut off every other session; keep the one that made this change.
        $currentTokenId = $request->user()->currentAccessToken()?->getKey();
        $user->tokens()
            ->when($currentTokenId !== null, fn ($query) => $query->where('id', '!=', $currentTokenId))
            ->delete();

        return response()->json([
            'message' => 'Password updated. Other devices have been signed out.',
        ]);
    }

    /**
     * The frozen §Auth user block (12_API_Specification.md) — never leaks the password hash.
     *
     * @return array<string, mixed>
     */
    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'is_admin' => (bool) $user->is_admin,
        ];
    }
}
