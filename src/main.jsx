import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "react-multi-carousel/lib/styles.css";
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx';
import { ToastContainer } from "react-toastify";
createRoot(document.getElementById("root")).render(
  // <StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
        <ToastContainer position="top-right" autoClose={3000} />
      </CartProvider>
    </AuthProvider>
  // </StrictMode>
);
