import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function MainLayout() {
  return (
    <div className="ov-page">
      <Navbar />
      <Outlet /> {/* page content goes here */}
      <Footer />
    </div>
  );
}