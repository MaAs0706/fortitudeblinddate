const adjectives = [
  "Silent",
  "Cosmic",
  "Velvet",
  "Mystic",
  "Crimson",
  "Lunar",
  "Echo",
  "Serene",
];

const nouns = [
  "Fox",
  "Raven",
  "Nova",
  "Vibe",
  "Soul",
  "Wave",
  "Flame",
  "Bloom",
];

export function generateNickname() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 900 + 100); // 3 digit

  return `${adj}${noun}${num}`;
}
