import { AuthForm } from "@/components/auth/auth-form";
import { authConfigured } from "@/lib/auth-server";
export const dynamic = "force-dynamic";
export const metadata = { title: "Reset password · Forge" };
export default function ResetPassword() {
  return <AuthForm mode="reset" configured={authConfigured()} />;
}
