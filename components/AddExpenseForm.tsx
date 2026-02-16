"use client";

import { useState, useEffect } from "react";
import { useApp, generateId } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Expense, Member, SplitType, Split } from "@/types";

interface Props {
  groupId: string;
  members: Member[];
  expense?: Expense;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function AddExpenseForm({
  groupId,
  members,
  expense,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: Props) {
  const { dispatch } = useApp();
  const isEdit = !!expense;

  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [paidBy, setPaidBy] = useState(members[0]?.id ?? "");
  const [splitType, setSplitType] = useState<SplitType>("equal");
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    new Set(members.map((m) => m.id))
  );
  const [unequalAmounts, setUnequalAmounts] = useState<Record<string, string>>(
    {}
  );

  // Pre-fill form when editing
  useEffect(() => {
    if (expense && open) {
      setDescription(expense.description);
      setAmount(expense.amount.toString());
      setDate(expense.date);
      setPaidBy(expense.paidBy);
      setSplitType(expense.splitType);
      if (expense.splitType === "select") {
        setSelectedMembers(new Set(expense.splits.map((s) => s.memberId)));
      } else {
        setSelectedMembers(new Set(members.map((m) => m.id)));
      }
      if (expense.splitType === "unequal") {
        const amounts: Record<string, string> = {};
        for (const s of expense.splits) {
          amounts[s.memberId] = s.amount.toString();
        }
        setUnequalAmounts(amounts);
      } else {
        setUnequalAmounts({});
      }
    }
  }, [expense, open, members]);

  function resetForm() {
    setDescription("");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setPaidBy(members[0]?.id ?? "");
    setSplitType("equal");
    setSelectedMembers(new Set(members.map((m) => m.id)));
    setUnequalAmounts({});
  }

  function toggleMember(memberId: string) {
    setSelectedMembers((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }
      return next;
    });
  }

  function computeSplits(): Split[] | null {
    const total = parseFloat(amount);
    if (isNaN(total) || total <= 0) return null;

    if (splitType === "equal") {
      const perPerson = Math.round((total / members.length) * 100) / 100;
      return members.map((m) => ({ memberId: m.id, amount: perPerson }));
    }

    if (splitType === "select") {
      const selected = members.filter((m) => selectedMembers.has(m.id));
      if (selected.length === 0) return null;
      const perPerson = Math.round((total / selected.length) * 100) / 100;
      return selected.map((m) => ({ memberId: m.id, amount: perPerson }));
    }

    if (splitType === "unequal") {
      const splits: Split[] = [];
      let sum = 0;
      for (const m of members) {
        const val = parseFloat(unequalAmounts[m.id] ?? "0");
        if (isNaN(val) || val < 0) return null;
        if (val > 0) {
          splits.push({ memberId: m.id, amount: val });
          sum += val;
        }
      }
      if (Math.abs(sum - total) > 0.01) return null;
      return splits;
    }

    return null;
  }

  const unequalSum = Object.values(unequalAmounts).reduce(
    (sum, v) => sum + (parseFloat(v) || 0),
    0
  );
  const totalNum = parseFloat(amount) || 0;
  const unequalDiff = Math.round((totalNum - unequalSum) * 100) / 100;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const splits = computeSplits();
    if (!splits || !description.trim() || !paidBy) return;

    if (isEdit) {
      dispatch({
        type: "EDIT_EXPENSE",
        payload: {
          groupId,
          expense: {
            id: expense.id,
            description: description.trim(),
            amount: parseFloat(amount),
            date,
            paidBy,
            splitType,
            splits,
          },
        },
      });
    } else {
      dispatch({
        type: "ADD_EXPENSE",
        payload: {
          groupId,
          expense: {
            id: generateId(),
            description: description.trim(),
            amount: parseFloat(amount),
            date,
            paidBy,
            splitType,
            splits,
          },
        },
      });
    }
    resetForm();
    setOpen(false);
  }

  const canSubmit =
    description.trim() &&
    parseFloat(amount) > 0 &&
    paidBy &&
    (splitType !== "select" || selectedMembers.size > 0) &&
    (splitType !== "unequal" || Math.abs(unequalDiff) < 0.01);

  const dialogContent = (
    <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit Expense" : "Add Expense"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g. Dinner"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-10 sm:h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-10 sm:h-9"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 sm:h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="paidBy">Paid By</Label>
            <select
              id="paidBy"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="flex h-10 sm:h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Split Type</Label>
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {(["equal", "select", "unequal"] as SplitType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSplitType(type)}
                className={`flex-1 rounded-md px-2 sm:px-3 py-2 sm:py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                  splitType === type
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {type === "equal"
                  ? "Equal"
                  : type === "select"
                  ? "Select"
                  : "Unequal"}
              </button>
            ))}
          </div>
        </div>

        {splitType === "equal" && (
          <p className="text-sm text-muted-foreground">
            Split equally among all {members.length} members
            {totalNum > 0 && (
              <>
                {" "}
                &mdash; ₹{(totalNum / members.length).toFixed(2)} each
              </>
            )}
          </p>
        )}

        {splitType === "select" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Select who to include in this expense:
            </p>
            <div className="space-y-2">
              {members.map((m) => (
                <label
                  key={m.id}
                  className="flex items-center gap-3 rounded-md border border-border/50 px-3 py-2 hover:bg-accent/30 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={selectedMembers.has(m.id)}
                    onCheckedChange={() => toggleMember(m.id)}
                  />
                  <span className="text-sm">{m.name}</span>
                  {selectedMembers.has(m.id) &&
                    totalNum > 0 &&
                    selectedMembers.size > 0 && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        ₹{(totalNum / selectedMembers.size).toFixed(2)}
                      </span>
                    )}
                </label>
              ))}
            </div>
          </div>
        )}

        {splitType === "unequal" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Enter each person&apos;s share (must add up to ₹
              {totalNum.toFixed(2)}):
            </p>
            <div className="space-y-2">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <span className="text-sm min-w-[80px]">{m.name}</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={unequalAmounts[m.id] ?? ""}
                    onChange={(e) =>
                      setUnequalAmounts((prev) => ({
                        ...prev,
                        [m.id]: e.target.value,
                      }))
                    }
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
            <div
              className={`text-sm font-medium ${
                Math.abs(unequalDiff) < 0.01
                  ? "text-green-500"
                  : "text-destructive"
              }`}
            >
              {Math.abs(unequalDiff) < 0.01
                ? "Amounts add up correctly"
                : unequalDiff > 0
                ? `₹${unequalDiff.toFixed(2)} remaining to assign`
                : `₹${Math.abs(unequalDiff).toFixed(2)} over the total`}
            </div>
          </div>
        )}

        <Button type="submit" className="w-full h-11 sm:h-10" disabled={!canSubmit}>
          {isEdit ? "Save Changes" : "Add Expense"}
        </Button>
      </form>
    </DialogContent>
  );

  // Edit mode: externally controlled dialog, no trigger button
  if (isEdit) {
    return (
      <Dialog
        open={open}
        onOpenChange={(val) => {
          setOpen(val);
          if (!val) resetForm();
        }}
      >
        {dialogContent}
      </Dialog>
    );
  }

  // Add mode: self-contained with trigger button
  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          Add Expense
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}
