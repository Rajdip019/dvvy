"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  calculateBalances,
  simplifyDebts,
} from "@/utils/balance";
import type { Expense, Member } from "@/types";

interface Props {
  members: Member[];
  expenses: Expense[];
}

export default function BalanceSheet({ members, expenses }: Props) {
  const balances = calculateBalances(members, expenses);
  const settlements = simplifyDebts(members, expenses);
  const memberMap = new Map(members.map((m) => [m.id, m.name]));

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-10 w-10 text-muted-foreground/50 mb-3"
        >
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
        <p className="text-muted-foreground">No balances to show.</p>
        <p className="text-sm text-muted-foreground/70">
          Add some expenses first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Net Balances
        </h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {balances.map((b) => (
            <Card key={b.memberId} className="p-2.5 sm:p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] sm:text-xs font-medium text-primary shrink-0">
                    {(memberMap.get(b.memberId) ?? "?").charAt(0).toUpperCase()}
                  </span>
                  <span className="text-xs sm:text-sm font-medium truncate">
                    {memberMap.get(b.memberId)}
                  </span>
                </div>
                <span
                  className={`text-xs sm:text-sm font-semibold shrink-0 ${
                    b.amount > 0.01
                      ? "text-green-500"
                      : b.amount < -0.01
                      ? "text-red-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {b.amount > 0.01
                    ? `+₹${b.amount.toFixed(2)}`
                    : b.amount < -0.01
                    ? `-₹${Math.abs(b.amount).toFixed(2)}`
                    : "Settled"}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {settlements.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Simplified Settlements
            </h3>
            <div className="space-y-2">
              {settlements.map((s, i) => (
                <Card key={i} className="p-2.5 sm:p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm min-w-0">
                      <span className="font-medium text-red-400 truncate">
                        {memberMap.get(s.from)}
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-muted-foreground"
                      >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                      <span className="font-medium text-green-500 truncate">
                        {memberMap.get(s.to)}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-semibold shrink-0">
                      ₹{s.amount.toFixed(2)}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
