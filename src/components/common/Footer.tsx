import React from 'react';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  variant?: 'default' | 'simple';
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ variant = 'default', className = '' }) => {
  if (variant === 'simple') {
    return (
      <footer className={`border-t border-border/20 py-8 px-4 bg-card/20 ${className}`}>
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/images/instituto-logo.png" 
              alt="Instituto dos Sonhos" 
              className="h-8 w-8 object-contain"
            />
            <span className="text-lg font-semibold text-foreground">Instituto dos Sonhos</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2024 Instituto dos Sonhos. Transformando vidas através da ciência e tecnologia.
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className={`bg-card/80 backdrop-blur-sm py-12 px-4 border-t border-border/20 ${className}`}>
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/images/instituto-logo.png" 
                alt="Instituto dos Sonhos" 
                className="h-12 w-12 object-contain"
              />
              <div>
                <h3 className="text-xl font-bold text-foreground">Instituto dos Sonhos</h3>
                <p className="text-sm text-muted-foreground">Transformação Real</p>
              </div>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              Transforme seu corpo e sua vida com nosso método exclusivo de emagrecimento integral. 
              Aqui seus sonhos se tornam realidade através da ciência, tecnologia e apoio humano.
            </p>
            <div className="flex items-center gap-2 text-primary">
              <Heart className="h-5 w-5" />
              <span className="text-sm font-medium">Feito com amor para sua transformação</span>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/auth" className="hover:text-primary transition-colors">Começar Agora</a></li>
              <li><a href="/dashboard" className="hover:text-primary transition-colors">Dashboard</a></li>
              <li><a href="/sobre" className="hover:text-primary transition-colors">Sobre Nós</a></li>
              <li><a href="/programas" className="hover:text-primary transition-colors">Programas</a></li>
              <li><a href="/depoimentos" className="hover:text-primary transition-colors">Depoimentos</a></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contato</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>contato@institutodossonhos.com.br</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>(11) 99999-9999</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>São Paulo, SP - Brasil</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Linha de Copyright */}
        <div className="border-t border-border/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Instituto dos Sonhos. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="/termos" className="hover:text-primary transition-colors">Termos de Uso</a>
              <a href="/privacidade" className="hover:text-primary transition-colors">Privacidade</a>
              <a href="/suporte" className="hover:text-primary transition-colors">Suporte</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;