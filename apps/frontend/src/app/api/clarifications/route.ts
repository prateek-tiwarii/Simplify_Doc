import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000"

type ClarificationNorm = {
  id: string
  question: string
  options: string[]
  status: string
  created_at: string
  contract_id: string
  contract_title: string
  contract_created_at?: string
}

function coerceClarification(item: any): ClarificationNorm | null {
  if (!item) return null
  const id = item.id ?? item.clarification_id ?? item._id
  const question = item.question ?? item.text ?? item.prompt
  const options = Array.isArray(item.options)
    ? item.options
    : Array.isArray(item.choices)
      ? item.choices
      : []
  const status = item.status ?? (item.resolved ? "resolved" : "pending")
  const created_at = item.created_at ?? item.createdAt ?? item.timestamp ?? new Date().toISOString()

  const contract = item.contract ?? {}
  const contract_id = contract.id ?? item.contract_id ?? item.contractId ?? "unknown"
  const contract_title = contract.title ?? item.contract_title ?? item.contractName ?? "Unknown Contract"
  const contract_created_at = contract.created_at ?? contract.createdAt ?? item.contract_created_at ?? item.contractCreatedAt

  if (!id || !question) return null
  return {
    id: String(id),
    question: String(question),
    options: options.map((o: any) => String(o)),
    status: String(status),
    created_at: String(created_at),
    contract_id: String(contract_id),
    contract_title: String(contract_title),
    contract_created_at: contract_created_at ? String(contract_created_at) : undefined,
  }
}

function normalizeToContracts(body: any) {
  if (body && Array.isArray(body.contracts)) {
    // Already in desired shape
    return { contracts: body.contracts }
  }

  const rawItems: any[] = Array.isArray(body)
    ? body
    : Array.isArray(body?.clarifications)
      ? body.clarifications
      : []

  const items: ClarificationNorm[] = rawItems
    .map(coerceClarification)
    .filter((x): x is ClarificationNorm => !!x)

  const map = new Map<string, { id: string; title: string; created_at: string; clarifications: any[] }>()
  for (const it of items) {
    if (!map.has(it.contract_id)) {
      map.set(it.contract_id, {
        id: it.contract_id,
        title: it.contract_title,
        created_at: it.contract_created_at ?? new Date().toISOString(),
        clarifications: [],
      })
    }
    const group = map.get(it.contract_id)!
    group.clarifications.push({
      id: it.id,
      question: it.question,
      options: it.options,
      status: it.status,
      created_at: it.created_at,
    })
  }

  return { contracts: Array.from(map.values()) }
}

export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = `${BACKEND_URL}/api/clarifications/all?user=${encodeURIComponent(session.user._id)}`
    const res = await fetch(url, { method: "GET" })
    const contentType = res.headers.get("content-type") || ""
    const body = contentType.includes("application/json") ? await res.json() : await res.text()

    if (!contentType.includes("application/json")) {
      // Pass through non-JSON
      return new NextResponse(typeof body === "string" ? body : String(body), {
        status: res.status,
        headers: { "content-type": "text/plain" },
      })
    }

    const normalized = normalizeToContracts(body)
    return NextResponse.json(normalized, { status: res.status })
  } catch (err) {
    console.error("GET /api/clarifications error", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
