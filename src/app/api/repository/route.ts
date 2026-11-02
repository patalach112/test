import { NextRequest, NextResponse } from "next/server";

// Read-only public repository data. No GitHub access token is needed or exposed.
export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path") || "";
  if (
    path.length > 1024 ||
    path.split("/").some((p) => p === ".." || p === ".") ||
    path.startsWith("/")
  )
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  const owner = "patalach112";
  const repo = "test";
  const endpoint = `https://api.github.com/repos/${owner}/${repo}/contents/${path.split("/").map(encodeURIComponent).join("/")}`;
  try {
    const response = await fetch(endpoint, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "Forge-Workspace",
      },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok)
      return NextResponse.json(
        {
          error:
            response.status === 403
              ? "GitHub API rate limit reached. Please try again later."
              : "Unable to load repository content.",
        },
        { status: response.status === 404 ? 404 : 502 },
      );
    const result = await response.json();
    if (Array.isArray(result))
      return NextResponse.json({
        items: result
          .filter((i) => i.type === "file" || i.type === "dir")
          .map((i) => ({
            name: i.name,
            path: i.path,
            contentType: i.type === "dir" ? "directory" : "file",
          }))
          .sort(
            (a, b) =>
              a.contentType.localeCompare(b.contentType) ||
              a.name.localeCompare(b.name),
          ),
      });
    if (
      result.type === "file" &&
      result.encoding === "base64" &&
      result.size <= 500000
    )
      return NextResponse.json({
        path,
        content: Buffer.from(result.content, "base64").toString("utf8"),
      });
    return NextResponse.json(
      { error: "This file is too large or cannot be displayed as text." },
      { status: 422 },
    );
  } catch {
    return NextResponse.json(
      { error: "Repository service is unavailable." },
      { status: 502 },
    );
  }
}
