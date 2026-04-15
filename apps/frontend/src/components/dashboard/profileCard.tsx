'use client'
import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "next-auth/react";
import { LogOut, User } from "lucide-react";
import SettingsDialog from "./settings";
import { signOut } from "next-auth/react";
export default function Header() {
  const { data: session } = useSession();
  const user = session?.user as {
    image?: string | null;
    name?: string | null;
    id?: string;
    email?: string | null;
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-2xl cursor-pointer">
              <Avatar className="h-7 w-7">
                <AvatarImage
                  src={user?.image ?? undefined}
                  alt={user?.name || ""}
                />
                {user?.name ? (
                  <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                ) : (
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="text-lg font-light">{user?.name}</p>
                <p className="text-xs text-muted-foreground font-extralight tracking-wider">
                  {user?.email}
                </p>
              </div>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-fit p-0 rounded-2xl" align="end">
            <DropdownMenuItem asChild>
              <SettingsDialog />
            </DropdownMenuItem>
            <DropdownMenuItem
              className="p-2 m-1"
              asChild
              onClick={() => {
                signOut({ redirect: true, redirectTo: "/login" });
              }}
            >
              <button className="w-full text-left hover:text-red-500 transition flex items-center">
                {" "}
                <LogOut className="mr-4" />
                Logout
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
