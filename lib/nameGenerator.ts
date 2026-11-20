const ADJECTIVES = [
  'Quiet', 'Gentle', 'Wandering', 'Luminous', 'Patient', 'Serene', 'Golden',
  'Amber', 'Silver', 'Misty', 'Velvet', 'Curious', 'Brave', 'Dreaming',
  'Wild', 'Silent', 'Swift', 'Warm', 'Humble', 'Echoing', 'Radiant',
  'Kind', 'Still', 'Starlit', 'Cobalt', 'Whimsical', 'Tender', 'Shadow'
];

const NOUNS = [
  'Otter', 'Sparrow', 'Fox', 'Heron', 'Badger', 'Deer', 'Falcon',
  'Hedgehog', 'Finch', 'Owl', 'Wolf', 'Rabbit', 'Moth', 'Robin',
  'Raven', 'Clover', 'Willow', 'River', 'Pebble', 'Breeze', 'Cricket',
  'Bear', 'Lynx', 'Moss', 'Cedar', 'Acorn', 'Wren', 'Lark'
];

export function generateRandomFriendlyName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj} ${noun}`;
}

export function generateAnonymousId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return 'user_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  }
  return 'user_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}
