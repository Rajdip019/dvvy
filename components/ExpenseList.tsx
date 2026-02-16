"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import AddExpenseForm from "@/components/AddExpenseForm";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Expense, Member } from "@/types";

interface Props {
  groupId: string;
  expenses: Expense[];
  members: Member[];
}

export default function ExpenseList({ groupId, expenses, members }: Props) {
  const { dispatch } = useApp();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

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
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
        <p className="text-muted-foreground">No expenses yet.</p>
        <p className="text-sm text-muted-foreground/70">
          Add your first expense above.
        </p>
      </div>
    );
  }

  const sorted = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <>
      <div className="space-y-3">
        {sorted.map((expense, idx) => (
          <div key={expense.id}>
            <Card className="p-3 sm:p-4">
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm sm:text-base font-medium truncate">
                      {expense.description}
                    </h4>
                    <Badge variant="outline" className="text-[10px] sm:text-xs shrink-0">
                      {expense.splitType}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                    <span>
                      Paid by{" "}
                      <span className="text-foreground font-medium">
                        {memberMap.get(expense.paidBy) ?? "Unknown"}
                      </span>
                    </span>
                    <span>&middot;</span>
                    <span>{new Date(expense.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-2">
                    {expense.splits.map((s) => (
                      <span
                        key={s.memberId}
                        className="inline-flex items-center rounded-md bg-muted px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs"
                      >
                        {memberMap.get(s.memberId) ?? "?"}: ₹{s.amount.toFixed(2)}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 sm:gap-2 shrink-0">
                  <span className="text-base sm:text-lg font-semibold">
                    ₹{expense.amount.toFixed(2)}
                  </span>
                  <div className="flex gap-0.5 sm:gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 sm:px-3 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setEditingExpense(expense)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 sm:px-3 text-xs text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        dispatch({
                          type: "DELETE_EXPENSE",
                          payload: { groupId, expenseId: expense.id },
                        })
                      }
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
            {idx < sorted.length - 1 && <Separator className="my-0" />}
          </div>
        ))}
      </div>

      {editingExpense && (
        <AddExpenseForm
          groupId={groupId}
          members={members}
          expense={editingExpense}
          open={!!editingExpense}
          onOpenChange={(val) => {
            if (!val) setEditingExpense(null);
          }}
        />
      )}
    </>
  );
}
