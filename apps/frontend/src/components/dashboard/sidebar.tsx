"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
  SidebarSeparator,
  SidebarGroupLabel,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import {
  BarChart2,
  Settings,
  LogOut,
  ChevronsLeft,
  NotebookTextIcon,
  ArrowUpRight,
  PlusCircleIcon,
  NotepadText,
  DumbbellIcon,
  Cog,
  ShredderIcon,
  HelpCircleIcon,
  Search,
  MoreHorizontalIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import SettingsDialog from "./settings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useSWR from "swr";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuSkeleton } from "@/components/ui/sidebar";
import { SearchDialog } from "./search";
import { toast } from "sonner";
import { Report } from "@/types/report.type";

export function AppSidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [starringId, setStarringId] = useState<string | null>(null);
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = (session?.user || {}) as {
    image?: string | null;
    name?: string | null;
    email?: string | null;
  };

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";



  const fetcher = (url: string) => fetch(url).then((r) => {
    if (!r.ok) throw new Error(`Failed ${r.status}`);
    return r.json();
  });
  const { data: reportsData, isLoading: reportsLoading, error: reportsError } = useSWR<{ results: Report[] }>(
    `${backendUrl}/api/contracts/results/all?userid=${encodeURIComponent(
      session?.user?._id || ""
    )}&skip=0&limit=100&sort=desc`,
    fetcher
  );
  const reports = reportsData?.results ?? [];

  const starReport = async (contractId: string) => {
    if (!contractId || starringId) return;
    setStarringId(contractId);
    await toast.promise(
      fetch(`/api/contracts/result/star/${encodeURIComponent(contractId)}`, {
        method: "POST",
      }).then((res) => {
        if (!res.ok) throw new Error(`Star failed: ${res.status}`);
        return res;
      }),
      {
        loading: "Starring report…",
        success: "Report starred",
        error: (err) => err?.message || "Failed to star report",
      }
    );
    setStarringId(null);
  };

  const unstarReport = async (contractId: string) => {
    if (!contractId || starringId) return;
    setStarringId(contractId);
    await toast.promise(
      fetch(`/api/contracts/result/star/${encodeURIComponent(contractId)}`, {
        method: "DELETE",
      }).then((res) => {
        if (!res.ok) throw new Error(`Unstar failed: ${res.status}`);
        return res;
      }),
      {
        loading: "Unstarring report…",
        success: "Report unstarred",
        error: (err) => err?.message || "Failed to unstar report",
      }
    );
    setStarringId(null);
  };

  const deleteReport = async (contractId: string) => {
    if (!contractId) return;
    await toast.promise(
      fetch(`/api/contracts/result/${encodeURIComponent(contractId)}`, {
        method: "DELETE",
      }).then((res) => {
        if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
        return res;
      }),
      {
        loading: "Deleting report…",
        success: "Report deleted",
        error: (err) => err?.message || "Failed to delete report",
      }
    );
  };

  return (
    <Sidebar collapsible="icon" className="">
      <SidebarHeader>
        <Link
          href="/dashboard"
          className="flex items-center justify-center py-3 gap-2 flex-row w-full"
        >
          <div className=" rounded-full shadow-xl p-1">
            <ShredderIcon className=" m-0 h-6 p-0 rounded-full w-full" />
          </div>
          {isSidebarOpen && (
            <AnimatePresence>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.2 }}
                className="text-2xl tracking-widest text-balance font-semibold"
              >
                Obligence
              </motion.span>
            </AnimatePresence>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-2 overflow-hidden">
        <SidebarSeparator className="" />
        <SidebarMenu className="globalScroll">
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Create New Document"
              isActive={pathname.includes("/dashboard/create")}
              asChild
              className="flex items-center"
            >
              <Link href="/dashboard/create">
                <PlusCircleIcon className="h-4 w-4" />
                <span>Create New Document</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>{" "}
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Pre Assessment Clarifications"
              isActive={pathname.includes("/dashboard/clarifications")}
              asChild
              className="flex items-center"
            >
              <Link href="/dashboard/clarifications">
                <HelpCircleIcon className="h-4 w-4" />
                <span>Pre Assessment Clarifications</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem> <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Search Reports"
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center"
            >
              <Search className="h-4 w-4" />
              <span>Search Reports</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarGroupLabel>All Reports</SidebarGroupLabel>
          {reportsLoading && (
            <>
              {Array.from({ length: 4 }).map((_, idx) => (
                <SidebarMenuItem key={`skeleton-${idx}`}>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
              ))}
            </>
          )}
          {!reportsLoading && reportsError && (
            <SidebarMenuItem>
              <div className="text-xs text-destructive px-2 py-1 rounded-md">
                Failed to load reports.
              </div>
            </SidebarMenuItem>
          )}
          {!reportsLoading && !reportsError && reports.length === 0 && (
            <SidebarMenuItem>
              <div className="text-xs text-muted-foreground px-2 py-1 rounded-md">
                No reports found.
              </div>
            </SidebarMenuItem>
          )}
          {!reportsLoading && !reportsError && reports.length > 0 && (
            <>
              {reports.map((report) => {
                const href = `/dashboard/results/${report?.contract_id}`;
                const active = pathname.startsWith("/dashboard/results/") && pathname.includes(report?.contract_id);
                return (
                  <SidebarMenuItem key={report._id}>
                    <SidebarMenuButton asChild className="flex items-center" isActive={active}>
                      <Link href={href}>
                        <NotepadText className="h-4 w-4" />
                        <span className="font-light">{report?.contract?.metadata?.name}</span>
                      </Link>
                    </SidebarMenuButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuAction>
                          <MoreHorizontalIcon />
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            starReport(report._id);
                          }}
                          disabled={starringId === report._id}
                        >
                          <span>{starringId === report._id ? "Starring…" : "Star"}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            unstarReport(report._id);
                          }}
                          disabled={starringId === report._id}
                        >
                          <span>{starringId === report._id ? "Unstarring…" : "Unstar"}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteReport(report._id);
                          }}
                        >
                          <span>{"Delete Report"}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                );
              })}
            </>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="border-t border-t-neutral-700/30 dark:border-t-white/20">
            <SidebarMenuButton
              tooltip="Expand Sidebar"
              onClick={() => {
                toggleSidebar();
                setIsSidebarOpen(!isSidebarOpen);
              }}
            // className="flex items-center justify-center w-full"
            >
              <ChevronsLeft
                className={`h-4 w-4 ${isSidebarOpen ? "" : "transform rotate-180"
                  } transition-transform duration-300`}
              />
              <span>Collapse Sidebar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* Account menu button with avatar and dropdown */}
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  variant="outline"
                  size="lg"
                  className="items-center"
                  tooltip={`Your Account`}
                >
                  <Avatar className="h-6 w-6 ml-1">
                    <AvatarImage src={user?.image ?? undefined} alt={user?.name || ""} />
                    <AvatarFallback>
                      {/* Use first letter of name or a fallback icon */}
                      {(user?.name?.charAt(0) || "U").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col text-left">
                    <span className="truncate">{user?.name || "Account"}</span>
                    {user?.email && (
                      <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                    )}
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full p-0 rounded-2xl" align="end">
                <DropdownMenuLabel className="flex gap-2 items-center">
                  <div>
                    <Avatar className="h-6 w-6 ml-1">
                      <AvatarImage src={user?.image ?? undefined} alt={user?.name || ""} />
                      <AvatarFallback>
                        {/* Use first letter of name or a fallback icon */}
                        {(user?.name?.charAt(0) || "U").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex min-w-0 flex-col text-left">
                    <span className="truncate">{user?.name || "Account"}</span>
                    {user?.email && (
                      <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <SettingsDialog />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="px-2"
                  asChild
                  onClick={() => {
                    signOut({ redirect: true, redirectTo: "/login" });
                  }}
                >
                  <button className="w-full pl-3 font-light text-left hover:text-red-500 transition flex items-center">
                    <LogOut className="mr-1" />
                    Logout
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      {/* Search dialog */}
      <SearchDialog isOpen={isSearchOpen} onClose={setIsSearchOpen} recentData={reports} />
    </Sidebar>
  );
}
