import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Topbar />
      <main className="erp-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
