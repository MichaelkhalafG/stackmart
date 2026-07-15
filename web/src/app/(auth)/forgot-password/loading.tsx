import { AuthShellSkeleton } from "@/components/auth/AuthShellSkeleton";

/** `/forgot-password` loading — mirrors the `AuthShell` split. One field: email. */
export default function ForgotPasswordLoading() {
  return <AuthShellSkeleton fields={1} />;
}
