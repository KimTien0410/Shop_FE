import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import Protected from "./protected";

import Homepage from "../pages/HomePage";
import MainLayout from "../layouts/MainLayout";

import ProductListPage from "../pages/ProductListPage"
import ProductDetailPage from "../pages/ProductDetailPage";
import LoginPage from "../pages/AuthPage/LoginPage";
import RegisterPage from "../pages/AuthPage/RegisterPage";
import CartPage from "../pages/CartPage";
import ProfilePage from "../pages/ProfilePage";
import AddressPage from "../pages/AddressPage";
import CheckoutPage from "../pages/CheckoutPage";
import OrderHistoryPage from "../pages/OrderHistoryPage";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/admin/dashboard";
import ManageCategory from "../pages/admin/ManageCategory";
import ManageBrand from "../pages/admin/ManageBrand";
import ManageUser from "../pages/admin/ManageUser";
import ManageProduct from "../pages/admin/ManageProduct";
import ManageOrder from "../pages/admin/ManageOrder";
import ManageVoucher from "../pages/admin/ManageVoucher";
import PageNotFound from "../pages/PageNotFound";



const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route element={<Protected />}>
        <Route path="/" element={<AdminLayout />}>
          <Route path="admin" element={<Dashboard />} />
          <Route path="admin/manage-category" element={<ManageCategory />} />
          <Route path="admin/manage-brand" element={<ManageBrand />} />
          <Route path="admin/manage-user" element={<ManageUser />} />
          <Route path="admin/manage-product" element={<ManageProduct />} />
          <Route path="admin/manage-order" element={<ManageOrder />} />
          <Route path="admin/manage-voucher" element={<ManageVoucher />} />
        </Route>
        <Route path="/" element={<MainLayout />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="order-history" element={<OrderHistoryPage />} />
          <Route path="receiver-address" element={<AddressPage />} />
        </Route>
      </Route>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Homepage />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="products/:productId" element={<ProductDetailPage />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="*" element={<PageNotFound />} />
    </Route>
  )
);

const Index = () => {
  return <RouterProvider router={router} />;
};

export default Index;
