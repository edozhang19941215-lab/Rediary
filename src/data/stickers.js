// Sticker library — matching the provided sticker sheet
export const STICKER_CATEGORIES = [
  {
    label: '日常',
    items: ['🥞','☕','🥐','🍳','🧁','🍦','🥖','🍵'],
  },
  {
    label: '文具',
    items: ['📖','✒️','📷','📚','✂️','📌','🖊️','📎'],
  },
  {
    label: '生活',
    items: ['🧥','👟','👜','🧦','👓','⌚','💌','🪔'],
  },
  {
    label: '自然',
    items: ['🌵','💐','🌿','🌸','🍃','🌱','🪴','🌾'],
  },
  {
    label: '情绪',
    items: ['✨','⭐','🎵','💫','🌙','☁️','🌈','❤️'],
  },
  {
    label: '小动物',
    items: ['🐰','🐇','🐱','🐶','🐻','🦔','🐣','🐝'],
  },
];

export const ALL_STICKERS = STICKER_CATEGORIES.flatMap(c => c.items);
