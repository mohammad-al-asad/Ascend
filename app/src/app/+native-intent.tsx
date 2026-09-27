export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  if (path.includes("oauthredirect")) return "/auth/signin";
  return path;
}
