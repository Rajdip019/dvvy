import type { Expense, Member } from "@/types";

export interface Balance {
  memberId: string;
  amount: number; // positive = owed money, negative = owes money
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export function calculateBalances(
  members: Member[],
  expenses: Expense[]
): Balance[] {
  const balanceMap = new Map<string, number>();

  for (const member of members) {
    balanceMap.set(member.id, 0);
  }

  for (const expense of expenses) {
    // The payer is owed the total amount
    const currentPayerBalance = balanceMap.get(expense.paidBy) ?? 0;
    balanceMap.set(expense.paidBy, currentPayerBalance + expense.amount);

    // Each person in the split owes their share
    for (const split of expense.splits) {
      const currentBalance = balanceMap.get(split.memberId) ?? 0;
      balanceMap.set(split.memberId, currentBalance - split.amount);
    }
  }

  return members.map((m) => ({
    memberId: m.id,
    amount: Math.round((balanceMap.get(m.id) ?? 0) * 100) / 100,
  }));
}

export function simplifyDebts(
  members: Member[],
  expenses: Expense[]
): Settlement[] {
  const balances = calculateBalances(members, expenses);
  const settlements: Settlement[] = [];

  const debtors: { memberId: string; amount: number }[] = [];
  const creditors: { memberId: string; amount: number }[] = [];

  for (const b of balances) {
    if (b.amount < -0.01) {
      debtors.push({ memberId: b.memberId, amount: -b.amount });
    } else if (b.amount > 0.01) {
      creditors.push({ memberId: b.memberId, amount: b.amount });
    }
  }

  // Sort descending
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const payment = Math.min(debtors[i].amount, creditors[j].amount);
    if (payment > 0.01) {
      settlements.push({
        from: debtors[i].memberId,
        to: creditors[j].memberId,
        amount: Math.round(payment * 100) / 100,
      });
    }
    debtors[i].amount -= payment;
    creditors[j].amount -= payment;

    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }

  return settlements;
}

export interface PairwiseTab {
  memberId: string;
  otherMemberId: string;
  amount: number; // positive = owes other, negative = owed by other
}

/**
 * Computes pairwise net debts between every pair of members.
 * For each member, shows what they owe (+) or are owed (-) by every other member.
 */
export function computePairwiseTabs(
  members: Member[],
  expenses: Expense[]
): PairwiseTab[] {
  // Track raw debts: rawDebts[fromId][toId] = total amount from owes to
  const rawDebts = new Map<string, Map<string, number>>();
  for (const m of members) {
    rawDebts.set(m.id, new Map());
  }

  for (const expense of expenses) {
    for (const split of expense.splits) {
      if (split.memberId !== expense.paidBy) {
        const fromMap = rawDebts.get(split.memberId)!;
        const current = fromMap.get(expense.paidBy) ?? 0;
        fromMap.set(expense.paidBy, current + split.amount);
      }
    }
  }

  // Net out and produce tabs for every ordered pair
  const tabs: PairwiseTab[] = [];
  for (const m1 of members) {
    for (const m2 of members) {
      if (m1.id === m2.id) continue;
      const m1OwesM2 = rawDebts.get(m1.id)?.get(m2.id) ?? 0;
      const m2OwesM1 = rawDebts.get(m2.id)?.get(m1.id) ?? 0;
      const net = Math.round((m1OwesM2 - m2OwesM1) * 100) / 100;
      tabs.push({ memberId: m1.id, otherMemberId: m2.id, amount: net });
    }
  }

  return tabs;
}
