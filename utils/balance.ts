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
