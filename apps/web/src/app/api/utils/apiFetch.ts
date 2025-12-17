// apps/web/src/app/api/utils/apiFetch.ts
export async function apiFetch(url: string, options: RequestInit = {}) {
  const res = await fetch(url, options);
  const contentType = (res.headers.get('content-type') || '').toLowerCase();

  if (contentType.includes('application/json')) {
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      throw { message: json?.message || res.statusText, errors: json?.errors };
    }
    return json;
  } else {
    const text = await res.text();
    if (!res.ok) throw { message: text || res.statusText };
    return text;
  }
}
