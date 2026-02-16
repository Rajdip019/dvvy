"use client";

import { use, useState } from "react";
import { useApp, generateId } from "@/context/AppContext";
import AddExpenseForm from "@/components/AddExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import BalanceSheet from "@/components/BalanceSheet";
import GroupStats from "@/components/GroupStats";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { state, dispatch } = useApp();
  const [newMember, setNewMember] = useState("");

  const group = state.groups.find((g) => g.id === id);

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold mb-2">Group not found</h2>
        <p className="text-muted-foreground mb-4">
          This group doesn&apos;t exist or may have been deleted.
        </p>
        <Link href="/">
          <Button variant="secondary">Back to Groups</Button>
        </Link>
      </div>
    );
  }

  function addMember() {
    const trimmed = newMember.trim();
    if (!trimmed || !group) return;
    dispatch({
      type: "ADD_MEMBER",
      payload: {
        groupId: group.id,
        member: { id: generateId(), name: trimmed },
      },
    });
    setNewMember("");
  }

  const totalSpent = group.expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Groups
        </Link>
        <span>/</span>
        <span className="text-foreground">{group.name}</span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{group.name}</h1>
          <p className="text-muted-foreground mt-1">
            {group.members.length} members &middot; Total spent: ₹
            {totalSpent.toFixed(2)}
          </p>
        </div>
        <AddExpenseForm groupId={group.id} members={group.members} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">
            Members
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {group.members.map((m) => (
            <Badge key={m.id} variant="secondary" className="px-3 py-1.5">
              {m.name}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2 max-w-xs">
          <Input
            placeholder="Add member"
            value={newMember}
            onChange={(e) => setNewMember(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addMember();
              }
            }}
            className="h-8 text-sm"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={addMember}
            disabled={!newMember.trim()}
          >
            Add
          </Button>
        </div>
      </div>

      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="expenses">
            Expenses ({group.expenses.length})
          </TabsTrigger>
          <TabsTrigger value="balances">Balances</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>
        <TabsContent value="expenses" className="mt-4">
          <ExpenseList
            groupId={group.id}
            expenses={group.expenses}
            members={group.members}
          />
        </TabsContent>
        <TabsContent value="balances" className="mt-4">
          <BalanceSheet
            members={group.members}
            expenses={group.expenses}
          />
        </TabsContent>
        <TabsContent value="stats" className="mt-4">
          <GroupStats
            members={group.members}
            expenses={group.expenses}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
