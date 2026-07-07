import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";

export function Feedback() {
  const [voted, setVoted] = useState<"up" | "down" | null>(null);

  const vote = (dir: "up" | "down") => {
    if (voted) return;
    setVoted(dir);
    toast.success(dir === "up" ? "Glad this helped!" : "Thanks for the feedback.");
  };

  return (
    <div className="mt-12 flex items-center gap-3 border-t border-border pt-6">
      <span className="text-sm text-muted-foreground">Was this helpful?</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => vote("up")}
          disabled={!!voted}
          className={"inline-flex h-7 w-7 items-center justify-center rounded-md text-sm " + (voted === "up" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/60")}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => vote("down")}
          disabled={!!voted}
          className={"inline-flex h-7 w-7 items-center justify-center rounded-md text-sm " + (voted === "down" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/60")}
        >
          <ThumbsDown className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
