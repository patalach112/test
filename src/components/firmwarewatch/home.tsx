"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Code,
  GitBranch,
  GitPullRequest,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
  X,
  BookOpen,
  CircleDot,
  LockKeyhole,
  CheckCircle2,
} from "lucide-react";
import { AccountMenu } from "@/components/auth/account-menu";
import { Brand } from "./brand";

const features = [
  {
    icon: Code,
    title: "Code",
    text: "A familiar home for every project.",
    detail:
      "Explore files, read documentation, and navigate your source code in a workspace built for developers.",
    href: "/patalach112/test",
    cta: "Explore a repository",
  },
  {
    icon: GitPullRequest,
    title: "Collaborate",
    text: "Great software starts with a conversation.",
    detail:
      "Keep the context close to the code. Explore the repository interface for issues, pull requests, and project activity.",
    href: "/patalach112/test",
    cta: "Explore the workspace",
  },
  {
    icon: ShieldCheck,
    title: "Secure",
    text: "Your workspace. Your infrastructure.",
    detail:
      "Independent accounts, hashed passwords, and server-side sessions. Host on your own machine with your own domain.",
    href: "/signup",
    cta: "Create your account",
  },
];

export function Homepage() {
  const [nav, setNav] = useState("");
  const [mobile, setMobile] = useState(false);
  const [email, setEmail] = useState("");
  const [active, setActive] = useState(0);
  const [query, setQuery] = useState("");
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNav("");
        setMobile(false);
      }
      if (
        event.key === "/" &&
        !(event.target instanceof HTMLInputElement) &&
        !(event.target instanceof HTMLTextAreaElement)
      ) {
        event.preventDefault();
        setNav("search");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <div className="fw-home">
      <header className="fw-header">
        <Brand />
        <nav
          className={mobile ? "fw-nav open" : "fw-nav"}
          aria-label="Main navigation"
        >
          {["Platform", "Solutions", "Resources"].map((label) => (
            <div className="fw-nav-item" key={label}>
              <button
                onClick={() => setNav(nav === label ? "" : label)}
                aria-expanded={nav === label}
              >
                {label}
                <ChevronDown size={13} />
              </button>
              {nav === label && (
                <div className="fw-megamenu">
                  <span className="fw-menu-caption">
                    {label === "Platform"
                      ? "BUILD ON YOUR TERMS"
                      : label === "Solutions"
                        ? "A HOME FOR YOUR WORK"
                        : "EXPLORE FIRMWAREWATCH"}
                  </span>
                  {(label === "Platform"
                    ? [
                        {
                          title: "Repositories",
                          detail: "Explore code and documentation",
                          icon: BookOpen,
                          href: "/patalach112/test",
                        },
                        {
                          title: "Your workspace",
                          detail: "All your development in one place",
                          icon: Code,
                          href: "/dashboard",
                        },
                        {
                          title: "Accounts & security",
                          detail: "Your identity, on your server",
                          icon: ShieldCheck,
                          href: "/signup",
                        },
                      ]
                    : label === "Solutions"
                      ? [
                          {
                            title: "For developers",
                            detail: "Start with a familiar workflow",
                            icon: Terminal,
                            href: "#platform",
                          },
                          {
                            title: "Self-hosted",
                            detail: "Your domain. Your infrastructure.",
                            icon: LockKeyhole,
                            href: "#self-hosted",
                          },
                        ]
                      : [
                          {
                            title: "Explore the repository",
                            detail: "Read the source and documentation",
                            icon: BookOpen,
                            href: "/patalach112/test",
                          },
                          {
                            title: "Git documentation ↗",
                            detail: "Learn the tools behind your code",
                            icon: GitBranch,
                            href: "https://docs.github.com/en/get-started/using-git",
                          },
                        ]
                  ).map(({ title, detail, icon: Icon, href }) => (
                    <Link
                      key={title}
                      href={href}
                      onClick={() => {
                        setNav("");
                        setMobile(false);
                      }}
                    >
                      <Icon size={21} />
                      <span>
                        <strong>{title}</strong>
                        <small>{detail}</small>
                      </span>
                      <ArrowRight size={15} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <a href="#platform">Open Source</a>
          <a href="#self-hosted">Self-hosted</a>
        </nav>
        <div className="fw-header-right">
          <button
            className="fw-search-button"
            aria-label="Search FirmwareWatch"
            onClick={() => setNav(nav === "search" ? "" : "search")}
          >
            <Search size={17} />
            <span>Search or jump to…</span>
            <kbd>/</kbd>
          </button>
          <AccountMenu />
          <button
            className="fw-mobile-button"
            aria-label={mobile ? "Close navigation" : "Open navigation"}
            onClick={() => setMobile(!mobile)}
          >
            {mobile ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {nav === "search" && (
          <div className="fw-search-panel">
            <div>
              <Search size={18} />
              <input
                aria-label="Search repositories"
                placeholder="Search repositories…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              <button aria-label="Close search" onClick={() => setNav("")}>
                <X size={18} />
              </button>
            </div>
            {!query || "patalach112/test".includes(query.toLowerCase()) ? (
              <Link href="/patalach112/test">
                <BookOpen size={16} />
                patalach112 / test
                <ArrowRight size={16} />
              </Link>
            ) : (
              <p>No matching repositories.</p>
            )}
          </div>
        )}
      </header>
      {nav && (
        <button
          className="fw-dismiss"
          aria-label="Dismiss menu"
          onClick={() => setNav("")}
        />
      )}
      <main>
        <section className="fw-hero">
          <div className="fw-hero-glow" />
          <div className="fw-hero-content">
            <a className="fw-announcement" href="#platform">
              <span className="fw-new">NEW</span> Your next build starts here{" "}
              <ArrowRight size={16} />
            </a>
            <h1>
              Software still starts
              <br />
              <span>with you.</span>
            </h1>
            <p>
              A home for your code. A place to build together.
              <br className="fw-desktop-break" /> The developer experience you
              know, on your own terms.
            </p>
            <form className="fw-hero-signup" action="/signup">
              <label className="sr-only" htmlFor="hero-email">
                Your email address
              </label>
              <input
                id="hero-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">
                Sign up for FirmwareWatch
                <ArrowRight size={17} />
              </button>
            </form>
            <Link className="fw-secondary-cta" href="/patalach112/test">
              Explore a repository
              <ArrowUpRight size={16} />
            </Link>
            <p className="fw-hero-note">
              Your code. Your community. Your server.
            </p>
          </div>
          <div className="fw-product-demo">
            <div className="fw-demo-top">
              <div className="fw-window-dots">
                <i />
                <i />
                <i />
              </div>
              <span>
                <LockKeyhole size={12} />
                firmwarewatch.com / patalach112 / test
              </span>
              <span className="fw-demo-branch">
                <GitBranch size={13} />
                master
              </span>
            </div>
            <div className="fw-demo-body">
              <aside className="fw-demo-files">
                <span>
                  <BookOpen size={14} />
                  test <span className="badge">Public</span>
                </span>
                {["Code", "Issues", "Pull requests"].map((t, i) => (
                  <button
                    key={t}
                    className={i === active ? "selected" : ""}
                    onClick={() => setActive(i)}
                  >
                    {i === 0 ? (
                      <Code size={16} />
                    ) : i === 1 ? (
                      <CircleDot size={16} />
                    ) : (
                      <GitPullRequest size={16} />
                    )}
                    <span>{t}</span>
                  </button>
                ))}
                <div className="fw-demo-tree">
                  <p>▾ &nbsp; src</p>
                  <p>　▾ &nbsp; app</p>
                  <p className="selected-file">　　 page.tsx</p>
                  <p>　　 layout.tsx</p>
                  <p>　▸ &nbsp; components</p>
                  <p>　▸ &nbsp; lib</p>
                  <p>　 README.md</p>
                  <p>　 package.json</p>
                </div>
              </aside>
              <div className="fw-demo-editor">
                {active === 0 ? (
                  <>
                    <div className="fw-editor-title">
                      <Code size={14} />
                      src / app / page.tsx<span>TypeScript</span>
                    </div>
                    <div className="fw-code-lines">
                      <p>
                        <i>1</i>
                        <span className="syntax-purple">import</span> {"{ "}
                        <span className="syntax-blue">possibility</span>
                        {" } "}
                        <span className="syntax-purple">from</span>{" "}
                        <span className="syntax-green">
                          &apos;your-next-idea&apos;
                        </span>
                        ;
                      </p>
                      <p>
                        <i>2</i>
                      </p>
                      <p>
                        <i>3</i>
                        <span className="syntax-purple">
                          export default function
                        </span>{" "}
                        <span className="syntax-blue">Home</span>() {"{"}
                      </p>
                      <p>
                        <i>4</i>　<span className="syntax-purple">return</span>{" "}
                        (
                      </p>
                      <p>
                        <i>5</i>　　&lt;
                        <span className="syntax-green">main</span>&gt;
                      </p>
                      <p>
                        <i>6</i>　　　&lt;
                        <span className="syntax-green">h1</span>&gt;Let&apos;s
                        build something great.&lt;/
                        <span className="syntax-green">h1</span>&gt;
                      </p>
                      <p>
                        <i>7</i>　　　&lt;
                        <span className="syntax-green">p</span>&gt;It starts
                        with a commit.&lt;/
                        <span className="syntax-green">p</span>&gt;
                      </p>
                      <p>
                        <i>8</i>　　&lt;/
                        <span className="syntax-green">main</span>&gt;
                      </p>
                      <p>
                        <i>9</i>　);
                      </p>
                      <p>
                        <i>10</i>
                        {"}"}
                      </p>
                    </div>
                    <div className="fw-terminal">
                      <span>
                        <Terminal size={13} />
                        Terminal
                      </span>
                      <p>
                        <span className="syntax-green">❯</span> git push origin
                        master
                      </p>
                      <p className="syntax-muted">
                        Your next chapter starts with a single commit.
                      </p>
                      <p className="syntax-green">
                        <Check size={14} />
                        Ready to build.
                      </p>
                    </div>
                  </>
                ) : active === 1 ? (
                  <div className="fw-demo-state">
                    <CircleDot size={36} />
                    <h3>Every idea deserves a starting point.</h3>
                    <p>
                      Bring your ideas, questions, and next steps closer to your
                      code.
                    </p>
                    <Link href="/patalach112/test">
                      Explore the repository
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                ) : (
                  <div className="fw-demo-state">
                    <GitPullRequest size={36} />
                    <h3>Better, together.</h3>
                    <p>
                      Explore a familiar workspace for reviewing changes and
                      sharing your work.
                    </p>
                    <Link href="/patalach112/test">
                      Explore the workspace
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                )}
              </div>
            </div>
            <div className="fw-demo-status">
              <span>
                <GitBranch size={12} />
                master
              </span>
              <span>
                <CheckCircle2 size={12} />
                Illustrative workspace preview
              </span>
              <span>UTF-8 &nbsp; TypeScript</span>
            </div>
          </div>
        </section>
        <section className="fw-platform" id="platform">
          <div className="fw-section-label">
            <Sparkles size={17} />
            THE DEVELOPER PLATFORM
          </div>
          <h2>
            Whatever you&apos;re building,
            <br />
            <span>make it your own.</span>
          </h2>
          <p className="fw-section-description">
            From the first line of code to your next big idea.
            <br />A familiar foundation, without giving up control.
          </p>
          <div className="fw-feature-grid">
            {features.map(({ icon: Icon, title, text, detail, href, cta }) => (
              <article key={title}>
                <Icon size={24} />
                <span>{title}</span>
                <h3>{text}</h3>
                <p>{detail}</p>
                <Link href={href}>
                  {cta}
                  <ArrowRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        </section>
        <section className="fw-self-hosted" id="self-hosted">
          <div>
            <span className="fw-section-label">
              <ShieldCheck size={17} />
              BUILT FOR YOUR INFRASTRUCTURE
            </span>
            <h2>
              Your server.
              <br />
              Your rules.
            </h2>
            <p>
              FirmwareWatch runs on your own machine. Your accounts stay in your
              own database, and your domain connects through Cloudflare Tunnel.
            </p>
            <Link href="/signup">
              Make yourself at home
              <ArrowRight size={17} />
            </Link>
          </div>
          <div className="fw-infra-card">
            <div>
              <span className="fw-infra-node">
                <Terminal size={25} />
              </span>
              <p>
                localhost:3000<small>Your application</small>
              </p>
              <span className="fw-infra-line" />
              <span className="fw-infra-node cloud">
                <ShieldCheck size={25} />
              </span>
              <p>
                Cloudflare Tunnel<small>Encrypted connection</small>
              </p>
              <span className="fw-infra-line" />
              <span className="fw-infra-node globe">
                <GitBranch size={25} />
              </span>
              <p>
                firmwarewatch.com<small>Your home on the web</small>
              </p>
            </div>
          </div>
        </section>
        <section className="fw-final-cta">
          <GitBranch size={44} />
          <h2>
            Your next great idea
            <br />
            deserves a first commit.
          </h2>
          <p>Start building your own corner of the developer community.</p>
          <Link href="/signup">
            Sign up for FirmwareWatch
            <ArrowRight size={18} />
          </Link>
          <small>Independent workspace. Not affiliated with GitHub.</small>
        </section>
      </main>
      <footer className="fw-footer">
        <div>
          <Brand />
          <p>A home for your code, on your terms.</p>
          <span>© {new Date().getFullYear()} FirmwareWatch</span>
        </div>
        <div>
          <strong>Platform</strong>
          <Link href="/patalach112/test">Repositories</Link>
          <Link href="/dashboard">Dashboard</Link>
          <a href="#self-hosted">Self-hosted</a>
        </div>
        <div>
          <strong>Account</strong>
          <Link href="/signup">Create an account</Link>
          <Link href="/login">Sign in</Link>
          <Link href="/password-reset">Account recovery</Link>
        </div>
        <div>
          <strong>Resources</strong>
          <a href="https://docs.github.com/en/get-started/using-git">
            Learn Git ↗
          </a>
          <a href="https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/">
            Cloudflare Tunnel ↗
          </a>
          <a href="https://github.com/patalach112/test">Source on GitHub ↗</a>
        </div>
      </footer>
    </div>
  );
}
