import { VisionAnalyzer } from '@/components/VisionAnalyzer';

export default function VisionDemo() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Demonstração da Vision API
          </h1>
          <p className="text-muted-foreground mt-2">
            Teste a análise automática de imagens com IA
          </p>
        </div>
        
        <VisionAnalyzer />
      </div>
    </div>
  );
}