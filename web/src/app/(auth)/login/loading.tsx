import { AuthShellSkeleton } from "@/components/auth/AuthShellSkeleton";

/** `/login` loading — mirrors the `AuthShell` split. Two fields: email + password. */
export default function LoginLoading() {
  return <AuthShellSkeleton fields={2} />;
}
