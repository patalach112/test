import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, ArrowRight, GitBranch } from "lucide-react";
import { getUser } from "@/lib/auth-server";
import { Brand } from "@/components/firmwarewatch/brand";
import { AccountMenu } from "@/components/auth/account-menu";
export const metadata = { title: "Dashboard · FirmwareWatch" };
export default async function Dashboard() {
  const user = await getUser();
  if (!user) redirect("/login");
  return (
    <div className="fw-dashboard">
      <header>
        <Brand />
        <AccountMenu />
      </header>
      <div className="fw-dashboard-layout">
        <aside>
          <strong>
            <GitBranch size={18} />
            {user.username}
          </strong>
          <h3>Explore repositories</h3>
          <Link href="/patalach112/test">
            <BookOpen size={16} />
            patalach112 / test
          </Link>
          <p>
            This public repository is available to explore. Creating and hosting
            repositories is not available yet.
          </p>
        </aside>
        <main>
          <span className="fw-section-label">YOUR WORKSPACE</span>
          <h1>Welcome, {user.username}.</h1>
          <p>
            You&apos;re signed in to FirmwareWatch. Your account is stored on
            this server.
          </p>
          <section>
            <BookOpen size={28} />
            <h2>Start exploring.</h2>
            <p>
              Open the repository to browse live source files and read the
              documentation.
            </p>
            <Link className="button green" href="/patalach112/test">
              Open repository
              <ArrowRight size={15} />
            </Link>
          </section>
        </main>
      </div>
    </div>
  );
}
