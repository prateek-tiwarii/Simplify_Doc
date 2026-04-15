"use client"

import * as React from "react"
import { AnimatePresence, LayoutGroup, motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Clock, CheckCircle2, HelpCircle, FileText } from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error("Failed to load clarifications")
  return res.json()
})

type Clarification = {
  id: string
  question: string
  options: string[]
  status: "pending" | "resolved" | string
  created_at: string
}

type ContractEntry = {
  id: string
  title: string
  created_at: string
  clarifications: Clarification[]
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

export default function Page() {
  // Fetch contracts and clarifications via API with SWR
  const { data, isLoading, error } = useSWR<{ contracts: ContractEntry[] }>(
    "/api/clarifications",
    fetcher,
    { revalidateOnFocus: false }
  )
  const contracts: ContractEntry[] = data?.contracts ?? []

  const [selectedContractId, setSelectedContractId] = React.useState<string | null>(null)
  React.useEffect(() => {
    if (!selectedContractId && contracts.length > 0) {
      setSelectedContractId(contracts[0].id)
    }
  }, [contracts, selectedContractId])
  const selectedContract = contracts.find((c) => c.id === selectedContractId) || null
  const pendingQuestions = (selectedContract?.clarifications || []).filter(
    (q) => q.status === "pending"
  )

  // Keep per-question choices
  const [choices, setChoices] = React.useState<Record<string, string | undefined>>({})
  const [submitting, setSubmitting] = React.useState<Record<string, boolean>>({})
  const setChoice = (qid: string, value?: string) =>
    setChoices((prev) => ({ ...prev, [qid]: value }))

  const { mutate } = useSWR<{ contracts: ContractEntry[] }>("/api/clarifications")

  async function submitAnswer(clarId: string) {
    const value = choices[clarId]
    if (!value) return
    try {
      setSubmitting((s) => ({ ...s, [clarId]: true }))
      const res = await fetch(`/api/clarifications/resolve/${encodeURIComponent(clarId)}?response=${encodeURIComponent(value)}`, {
        method: "POST",
      })
      if (!res.ok) throw new Error("Failed to submit answer")
      // Refresh clarifications list
      await mutate()
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting((s) => ({ ...s, [clarId]: false }))
    }
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold">Pre Assessment Clarifications</h1>
        <p className="text-muted-foreground mt-1">
          Contracts with pending clarifications on the left, questions on the right.
        </p>
      </section>
      <Separator />

      <LayoutGroup>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: contract entries */}
          <div className="md:col-span-1 space-y-3">
            {isLoading ? (
              <Card className="rounded-2xl bg-transparent">
                <CardContent className="py-10 text-center text-muted-foreground">
                  Loading contracts…
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="rounded-2xl bg-transparent">
                <CardContent className="py-10 text-center text-destructive">
                  Failed to load clarifications.
                </CardContent>
              </Card>
            ) : contracts.length === 0 ? (
              <Card className="rounded-2xl bg-transparent">
                <CardContent className="py-10 text-center text-muted-foreground">
                  No contracts found.
                </CardContent>
              </Card>
            ) : (
              contracts.map((ctr) => {
                const pendingCount = ctr.clarifications.filter((q) => q.status === "pending").length
                return (
                  <motion.div
                    layout
                    key={ctr.id}
                    role="button"
                    aria-pressed={selectedContractId === ctr.id}
                    aria-selected={selectedContractId === ctr.id}
                    tabIndex={0}
                    onClick={() => setSelectedContractId(ctr.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setSelectedContractId(ctr.id)
                    }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.6 }}
                    className="focus:outline-none"
                  >
                    <Card
                      className={
                        "cursor-pointer transition-colors bg-transparent rounded-2xl border-border hover:bg-accent/30" +
                        (selectedContractId === ctr.id ? " border-primary ring-1 ring-ring bg-accent/40" : "")
                      }
                    >
                      <CardHeader className="flex flex-row items-start gap-3">
                        <div className="shrink-0 rounded-md bg-secondary p-2 text-primary">
                          <AnimatePresence mode="wait" initial={false}>
                            <motion.span
                              key={String(pendingCount)}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.18, ease: "easeOut" }}
                              className="flex"
                            >
                              <FileText className="h-5 w-5" />
                            </motion.span>
                          </AnimatePresence>
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="truncate flex items-center gap-2">
                            <span className="truncate">{ctr.title}</span>
                            {pendingCount > 0 && (
                              <Badge variant="outline" className="rounded-full">
                                {pendingCount} pending
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center gap-1 text-xs">
                              <Clock className="h-3.5 w-3.5" />
                              {formatDate(ctr.created_at)}
                            </span>
                          </CardDescription>
                        </div>
                      </CardHeader>
                    </Card>
                  </motion.div>
                )
              })
            )}
          </div>

          {/* Right: pending questions for selected contract */}
          <div className="md:col-span-2">
            <Card className="min-h-[16rem] rounded-2xl bg-transparent h-full">
              <AnimatePresence mode="wait" initial={false}>
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="h-64"
                  >
                    <CardContent className="h-full flex items-center justify-center text-muted-foreground">
                      Loading clarifications…
                    </CardContent>
                  </motion.div>
                ) : error ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="h-64"
                  >
                    <CardContent className="h-full flex items-center justify-center text-destructive">
                      Failed to load clarifications.
                    </CardContent>
                  </motion.div>
                ) : selectedContract ? (
                  <motion.div
                    key={selectedContract.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="space-y-4"
                  >
                    <CardHeader className="flex flex-row items-center gap-3">
                      <div className="shrink-0 rounded-md bg-secondary p-2 text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="break-words">
                          {selectedContract.title}
                        </CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-xs">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDate(selectedContract.created_at)}
                          </span>
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="space-y-4">
                      {pendingQuestions.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-muted-foreground">
                          All clarifications are resolved for this contract.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {pendingQuestions.map((q) => (
                            <motion.div
                              key={q.id}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                              transition={{ duration: 0.18, ease: "easeOut" }}
                            >
                              <Card className="rounded-2xl bg-transparent">
                                <CardHeader className="flex flex-row items-start gap-3">
                                  <div className="shrink-0 rounded-md bg-secondary p-2 text-primary">
                                    <HelpCircle className="h-5 w-5" />
                                  </div>
                                  <div className="min-w-0">
                                    <CardTitle className="text-base break-words">
                                      {q.question}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-2 mt-1">
                                      <Badge variant="outline" className="rounded-full">Pending</Badge>
                                      <span className="inline-flex items-center gap-1 text-xs">
                                        <Clock className="h-3.5 w-3.5" />
                                        {formatDate(q.created_at)}
                                      </span>
                                    </CardDescription>
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <RadioGroup
                                    value={choices[q.id]}
                                    onValueChange={(v) => setChoice(q.id, v)}
                                    className="grid grid-cols-1 gap-3"
                                  >
                                    {q.options.map((opt) => (
                                      <label
                                        key={opt}
                                        className="flex items-center gap-2 rounded-xl border bg-card/30 px-3 py-2 hover:bg-accent/40 transition-colors cursor-pointer"
                                      >
                                        <RadioGroupItem value={opt} />
                                        <span className="text-sm">{opt}</span>
                                      </label>
                                    ))}
                                  </RadioGroup>
                                  <div className="pt-1">
                                    <Button size="sm" disabled={!choices[q.id] || submitting[q.id]} onClick={() => submitAnswer(q.id)}>
                                      {submitting[q.id] ? "Submitting…" : "Submit answer"}
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="h-64"
                  >
                    <CardContent className="h-full flex items-center justify-center text-muted-foreground">
                      Select a contract to see its pending questions
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>
        </div>
      </LayoutGroup>
    </div>
  )
}