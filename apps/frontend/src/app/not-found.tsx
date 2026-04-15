"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6 overflow-hidden">
      <div className="h-1/3 md:h-1/2 w-full md:w-1/2 p-4 md:p-0">
        <DotLottieReact
          src="https://lottie.host/c3a70f7b-3f17-4828-89e0-4a91479293ce/Fv3xzv9Cni.lottie"
          loop
          autoplay
        />
      </div>
      <div className="text-3xl font-light text-center tracking-wide">
        Oops! Looks like this page took a detour.
      </div>
      <Link href="/dashboard" className="z-10 cursor-pointer">
        <Button className="z-10 cursor-pointer ">Return back Home</Button>
      </Link>
    </div>
  );
}
