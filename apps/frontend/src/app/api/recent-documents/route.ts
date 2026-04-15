export const dynamic = "force-dynamic";

type RecentDocument = {
  id: string;
  title: string;
  editedAt: string; // ISO date string
  summary?: string;
};

export async function GET() {
  // Dummy payload: replace with your real data source later
  const now = Date.now();
  const documents: RecentDocument[] = [
    {
      id: "1",
      title: "Master Service Agreement",
      editedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      summary: "Key terms and obligations between parties for services.",
    },
    {
      id: "2",
      title: "NDA - Vendor XYZ",
      editedAt: new Date(now - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      summary: "Mutual confidentiality terms for preliminary discussions.",
    },
    {
      id: "3",
      title: "Lease Agreement Draft v3",
      editedAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      summary: "Updated clauses on maintenance and liability coverage.",
    },
    {
      id: "4",
      title: "Project Proposal - Q3 Initiatives",
      editedAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      summary: "Outline of proposed projects for the upcoming quarter.",
    },
    {
      id: "5",
      title: "Employee Handbook 2024",
      editedAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      summary: "Company policies and procedures for all employees.",
    },
  ];

  return Response.json({ documents });
}
