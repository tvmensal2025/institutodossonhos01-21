import React, { useEffect, useState } from 'react';

const CSSDebug = () => {
  const [cssVariables, setCssVariables] = useState<Record<string, string>>({});

  useEffect(() => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    const variables = {
      '--background': computedStyle.getPropertyValue('--background'),
      '--foreground': computedStyle.getPropertyValue('--foreground'),
      '--primary': computedStyle.getPropertyValue('--primary'),
      '--secondary': computedStyle.getPropertyValue('--secondary'),
      '--accent': computedStyle.getPropertyValue('--accent'),
      '--muted': computedStyle.getPropertyValue('--muted'),
      '--destructive': computedStyle.getPropertyValue('--destructive'),
      '--success': computedStyle.getPropertyValue('--success'),
      '--warning': computedStyle.getPropertyValue('--warning'),
      '--card': computedStyle.getPropertyValue('--card'),
      '--card-foreground': computedStyle.getPropertyValue('--card-foreground'),
      '--instituto-blue': computedStyle.getPropertyValue('--instituto-blue'),
      '--instituto-green': computedStyle.getPropertyValue('--instituto-green'),
      '--instituto-red': computedStyle.getPropertyValue('--instituto-red'),
      '--instituto-gray': computedStyle.getPropertyValue('--instituto-gray'),
      '--health-heart': computedStyle.getPropertyValue('--health-heart'),
      '--health-steps': computedStyle.getPropertyValue('--health-steps'),
      '--health-calories': computedStyle.getPropertyValue('--health-calories'),
      '--health-hydration': computedStyle.getPropertyValue('--health-hydration'),
    };
    
    setCssVariables(variables);
  }, []);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Debug de Variáveis CSS</h1>
      
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-xl font-bold mb-4">Variáveis CSS Detectadas:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(cssVariables).map(([variable, value]) => (
            <div key={variable} className="bg-muted p-3 rounded">
              <div className="font-mono text-sm text-muted-foreground">{variable}</div>
              <div className="font-mono text-sm font-bold">{value || 'não definida'}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-xl font-bold mb-4">Teste de Cores com HSL:</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div 
            className="p-4 rounded-lg text-white"
            style={{ backgroundColor: `hsl(${cssVariables['--primary']})` }}
          >
            Primary
          </div>
          <div 
            className="p-4 rounded-lg text-white"
            style={{ backgroundColor: `hsl(${cssVariables['--secondary']})` }}
          >
            Secondary
          </div>
          <div 
            className="p-4 rounded-lg text-white"
            style={{ backgroundColor: `hsl(${cssVariables['--accent']})` }}
          >
            Accent
          </div>
          <div 
            className="p-4 rounded-lg text-white"
            style={{ backgroundColor: `hsl(${cssVariables['--destructive']})` }}
          >
            Destructive
          </div>
        </div>
      </div>
      
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-xl font-bold mb-4">Teste de Classes Tailwind:</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-primary text-primary-foreground p-4 rounded-lg">
            bg-primary
          </div>
          <div className="bg-secondary text-secondary-foreground p-4 rounded-lg">
            bg-secondary
          </div>
          <div className="bg-accent text-accent-foreground p-4 rounded-lg">
            bg-accent
          </div>
          <div className="bg-destructive text-destructive-foreground p-4 rounded-lg">
            bg-destructive
          </div>
        </div>
      </div>
      
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-xl font-bold mb-4">Teste de Cores do Instituto:</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-instituto-blue text-white p-4 rounded-lg">
            bg-instituto-blue
          </div>
          <div className="bg-instituto-green text-white p-4 rounded-lg">
            bg-instituto-green
          </div>
          <div className="bg-instituto-red text-white p-4 rounded-lg">
            bg-instituto-red
          </div>
          <div className="bg-instituto-gray text-white p-4 rounded-lg">
            bg-instituto-gray
          </div>
        </div>
      </div>
      
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-xl font-bold mb-4">Teste de Cores de Saúde:</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-health-heart text-white p-4 rounded-lg">
            bg-health-heart
          </div>
          <div className="bg-health-steps text-white p-4 rounded-lg">
            bg-health-steps
          </div>
          <div className="bg-health-calories text-white p-4 rounded-lg">
            bg-health-calories
          </div>
          <div className="bg-health-hydration text-white p-4 rounded-lg">
            bg-health-hydration
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSSDebug; 