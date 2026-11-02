import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { authConfigured, getUser } from "@/lib/auth-server";
export const metadata = { title: "Create an account · Forge" };
export default async function Signup() {
  if (await getUser()) redirect("/");
  return <AuthForm mode="signup" configured={authConfigured()} />;
}
