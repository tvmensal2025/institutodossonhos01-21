# DETALHES TÉCNICOS - SISTEMA SOFIA NUTRICIONAL

## 🔧 CONFIGURAÇÃO TÉCNICA COMPLETA

### Stack Tecnológico
```
Frontend:
├── React 18.2.0
├── TypeScript 5.0.0
├── Vite 4.4.0
├── Tailwind CSS 3.3.0
├── Shadcn/ui (Componentes)
├── Framer Motion (Animações)
├── React Query (Cache)
└── React Router (Navegação)

Backend:
├── Supabase (PostgreSQL)
├── Edge Functions (Deno)
├── Real-time Subscriptions
├── Row Level Security (RLS)
└── Storage (Arquivos)

APIs Externas:
├── OpenAI GPT-4
├── Google Vision API
├── Google Fit API
├── Mealie API
├── Stripe (Pagamentos)
└── WhatsApp Business API
```

### Estrutura de Banco de Dados

#### Tabelas Principais
```sql
-- Perfis de usuários
profiles (
  id uuid primary key,
  email text unique,
  full_name text,
  avatar_url text,
  google_fit_enabled boolean default false,
  subscription_status text,
  created_at timestamp,
  updated_at timestamp
)

-- Medições de peso
weight_measurements (
  id uuid primary key,
  user_id uuid references profiles(id),
  weight numeric,
  body_fat numeric,
  muscle_mass numeric,
  hydration numeric,
  measured_at timestamp,
  created_at timestamp
)

-- Conversas com Sofia
sofia_conversations (
  id uuid primary key,
  user_id uuid references profiles(id),
  message text,
  response text,
  message_type text,
  created_at timestamp
)

-- Planos de refeição
meal_plans (
  id uuid primary key,
  user_id uuid references profiles(id),
  plan_data jsonb,
  nutrition_data jsonb,
  created_at timestamp,
  expires_at timestamp
)

-- Análise de alimentos
food_analysis (
  id uuid primary key,
  user_id uuid references profiles(id),
  image_url text,
  analysis_result jsonb,
  nutrition_data jsonb,
  created_at timestamp
)
```

### Edge Functions Principais

#### 1. Sofia Chat (`sofia-chat`)
```typescript
// Função principal de chat com IA
export async function handler(req: Request) {
  const { message, userId, context } = await req.json()
  
  // Processamento com OpenAI GPT-4
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: SOFIA_PROMPT },
      { role: "user", content: message }
    ]
  })
  
  return new Response(JSON.stringify({ response }))
}
```

#### 2. Geração de Refeições (`generate-meal-plan`)
```typescript
// Geração inteligente de planos
export async function handler(req: Request) {
  const { userId, preferences, restrictions } = await req.json()
  
  // Integração com Mealie API
  const recipes = await mealieApi.searchRecipes({
    ingredients: preferences.ingredients,
    restrictions: restrictions,
    calories: preferences.calories
  })
  
  // Cálculo nutricional com TACO
  const nutritionData = await calculateNutrition(recipes)
  
  return new Response(JSON.stringify({ plan: recipes, nutrition: nutritionData }))
}
```

#### 3. Google Fit Sync (`google-fit-sync`)
```typescript
// Sincronização com Google Fit
export async function handler(req: Request) {
  const { userId, accessToken } = await req.json()
  
  // Buscar dados do Google Fit
  const fitData = await googleFit.getData({
    accessToken,
    dataTypes: ['weight', 'activity', 'heart_rate']
  })
  
  // Salvar no Supabase
  await supabase.from('weight_measurements').insert(fitData)
  
  return new Response(JSON.stringify({ synced: true }))
}
```

### Componentes React Principais

#### 1. Sofia Chat Component
```typescript
// src/components/sofia/SofiaChat.tsx
export const SofiaChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const sendMessage = async (message: string) => {
    setIsLoading(true)
    
    const response = await supabase.functions.invoke('sofia-chat', {
      body: { message, userId: user.id }
    })
    
    setMessages(prev => [...prev, { role: 'user', content: message }])
    setMessages(prev => [...prev, { role: 'assistant', content: response.data }])
    
    setIsLoading(false)
  }
  
  return (
    <div className="chat-container">
      <MessageList messages={messages} />
      <MessageInput onSend={sendMessage} isLoading={isLoading} />
    </div>
  )
}
```

