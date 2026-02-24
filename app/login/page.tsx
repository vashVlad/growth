import type { Metadata } from "next";
import AuthForm from "@/features/auth/components/auth-form";

export const metadata: Metadata = {
  title: "Sign in • Growth",
  description: "Sign in to your account.",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
