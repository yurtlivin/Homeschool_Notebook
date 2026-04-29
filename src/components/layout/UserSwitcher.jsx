import { USERS, ANIMALS } from "@/lib/constants";
import { useUser } from "@/lib/userContext";
import { X } from "lucide-react";

export default function UserSwitcher({ onClose }) {
  const { activeUser, switchUser, userAvatars, setAvatar, getAvatar } = useUser();

  const handleSwitch = (name) => {
    switchUser(name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white border border-border rounded-lg w-80 shadow-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <span className="text-sm font-semibold">Switch user</span>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="p-4 space-y-2">
          {USERS.map(u => (
            <button
              key={u.name}
              onClick={() => handleSwitch(u.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-md border transition-colors text-left ${
                activeUser === u.name
                  ? "border-[#534AB7] bg-[#EEEDFE]"
                  : "border-border hover:bg-muted"
              }`}
            >
              <span className="text-2xl">{getAvatar(u.name)}</span>
              <div>
                <div className="text-sm font-medium">{u.name}</div>
                {!userAvatars[u.name] && <div className="text-xs text-muted-foreground">Pick an avatar →</div>}
              </div>
            </button>
          ))}
        </div>
        {/* Avatar picker for active user */}
        {activeUser && (
          <div className="px-5 pb-4">
            <div className="text-xs text-muted-foreground mb-2">Your avatar ({activeUser})</div>
            <div className="flex flex-wrap gap-2">
              {ANIMALS.map(a => (
                <button
                  key={a.id}
                  onClick={() => setAvatar(activeUser, a.id)}
                  className={`w-9 h-9 flex items-center justify-center rounded-md border text-lg transition-colors ${
                    userAvatars[activeUser] === a.id
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
        )}
      </div>
    </div>
  );
}