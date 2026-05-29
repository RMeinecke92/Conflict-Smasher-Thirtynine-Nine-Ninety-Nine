let nextCharacterId = 1;

export function createCharacterCollisionFilter() {
  const id = nextCharacterId++;
  const category = 0x0001 << (id % 16);

  return {
    group: -1,
    category,
    mask: 0xffff,
  };
}

export const GROUND_COLLISION = {
  group: 0,
  category: 0x0001,
  mask: 0xffff,
};
