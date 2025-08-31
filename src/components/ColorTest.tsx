import React from 'react';

const ColorTest = () => {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-3xl font-bold text-foreground">Teste de Cores</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Cores básicas */}
        <div className="bg-primary text-primary-foreground p-4 rounded-lg">
          <h3 className="font-bold">Primary</h3>
          <p>Cor primária</p>
        </div>
        
        <div className="bg-secondary text-secondary-foreground p-4 rounded-lg">
          <h3 className="font-bold">Secondary</h3>
          <p>Cor secundária</p>
        </div>
        
        <div className="bg-accent text-accent-foreground p-4 rounded-lg">
          <h3 className="font-bold">Accent</h3>
          <p>Cor de destaque</p>
        </div>
        
        <div className="bg-muted text-muted-foreground p-4 rounded-lg">
          <h3 className="font-bold">Muted</h3>
          <p>Cor suave</p>
        </div>
        
        <div className="bg-destructive text-destructive-foreground p-4 rounded-lg">
          <h3 className="font-bold">Destructive</h3>
          <p>Cor de erro</p>
        </div>
        
        <div className="bg-success text-success-foreground p-4 rounded-lg">
          <h3 className="font-bold">Success</h3>
          <p>Cor de sucesso</p>
        </div>
        
        <div className="bg-warning text-warning-foreground p-4 rounded-lg">
          <h3 className="font-bold">Warning</h3>
          <p>Cor de aviso</p>
        </div>
        
        <div className="bg-card text-card-foreground p-4 rounded-lg border">
          <h3 className="font-bold">Card</h3>
          <p>Cor do card</p>
        </div>
      </div>
      
      {/* Cores do Instituto */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">Cores do Instituto</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-instituto-blue text-white p-4 rounded-lg">
            <h3 className="font-bold">Instituto Blue</h3>
          </div>
          
          <div className="bg-instituto-green text-white p-4 rounded-lg">
            <h3 className="font-bold">Instituto Green</h3>
          </div>
          
          <div className="bg-instituto-red text-white p-4 rounded-lg">
            <h3 className="font-bold">Instituto Red</h3>
          </div>
          
          <div className="bg-instituto-gray text-white p-4 rounded-lg">
            <h3 className="font-bold">Instituto Gray</h3>
          </div>
        </div>
      </div>
      
      {/* Cores de saúde */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">Cores de Saúde</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-health-heart text-white p-4 rounded-lg">
            <h3 className="font-bold">Heart</h3>
          </div>
          
          <div className="bg-health-steps text-white p-4 rounded-lg">
            <h3 className="font-bold">Steps</h3>
          </div>
          
          <div className="bg-health-calories text-white p-4 rounded-lg">
            <h3 className="font-bold">Calories</h3>
          </div>
          
          <div className="bg-health-hydration text-white p-4 rounded-lg">
            <h3 className="font-bold">Hydration</h3>
          </div>
        </div>
      </div>
      
      {/* Gradientes */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">Gradientes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-primary text-white p-8 rounded-lg">
            <h3 className="font-bold text-xl">Gradient Primary</h3>
          </div>
          
          <div className="bg-gradient-dark text-white p-8 rounded-lg">
            <h3 className="font-bold text-xl">Gradient Dark</h3>
          </div>
          
          <div className="bg-gradient-card text-white p-8 rounded-lg">
            <h3 className="font-bold text-xl">Gradient Card</h3>
          </div>
          
          <div className="bg-gradient-accent text-white p-8 rounded-lg">
            <h3 className="font-bold text-xl">Gradient Accent</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorTest; 