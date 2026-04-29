import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useUser } from "@/lib/userContext";
import UserPickerScreen from "./UserPickerScreen";

export default function AppLayout() {
  const { activeUser } = useUser();

  if (!activeUser) {
    return <UserPickerScreen />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}