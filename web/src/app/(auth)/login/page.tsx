import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Sign in to MDN STACKMART"
      subtitle="Access your purchases and license keys."
      footer={
        <>
          New to MDN STACKMART?{" "}
          <Link href="/register" className="font-medium text-accent hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm />
      <div className="mt-4 text-center">
        <Link href="/forgot-password" className="text-sm text-accent hover:underline">
          Forgot your password?
        </Link>
      </div>
    </AuthShell>
  );
}
