// reroll.ts
import { DropTable, generateDropTable } from './dropTable';

const dropChancesByLevel = [
  [100, 0, 0, 0, 0], // Level 1
  [100, 0, 0, 0, 0], // Level 2
  [75, 25, 0, 0, 0], // Level 3
  [55, 30, 15, 0, 0], // Level 4
  [45, 33, 20, 2, 0], // Level 5
  [25, 40, 30, 5, 0], // Level 6
  [19, 30, 35, 15, 1], // Level 7
  [16, 20, 35, 25, 4], // Level 8
  [9, 15, 30, 30, 16], // Level 9
];

export function rerollItems(avatarLevel: number): string {
  const dropTable: DropTable = generateDropTable(dropChancesByLevel[avatarLevel - 1]);
  const roll = Math.random() * 100;

  if (roll < dropTable.oneCost) {
    return '1-cost item';
  } else if (roll < dropTable.oneCost + dropTable.twoCost) {
    return '2-cost item';
  } else if (roll < dropTable.oneCost + dropTable.twoCost + dropTable.threeCost) {
    return '3-cost item';
  } else if (
    roll <
    dropTable.oneCost + dropTable.twoCost + dropTable.threeCost + dropTable.fourCost
  ) {
    return '4-cost item';
  } else {
    return '5-cost item';
  }
}
