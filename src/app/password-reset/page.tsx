import { AuthForm } from "@/components/auth/auth-form";
import { authConfigured } from "@/lib/auth-server";
export const dynamic = "force-dynamic";
export const metadata = { title: "Reset password · FirmwareWatch" };
export default function ResetPassword() {
  return (
    <AuthForm
      mode="reset"
      configured={authConfigured()}
      recoveryAvailable={Boolean(process.env.AUTH_API_URL)}
    />
  );
}
