import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Calendar, Users } from 'lucide-react';
import SaboteurManagement from './SaboteurManagement';
import SessionManagement from './SessionManagement';

const UnifiedManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'saboteurs' | 'sessions'>('saboteurs');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gerenciamento Unificado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === 'saboteurs' ? 'default' : 'outline'}
              onClick={() => setActiveTab('saboteurs')}
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              Sabotadores
            </Button>
            <Button
              variant={activeTab === 'sessions' ? 'default' : 'outline'}
              onClick={() => setActiveTab('sessions')}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Sessões
            </Button>
          </div>

          {activeTab === 'saboteurs' && <SaboteurManagement />}
          {activeTab === 'sessions' && <SessionManagement />}
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedManagement;