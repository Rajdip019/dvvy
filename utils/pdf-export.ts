import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { calculateBalances, computePairwiseTabs } from "@/utils/balance";
import { computeGroupStats, computeMemberStats } from "@/utils/stats";
import type { Group } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getFinalY(doc: jsPDF, fallback: number): number {
  return (doc as any).lastAutoTable?.finalY ?? fallback;
}

export function exportGroupPDF(group: Group) {
  const memberMap = new Map(group.members.map((m) => [m.id, m.name]));
  const getName = (id: string) => memberMap.get(id) ?? "Unknown";

  const balances = calculateBalances(group.members, group.expenses);
  const pairwiseTabs = computePairwiseTabs(group.members, group.expenses);
  const groupStats = computeGroupStats(group.expenses);
  const memberStats = computeMemberStats(group.members, group.expenses);

  const doc = new jsPDF();
  let y = 20;

  const MARGIN = 14;
  const PAGE_WIDTH = doc.internal.pageSize.getWidth();

  function addSectionTitle(title: string) {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(title, MARGIN, y);
    y += 8;
  }

  function checkPageBreak(needed: number) {
    if (y + needed > 280) {
      doc.addPage();
      y = 20;
    }
  }

  // ── Header ──
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(group.name, MARGIN, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(
    `${group.members.length} members  |  ${group.expenses.length} expenses  |  Total: Rs.${groupStats.totalExpenses.toFixed(2)}`,
    MARGIN,
    y
  );
  y += 5;
  doc.text(
    `Exported: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
    MARGIN,
    y
  );
  doc.setTextColor(0);
  y += 10;

  // ── Members ──
  addSectionTitle("Members");
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(group.members.map((m) => m.name).join(",  "), MARGIN, y);
  y += 10;

  // ── Summary Stats ──
  addSectionTitle("Summary");
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN },
    head: [["Metric", "Value"]],
    body: [
      ["Total Expenses", `Rs.${groupStats.totalExpenses.toFixed(2)}`],
      ["Number of Expenses", `${groupStats.expenseCount}`],
      ["Average Expense", `Rs.${groupStats.averageExpense.toFixed(2)}`],
      [
        "Largest Expense",
        groupStats.largestExpense
          ? `Rs.${groupStats.largestExpense.amount.toFixed(2)} (${groupStats.largestExpense.description})`
          : "—",
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [40, 40, 40] },
    styles: { fontSize: 9 },
  });
  y = getFinalY(doc, y + 30) + 10;

  // ── Per-Member Stats ──
  checkPageBreak(30);
  addSectionTitle("Per-Member Breakdown");
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN },
    head: [["Member", "Total Paid", "Total Share", "Net"]],
    body: memberStats.map((ms) => {
      const balance = balances.find((b) => b.memberId === ms.memberId);
      const net = balance?.amount ?? 0;
      return [
        getName(ms.memberId),
        `Rs.${ms.totalPaid.toFixed(2)}`,
        `Rs.${ms.totalShare.toFixed(2)}`,
        net > 0.01
          ? `+Rs.${net.toFixed(2)}`
          : net < -0.01
          ? `-Rs.${Math.abs(net).toFixed(2)}`
          : "Settled",
      ];
    }),
    theme: "grid",
    headStyles: { fillColor: [40, 40, 40] },
    styles: { fontSize: 9 },
  });
  y = getFinalY(doc, y + 30) + 10;

  // ── Expenses Table ──
  checkPageBreak(30);
  addSectionTitle("All Expenses");

  const sortedExpenses = [...group.expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN },
    head: [["Description", "Amount", "Date", "Paid By", "Split", "Details"]],
    body: sortedExpenses.map((e) => [
      e.description,
      `Rs.${e.amount.toFixed(2)}`,
      new Date(e.date).toLocaleDateString("en-IN"),
      getName(e.paidBy),
      e.splitType,
      e.splits.map((s) => `${getName(s.memberId)}: Rs.${s.amount.toFixed(2)}`).join(", "),
    ]),
    theme: "grid",
    headStyles: { fillColor: [40, 40, 40] },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 30 },
      5: { cellWidth: 50 },
    },
  });
  y = getFinalY(doc, y + 30) + 10;

  // ── Who Pays Whom ──
  checkPageBreak(30);
  addSectionTitle("Who Pays Whom");

  const pairwiseRows: string[][] = [];
  for (const m of group.members) {
    const tabs = pairwiseTabs.filter((t) => t.memberId === m.id);
    for (const t of tabs) {
      if (Math.abs(t.amount) < 0.01) {
        pairwiseRows.push([m.name, getName(t.otherMemberId), "Settled", "Rs.0.00"]);
      } else if (t.amount > 0) {
        pairwiseRows.push([m.name, getName(t.otherMemberId), "Owes", `Rs.${t.amount.toFixed(2)}`]);
      } else {
        pairwiseRows.push([m.name, getName(t.otherMemberId), "Gets back", `Rs.${Math.abs(t.amount).toFixed(2)}`]);
      }
    }
  }

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN },
    head: [["From", "To", "Status", "Amount"]],
    body: pairwiseRows,
    theme: "grid",
    headStyles: { fillColor: [40, 40, 40] },
    styles: { fontSize: 9 },
  });
  y = getFinalY(doc, y + 30) + 10;

  // ── Footer ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `dvvy export  —  Page ${i} of ${pageCount}`,
      PAGE_WIDTH / 2,
      290,
      { align: "center" }
    );
  }

  // Download
  const safeName = group.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
  doc.save(`${safeName}-dvvy-export.pdf`);
}
