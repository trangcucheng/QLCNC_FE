"use client";

import { useAuth } from "@/context/AuthContext";

interface ProtectedProps {
  children: React.ReactNode;
  permission?: string | string[];
  role?: string | string[];
  requireAll?: boolean; // Yêu cầu tất cả permissions/roles (AND) thay vì một trong số đó (OR)
  fallback?: React.ReactNode;
}

/**
 * Component bảo vệ nội dung dựa trên quyền hoặc vai trò
 * 
 * Usage:
 * <Protected permission="ho-so-doi-tuong:create">
 *   <ButtonThemMoi />
 * </Protected>
 * 
 * <Protected role="Admin">
 *   <AdminPanel />
 * </Protected>
 */
export function Protected({
  children,
  permission,
  role,
  requireAll = false,
  fallback = null,
}: ProtectedProps) {
  const { hasPermission, hasRole, user } = useAuth();

  if (!user) return <>{fallback}</>;

  let hasAccess = true;

  // Check permissions
  if (permission) {
    const permissions = Array.isArray(permission) ? permission : [permission];
    
    if (requireAll) {
      // Phải có TẤT CẢ permissions
      hasAccess = permissions.every((p) => hasPermission(p));
    } else {
      // Chỉ cần MỘT trong các permissions
      hasAccess = permissions.some((p) => hasPermission(p));
    }
  }

  // Check roles
  if (hasAccess && role) {
    const roles = Array.isArray(role) ? role : [role];
    
    if (requireAll) {
      // Phải có TẤT CẢ roles
      hasAccess = roles.every((r) => hasRole(r));
    } else {
      // Chỉ cần MỘT trong các roles
      hasAccess = roles.some((r) => hasRole(r));
    }
  }

  if (!hasAccess) return <>{fallback}</>;

  return <>{children}</>;
}

/**
 * Hook để check quyền trong component
 * 
 * Usage:
 * const { canCreate, canEdit, canDelete } = usePermissions({
 *   canCreate: 'ho-so-doi-tuong:create',
 *   canEdit: 'ho-so-doi-tuong:update',
 *   canDelete: 'ho-so-doi-tuong:delete',
 * });
 */
export function usePermissions<T extends Record<string, string | string[]>>(
  permissionMap: T
): Record<keyof T, boolean> {
  const { hasPermission } = useAuth();

  const result: any = {};

  for (const [key, permission] of Object.entries(permissionMap)) {
    result[key] = hasPermission(permission);
  }

  return result;
}
