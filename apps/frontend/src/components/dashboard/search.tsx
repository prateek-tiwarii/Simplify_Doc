import { useState, useEffect } from "react";
import useSWR from "swr";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search as SearchIcon, Loader2, FileText, Clock, X, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Report } from "@/types/report.type";

export function SearchDialog({ isOpen, onClose, recentData }: { isOpen: boolean; onClose: (open: boolean) => void; recentData: Report[] }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Report[]>([]);


  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);


  const handleSearch = async () => {
    if (!debouncedQuery) return;

    setIsLoading(true);
    try {
      // check if the query is in the recent data
      const filteredResults = recentData.filter((report) =>
        report?.contract?.metadata?.name?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        report?.result?.summary?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        report?._id?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        report?.created_at?.toLowerCase().includes(debouncedQuery.toLowerCase())
      );
      setResults(filteredResults);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl h-fit">
        <div className="flex items-center gap-2 mb-2 h-fit sticky top-0 bg-background">
          <SearchIcon className="h-5 w-5 text-primary" />
          <DialogTitle className="text-lg font-light">Search Reports</DialogTitle>
          {/* <div className="ml-auto text-xs text-muted-foreground hidden sm:block">Press Esc to close</div> */}
        </div>
        <div className="relative flex items-center h-fit">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by report name or ID..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              handleSearch();
            }}
            className="pl-10 pr-10"
            autoFocus
          />
          {query && !isLoading && (
            <button
              aria-label="Clear query"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted transition"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Content area */}
        <div className="mt-3 max-h-72 overflow-y-auto pr-1">
          {/* {showEmptyHint && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <SearchIcon className="h-4 w-4" />
              Start typing to search your reports
            </motion.div>
          )} */}

          {/* Recent documents list */}
          {!debouncedQuery && recentData && (
            <div className="mt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <History className="h-3.5 w-3.5" /> Recent documents
              </div>
              {recentData && (
                <ul>
                  <AnimatePresence initial={false}>
                    {recentData.map((doc) => (
                      <motion.li
                        key={`recent-${doc._id}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="my-2"
                      >
                        <Link
                          href={`/dashboard/results/${doc.contract_id}`}
                          className="flex items-center gap-3 px-2 py-2 rounded-2xl hover:bg-accent/60 transition"
                          onClick={() => onClose(false)}
                        >
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-foreground">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate">{doc?.contract?.metadata?.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {doc?.result?.summary ?? `Last edited: ${new Date(doc?.created_at).toLocaleString()}`}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {new Date(doc.created_at).toLocaleDateString()}
                          </div>
                        </Link>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>
          )}

          {isLoading && (
            <div className="space-y-2 mt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching...
              </div>
              <Skeleton className="h-6" />
              <Skeleton className="h-6" />
              <Skeleton className="h-6" />
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <ul className="">
              <AnimatePresence initial={false}>
                {results.map((report) => (
                  <motion.li
                    key={report._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="my-2"
                  >
                    <Link
                      href={`/dashboard/results/${report._id}`}
                      className="flex items-center gap-3 px-2 py-2 rounded-2xl hover:bg-accent/60 transition"
                      onClick={() => onClose(false)}
                    >
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{report?.contract?.metadata?.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {report?.result?.summary ?? `ID: ${report._id}`}
                        </div>
                      </div>
                    </Link>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}

          {!isLoading && results && !!query && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-muted-foreground"
            >
              No reports found.
            </motion.div>
          )}
        </div>

        <DialogClose className="sr-only" />
      </DialogContent>
    </Dialog>
  );
}