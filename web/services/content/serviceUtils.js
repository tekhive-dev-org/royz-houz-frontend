import { createSupabaseServerClient } from "@/lib/supabase/server";

export function getContentClient(client) {
  return client || createSupabaseServerClient();
}

export function serviceSuccess(data, message = "Content loaded successfully", pagination = null) {
  return { success: true, data, message, pagination };
}

export function serviceFailure(error) {
  return {
    success: false,
    data: null,
    message: error.message || "Unable to load content.",
    error,
    pagination: null,
  };
}

export function normalizeSearch(search) {
  return typeof search === "string" ? search.trim().slice(0, 160) : "";
}
