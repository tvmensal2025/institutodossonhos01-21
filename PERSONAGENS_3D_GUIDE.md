# 🎭 Guia dos Personagens 3D

Este guia explica como usar os componentes de personagens 3D masculino e feminino em sua aplicação React.

## 📋 Componentes Disponíveis

### 1. MegaMaleCharacter3D
Personagem masculino 3D com suporte completo a modelos FBX.

### 2. MegaFemaleCharacter3D  
Personagem feminino 3D com suporte completo a modelos FBX.

### 3. CharacterSelector3D
Seletor que permite alternar entre personagem masculino e feminino.

## 🚀 Instalação

Primeiro, instale as dependências necessárias:

```bash
npm install three @react-three/fiber @react-three/drei
```

## 📁 Estrutura de Arquivos

Certifique-se de ter os modelos FBX na pasta `public/models/`:

```
public/
  models/
    male-character.fbx    # Modelo masculino
    female-character.fbx  # Modelo feminino
```

## 💡 Exemplos de Uso

### Personagem Masculino Simples

```tsx
import { MegaMaleCharacter3D } from './components/ui/mega-male-character-3d'

function App() {
  return (
    <MegaMaleCharacter3D 
      width={400} 
      height={600}
      autoRotate={true}
      showControls={true}
    />
  )
}
```

### Personagem Feminino com Configurações Avançadas

```tsx
import { MegaFemaleCharacter3D } from './components/ui/mega-female-character-3d'

function App() {
  return (
    <MegaFemaleCharacter3D 
      width={500} 
      height={700}
      autoRotate={false}
      showControls={true}
      enableZoom={true}
      backgroundColor="#f0f8ff"
      showEnvironment={true}
      animationSpeed={1.5}
      onLoad={() => console.log('Modelo carregado!')}
      onError={(error) => console.error('Erro:', error)}
    />
  )
}
```

### Seletor de Personagens

```tsx
import { CharacterSelector3D } from './components/ui/character-selector-3d'

function App() {
  const handleGenderChange = (gender) => {
    console.log('Gênero selecionado:', gender)
  }

  return (
    <CharacterSelector3D 
      width={450} 
      height={650}
      defaultGender="male"
      showGenderSelector={true}
      onGenderChange={handleGenderChange}
      maleCharacterProps={{
        autoRotate: true,
        showControls: true
      }}
      femaleCharacterProps={{
        autoRotate: false,
        showEnvironment: true
      }}
    />
  )
}
```

## ⚙️ Props Disponíveis

### Dimensões
- `width`: Largura do componente (padrão: 400)
- `height`: Altura do componente (padrão: 600)

### Controles
- `showControls`: Mostrar controles de câmera (padrão: true)
- `autoRotate`: Rotação automática (padrão: true)
- `enableZoom`: Permitir zoom (padrão: true)
- `enablePan`: Permitir pan (padrão: true)

### Câmera
- `cameraPosition`: Posição da câmera [x, y, z] (padrão: [0, 1.5, 3])

### Visual
- `backgroundColor`: Cor de fundo (padrão: '#f8fafc')
- `showEnvironment`: Mostrar ambiente 3D (padrão: true)
- `showGrid`: Mostrar grade de referência (padrão: false)
- `showAxes`: Mostrar eixos de coordenadas (padrão: false)

### Animação
- `animationSpeed`: Velocidade das animações (padrão: 1)

### Eventos
- `onLoad`: Callback quando modelo carrega
- `onError`: Callback quando ocorre erro

### Estilo
- `className`: Classes CSS customizadas
- `style`: Estilos inline

## 🎮 Funcionalidades

### Controles de Animação
- **Navegação**: Use as setas ← → para trocar animações
- **Indicadores**: Pontos indicam qual animação está ativa
- **Contador**: Mostra animação atual e total

### Controles de Câmera
- **Mouse**: Arraste para rotacionar
- **Scroll**: Zoom in/out
- **Botão direito**: Pan

### Estados Visuais
- **Loading**: Spinner durante carregamento
- **Erro**: Mensagem de erro com botão de retry
- **Info**: Painel com informações do modelo

## 🔧 Personalização

### Cores Temáticas

```tsx
// Tema azul para masculino
<MegaMaleCharacter3D 
  backgroundColor="#e3f2fd"
  style={{ border: '2px solid #2196f3' }}
/>

// Tema rosa para feminino
<MegaFemaleCharacter3D 
  backgroundColor="#fce4ec"
  style={{ border: '2px solid #e91e63' }}
/>
```

### Configurações Avançadas

```tsx
<CharacterSelector3D 
  maleCharacterProps={{
    autoRotate: true,
    showControls: true,
    backgroundColor: "#e3f2fd",
    animationSpeed: 1.2
  }}
  femaleCharacterProps={{
    autoRotate: false,
    showEnvironment: true,
    backgroundColor: "#fce4ec",
    animationSpeed: 0.8
  }}
/>
```

## 🐛 Solução de Problemas

### Modelo não carrega
1. Verifique se o arquivo FBX existe em `/public/models/`
2. Confirme se o nome do arquivo está correto
3. Verifique se as dependências estão instaladas

### Performance lenta
1. Reduza a qualidade do modelo
2. Desative animações desnecessárias
3. Ajuste a resolução do canvas

### Erro de Three.js
1. Verifique a versão das dependências
2. Confirme se o modelo FBX é compatível
3. Verifique o console para erros específicos

## 📱 Responsividade

Os componentes são responsivos por padrão. Para melhor controle:

```tsx
// Responsivo baseado no container
<div className="w-full h-96">
  <MegaMaleCharacter3D 
    width="100%" 
    height="100%"
  />
</div>

// Tamanho fixo
<MegaFemaleCharacter3D 
  width={300} 
  height={400}
  className="mx-auto"
/>
```

## 🎯 Casos de Uso

### Dashboard de Saúde
```tsx
<CharacterSelector3D 
  width={300} 
  height={400}
  showGenderSelector={false}
  defaultGender={userGender}
  onGenderChange={updateUserProfile}
/>
```

### Configuração de Perfil
```tsx
<CharacterSelector3D 
  width={500} 
  height={600}
  showGenderSelector={true}
  onGenderChange={saveUserPreference}
/>
```

### Visualização de Progresso
```tsx
<MegaMaleCharacter3D 
  width={400} 
  height={500}
  autoRotate={false}
  showControls={true}
  onLoad={() => startProgressAnimation()}
/>
```

## 🔄 Atualizações

Para atualizar os componentes:

1. Substitua os arquivos FBX em `/public/models/`
2. Ajuste as configurações conforme necessário
3. Teste as animações e controles

## 📞 Suporte

Se encontrar problemas:

1. Verifique o console do navegador
2. Confirme se todas as dependências estão instaladas
3. Teste com modelos FBX simples primeiro
4. Verifique a compatibilidade do navegador

---

**🎭 Pronto para usar!** Os componentes estão otimizados para performance e oferecem uma experiência 3D rica e interativa. 