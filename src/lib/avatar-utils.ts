// Utilitário para gerar avatares de emoji consistentes baseados no nome
export function getRandomEmoji(name: string): string {
  const emojis = [
    '😊', '😎', '🤗', '😄', '🥳', '😇', '🤩', '🥰', '😋', '🤓',
    '🌟', '⭐', '🔥', '💫', '✨', '🌈', '🦄', '🚀', '🎯', '🏆',
    '🐱', '🐶', '🐨', '🐼', '🦊', '🐸', '🐯', '🐰', '🐵', '🐺',
    '🌺', '🌸', '🌻', '🌹', '🌷', '🌿', '🍀', '🌱', '🌳', '🌲',
    '🎨', '🎭', '🎪', '🎸', '🎵', '🎤', '🎬', '🎮', '⚽', '🏀'
  ];

  // Usar o nome como seed para garantir consistência
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Converter para 32-bit integer
  }

  // Garantir que o hash seja positivo
  const positiveHash = Math.abs(hash);
  
  // Selecionar emoji baseado no hash
  const emojiIndex = positiveHash % emojis.length;
  return emojis[emojiIndex];
}

// Função para gerar avatar URL baseado no nome (Dicebear)
export function generateAvatarUrl(name: string): string {
  const seed = encodeURIComponent(name);
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
}

// Função para obter avatar (foto, emoji ou fallback)
export function getUserAvatar(avatar: string | null, name: string): { type: 'photo' | 'emoji' | 'generated', value: string } {
  if (avatar && avatar.trim()) {
    return { type: 'photo', value: avatar };
  }
  
  // 50% chance de emoji, 50% chance de avatar gerado
  const useEmoji = Math.abs(hashCode(name)) % 2 === 0;
  
  if (useEmoji) {
    return { type: 'emoji', value: getRandomEmoji(name) };
  } else {
    return { type: 'generated', value: generateAvatarUrl(name) };
  }
}

// Função auxiliar para hash
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}