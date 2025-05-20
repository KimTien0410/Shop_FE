import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { login } from "../services/authService"; // Import your login function from the service

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: null,
    email: null,
    role: null,
    isAuthenticated: false,
  });

  // Load token từ localStorage khi load lại trang
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const isExpired = decoded.exp * 1000 < Date.now();
        if (!isExpired) {
          setAuth({
            token,
            email: decoded.sub,
            role: decoded.scope,
            isAuthenticated: true,
          });
        } else {
          logout();
        }
      } catch (err) {
        logout();
      }
    }
  }, []);

  // Đăng nhập
  const loginResponse = async (loginForm) => {
    const res = await login(loginForm);
    // console.log(res.data.token);
    const token = res.data.token;
    localStorage.setItem("token", token);

    const decoded = jwtDecode(token);

    const newAuth = {
      token,
      email: decoded.sub,
      role: extractRoleFromScope(decoded.scope),
      isAuthenticated: true,
    };
    setAuth(newAuth);
    return newAuth;
  };
const extractRoleFromScope = (scope) => {
  if (scope.includes("ROLE_ADMIN")) {
    return "ADMIN";
  } else if (scope.includes("ROLE_USER")) {
    return "USER";
  }
  return null; // Trường hợp không xác định
};
  // Đăng xuất
  const logout = () => {
    localStorage.removeItem("token");
    setAuth({
      token: null,
      email: null,
      role: null,
      isAuthenticated: false,
    });
  };

  return (
    <AuthContext.Provider value={{ auth, loginResponse, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook để sử dụng context
export const useAuth = () => useContext(AuthContext);
