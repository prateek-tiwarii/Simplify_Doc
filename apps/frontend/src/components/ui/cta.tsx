"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
export default function CTA() {
  return (
    <div className="h-screen flex items-center">
    <div className=" relative mx-auto w-full max-w-4xl h-1/2  overflow-hidden rounded-2xl bg-background p-6 sm:p-10 md:p-20">
      <div className="pointer-events-none absolute inset-0 hidden h-full w-full overflow-hidden md:block">
        <div className="absolute top-1/2 right-[-45%] aspect-square h-[800px] w-[800px] -translate-y-1/2">
          {[
            { base: 1, className: "bg-background/90", delay: 0 },
            { base: 0.8, className: "bg-orange-300", delay: 0.2 },
            { base: 0.6, className: "bg-orange-200", delay: 0.4 },
            { base: 0.4, className: "bg-orange-100", delay: 0.6 },
            { base: 0.2, className: "bg-orange-50", delay: 0.8 },
            { base: 0.1, className: "bg-white/50", delay: 1.0 },
          ].map(({ base, className, delay }, i) => (
            <motion.div
              key={i}
              initial={{ scale: base, opacity: 0.3 }}
              animate={{
                scale: [base, base + Math.min(0.06, base * 0.2), base],
                opacity: [0.3, 0.38, 0.3],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay,
              }}
              className={cn("absolute inset-0 rounded-full", className)}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10">
        <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl md:mb-4 md:text-5xl">
          Let&apos;s Get In Touch.
        </h1>
        <p className="mb-6 max-w-md text-base text-white sm:text-lg md:mb-8">
          Your laboratory instruments should serve you, not the other way
          around. We&apos;re happy to help you.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
          <div className="flex items-center justify-center">
            <Link href="/signup">
              <div
                className={cn(
                  "group cursor-pointer group gap-2  h-[64px] flex items-center p-[11px] rounded-full"
                )}
              >
                <div className="border bg-white border-border h-[43px] rounded-full flex items-center justify-center text-black">
                  <p className="font-medium tracking-tight mr-3 ml-2 flex items-center gap-2 justify-center ">
                    Get started
                  </p>
                </div>
                <div className="text-[#3b3a3a] group-hover:ml-2  ease-in-out transition-all size-[26px] flex items-center justify-center rounded-full border-2 border-[#3b3a3a]  ">
                  <ArrowRight
                    size={18}
                    className="group-hover:-rotate-45 ease-in-out transition-all "
                  />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div></div>
  );
}
