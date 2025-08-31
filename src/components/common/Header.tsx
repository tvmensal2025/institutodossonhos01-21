import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, User, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  variant?: 'default' | 'landing' | 'dashboard';
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ variant = 'default', className = '' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAuthAction = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  return (
    <header className={`border-b border-border/20 bg-card/50 backdrop-blur-sm sticky top-0 z-50 ${className}`}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo e Branding */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="relative">
            <img 
              src="/images/instituto-logo.png" 
              alt="Instituto dos Sonhos" 
              className="h-10 w-10 object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Instituto dos Sonhos</h1>
            <p className="text-xs text-muted-foreground">Transformação Real</p>
          </div>
        </Link>

        {/* Navegação */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => navigate("/dashboard")} 
                variant="outline"
                className="hover:bg-primary/10"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {user.email?.split("@")[0]}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button onClick={() => navigate("/auth")} variant="outline">
                Entrar
              </Button>
              <Button 
                onClick={handleAuthAction} 
                className="bg-primary hover:bg-primary/90"
              >
                <Heart className="h-4 w-4 mr-2" />
                Começar Agora
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;