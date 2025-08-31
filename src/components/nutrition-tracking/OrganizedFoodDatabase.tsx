import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Filter, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ChefHat,
  Leaf,
  Flame,
  Snowflake
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Dados dos alimentos organizados
const ORGANIZED_FOODS = [
  {
    nome: "Quinoa",
    categoria: "grãos",
    pontuacao: 95,
    super_alimento: true,
    metabolismo: "acelerar_quente",
    classificacao: { categoria: "superalimento", label: "Superalimento", cor: "#10B981" },
    tags: ["alto teor proteico", "rico em fibras", "antioxidante"],
    beneficios: ["Proteína completa", "Rico em ferro", "Sem glúten"],
    macronutrientes: { calorias: 120, proteinas: 4.4, carboidratos: 21.3, gorduras: 1.9, fibras: 2.8 }
  },
  {
    nome: "Salmão",
    categoria: "proteína animal",
    pontuacao: 92,
    super_alimento: true,
    metabolismo: "acelerar_quente",
    classificacao: { categoria: "superalimento", label: "Superalimento", cor: "#10B981" },
    tags: ["ômega-3", "alto teor proteico", "anti-inflamatório"],
    beneficios: ["Rico em ômega-3", "Proteína de qualidade", "Saúde cardiovascular"],
    macronutrientes: { calorias: 208, proteinas: 25.4, carboidratos: 0, gorduras: 12.4, fibras: 0 }
  },
  {
    nome: "Abacate",
    categoria: "frutas",
    pontuacao: 88,
    super_alimento: true,
    metabolismo: "acalmar_frio",
    classificacao: { categoria: "superalimento", label: "Superalimento", cor: "#10B981" },
    tags: ["gorduras boas", "cremoso", "anti-inflamatório"],
    beneficios: ["Gorduras monoinsaturadas", "Rico em potássio", "Saúde do coração"],
    macronutrientes: { calorias: 160, proteinas: 2, carboidratos: 8.5, gorduras: 14.7, fibras: 6.7 }
  },
  {
    nome: "Brócolis",
    categoria: "vegetais",
    pontuacao: 85,
    super_alimento: true,
    metabolismo: "acelerar_quente",
    classificacao: { categoria: "superalimento", label: "Superalimento", cor: "#10B981" },
    tags: ["rico em vitaminas", "anti-inflamatório", "detox"],
    beneficios: ["Rico em vitamina C", "Antioxidantes", "Fibras"],
    macronutrientes: { calorias: 34, proteinas: 2.8, carboidratos: 7, gorduras: 0.4, fibras: 2.6 }
  },
  {
    nome: "Aveia",
    categoria: "grãos",
    pontuacao: 82,
    super_alimento: false,
    metabolismo: "acelerar_acalmar",
    classificacao: { categoria: "saudável", label: "Saudável", cor: "#3B82F6" },
    tags: ["rico em fibras", "energia sustentada", "beta-glucano"],
    beneficios: ["Controla colesterol", "Energia duradoura", "Saciedade"],
    macronutrientes: { calorias: 389, proteinas: 16.9, carboidratos: 66.3, gorduras: 6.9, fibras: 10.6 }
  },
  {
    nome: "Banana",
    categoria: "frutas",
    pontuacao: 75,
    super_alimento: false,
    metabolismo: "acelerar_acalmar",
    classificacao: { categoria: "moderado", label: "Moderado", cor: "#F59E0B" },
    tags: ["rica em potássio", "energia rápida", "doce natural"],
    beneficios: ["Potássio", "Energia rápida", "Vitamina B6"],
    macronutrientes: { calorias: 89, proteinas: 1.1, carboidratos: 22.8, gorduras: 0.3, fibras: 2.6 }
  }
];

const CATEGORIAS = ["todas", "grãos", "proteína animal", "frutas", "vegetais", "leguminosas", "oleaginosas"];
const METABOLISMO_OPTIONS = ["todos", "acelerar_quente", "acalmar_frio", "acelerar_acalmar"];

