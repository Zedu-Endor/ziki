"use client";
type Preview = { id: string; title: string; createdAt: Date; readAt: Date | null };
export async function recentNotificationsAction(): Promise<Preview[]> {
  return new Promise((resolve) => window.dispatchEvent(new CustomEvent("ziki-demo:notifications", { detail: resolve })));
}
