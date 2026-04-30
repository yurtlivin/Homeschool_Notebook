import { Link, useLocation } from "react-router-dom";
import { Home, CalendarDays, BookOpen, FolderOpen, BookMarked, Leaf, ChevronRight } from "lucide-react";
import { useUser } from "@/lib/userContext";
import { useState } from "react";
import UserSwitcher from "./UserSwitcher";

const NAV = [
{ label: "Home", icon: Home, path: "/" },
{ label: "Planner", icon: CalendarDays, path: "/planner" },
{ label: "Curriculum Planner", icon: BookOpen, path: "/curriculum" },
{ label: "Portfolio", icon: FolderOpen, path: "/portfolio" },
{ label: "Books", icon: BookMarked, path: "/books" }];


export default function Sidebar() {
  const location = useLocation();
  const { activeUser, getAvatar } = useUser();
  const [showSwitcher, setShowSwitcher] = useState(false);

  return (
    <>
      <aside className="w-[220px] min-h-screen border-r border-border bg-white flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-[#534AB7]" />
            <div>
              <div className="text-sm font-semibold text-foreground leading-tight">Our Homeschool</div>
              <div className="text-xs text-muted-foreground">2025–26</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ label, icon: Icon, path }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                active ?
                "text-[#534AB7] font-medium bg-[#EEEDFE] border-l-2 border-[#534AB7]" :
                "text-muted-foreground hover:text-foreground hover:bg-muted"}`
                }>
                
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>);

          })}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-border">
          <button
            onClick={() => setShowSwitcher(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted transition-colors text-left">
            
            <span className="text-xl leading-none">{getAvatar(activeUser)}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{activeUser || "Select user"}</div>
              <div className="text-xs text-muted-foreground">Tap to switch</div>
            </div>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
      </aside>

      {showSwitcher && <UserSwitcher onClose={() => setShowSwitcher(false)} />}
    </>);

}