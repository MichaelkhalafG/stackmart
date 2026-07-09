/**
 * repoProvider(url) — PURE hostname → provider-key map (06_UI_System.md §3 / 13_Component_Map.md).
 * No side effects, no network, no favicon fetch, no Git provider API. Extending later = add one line.
 *
 *   github.com    → "github"
 *   gitlab.com    → "gitlab"
 *   bitbucket.org → "bitbucket"
 *   anything else (self-hosted / unknown / parse error) → "generic"
 */
export type RepoProvider = "github" | "gitlab" | "bitbucket" | "generic";

export function repoProvider(url: string): RepoProvider {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host === "github.com") return "github";
    if (host === "gitlab.com") return "gitlab";
    if (host === "bitbucket.org") return "bitbucket";
    return "generic";
  } catch {
    return "generic";
  }
}
