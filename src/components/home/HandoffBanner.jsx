import { useUser } from "@/lib/userContext";
import { MessageSquare } from "lucide-react";

export default function HandoffBanner({ note, onReply }) {
  const { getAvatar } = useUser();
  if (!note) return null;

  const otherParent = note.logged_by;

  return (
    <div className="bg-[#EEEDFE] border-l-4 border-[#7F77DD] rounded-r-md px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1">
          <span className="text-lg leading-none mt-0.5">{getAvatar(otherParent)}</span>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-[#534AB7]">Handoff from {otherParent}</span>
              <span className="text-xs text-muted-foreground">{note.date}</span>
            </div>
            <p className="text-sm text-foreground">{note.content}</p>
          </div>
        </div>
        <button
          onClick={onReply}
          className="flex items-center gap-1.5 text-xs text-[#534AB7] hover:underline shrink-0 mt-0.5"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Reply
        </button>
      </div>
    </div>
  );
}