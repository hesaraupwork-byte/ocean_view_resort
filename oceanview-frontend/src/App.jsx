// src/App.jsx
import { BrowserRouter, Route, Routes } from "react-router-dom";

// layouts
import AdminLayout from "./layouts/AdminLayout";
import CustomerLayout from "./layouts/CustomerLayout";
import MainLayout from "./layouts/MainLayout";
import StaffLayout from "./layouts/StaffLayout";

// public pages
import About from "./pages/About";
import EnterOtp from "./pages/EnterOtp";
import Faq from "./pages/Faq";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";

// admin pages
import AdminBills from "./pages/admin/AdminBills";
import AdminProfile from "./pages/admin/AdminProfile"; // ✅ fixed
import AdminQuestions from "./pages/admin/AdminQuestions";
import AdminReservations from "./pages/admin/AdminReservations";
import AdminUsers from "./pages/admin/AdminUsers";
import RequireAdmin from "./routes/RequireAdmin";

// staff pages
import StaffBills from "./pages/staff/StaffBills";
import StaffGuide from "./pages/staff/StaffGuide";
import StaffProfile from "./pages/staff/StaffProfile";
import StaffQuestions from "./pages/staff/StaffQuestions";
import StaffReservations from "./pages/staff/StaffReservations";

// customer pages
import CustomerAdditionalTime from "./pages/customer/CustomerAdditionalTime";
import CustomerBills from "./pages/customer/CustomerBills";
import CustomerProfile from "./pages/customer/CustomerProfile";
import CustomerReservationHistory from "./pages/customer/CustomerReservationHistory";
import CustomerReservations from "./pages/customer/CustomerReservations";

// route guards
import RequireCustomer from "./routes/RequireCustomer";
import RequireStaff from "./routes/RequireStaff";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ Public Layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* password reset flow */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/enter-otp" element={<EnterOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminUsers />} /> {/* ✅ default admin page */}
            <Route path="users" element={<AdminUsers />} />
            <Route path="reservations" element={<AdminReservations />} />
            <Route path="questions" element={<AdminQuestions />} />
            <Route path="bills" element={<AdminBills />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>
        </Route>

        {/* ✅ Staff Protected Layout */}
        <Route element={<RequireStaff />}>
          <Route path="/staff" element={<StaffLayout />}>
            <Route index element={<StaffReservations />} />
            <Route path="reservations" element={<StaffReservations />} />
            <Route path="bills" element={<StaffBills />} />
            <Route path="questions" element={<StaffQuestions />} />
            <Route path="guide" element={<StaffGuide />} />
            <Route path="profile" element={<StaffProfile />} />
          </Route>
        </Route>

        {/* ✅ Customer Protected Layout */}
        <Route element={<RequireCustomer />}>
          <Route path="/customer" element={<CustomerLayout />}>
            <Route index element={<CustomerReservations />} />
            <Route path="reservations" element={<CustomerReservations />} />
            <Route path="history" element={<CustomerReservationHistory />} />
            <Route path="bills" element={<CustomerBills />} />
            <Route path="additional-time" element={<CustomerAdditionalTime />} />
            <Route path="profile" element={<CustomerProfile />} />
          </Route>
        </Route>

        {/* fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}