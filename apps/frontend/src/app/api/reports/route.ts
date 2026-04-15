import { NextResponse } from "next/server";

// Mock dataset – replace with real data source later
const MOCK_REPORTS = [
  {
    id: "3456787654",
    name: "Hello World Report",
    date: "2025-12-12",
    summary: "Overview of greeting-related operations and KPIs.",
  },
  {
    id: "1234567890",
    name: "Quarterly Summary",
    date: "2025-06-01",
    summary: "Q2 performance summary across departments with highlights.",
  },
  {
    id: "9876543210",
    name: "Market Analysis",
    date: "2025-07-15",
    summary: "Competitive landscape and segment insights for H2.",
  },
  {
    id: "5551113337",
    name: "Risk Assessment",
    date: "2025-05-21",
    summary: "Top operational risks and mitigation strategies.",
  },
  {
    id: "2468135790",
    name: "Annual Financial Report",
    date: "2026-01-31",
    summary: "Comprehensive financial statements and analysis for the fiscal year.",
  },
  {
    id: "1357924680",
    name: "Customer Satisfaction Survey",
    date: "2025-08-20",
    summary: "Results and key takeaways from the latest customer feedback survey.",
  },
  {
    id: "9753102468",
    name: "Product Launch Post-Mortem",
    date: "2025-11-05",
    summary: "Analysis of the recent product launch, successes, and areas for improvement.",
  },
  {
    id: "8642097531",
    name: "IT Infrastructure Audit",
    date: "2025-09-10",
    summary: "Findings from the quarterly IT systems and security audit.",
  },
  {
    id: "7531928640",
    name: "Employee Engagement Report",
    date: "2025-10-01",
    summary: "Insights into employee morale, productivity, and workplace culture.",
  },
  {
    id: "6420817539",
    name: "Sales Performance Review",
    date: "2025-07-01",
    summary: "Monthly sales figures, team performance, and pipeline analysis.",
  },
  {
    id: "5319706428",
    name: "Social Media Analytics",
    date: "2025-08-15",
    summary: "Performance metrics for all social media channels and campaigns.",
  },
  {
    id: "4208695317",
    name: "Supply Chain Efficiency",
    date: "2025-06-30",
    summary: "Report on logistics, inventory management, and supplier performance.",
  },
  {
    id: "3197584206",
    name: "Website Traffic Analysis",
    date: "2025-09-01",
    summary: "Deep dive into website user behavior, traffic sources, and conversion rates.",
  },
  {
    id: "2086473195",
    name: "Compliance and Legal Update",
    date: "2025-12-01",
    summary: "Summary of recent regulatory changes and compliance status.",
  },
];

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get("search") || "").trim().toLowerCase();
  const hasSearch = search.length > 0;

  const filtered = !hasSearch
    ? MOCK_REPORTS
    : MOCK_REPORTS.filter(
        (r) => r.name.toLowerCase().includes(search) || r.id.includes(search)
      );

  // If searching, return an array for the SearchDialog component
  if (hasSearch) {
    return NextResponse.json(filtered);
  }

  // Default: return an object for the sidebar list
  return NextResponse.json({ reports: filtered });
}
