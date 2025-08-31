import React from "react";
import { cn } from "@/lib/utils";

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

export function MobileContainer({ 
  children, 
  className,
  padding = "md"
}: MobileContainerProps) {
  const paddingClasses = {
    sm: "p-2 lg:p-4",
    md: "p-4 lg:p-6", 
    lg: "p-6 lg:p-8"
  };

  return (
    <div className={cn(
      "w-full mx-auto max-w-7xl",
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}

// Hook para detectar se está em mobile
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}