// dropTable.ts
export interface DropTable {
  oneCost: number;
  twoCost: number;
  threeCost: number;
  fourCost: number;
  fiveCost: number;
}

export function generateDropTable(percentages: number[]): DropTable {
  return {
    oneCost: percentages[0],
    twoCost: percentages[1],
    threeCost: percentages[2],
    fourCost: percentages[3],
    fiveCost: percentages[4],
  };
}
