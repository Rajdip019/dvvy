import type { Expense, Member } from "@/types";

export interface GroupStats {
  totalExpenses: number;
  expenseCount: number;
  averageExpense: number;
  largestExpense: { amount: number; description: string } | null;
}

export interface MemberStats {
  memberId: string;
  totalPaid: number;
  totalShare: number;
}

export interface ExpenseByDate {
  date: string;
  total: number;
}

export function computeGroupStats(expenses: Expense[]): GroupStats {
  if (expenses.length === 0) {
    return {
      totalExpenses: 0,
      expenseCount: 0,
      averageExpense: 0,
      largestExpense: null,
    };
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  let largest = expenses[0];
  for (const e of expenses) {
    if (e.amount > largest.amount) largest = e;
  }

  return {
    totalExpenses,
    expenseCount: expenses.length,
    averageExpense: Math.round((totalExpenses / expenses.length) * 100) / 100,
    largestExpense: {
      amount: largest.amount,
      description: largest.description,
    },
  };
}

export function computeMemberStats(
  members: Member[],
  expenses: Expense[]
): MemberStats[] {
  const paidMap = new Map<string, number>();
  const shareMap = new Map<string, number>();

  for (const member of members) {
    paidMap.set(member.id, 0);
    shareMap.set(member.id, 0);
  }

  for (const expense of expenses) {
    paidMap.set(
      expense.paidBy,
      (paidMap.get(expense.paidBy) ?? 0) + expense.amount
    );
    for (const split of expense.splits) {
      shareMap.set(
        split.memberId,
        (shareMap.get(split.memberId) ?? 0) + split.amount
      );
    }
  }

  return members.map((m) => ({
    memberId: m.id,
    totalPaid: Math.round((paidMap.get(m.id) ?? 0) * 100) / 100,
    totalShare: Math.round((shareMap.get(m.id) ?? 0) * 100) / 100,
  }));
}

export function computeExpenseTimeline(expenses: Expense[]): ExpenseByDate[] {
  const dateMap = new Map<string, number>();

  for (const expense of expenses) {
    dateMap.set(expense.date, (dateMap.get(expense.date) ?? 0) + expense.amount);
  }

  return Array.from(dateMap.entries())
    .map(([date, total]) => ({
      date,
      total: Math.round(total * 100) / 100,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
