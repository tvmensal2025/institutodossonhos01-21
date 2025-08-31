import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

interface LockedSectionProps {
  title: string;
  description: string;
  showPreview?: boolean;
  className?: string;
}

const LockedSection: React.FC<LockedSectionProps> = ({ 
  title, 
  description, 
  showPreview = false,
  className = ""
}) => {
  return (
    <div className={`p-6 ${className}`}>
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">
            {description}
          </p>
          {showPreview && (
            <div className="bg-muted/30 rounded-lg p-8 border-2 border-dashed border-muted-foreground/20">
              <p className="text-sm text-muted-foreground">
                Preview em breve...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LockedSection;