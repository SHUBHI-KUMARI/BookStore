const PLACEHOLDER_COVERS = [
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1614544048536-0d28caf77f41?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=600",
];

const API_BASE_URL = import.meta.env.VITE_API_URL as string | undefined;
const ABSOLUTE_URL = /^https?:\/\//i;

function getBaseOrigin() {
  if (API_BASE_URL) {
    try {
      return new URL(API_BASE_URL).origin;
    } catch {
      return API_BASE_URL;
    }
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "";
}

function normalizeCoverUrl(rawUrl: string) {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return null;
  }

  if (ABSOLUTE_URL.test(trimmed)) {
    if (trimmed.startsWith("http://") && typeof window !== "undefined") {
      return trimmed.replace(/^http:\/\//i, `${window.location.protocol}//`);
    }
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    const protocol =
      typeof window !== "undefined" ? window.location.protocol : "https:";
    return `${protocol}${trimmed}`;
  }

  const baseOrigin = getBaseOrigin();
  if (!baseOrigin) {
    return trimmed;
  }

  try {
    return new URL(trimmed, baseOrigin).toString();
  } catch {
    return trimmed;
  }
}

export function getBookCoverUrl(book: {
  title: string;
  image?: string | null;
}) {
  if (book.image) {
    const normalized = normalizeCoverUrl(book.image);
    if (normalized) {
      return normalized;
    }
  }

  const safeTitle = book.title?.trim() || "0";

  return PLACEHOLDER_COVERS[
    safeTitle.charCodeAt(0) % PLACEHOLDER_COVERS.length
  ];
}
