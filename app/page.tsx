"use client";

import { useApp } from "@/context/AppContext";
import CreateGroupForm from "@/components/CreateGroupForm";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function Home() {
  const { state } = useApp();

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Groups</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Create a group and start splitting expenses.
          </p>
        </div>
        <CreateGroupForm />
      </div>

      {state.groups.length === 0 ? (
        <Card className="border-dashed">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-12 w-12 text-muted-foreground/50 mb-4"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <h3 className="text-lg font-semibold text-muted-foreground">
              No groups yet
            </h3>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Create your first group to get started.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {state.groups.map((group) => {
            const totalExpenses = group.expenses.reduce(
              (sum, e) => sum + e.amount,
              0
            );
            return (
              <Link key={group.id} href={`/group/${group.id}`}>
                <Card className="transition-colors hover:bg-accent/50 cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {group.members.length} members &middot;{" "}
                          {group.expenses.length} expense
                          {group.expenses.length !== 1 ? "s" : ""}
                        </CardDescription>
                      </div>
                      {totalExpenses > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          ₹{totalExpenses.toFixed(2)}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {group.members.map((m) => (
                        <span
                          key={m.id}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary"
                          title={m.name}
                        >
                          {m.name.charAt(0).toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
