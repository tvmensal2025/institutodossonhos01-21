// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminPermissions = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, admin_level')
        .eq('user_id', user.id)
        .single();

      const adminRole = profile?.role === 'admin';
      const superAdminLevel = profile?.admin_level === 'super';

      setIsAdmin(adminRole);
      setIsSuperAdmin(adminRole && superAdminLevel);
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      setIsAdmin(false);
      setIsSuperAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    isAdmin,
    isSuperAdmin,
    loading,
    checkPermissions
  };
};