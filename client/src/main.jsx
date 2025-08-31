import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ProtectedRoute from "./router/ProtectedRoute.jsx";

import "./index.css";

import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import Verify from "./pages/auth/Verify.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import AdminLayout from "./layout/AdminLayout.jsx";
import KasirController from "./pages/admin/KasirController.jsx";
import ProdukController from "./pages/admin/ProdukController.jsx";
import KasirLayout from "./layout/KasirLayout.jsx";
import ProductsController from "./pages/kasir/ProductsController.jsx";
import DashboardCahsier from "./pages/kasir/DashboardCashier.jsx";
import ProfileController from "./pages/kasir/ProfileController.jsx";
import OrderController from "./pages/admin/OrderController.jsx";
import LaporanProductController from "./pages/admin/LaporanProdukController.jsx";
import LaporanPendapatanController from "./pages/admin/LaporanPendapatanController.jsx";
import AiAssistantController from "./pages/admin/AiAssistantController.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/Register",
    element: <Register />,
  },
  {
    path: "/verify",
    element: <Verify />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/resetPassword",
    element: <ResetPassword />,
  },

  //ADMIN ROUTES
  {
    path: "/admin",
    element: <ProtectedRoute allowedRoles={["ADMIN"]} />,
    children: [
      {
        path: "",
        element: <AdminLayout />,
        children: [
          {
            path: "",
            element: <KasirController />,
          },
          {
            path: "products",
            element: <ProdukController />,
          },
          {
            path: "orders",
            element: <OrderController />,
          },
          {
            path: "reports",
            children: [
              {
                path: "products", 
                element: <LaporanProductController />
              },
              {
                path: "income",
                element: <LaporanPendapatanController />
              }
            ]
          },
          {
            path: "ai-assistant",
            element: <AiAssistantController />,
          },
        ],
      },
    ],
  },

  //CASHIER ROUTES
  {
    path: "/kasir",
    element: <ProtectedRoute allowedRoles={["KASIR"]} />,
    children: [
      {
        path: "",
        element: <KasirLayout />,
        children: [
          {
            path: "",
            element: <DashboardCahsier/>
          },
          {
            path: "transaction/new",
            element: <ProductsController/>
          },
          {
            path: "profile",
            element: <ProfileController />,
          },
        ]
      }
    ]
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
