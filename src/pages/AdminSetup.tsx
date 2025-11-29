import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield, UserPlus } from "lucide-react";

const AdminSetup = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) throw error;
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  const makeUserAdmin = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'admin'
        });

      if (error) {
        if (error.code === '23505') {
          toast.info('Você já é um administrador');
        } else {
          throw error;
        }
      } else {
        toast.success('Você agora é um administrador!');
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Error making user admin:', error);
      toast.error('Erro ao adicionar permissão de admin');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Configuração de Administrador</CardTitle>
          <CardDescription>
            {isAdmin 
              ? "Você já tem permissões de administrador" 
              : "Configure sua conta como administrador para gerenciar o sistema"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAdmin ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-primary font-medium">
                  ✓ Permissões de Administrador Ativas
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Você pode importar dados, gerenciar produtos e filiais.
              </p>
              <Button className="w-full" onClick={() => window.location.href = '/'}>
                Ir para o Dashboard
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm text-foreground">
                  <strong>Primeiro Acesso:</strong> Como você é o primeiro usuário, clique no botão abaixo para se tornar administrador do sistema.
                </p>
                <p className="text-xs text-muted-foreground">
                  Administradores podem importar dados e gerenciar todo o sistema.
                </p>
              </div>
              <Button 
                className="w-full" 
                onClick={makeUserAdmin}
                disabled={loading}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {loading ? "Configurando..." : "Tornar-me Administrador"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSetup;
