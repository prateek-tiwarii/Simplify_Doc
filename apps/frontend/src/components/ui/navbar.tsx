"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, easeInOut } from "framer-motion";
import { Menu, X, ArrowRight, Zap, Search, ShredderIcon, LogOut } from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SettingsDialog from "@/components/dashboard/settings";

interface NavItem {
  name: string;
  href: string;
}

const navItems: NavItem[] = [
  { name: "Features", href: "#features" },
  { name: "Solutions", href: "#solutions" },
  { name: "Testimonials", href: "#testimonials" },
  { name: "Pricing", href: "#pricing" }
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const { data: session } = useSession();
  const user = (session?.user || {}) as {
    image?: string | null;
    name?: string | null;
    email?: string | null;
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      x: "100%",
      transition: {
        duration: 0.3,
        ease: easeInOut,
      },
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: easeInOut,
        staggerChildren: 0.1,
      },
    },
  };

  const mobileItemVariants = {
    closed: { opacity: 0, x: 20 },
    open: { opacity: 1, x: 0 },
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "border-border/50 bg-background/80 border-b shadow-sm backdrop-blur-md"
            : "bg-transparent"
        }`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <motion.div
              className="flex items-center space-x-3"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Link
                prefetch={false}
                href="/"
                className="flex items-center space-x-3"
              >
                <div className="relative">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full  shadow-lg">
                    <ShredderIcon className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-foreground text-lg font-bold">
                Obligence
                  </span>
                  <span className="text-muted-foreground -mt-1 text-xs font-light">
                    Lightspeed Insights
                  </span>
                </div>
              </Link>
            </motion.div>

            <nav className="hidden items-center space-x-1 lg:flex">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  variants={itemVariants}
                  className="relative"
                  onMouseEnter={() => setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Link
                    prefetch={false}
                    href={item.href}
                    className="text-foreground/80 hover:text-foreground relative rounded-lg px-4 py-2 text-sm font-light transition-colors duration-200"
                    onClick={(e) => {
                      if (item.href.startsWith('#')) {
                        e.preventDefault();
                        const el = document.querySelector(item.href);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          setIsMobileMenuOpen(false);
                        }
                      }
                    }}
                  >
                    {hoveredItem === item.name && (
                      <motion.div
                        className="bg-muted absolute inset-0 rounded-full"
                        layoutId="navbar-hover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                    <span className="relative z-10">{item.name}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div className="hidden items-center space-x-3 lg:flex" variants={itemVariants}>
              {!user?.email ? (
                <>
                  <Link
                    prefetch={false}
                    href="/login"
                    className="text-foreground/80 hover:text-foreground px-4 py-2 text-sm font-medium transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      prefetch={false}
                      href="/signup"
                      className="bg-foreground text-background hover:bg-foreground/90 inline-flex items-center space-x-2 px-5 py-2.5 text-sm font-medium shadow-sm transition-all duration-200 rounded-full"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </motion.div>
                </>
              ) : (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="rounded-full p-1 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        aria-label="Account menu"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.image ?? undefined} alt={user?.name || ""} />
                          <AvatarFallback>
                            {(user?.name?.charAt(0) || "U").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 p-0 rounded-2xl" align="end">
                      <DropdownMenuLabel className="flex gap-2 items-center">
                        <div>
                          <Avatar className="h-6 w-6 ml-1">
                            <AvatarImage src={user?.image ?? undefined} alt={user?.name || ""} />
                            <AvatarFallback>
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

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      prefetch={false}
                      href="/dashboard"
                      className="bg-foreground text-background hover:bg-foreground/90 inline-flex items-center space-x-2 px-5 py-2.5 text-sm font-medium shadow-sm transition-all duration-200 rounded-full"
                    >
                      <span>Go to Dashboard</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </motion.div>
                </>
              )}
            </motion.div>

            <motion.button
              className="text-foreground hover:bg-muted rounded-lg p-2 transition-colors duration-200 lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              variants={itemVariants}
              whileTap={{ scale: 0.95 }}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              className="border-border bg-background fixed top-16 right-4 z-50 w-80 overflow-hidden rounded-2xl border shadow-2xl lg:hidden"
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <div className="space-y-6 p-6">
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <motion.div key={item.name} variants={mobileItemVariants}>
                      <Link
                        prefetch={false}
                        href={item.href}
                        className="text-foreground hover:bg-muted block rounded-lg px-4 py-3 font-medium transition-colors duration-200"
                        onClick={(e) => {
                          if (item.href.startsWith('#')) {
                            e.preventDefault();
                            const el = document.querySelector(item.href);
                            if (el) {
                              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              setIsMobileMenuOpen(false);
                            }
                          } else {
                            setIsMobileMenuOpen(false);
                          }
                        }}
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <motion.div className="border-border space-y-3 border-t pt-6" variants={mobileItemVariants}>
                  {!user?.email ? (
                    <>
                      <Link
                        prefetch={false}
                        href="/login"
                        className="text-foreground hover:bg-muted block w-full rounded-lg py-3 text-center font-medium transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        prefetch={false}
                        href="/signup"
                        className="bg-foreground text-background hover:bg-foreground/90 block w-full rounded-full py-3 text-center font-medium transition-all duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Get Started
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        prefetch={false}
                        href="/dashboard"
                        className="bg-foreground text-background hover:bg-foreground/90 block w-full rounded-full py-3 text-center font-medium transition-all duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Go to Dashboard
                      </Link>
                      <button
                        className="text-foreground hover:bg-muted block w-full rounded-lg py-3 text-center font-medium transition-colors duration-200"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          signOut({ redirect: true, redirectTo: "/login" });
                        }}
                      >
                        Logout
                      </button>
                    </>
                  )}
                </motion.div>
              </div>
              
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
