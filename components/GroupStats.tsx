"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Pie,
  PieChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  computeGroupStats,
  computeMemberStats,
  computeExpenseTimeline,
} from "@/utils/stats";
import type { Expense, Member } from "@/types";

interface Props {
  members: Member[];
  expenses: Expense[];
}

export default function GroupStats({ members, expenses }: Props) {
  const groupStats = computeGroupStats(expenses);
  const memberStats = computeMemberStats(members, expenses);
  const timeline = computeExpenseTimeline(expenses);
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
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
        <p className="text-muted-foreground">No stats to show.</p>
        <p className="text-sm text-muted-foreground/70">
          Add some expenses first.
        </p>
      </div>
    );
  }

  // Pie chart: expense distribution by payer
  const pieData = memberStats
    .filter((ms) => ms.totalPaid > 0)
    .map((ms, i) => ({
      name: memberMap.get(ms.memberId) ?? "Unknown",
      value: ms.totalPaid,
      fill: `var(--color-${memberMap.get(ms.memberId) ?? `member-${i}`})`,
    }));

  const pieConfig: ChartConfig = Object.fromEntries(
    pieData.map((d, i) => [
      d.name,
      {
        label: d.name,
        color: `var(--chart-${(i % 5) + 1})`,
      },
    ])
  );

  // Bar chart: paid vs share per member
  const barData = memberStats.map((ms) => ({
    name: memberMap.get(ms.memberId) ?? "Unknown",
    paid: ms.totalPaid,
    share: ms.totalShare,
  }));

  const barConfig: ChartConfig = {
    paid: { label: "Paid", color: "var(--chart-1)" },
    share: { label: "Share", color: "var(--chart-2)" },
  };

  // Line chart config
  const lineConfig: ChartConfig = {
    total: { label: "Amount", color: "var(--chart-1)" },
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Summary
        </h3>
        <div className="grid gap-2 sm:gap-3 grid-cols-2">
          <Card className="p-2.5 sm:p-3">
            <div className="text-[10px] sm:text-xs text-muted-foreground">Total Expenses</div>
            <div className="text-base sm:text-lg font-semibold">
              ₹{groupStats.totalExpenses.toFixed(2)}
            </div>
          </Card>
          <Card className="p-2.5 sm:p-3">
            <div className="text-[10px] sm:text-xs text-muted-foreground">No. of Expenses</div>
            <div className="text-base sm:text-lg font-semibold">{groupStats.expenseCount}</div>
          </Card>
          <Card className="p-2.5 sm:p-3">
            <div className="text-[10px] sm:text-xs text-muted-foreground">Average Expense</div>
            <div className="text-base sm:text-lg font-semibold">
              ₹{groupStats.averageExpense.toFixed(2)}
            </div>
          </Card>
          <Card className="p-2.5 sm:p-3">
            <div className="text-[10px] sm:text-xs text-muted-foreground">Largest Expense</div>
            <div className="text-base sm:text-lg font-semibold">
              ₹{groupStats.largestExpense?.amount.toFixed(2) ?? "0.00"}
            </div>
            {groupStats.largestExpense && (
              <div className="text-[10px] sm:text-xs text-muted-foreground truncate">
                {groupStats.largestExpense.description}
              </div>
            )}
          </Card>
        </div>
      </div>

      <Separator />

      {/* Per-member breakdown */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Per Member Breakdown
        </h3>
        <div className="space-y-2">
          {memberStats.map((ms) => (
            <Card key={ms.memberId} className="p-2.5 sm:p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] sm:text-xs font-medium text-primary shrink-0">
                    {(memberMap.get(ms.memberId) ?? "?")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                  <span className="text-xs sm:text-sm font-medium truncate">
                    {memberMap.get(ms.memberId)}
                  </span>
                </div>
                <div className="text-right text-xs sm:text-sm shrink-0">
                  <div>
                    Paid:{" "}
                    <span className="font-semibold">
                      ₹{ms.totalPaid.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-muted-foreground">
                    Share: ₹{ms.totalShare.toFixed(2)}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* Pie chart: who paid what */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Who Paid What
        </h3>
        <Card>
          <CardContent className="pt-4 sm:pt-6 px-2 sm:px-6">
            <ChartContainer
              config={pieConfig}
              className="mx-auto aspect-square max-h-[200px] sm:max-h-[250px]"
            >
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => `₹${Number(value).toFixed(2)}`}
                    />
                  }
                />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={40}
                  strokeWidth={2}
                />
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Bar chart: paid vs share */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Paid vs. Share
        </h3>
        <Card>
          <CardContent className="pt-4 sm:pt-6 px-2 sm:px-6">
            <ChartContainer config={barConfig} className="max-h-[200px] sm:max-h-[250px] w-full">
              <BarChart data={barData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${v}`}
                  width={40}
                  fontSize={11}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => `₹${Number(value).toFixed(2)}`}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="paid"
                  fill="var(--color-paid)"
                  radius={4}
                />
                <Bar
                  dataKey="share"
                  fill="var(--color-share)"
                  radius={4}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Line chart: spending over time (only if 2+ dates) */}
      {timeline.length >= 2 && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Spending Over Time
            </h3>
            <Card>
              <CardContent className="pt-4 sm:pt-6 px-2 sm:px-6">
                <ChartContainer
                  config={lineConfig}
                  className="max-h-[180px] sm:max-h-[200px] w-full"
                >
                  <LineChart data={timeline} accessibilityLayer>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={11}
                      tickFormatter={(d) =>
                        new Date(d).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                      }
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `₹${v}`}
                      width={40}
                      fontSize={11}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) =>
                            `₹${Number(value).toFixed(2)}`
                          }
                        />
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="var(--color-total)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
