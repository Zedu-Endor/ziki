"use client";
export async function toggleVoteAction(bugId: string, _direction: number): Promise<{ error?: string; likeCount?: number; userVote?: number; voted?: boolean }> {
  return new Promise((resolve) => window.dispatchEvent(new CustomEvent("ziki-demo:vote", { detail: { bugId, resolve } })));
}
