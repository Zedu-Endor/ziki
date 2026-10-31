"use client";

import { Button } from "@/components/ui/button";

export function SignOutButton({
  userId,
  className = "",
}: {
  userId?: string | null;
  className?: string;
}) {
  return (
    <Button
      variant="ghost"
      className={className}
      onClick={() => {
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
      }}
    >
      Sign out
    </Button>
  );
}
