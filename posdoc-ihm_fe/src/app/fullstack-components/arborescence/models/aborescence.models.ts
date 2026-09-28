export interface Arborescence {
  id: number;
  text: string;
  value: any; // true : case cochée, false : case décochée, null, case semi-cochée
  children?: Arborescence[];
  expandChildByDefault?: boolean;
  icon?: string;
  ordre?: number;
}

export interface ArborescenceOutputEvent {
  value: boolean;
  parentsIndexes: string;
}
