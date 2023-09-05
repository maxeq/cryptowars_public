interface ItemStats {
  stamina: number;
  agility: number;
  luck: number;
  strength: number;
}

function generateItemStats(quality: string): ItemStats {
  let baseValue: number;
  switch (quality) {
    case 'Common':
      baseValue = 1;
      break;
    case 'Uncommon':
      baseValue = 5;
      break;
    case 'Rare':
      baseValue = 10;
      break;
    case 'Epic':
      baseValue = 15;
      break;
    case 'Legendary':
      baseValue = 20;
      break;
    default:
      baseValue = 1;
      break;
  }

  const stats: ItemStats = {
    stamina: baseValue + Math.ceil(Math.random() * 5),
    agility: baseValue + Math.ceil(Math.random() * 5),
    luck: baseValue + Math.ceil(Math.random() * 5),
    strength: baseValue + Math.ceil(Math.random() * 5),
  };

  return stats;
}

export default generateItemStats;
