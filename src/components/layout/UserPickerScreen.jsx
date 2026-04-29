import { USERS, ANIMALS } from "@/lib/constants";
import { useUser } from "@/lib/userContext";
import { Leaf } from "lucide-react";

export default function UserPickerScreen() {
  const { switchUser, userAvatars, setAvatar, getAvatar } = useUser();

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center px-4">
      <div className="flex items-center gap-2 mb-8">
        <Leaf className="w-5 h-5 text-[#534AB7]" />
        <div>
          <div className="text-lg font-semibold text-foreground">Our Homeschool</div>
          <div className="text-xs text-muted-foreground">2025–26</div>
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-1">Who's logging today?</h1>
        <p className="text-sm text-muted-foreground">Select your name to continue</p>
      </div>

      <div className="flex gap-4 mb-10">
        {USERS.map(u => (
          <button
            key={u.name}
            onClick={() => switchUser(u.name)}
            className="flex flex-col items-center gap-3 px-8 py-6 bg-white border border-border rounded-lg hover:border-[#534AB7] hover:bg-[#EEEDFE] transition-all group"
          >
            <span className="text-4xl">{getAvatar(u.name)}</span>
            <span className="text-base font-medium text-foreground">{u.name}</span>
          </button>
        ))}
      </div>

      <div className="w-full max-w-sm">
        <div className="text-xs text-muted-foreground mb-3 text-center">Pick your avatar</div>
        {USERS.map(u => (
          <div key={u.name} className="mb-4">
            <div className="text-xs font-medium text-muted-foreground mb-2">{u.name}</div>
            <div className="flex flex-wrap gap-2">
              {ANIMALS.map(a => (
                <button
                  key={a.id}
                  onClick={() => setAvatar(u.name, a.id)}
                  className={`w-9 h-9 flex items-center justify-center rounded-md border text-lg transition-colors ${
                    userAvatars[u.name] === a.id
                      ? "border-[#534AB7] bg-[#EEEDFE]"
                      : "border-border hover:bg-muted"
                  }`}
                  title={a.id}
                >
                  {a.emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}