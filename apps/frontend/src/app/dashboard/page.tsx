"use client";
import React from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Separator } from "@/components/ui/separator";
import { FilePlus, Sheet } from "lucide-react";
import GlowingCards, { GlowingCard } from "@/components/dashboard/glowing-cards";
import useSWR from "swr";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Report } from "@/types/report.type";
import Link from "next/link"

function page() {
  const { data: session } = useSession();
  const user = session?.user;

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

  const fetcher = (url: string) => fetch(url).then((r) => {
    if (!r.ok) throw new Error(`Failed ${r.status}`);
    return r.json();
  });
  // recent posts
  const { data, error, isLoading } = useSWR<{ results: Report[] }>(
    `${backendUrl}/api/contracts/results/all?userid=${encodeURIComponent(
      user?._id || ""
    )}&skip=0&limit=6&sort=desc`,
    fetcher
  );
  const recent = data?.results ?? [];

  // starred posts
  const { data: starredData, error: starredError, isLoading: starredLoading } = useSWR<{ results: Report[] }>(
    `${backendUrl}/api/contracts/result/starred?userid=${encodeURIComponent(
      user?._id || ""
    )}&skip=0&limit=6&sort=desc`,
    fetcher
  );
  const starred = starredData?.results ?? [];

  const formatRelative = (iso: string) => {
    try {
      const d = new Date(iso);
      const diff = Date.now() - d.getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
      const days = Math.floor(hrs / 24);
      return `${days} day${days === 1 ? "" : "s"} ago`;
    } catch {
      return new Date(iso).toLocaleString();
    }
  };
  return (
    <div className="max-w-5xl mx-auto space-y-6 justify-center">
      <motion.section
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <h1 className="font-light text-sm text-muted-foreground">
          My Workspace
        </h1>
        <h2 className="font-semibold text-2xl">Welcome, <span className="from-primary/10 via-foreground/85 to-foreground/50 bg-linear-to-tl bg-clip-text text-balance text-transparent ">{user?.name}!</span></h2>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.22, ease: "easeOut", delay: 0.05 }}
      >
        {/* cards with glowing effect */}
        <GlowingCards
          enableGlow
          glowRadius={30}
          glowOpacity={1}
          animationDuration={350}
          enableHover={false}
          gap="1rem"
          maxWidth="64rem"
          padding="0"
          borderRadius="1rem"
          className="mt-2"
        >
          {(() => {
            type Card = {
              title: string;
              link: string;
              glowColor: string;
              icon?: React.ElementType;
              iconNode?: React.ReactNode;
            };
            const cards: Card[] = [
              { title: "New Document", link: "/dashboard/create", icon: FilePlus, glowColor: "#737373" },
              {
                title: "Clarifications",
                link: "/dashboard/clarifications",
                glowColor: "#f97316",
                iconNode: (
                  <DotLottieReact
                    src="https://lottie.host/998c2d8e-89f8-4d6c-82fb-452c2108604a/bLDcCbygKs.lottie"
                    loop
                    playOnHover
                    className="h-10 w-10 md:h-24 md:w-24"
                  />
                ),
              },
              // { title: "Search Reports", link: "/", icon: Sheet, glowColor: "#737373" },
            ];
            return cards.map((document, i) => {
              const Icon = (document.icon ?? Sheet) as React.ElementType;
              return (
                <GlowingCard
                  key={i}
                  glowColor={document.glowColor as string}
                  className="group cursor-pointer select-none flex items-center justify-center min-h-32 md:min-h-48"
                >
                  <motion.a
                    href={document.link}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.6 }}
                    className="flex flex-col items-center outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:border-ring"
                  >
                    <motion.span>
                      {document.iconNode ? (
                        document.iconNode
                      ) : (
                        <Icon className=" group-hover:rotate-6 transition-all text-foreground h-10 w-10 md:h-20 md:w-20" />
                      )}
                    </motion.span>
                    <h3 className="mt-2 text-xs text-foreground md:text-base text-center font-semibold">{document.title}</h3>
                  </motion.a>
                </GlowingCard>
              );
            });
          })()}
        </GlowingCards>
      </motion.section>
      <Separator className="my-6" />

      <motion.section
        className="flex md:flex-row flex-col"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.22, ease: "easeOut", delay: 0.1 }}
      >
        <div className="w-full md:w-1/2 space-y-6">
          <h2 className="font-semibold text-2xl">Recent Activity</h2>
          <div className="space-y-4">
            {isLoading && (
              <p className="text-sm text-muted-foreground">Loading…</p>
            )}
            {error && (
              <p className="text-sm text-destructive">Failed to load recent documents.</p>
            )}
            {!isLoading && !error && recent.length === 0 && (
              <p className="text-sm text-muted-foreground">No recent documents.</p>
            )}
            {recent.map((doc) => (
              <Link
                key={doc._id}
                href={`/dashboard/results/${doc.contract_id}`}
              >
                <motion.div
                  key={doc._id}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: "spring", stiffness: 500, damping: 35, mass: 0.6 }}
                  className="cursor-pointer flex items-center gap-2 text-sm text-muted-foreground w-fit rounded-full px-4 py-2 hover:bg-accent/30"
                >
                  <motion.span whileHover={{ rotate: 3 }} className="inline-flex">
                    <Sheet className="text-foreground rounded-full h-8 w-8" />
                  </motion.span>
                  <div className="flex flex-col">
                    <h4 className="font-semibold text-foreground">{doc?.contract?.metadata?.name}</h4>
                    <p className="text-xs text-muted-foreground italic">
                      Edited {formatRelative(doc?.created_at)}
                    </p>
                  </div>
                </motion.div>
              </Link>

            ))}
          </div>{" "}
        </div>

        <div className="w-full md:w-1/2 space-y-6">
          <h2 className="font-semibold text-2xl">Starred Reports</h2>
          <div className="space-y-4">
            {starredLoading && (
              <p className="text-sm text-muted-foreground">Loading…</p>
            )}
            {starredError && (
              <p className="text-sm text-destructive">Failed to load starred documents.</p>
            )}
            {!starredLoading && !starredError && starred.length === 0 && (
              <p className="text-sm text-muted-foreground">No starred documents.</p>
            )}
            {starred.map((doc) => (
              <Link
                key={doc._id}
                href={`/dashboard/results/${doc.contract_id}`}
              >
                <motion.div
                  key={doc._id}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: "spring", stiffness: 500, damping: 35, mass: 0.6 }}
                  className="cursor-pointer flex items-center gap-2 text-sm text-muted-foreground w-fit rounded-full px-4 py-2 hover:bg-accent/30"
                >
                  <motion.span whileHover={{ rotate: 3 }} className="inline-flex">
                    <Sheet className="text-foreground rounded-full h-8 w-8" />
                  </motion.span>
                  <div className="flex flex-col">
                    <h4 className="font-semibold text-foreground">{doc?.contract?.metadata?.name}</h4>
                    <p className="text-xs text-muted-foreground italic">
                      Edited {formatRelative(doc?.created_at)}
                    </p>
                  </div>
                </motion.div>
              </Link>

            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}

export default page;
