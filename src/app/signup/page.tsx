import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { authConfigured, getUser } from "@/lib/auth-server";
export const metadata = { title: "Create an account · FirmwareWatch" };
export default async function Signup({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  if (await getUser()) redirect("/dashboard");
  return (
    <AuthForm
      mode="signup"
      configured={authConfigured()}
      initialEmail={typeof email === "string" ? email.slice(0, 254) : ""}
    />
  );
}
