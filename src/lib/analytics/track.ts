"use client";

import { useEffect } from "react";

function getSessionId() {
  let sessionId = localStorage.getItem("vyra_session");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("vyra_session", sessionId);
  }
  return sessionId;
}

export async function trackEvent(
  eventName: string,
  metadata: Record<string, any> = {},
) {
  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_name: eventName,
        session_id: getSessionId(),
        page_url: window.location.pathname,
        metadata,
      }),
    });
  } catch {
    // Silent fail - analytics should never break the app
  }
}

export function usePageTracking() {
  useEffect(() => {
    trackEvent("page_view");
  }, []);
}
