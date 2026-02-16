export interface Member {
  id: string;
  name: string;
}

export type SplitType = "equal" | "unequal" | "select";

export interface Split {
  memberId: string;
  amount: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  paidBy: string;
  splitType: SplitType;
  splits: Split[];
}

export interface Group {
  id: string;
  name: string;
  members: Member[];
  expenses: Expense[];
  createdAt: string;
}
