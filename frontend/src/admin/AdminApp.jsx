import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "./AdminDashboard.jsx";
import AdminProducts from "./AdminProducts.jsx";
import ActiveOrders from "./ActiveOrders.jsx";
import Deals from "./Deals.jsx";
import Coupons from "./Coupons.jsx";
import OrderHistory from "./OrderHistory.jsx";

export default function AdminApp() {
  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="products" element={<AdminProducts />} />
      <Route path="orders" element={<ActiveOrders />} />
      <Route path="deals" element={<Deals />} />
      <Route path="coupons" element={<Coupons />} />
      <Route path="history" element={<OrderHistory />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
