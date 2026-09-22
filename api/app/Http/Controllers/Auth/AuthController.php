<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * Sanctum personal-access-token auth (routes/auth.php) — register/login/logout/me.
 *
 * Thin by design (Planning/09_Backend_Architecture.md): validate via Form Request,
 * touch Eloquent, shape the JSON inline. No UserResource — the user block is
 * serialized here (no API Resource). Response shapes are the frozen
 * contract (Planning/12_API_Specification.md §Auth) and must not drift.
 *
 * Token issuance uses Sanctum's `createToken()` / `currentAccessToken()`, which come
 * from the `Laravel\Sanctum\HasApiTokens` trait on the User model.
 */
class AuthController extends Controller
{
    /**
     * POST /api/auth/register — create a buyer account and issue a token.
     *
     * Every field is passed explicitly from validated input — never `$request->all()`.
     *
     * `is_admin` is NOT mass-assignable (User::$fillable), so it cannot arrive from the request no
     * matter what the body contains. It is instead assigned directly on the instance below: a
     * property set is not mass assignment, so this stays explicit and deterministic rather than
     * leaning on the column default, which would leave the returned model reporting null until it
     * was reloaded. A registration can only ever produce a buyer.
     *
     * The password is hashed by the model's `password => 'hashed'` cast.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = new User([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => $request->validated('password'),
        ]);

        $user->is_admin = false;
        $user->save();

        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'data' => ['token' => $token, 'user' => $this->userPayload($user)],
        ], 201);
    }

    /**
     * POST /api/auth/login — verify credentials and issue a token.
     *
     * A wrong email OR password yields the same 422 validation error, so the
     * response never reveals which of the two was incorrect.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->validated('email'))->first();

        if (! $user || ! Hash::check($request->validated('password'), $user->password)) {
            throw ValidationException::withMessages([
                'email' => [__('auth.failed')],
            ]);
        }

        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'data' => ['token' => $token, 'user' => $this->userPayload($user)],
        ]);
    }

    /**
     * POST /api/auth/logout (Bearer) — revoke ONLY the token on the current request,
     * leaving the user's other sessions/tokens intact.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    /**
     * GET /api/auth/me (Bearer) — the authenticated user block.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json(['data' => $this->userPayload($request->user())]);
    }

    /**
     * The frozen user block returned by register/login/me
     * (Planning/12_API_Specification.md §Auth): { id, name, email, is_admin }.
     *
     * @return array{id: int, name: string, email: string, is_admin: bool}
     */
    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            // Cast at the boundary, matching ProfileController: the contract says boolean, and it
            // should never be possible for this key to serialize as null.
            'is_admin' => (bool) $user->is_admin,
        ];
    }
}