const OrganizedFoodDatabase: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [selectedMetabolism, setSelectedMetabolism] = useState('todos');
  const [showOnlySuper, setShowOnlySuper] = useState(false);

  const filteredFoods = useMemo(() => {
    return ORGANIZED_FOODS.filter(food => {
      const matchesSearch = food.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           food.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'todas' || food.categoria === selectedCategory;
      const matchesMetabolism = selectedMetabolism === 'todos' || food.metabolismo === selectedMetabolism;
      const matchesSuper = !showOnlySuper || food.super_alimento;

      return matchesSearch && matchesCategory && matchesMetabolism && matchesSuper;
    });
  }, [searchTerm, selectedCategory, selectedMetabolism, showOnlySuper]);

  const getMetabolismIcon = (metabolismo: string) => {
    switch (metabolismo) {
      case 'acelerar_quente':
        return <Flame className="h-4 w-4 text-red-500" />;
      case 'acalmar_frio':
        return <Snowflake className="h-4 w-4 text-blue-500" />;
      case 'acelerar_acalmar':
        return <Minus className="h-4 w-4 text-purple-500" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getMetabolismLabel = (metabolismo: string) => {
    switch (metabolismo) {
      case 'acelerar_quente':
        return 'Acelerar (Quente)';
      case 'acalmar_frio':
        return 'Acalmar (Frio)';
      case 'acelerar_acalmar':
        return 'Equilibrar';
      default:
        return 'Neutro';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar alimentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Categoria */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS.map(categoria => (
                  <SelectItem key={categoria} value={categoria}>
                    {categoria === 'todas' ? 'Todas as categorias' : categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Metabolismo */}
            <Select value={selectedMetabolism} onValueChange={setSelectedMetabolism}>
              <SelectTrigger>
                <SelectValue placeholder="Metabolismo" />
              </SelectTrigger>
              <SelectContent>
                {METABOLISMO_OPTIONS.map(metabolismo => (
                  <SelectItem key={metabolismo} value={metabolismo}>
                    {metabolismo === 'todos' ? 'Todos os tipos' : getMetabolismLabel(metabolismo)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Apenas Superalimentos */}
            <Button
              variant={showOnlySuper ? "default" : "outline"}
              onClick={() => setShowOnlySuper(!showOnlySuper)}
              className="flex items-center gap-2"
            >
              <Star className={`h-4 w-4 ${showOnlySuper ? 'text-white' : 'text-yellow-500'}`} />
              Superalimentos
            </Button>
          </div>

          {/* Estatísticas */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Total: {filteredFoods.length} alimentos</span>
            <span>Superalimentos: {filteredFoods.filter(f => f.super_alimento).length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Alimentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFoods.map((food, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {food.super_alimento && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                    {food.nome}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground capitalize">{food.categoria}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold" style={{ color: food.classificacao.cor }}>
                    {food.pontuacao}
                  </div>
                  <div className="text-xs text-muted-foreground">pontos</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Classificação */}
              <Badge 
                style={{ backgroundColor: food.classificacao.cor + '20', color: food.classificacao.cor }}
                className="border-0"
              >
                {food.classificacao.label}
              </Badge>

              {/* Metabolismo */}
              <div className="flex items-center gap-2">
                {getMetabolismIcon(food.metabolismo)}
                <span className="text-sm">{getMetabolismLabel(food.metabolismo)}</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {food.tags.map((tag, tagIndex) => (
                  <Badge key={tagIndex} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Benefícios */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Benefícios:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {food.beneficios.map((beneficio, bIndex) => (
                    <li key={bIndex} className="flex items-center gap-1">
                      <Leaf className="h-3 w-3 text-green-500" />
                      {beneficio}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Macronutrientes */}
              <div className="bg-muted/50 p-3 rounded-lg">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                  <ChefHat className="h-3 w-3" />
                  Nutrição (100g)
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Calorias: {food.macronutrientes.calorias}kcal</div>
                  <div>Proteínas: {food.macronutrientes.proteinas}g</div>
                  <div>Carboidratos: {food.macronutrientes.carboidratos}g</div>
                  <div>Gorduras: {food.macronutrientes.gorduras}g</div>
                  {food.macronutrientes.fibras > 0 && (
                    <div className="col-span-2">Fibras: {food.macronutrientes.fibras}g</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFoods.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum alimento encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou termos de busca.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrganizedFoodDatabase;