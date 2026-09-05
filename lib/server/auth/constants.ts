export const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === "production" ? "__Host-session" : "session";

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days
