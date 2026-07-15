import { AuthShellSkeleton } from "@/components/auth/AuthShellSkeleton";

/** Auth-group loading fallback — mirrors the full-viewport `AuthShell` split. */
export default function AuthLoading() {
  return <AuthShellSkeleton fields={2} />;
}
