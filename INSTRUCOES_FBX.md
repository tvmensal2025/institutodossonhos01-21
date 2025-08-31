# 📁 Instruções para Arquivo FBX

## 🎯 Como usar arquivos FBX no projeto

### 1. 📂 Pasta para arquivos FBX
Coloque seus arquivos FBX na pasta:
```
public/models/
```

### 2. 📝 Nome do arquivo
Para o personagem feminino, use o nome:
```
personagem-feminino-3d.fbx
```

### 3. 🔧 Como funciona
- O sistema automaticamente detecta se existe um arquivo FBX
- Se encontrar, carrega o modelo 3D real
- Se não encontrar, mostra o placeholder

### 4. ✨ Recursos do FBXViewer
- ✅ Carregamento automático de FBX
- ✅ Renderização 3D real
- ✅ Iluminação e sombras
- ✅ Controles de câmera (opcional)
- ✅ Redimensionamento automático
- ✅ Fundo branco perfeito
- ✅ SEM elementos de navegador

### 5. 🎮 Controles (quando habilitados)
- 🖱️ Arraste para rotacionar
- 🔍 Scroll para zoom
- 🔄 Clique direito para pan

### 6. 📊 Formatos suportados
- ✅ FBX (recomendado)
- ✅ GLB/GLTF (fallback)
- ✅ Placeholder (quando não há arquivo)

### 7. 🚀 Exemplo de uso
```jsx
<FBXViewer
  modelPath="/models/personagem-feminino-3d.fbx"
  height="500px"
  width="100%"
  autoRotate={false}
  showControls={false}
/>
```

### 8. 📋 Checklist
- [ ] Arquivo FBX na pasta `public/models/`
- [ ] Nome correto: `personagem-feminino-3d.fbx`
- [ ] Three.js instalado (já feito)
- [ ] Componente FBXViewer criado (já feito)
- [ ] Sistema de detecção automática (já feito)

### 9. 🔍 Verificação
Após colocar o arquivo, o sistema vai:
1. Detectar automaticamente o arquivo FBX
2. Carregar o modelo 3D real
3. Substituir o placeholder
4. Mostrar o personagem 3D MUITO MAIOR

### 10. 🎉 Resultado esperado
- Personagem 3D real renderizado
- Tamanho MUITO MAIOR (5000px)
- SEM elementos de navegador
- Fundo branco perfeito
- Modelo estático (sem rotação automática)

---

**🎯 PRONTO! Agora é só colocar seu arquivo FBX na pasta `public/models/` com o nome `personagem-feminino-3d.fbx` e o sistema vai carregar automaticamente!** 