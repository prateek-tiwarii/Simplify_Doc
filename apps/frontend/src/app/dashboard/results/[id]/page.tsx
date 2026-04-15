import React from "react"
import { headers } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import ReportClient, { ContractReport } from "./ReportClient"

// Backend response (subset) for mapping
type BackendParty = { name: string; role?: string | null; contact_info?: any }
type BackendObligation = { party: string; text: string; deadline?: string | null; category?: string | null }
type BackendDates = {
  effective_date?: string | null
  termination_date?: string | null
  renewal_date?: string | null
  signature_date?: string | null
}
type BackendRisk = { risk_level?: "Low" | "Medium" | "High"; risk_factors?: string[]; recommendations?: string[] }
type BackendUnclear = { section: string; issue: string; priority: string }
type BackendResultDoc = {
  _id?: { $oid?: string } | string
  contract_id?: { $oid?: string } | string
  user?: { $oid?: string } | string
  result?: {
    summary?: string
    parties?: BackendParty[]
    dates?: BackendDates
    obligations?: BackendObligation[]
    financial_terms?: any[]
    risk_assessment?: BackendRisk
    confidence_score?: number
    unclear_sections?: BackendUnclear[]
  }
  created_at?: { $date?: string } | string
  starred?: boolean
}

function oidToString(v: any): string | undefined {
  if (!v) return undefined
  if (typeof v === "string") return v
  if (typeof v === "object" && "$oid" in v) return String((v as any).$oid)
  return undefined
}

function mapToViewModel(doc: BackendResultDoc, fallbackId: string): ContractReport {
  const r = doc.result || {}
  const parties = (r.parties || []).map((p) => p.name).filter(Boolean) as string[]
  const obligations = (r.obligations || []).map((o) => ({ party: o.party, text: o.text }))
  const clarifications = (r.unclear_sections || []).map((u, idx) => ({ id: `unclear-${idx}`, status: "pending" as const }))
  return {
    contract_id: oidToString(doc.contract_id) || fallbackId,
    status: "completed",
    summary: r.summary || "",
    parties,
    dates: {
      effective_date: r.dates?.effective_date || "",
      termination_date: r.dates?.termination_date || undefined,
      renewal: r.dates?.renewal_date || undefined,
    },
    obligations,
    clarifications,
    unclearSections: (r.unclear_sections || []).map((u) => ({ section: u.section, issue: u.issue, priority: u.priority })),
  }
}

export default async function Page({ params }: { params: Promise<{ id?: string; contract_id?: string }> }) {
  const awaited = await params
  const raw = (awaited as any)?.contract_id ?? (awaited as any)?.id
  const contractId = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : ""
  if (!contractId) {
    return <ReportNotFound contractId={"unknown"} />
  }

  // Fetch on the server to decide which UI to render without a loading flash
  const h = await headers()
  const protocol = h.get("x-forwarded-proto") || "http"
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000"
  const origin = `${protocol}://${host}`
  const cookieHeader = h.get("cookie") || ""
  const res = await fetch(`${origin}/api/contracts/result/${encodeURIComponent(contractId)}`, {
    cache: "no-store",
    headers: { cookie: cookieHeader },
  })
  if (res.status === 404) {
    return <ReportNotFound contractId={contractId} />
  }
  if (!res.ok) {
    return <ReportNotFound contractId={contractId} />
  }
  const doc: BackendResultDoc = await res.json()
  const vm = mapToViewModel(doc, contractId)
  return <ReportClient data={vm} />
}

function ReportNotFound({ contractId }: { contractId: string }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl">Report not found</CardTitle>
          <CardDescription>
            We couldn’t find a completed report for this contract. It may still be processing or was removed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">Contract ID</div>
          <Badge variant="outline" className="rounded-full font-mono">{contractId}</Badge>
        </CardContent>
        <CardFooter className="gap-2">
          <Button asChild variant="outline">
            <a href="/dashboard">Back to dashboard</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}