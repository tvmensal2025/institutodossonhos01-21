import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';

/**
 * Determines admin capability from the authenticated user's claims/metadata.
 * Admin is granted only if the token (app_metadata) or user_metadata contains role === 'admin'.
 * Admin mode toggle is available only for admins and defaults to enabled for admins.
 */
export const useAdminMode = (user: User | null) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminModeEnabled, setAdminModeEnabled] = useState(false);

  useEffect(() => {
    const roleFromAppMeta = (user as any)?.app_metadata?.role as string | undefined;
    const roleFromUserMeta = (user as any)?.user_metadata?.role as string | undefined;
    const hasAdminRole = roleFromAppMeta === 'admin' || roleFromUserMeta === 'admin';

    setIsAdmin(!!hasAdminRole);
    setAdminModeEnabled(!!hasAdminRole);
  }, [user]);

  const toggleAdminMode = () => {
    // Only admins can toggle admin features in the UI
    setAdminModeEnabled((prev) => (isAdmin ? !prev : false));
  };

  return {
    isAdmin,
    adminModeEnabled,
    toggleAdminMode,
  };
};