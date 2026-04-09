type FetchImpl = typeof fetch;

interface FetchArtifactOptions<T> {
  liveOrigin?: string;
  basePath?: string;
  fetchImpl?: FetchImpl;
  livePath: string;
  staticPath: string;
  liveLabel: string;
  staticLabel: string;
  validate: (payload: unknown, label: string) => T;
}

function normalizeBasePath(basePath: string) {
  return basePath.endsWith("/") ? basePath : `${basePath}/`;
}

function normalizeLiveOrigin(liveOrigin?: string | null) {
  const trimmed = liveOrigin?.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.replace(/\/+$/, "");
}

function staticArtifactUrl(relativePath: string, basePath = import.meta.env.BASE_URL) {
  const normalizedBase = normalizeBasePath(basePath);
  const normalizedPath = relativePath.startsWith("/") ? relativePath.slice(1) : relativePath;
  return `${normalizedBase}${normalizedPath}`;
}

function liveArtifactUrl(livePath: string, liveOrigin: string) {
  const normalizedPath = livePath.startsWith("/") ? livePath : `/${livePath}`;
  return `${liveOrigin}${normalizedPath}`;
}

async function fetchJson<T>(url: string, label: string, fetchImpl: FetchImpl): Promise<T> {
  const response = await fetchImpl(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load ${label}: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function fetchArtifactWithStaticFallback<T>({
  liveOrigin = import.meta.env.VITE_LIVE_FEED_ORIGIN,
  basePath = import.meta.env.BASE_URL,
  fetchImpl = fetch,
  livePath,
  staticPath,
  liveLabel,
  staticLabel,
  validate,
}: FetchArtifactOptions<T>): Promise<T> {
  const normalizedLiveOrigin = normalizeLiveOrigin(liveOrigin);

  if (!normalizedLiveOrigin) {
    return validate(await fetchJson(staticArtifactUrl(staticPath, basePath), staticLabel, fetchImpl), staticLabel);
  }

  try {
    return validate(
      await fetchJson(liveArtifactUrl(livePath, normalizedLiveOrigin), liveLabel, fetchImpl),
      liveLabel
    );
  } catch (liveError) {
    try {
      return validate(
        await fetchJson(staticArtifactUrl(staticPath, basePath), staticLabel, fetchImpl),
        staticLabel
      );
    } catch (staticError) {
      throw new Error(
        `Live fetch failed (${errorMessage(liveError)}); static fallback failed (${errorMessage(staticError)})`
      );
    }
  }
}

export function editionSlugFromPath(relativePath: string) {
  const normalized = relativePath.replaceAll("\\", "/");

  if (normalized.endsWith("/current.json")) {
    return "current";
  }

  const match = normalized.match(/\/([^/]+)\.json$/);
  if (!match) {
    throw new Error(`Could not derive archive edition slug from path: ${relativePath}`);
  }

  return match[1];
}
