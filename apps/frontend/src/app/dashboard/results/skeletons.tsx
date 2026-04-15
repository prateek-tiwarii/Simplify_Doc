"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import { Calendar, ChevronDown, RefreshCw, Users } from "lucide-react"

export function ReportSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:py-10">
      <div className="mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Contract Assessment Report</h1>
          <div className="mt-1">
            <Skeleton className="h-4 w-56 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-40 rounded-full" />
          <Skeleton className="h-6 w-28 rounded-full" />
          <div className="h-6 w-px bg-border mx-2 hidden md:block" />
          <Skeleton className="h-9 w-32 rounded-2xl" />
          <Skeleton className="h-9 w-24 rounded-2xl" />
        </div>
      </div>

      <div className="flex flex-col gap-6 md:gap-8">
        {/* Summary */}
        <Card className="rounded-2xl">
          <CardHeader className="border-b">
            <CardTitle className="text-xl">Readable Summary</CardTitle>
            <CardDescription>At-a-glance overview and key dates</CardDescription>
          </CardHeader>
          <CardContent className="mt-4 grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="text-muted-foreground" />
                <span className="text-sm font-medium">Parties</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
              <div className="mt-4 grid gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="text-muted-foreground" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="text-muted-foreground" />
                  <Skeleton className="h-4 w-44" />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <RefreshCw className="text-muted-foreground" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[85%]" />
                <Skeleton className="h-4 w-[70%]" />
              </div>
              <div className="border rounded-2xl p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Assessment completion</span>
                  <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Risk indicator</span>
                  <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t justify-between">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Skeleton className="h-6 w-48 rounded-full" />
              <Skeleton className="h-6 w-44 rounded-full" />
            </div>
          </CardFooter>
        </Card>

        {/* Highlights */}
        <Card className="rounded-2xl">
          <CardHeader className="border-b">
            <CardTitle className="text-xl">Highlights & Drill‑down</CardTitle>
            <CardDescription>Important clauses surfaced first</CardDescription>
          </CardHeader>
          <CardContent className="mt-4 grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Key clauses</h3>
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-56 rounded-full" />
                <Skeleton className="h-6 w-52 rounded-full" />
                <Skeleton className="h-6 w-64 rounded-full" />
              </div>
              <Skeleton className="h-4 w-64" />
            </div>
            <div>
              <div className="rounded-2xl border p-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Read full summary</span>
                  <ChevronDown className="opacity-40" />
                </div>
                <div className="mt-3 space-y-2">
                  <Skeleton className="h-4 w-[92%]" />
                  <Skeleton className="h-4 w-[80%]" />
                  <Skeleton className="h-4 w-[70%]" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Obligations by party */}
        <Card className="rounded-2xl">
          <CardHeader className="border-b">
            <CardTitle className="text-xl">Obligations by Party</CardTitle>
            <CardDescription>Concise breakdown per party</CardDescription>
          </CardHeader>
          <CardContent className="mt-4 grid gap-6 md:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="rounded-2xl border p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Skeleton className="h-6 w-28 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-4 w-[75%]" />
                  <Skeleton className="h-4 w-[65%]" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
