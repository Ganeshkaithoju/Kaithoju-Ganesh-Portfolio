function getApiBaseUrl(): string {
  const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (typeof window === "undefined") {
    return (configuredApiBaseUrl || "http://localhost:5000/api").replace(/\/$/, "");
  }

  if (configuredApiBaseUrl) {
    const configuredUrl = new URL(configuredApiBaseUrl, window.location.origin);
    const isLoopback = configuredUrl.hostname === "localhost" || configuredUrl.hostname === "127.0.0.1";
    const isRemoteBrowser = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";
    if (isLoopback && isRemoteBrowser) configuredUrl.hostname = window.location.hostname;
    return configuredUrl.toString().replace(/\/$/, "");
  }

  return window.location.protocol === "https:"
    ? "/api"
    : `${window.location.protocol}//${window.location.hostname}:5000/api`;
}

const API_BASE_URL = getApiBaseUrl();
const TOKEN_KEY = "portfolio-owner-token";

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function saveOwnerToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearOwnerToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(apiUrl(path), { ...init, headers });
}
