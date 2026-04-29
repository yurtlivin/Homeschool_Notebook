import { useState } from "react";
import { Camera, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useUser } from "@/lib/userContext";

export default function QuickAddMoment({ date, onAdded }) {
  const [content, setContent] = useState("");
  const [kid, setKid] = useState("Both");
  const { activeUser } = useUser();

  const handleAdd = async () => {
    if (!content.trim()) return;
    await base44.entities.LogEntry.create({
      date,
      kid,
      logged_by: activeUser,
      content: content.trim(),
      tags: [],
      milestone_flag: false,
    });
    setContent("");
    onAdded();
  };

  return (
    <div className="bg-white border border-border rounded-md p-3">
      <div className="text-xs font-medium text-muted-foreground mb-2">Quick moment</div>
      <textarea
        placeholder="What just happened? What did they make, say, discover..."
        value={content}
        onChange={e => setContent(e.target.value)}
        className="w-full text-sm bg-muted/30 border border-border rounded px-3 py-2 resize-none min-h-[72px] outline-none focus:border-[#534AB7]"
      />
      <div className="flex items-center gap-2 mt-2">
        <div className="flex items-center border border-border rounded-md overflow-hidden text-xs">
          {["Tigerlily", "Rowen", "Both"].map(k => (
            <button
              key={k}
              onClick={() => setKid(k)}
              className={`px-3 py-1.5 transition-colors ${kid === k ? "bg-[#534AB7] text-white" : "text-muted-foreground hover:bg-muted"}`}
            >
              {k}
            </button>
          ))}
        </div>
        <button className="text-muted-foreground hover:text-foreground p-1.5">
          <Camera className="w-4 h-4" />
        </button>
        <div className="flex-1" />
        <button
          onClick={handleAdd}
          disabled={!content.trim()}
          className="flex items-center gap-1.5 text-sm bg-[#534AB7] text-white px-4 py-1.5 rounded-md hover:bg-[#4340a0] disabled:opacity-40 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>
    </div>
  );
}