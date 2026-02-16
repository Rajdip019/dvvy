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

  // ── Branded Header ──
  // Draw logo icon (rounded rect with gradient-like fill)
  const logoSize = 12;
  const logoX = MARGIN;
  const logoY = y - 8;
  doc.setFillColor(99, 102, 241); // indigo-500
  doc.roundedRect(logoX, logoY, logoSize, logoSize, 2, 2, "F");
  // Draw the split lines on the logo
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.8);
  // Vertical line
  doc.line(logoX + logoSize / 2, logoY + 2.5, logoX + logoSize / 2, logoY + logoSize - 2.5);
  // Top horizontal
  doc.line(logoX + 3, logoY + 4.5, logoX + logoSize - 3, logoY + 4.5);
  // Bottom horizontal
  doc.line(logoX + 3, logoY + logoSize - 4.5, logoX + logoSize - 3, logoY + logoSize - 4.5);
  doc.setDrawColor(0);
  doc.setLineWidth(0.2);

  // Brand name
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(99, 102, 241);
  doc.text("dvvy", MARGIN + logoSize + 3, y);
  doc.setTextColor(0);

  // Tagline
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150);
  doc.text("Group Expense Calculator", MARGIN + logoSize + 3, y + 4.5);
  doc.setTextColor(0);
  y += 14;

  // Divider line
  doc.setDrawColor(200);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  doc.setDrawColor(0);
  y += 8;

  // Group name
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(group.name, MARGIN, y);
  y += 7;

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

  // ── Who Pays Whom (grouped by member) ──
  checkPageBreak(30);
  addSectionTitle("Who Pays Whom");

  for (const m of group.members) {
    const tabs = pairwiseTabs.filter((t) => t.memberId === m.id);
    const rows = tabs.map((t) => {
      if (Math.abs(t.amount) < 0.01) {
        return [getName(t.otherMemberId), "Settled", "Rs.0.00"];
      } else if (t.amount > 0) {
        return [getName(t.otherMemberId), "Owes", `Rs.${t.amount.toFixed(2)}`];
      } else {
        return [getName(t.otherMemberId), "Gets back", `Rs.${Math.abs(t.amount).toFixed(2)}`];
      }
    });

    checkPageBreak(20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(m.name, MARGIN, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      margin: { left: MARGIN },
      head: [["With", "Status", "Amount"]],
      body: rows,
      theme: "grid",
      headStyles: { fillColor: [60, 60, 60] },
      styles: { fontSize: 9 },
    });
    y = getFinalY(doc, y + 20) + 6;
  }

  // ── Footer ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `dvvy export  —  Page ${i} of ${pageCount}`,
      PAGE_WIDTH / 2,
      287,
      { align: "center" }
    );
    doc.text(
      "Created with love by Rajdeep  —  github.com/Rajdip019",
      PAGE_WIDTH / 2,
      292,
      { align: "center" }
    );
  }

  // Download
  const safeName = group.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
  doc.save(`${safeName}-dvvy-export.pdf`);
}