#### 2. Meal Plan Generator
```typescript
// src/components/meal-plan/MealPlanGenerator.tsx
export const MealPlanGenerator: React.FC = () => {
  const [plan, setPlan] = useState<MealPlan | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences>()
  
  const generatePlan = async () => {
    const response = await supabase.functions.invoke('generate-meal-plan', {
      body: { userId: user.id, preferences }
    })
    
    setPlan(response.data.plan)
  }
  
  return (
    <div className="meal-plan-generator">
      <PreferencesForm onSave={setPreferences} />
      <GenerateButton onClick={generatePlan} />
      {plan && <MealPlanDisplay plan={plan} />}
    </div>
  )
}
```

### Hooks Customizados

#### 1. useSofiaIntegration
```typescript
// src/hooks/useSofiaIntegration.ts
export const useSofiaIntegration = () => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const sendMessage = async (message: string) => {
    setIsLoading(true)
    
    try {
      const response = await supabase.functions.invoke('sofia-chat', {
        body: { message, userId: user.id }
      })
      
      setConversations(prev => [...prev, {
        id: Date.now(),
        message,
        response: response.data,
        timestamp: new Date()
      }])
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  return { conversations, sendMessage, isLoading }
}
```

#### 2. useMealPlanGenerator
```typescript
// src/hooks/useMealPlanGenerator.ts
export const useMealPlanGenerator = () => {
  const [plans, setPlans] = useState<MealPlan[]>([])
  const [currentPlan, setCurrentPlan] = useState<MealPlan | null>(null)
  
  const generatePlan = async (preferences: UserPreferences) => {
    const response = await supabase.functions.invoke('generate-meal-plan', {
      body: { userId: user.id, preferences }
    })
    
    const newPlan = response.data
    setPlans(prev => [...prev, newPlan])
    setCurrentPlan(newPlan)
    
    return newPlan
  }
  
  return { plans, currentPlan, generatePlan }
}
```

### Configurações de Segurança

#### Row Level Security (RLS)
```sql
-- Política para perfis
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política para medições de peso
CREATE POLICY "Users can view own measurements" ON weight_measurements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own measurements" ON weight_measurements
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Variáveis de Ambiente
```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# OpenAI
VITE_OPENAI_API_KEY=sk-your-openai-key

# Google APIs
VITE_GOOGLE_FIT_CLIENT_ID=your-google-fit-client-id
VITE_GOOGLE_VISION_API_KEY=your-vision-api-key

# Mealie
VITE_MEALIE_API_URL=https://your-mealie-instance.com
VITE_MEALIE_API_KEY=your-mealie-api-key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk-your-stripe-key

# WhatsApp
VITE_WHATSAPP_API_TOKEN=your-whatsapp-token
```

### Scripts de Deploy
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "deploy": "vercel --prod",
    "supabase:deploy": "supabase functions deploy",
    "supabase:start": "supabase start",
    "supabase:stop": "supabase stop"
  }
}
```

### Métricas de Performance
```typescript
// Monitoramento de performance
const performanceMetrics = {
  pageLoadTime: '< 2s',
  apiResponseTime: '< 500ms',
  bundleSize: '< 2MB',
  lighthouseScore: '95+',
  uptime: '99.9%'
}
```

### Testes
```typescript
// Exemplo de teste de componente
describe('SofiaChat', () => {
  it('should send message and receive response', async () => {
    render(<SofiaChat />)
    
    const input = screen.getByPlaceholderText('Digite sua mensagem...')
    const sendButton = screen.getByText('Enviar')
    
    fireEvent.change(input, { target: { value: 'Olá Sofia' } })
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText('Olá! Como posso ajudar?')).toBeInTheDocument()
    })
  })
})
```

---

**Documento Técnico Completo**
**Versão**: 2.1.0
**Última Atualização**: Janeiro 2025
**Commit**: f7711c8
