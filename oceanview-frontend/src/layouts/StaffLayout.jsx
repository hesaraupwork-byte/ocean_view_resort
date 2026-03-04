import { Outlet } from "react-router-dom";
import StaffNavbar from "../components/StaffNavbar";

export default function StaffLayout() {
  return (
    <>
      <StaffNavbar />
      <div className="container-fluid">
        <Outlet />
      </div>
    </>
  );
}