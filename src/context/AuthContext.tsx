"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authApi } from "@/lib/api";
import { AuthUser } from "@/types";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string | string[]) => boolean;
  hasPermission: (permission: string | string[]) => boolean;
  isAdmin: () => boolean;
  isLanhDao: () => boolean;
  isCanBoNghiepVu: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = ["/auth/login", "/auth/signup", "/auth/forgot-password"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Load user từ localStorage khi mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const savedUser = localStorage.getItem("user");

        if (token && savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          
          // Verify token bằng cách gọi API profile
          try {
            const response = await authApi.getProfile();
            if (response.data) {
              const updatedUser = processUserData(response.data);
              setUser(updatedUser);
              localStorage.setItem("user", JSON.stringify(updatedUser));
            }
          } catch (error) {
            // Token invalid, clear everything
            localStorage.removeItem("access_token");
            localStorage.removeItem("user");
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Redirect logic
  useEffect(() => {
    if (!loading) {
      const isPublicRoute = PUBLIC_ROUTES.some((route) =>
        pathname.startsWith(route)
      );

      if (!user && !isPublicRoute) {
        router.push("/auth/login");
      } else if (user && isPublicRoute) {
        router.push("/admin");
      }
    }
  }, [user, loading, pathname, router]);

  // Process user data để extract roles và permissions
  const processUserData = (userData: any): AuthUser => {
    const roles: string[] = [];
    const permissions: string[] = [];

    // Extract roles và permissions từ vaiTroNguoiDung
    if (userData.vaiTroNguoiDung && Array.isArray(userData.vaiTroNguoiDung)) {
      userData.vaiTroNguoiDung.forEach((vtn: any) => {
        if (vtn.vaiTro) {
          roles.push(vtn.vaiTro.tenVaiTro);
          
          // Extract permissions từ vaiTroQuyen
          if (vtn.vaiTro.vaiTroQuyen && Array.isArray(vtn.vaiTro.vaiTroQuyen)) {
            vtn.vaiTro.vaiTroQuyen.forEach((vtq: any) => {
              if (vtq.quyen && vtq.quyen.tenQuyen) {
                permissions.push(vtq.quyen.tenQuyen);
              }
            });
          }
        }
      });
    }

    return {
      ...userData,
      roles: [...new Set(roles)], // Remove duplicates
      permissions: [...new Set(permissions)], // Remove duplicates
    };
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      const { access_token, user: userData } = response.data;
      console.log(response)

      // Save token
      localStorage.setItem("access_token", access_token);

      // Process and save user
      const processedUser = processUserData(userData);
      setUser(processedUser);
      localStorage.setItem("user", JSON.stringify(processedUser));

      // Redirect to admin
      router.push("/admin");
    } catch (error: any) {
      throw new Error(error.message || "Đăng nhập thất bại");
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      setUser(null);
      router.push("/auth/login");
    }
  };

  // Check if user has specific role(s)
  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;
    
    const roles = Array.isArray(role) ? role : [role];
    return roles.some((r) => user.roles.includes(r));
  };

  // Check if user has specific permission(s)
  const hasPermission = (permission: string | string[]): boolean => {
    if (!user) return false;
    
    // Admin có full quyền
    if (user.loaiNguoiDung === "QUAN_TRI_VIEN") return true;
    
    const permissions = Array.isArray(permission) ? permission : [permission];
    return permissions.some((p) => user.permissions.includes(p));
  };

  // Helper functions
  const isAdmin = (): boolean => {
    return user?.loaiNguoiDung === "QUAN_TRI_VIEN";
  };

  const isLanhDao = (): boolean => {
    return user?.loaiNguoiDung === "LANH_DAO";
  };

  const isCanBoNghiepVu = (): boolean => {
    return user?.loaiNguoiDung === "CAN_BO_NGHIEP_VU";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        hasRole,
        hasPermission,
        isAdmin,
        isLanhDao,
        isCanBoNghiepVu,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
