import { AuthShellSkeleton } from "@/components/auth/AuthShellSkeleton";

/** `/register` loading — mirrors the `AuthShell` split. Four fields. */
export default function RegisterLoading() {
  return <AuthShellSkeleton fields={4} />;
}
