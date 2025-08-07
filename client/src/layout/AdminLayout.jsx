import { Outlet } from "react-router-dom";
import AdminSidebar from "../componens/admin/AdminSidebar";

const AdminLayout = () => {
  return (
    <>
      <AdminSidebar />
      <Outlet />
    </>
  );
};
export default AdminLayout;
