import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { authConfigured, getUser } from "@/lib/auth-server";
export const metadata = { title: "Sign in · FirmwareWatch" };
export default async function Login() {
  if (await getUser()) redirect("/dashboard");
  return <AuthForm mode="login" configured={authConfigured()} />;
}
