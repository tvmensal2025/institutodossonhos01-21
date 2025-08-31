# 🎬 Guia para Adicionar Vídeo Masculino

## 📁 **Como Adicionar o Vídeo:**

### **1. Preparar o Vídeo:**
- Formato: **MP4**
- Tamanho recomendado: **200x250 pixels** ou proporcional
- Duração: **5-10 segundos** (loop)
- Peso: **Máximo 5MB** para carregamento rápido

### **2. Colocar o Vídeo:**
```bash
# Copie seu vídeo para a pasta
cp SEU_VIDEO.mp4 public/videos/male-character.mp4
```

### **3. Estrutura de Arquivos:**
```
public/
├── videos/
│   ├── male-character.mp4    # Seu vídeo aqui
│   └── female-character.mp4  # Opcional
└── video-male.html          # HTML de referência
```

## 🔧 **Configuração do Componente:**

### **Arquivo:** `src/components/ui/video-character-3d.tsx`
```tsx
const characterConfig = {
  male: {
    videoSrc: '/videos/male-character.mp4', // Seu vídeo aqui
    fallbackEmoji: '👨',
    color: '#3b82f6',
    name: 'Masculino',
    bgColor: '#e3f2fd'
  },
  // ...
}
```

## 🎯 **Características do Vídeo:**

### **✅ Recomendado:**
- ✅ **Formato:** MP4
- ✅ **Codec:** H.264
- ✅ **Resolução:** 200x250px ou proporcional
- ✅ **FPS:** 24-30fps
- ✅ **Loop:** Sim (5-10 segundos)
- ✅ **Mudo:** Sim (autoplay requer)
- ✅ **Peso:** < 5MB

### **❌ Evitar:**
- ❌ **Formatos:** AVI, MOV, WMV
- ❌ **Tamanho:** Muito grande (> 10MB)
- ❌ **Duração:** Muito longa (> 30 segundos)
- ❌ **Áudio:** Com som (não funciona com autoplay)

## 🚀 **Como Testar:**

### **1. Verificar se o vídeo carrega:**
```bash
# Teste se o arquivo existe
ls -la public/videos/male-character.mp4
```

### **2. Acessar a página:**
```
http://localhost:8082/character-demo
```

### **3. Verificar no console:**
- Abra DevTools (F12)
- Verifique se não há erros de carregamento
- O vídeo deve aparecer no personagem masculino

## 🔧 **Troubleshooting:**

### **Se o vídeo não carregar:**
1. **Verificar caminho:** `/videos/male-character.mp4`
2. **Verificar formato:** Deve ser MP4
3. **Verificar tamanho:** < 5MB
4. **Verificar console:** Erros no DevTools

### **Se o vídeo carregar mas não aparecer:**
1. **Verificar autoplay:** Deve ser `muted`
2. **Verificar loop:** Deve ter `loop`
3. **Verificar playsInline:** Para mobile

## 📊 **Exemplo de Vídeo Ideal:**

### **Especificações:**
- **Resolução:** 200x250px
- **Duração:** 8 segundos
- **FPS:** 24fps
- **Peso:** 2-3MB
- **Loop:** Sim
- **Mudo:** Sim

### **Conteúdo Sugerido:**
- Personagem masculino em 3D
- Rotação suave
- Movimento natural
- Fundo transparente ou sólido

## 🎭 **Resultado Final:**

Após adicionar o vídeo, você terá:
- ✅ **Masculino:** Vídeo interativo com rotação 3D
- ✅ **Feminino:** Emoji 3D com rotação
- ✅ **Controles:** Botões de rotação funcionais
- ✅ **Responsivo:** Funciona em todos dispositivos
- ✅ **Performance:** Carregamento otimizado

---

**🎬 Coloque seu vídeo em `public/videos/male-character.mp4` e veja a magia acontecer!** 