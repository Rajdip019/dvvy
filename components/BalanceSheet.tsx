"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  calculateBalances,
  computePairwiseTabs,
} from "@/utils/balance";
import type { Expense, Member } from "@/types";

interface Props {
  members: Member[];
  expenses: Expense[];
}

export default function BalanceSheet({ members, expenses }: Props) {
  const balances = calculateBalances(members, expenses);
  const pairwiseTabs = computePairwiseTabs(members, expenses);
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

      {pairwiseTabs.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Who Pays Whom
            </h3>
            <div className="space-y-4">
              {members.map((m) => {
                const tabs = pairwiseTabs.filter(
                  (t) => t.memberId === m.id
                );
                return (
                  <Card key={m.id} className="p-2.5 sm:p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] sm:text-xs font-medium text-primary shrink-0">
                        {m.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold">
                        {m.name}
                      </span>
                    </div>
                    <div className="space-y-1 ml-8 sm:ml-9">
                      {tabs.map((t) => (
                        <div
                          key={t.otherMemberId}
                          className="flex items-center justify-between text-xs sm:text-sm"
                        >
                          <span className="text-muted-foreground truncate">
                            {t.amount > 0.01
                              ? `owes ${memberMap.get(t.otherMemberId)}`
                              : t.amount < -0.01
                              ? `gets back from ${memberMap.get(t.otherMemberId)}`
                              : `settled with ${memberMap.get(t.otherMemberId)}`}
                          </span>
                          <span
                            className={`font-medium shrink-0 ml-2 ${
                              t.amount > 0.01
                                ? "text-red-400"
                                : t.amount < -0.01
                                ? "text-green-500"
                                : "text-muted-foreground"
                            }`}
                          >
                            {t.amount > 0.01
                              ? `₹${t.amount.toFixed(2)}`
                              : t.amount < -0.01
                              ? `₹${Math.abs(t.amount).toFixed(2)}`
                              : "₹0.00"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </>
      )}

    </div>
  );
}
