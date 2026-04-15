"use client";

import { useEffect, useState } from "react";
import type React from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarSeparator,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signIn as signInClient } from "next-auth/react";
import {
	User,
	Mail,
	Lock,
	Shield,
	Trash2,
	Settings,
    AlertTriangleIcon,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { LuGithub } from "react-icons/lu";
import { AnimatePresence, motion } from "framer-motion";

type TabKey = "profile" | "connected" | "danger";
type OAuthProvider = "google" | "github";

type AccountDoc = {
	provider: OAuthProvider | string;
	providerAccountId: string;
};

export default function SettingsDialog() {
	const [open, setOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<TabKey>("profile");

	// Profile state
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");

	// Password state
	const [accounts, setAccounts] = useState<AccountDoc[]>([]);
	const [loadingAccounts, setLoadingAccounts] = useState(false);

	const handleSaveProfile = (e: React.FormEvent) => {
		e.preventDefault();
		// Replace with API call
		console.log("Save profile", { username, email });
		setOpen(false);
	};

	const refreshAccounts = async () => {
		try {
			setLoadingAccounts(true);
			const res = await fetch("/api/accounts", { cache: "no-store" });
			if (!res.ok) throw new Error("Failed to load accounts");
			const data = await res.json();
			setAccounts(data.accounts || []);
		} catch (err) {
			console.error(err);
		} finally {
			setLoadingAccounts(false);
		}
	};

	useEffect(() => {
		if (open && activeTab === "connected") {
			refreshAccounts();
		}
	}, [open, activeTab]);

	const handleUnlink = async (provider: OAuthProvider) => {
		try {
			const res = await fetch("/api/accounts/unlink", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ provider }),
			});
			if (!res.ok) throw new Error("Failed to unlink account");
			await refreshAccounts();
			alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} account disconnected`);
		} catch (err) {
			console.error(err);
			alert("Unable to disconnect account.");
		}
	};

	const handleDeleteAccount = (e: React.FormEvent) => {
		e.preventDefault();
		// Replace with API call + confirmation flow
		const ok = confirm(
			"This will permanently delete your account and all associated data. Are you sure?"
		);
		if (!ok) return;
		console.log("Delete account");
		setOpen(false);
	};

	const SidebarItem = ({
		tab,
		label,
		icon: Icon,
	}: {
		tab: TabKey;
		label: string;
		icon: React.ComponentType<any>;
	}) => (
		<SidebarMenuItem>
			<motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
				<SidebarMenuButton
					isActive={activeTab === tab}
					onClick={() => setActiveTab(tab)}
					className="flex items-center rounded-2xl"
				>
					<Icon className="h-4 w-4" />
					<span>{label}</span>
				</SidebarMenuButton>
			</motion.div>
		</SidebarMenuItem>
	);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="w-full font-light border-0 ring-0 outline-0 justify-start bg-transparent">
					<Settings className="mr-2 h-4 w-4" />
					Open Settings
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-5xl p-0 overflow-hidden rounded-2xl">
				<DialogHeader className="px-6 pt-6 pb-2 border-b">
					<DialogTitle>Settings</DialogTitle>
					<DialogDescription>
						Manage your account details and preferences.
					</DialogDescription>
				</DialogHeader>

				<div className="flex h-[70vh] w-full">
					<SidebarProvider defaultOpen={true}>
						{/* Left rail */}
						<div className="border-r w-64 shrink-0">
							<Sidebar collapsible="none" className="h-full">
								<SidebarContent className="p-2">
									<SidebarMenu>
										{/* Real tabs */}
										<SidebarItem tab="profile" label="Profile" icon={User} />
										<SidebarItem tab="connected" label="Connected Accounts" icon={Shield} />
										<SidebarItem tab="danger" label="Danger Zone" icon={Trash2} />

									</SidebarMenu>
								</SidebarContent>
							</Sidebar>
						</div>

						{/* Right content */}
						<div className="flex-1 overflow-auto p-6 space-y-8">
							<AnimatePresence mode="wait" initial={false}>
								{activeTab === "profile" && (
									<motion.section
										key="profile"
										initial={{ opacity: 0, x: 24 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: -24 }}
										transition={{ duration: 0.22, ease: "easeOut" }}
										className="space-y-6"
									>
									<header>
										<h3 className="text-base font-semibold">Profile</h3>
										<p className="text-sm text-muted-foreground">
											Update your public profile information.
										</p>
									</header>
									<form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
										<div className="grid gap-2">
											<Label htmlFor="username">Username</Label>
											<Input
												id="username"
												placeholder="johndoe"
												value={username}
												onChange={(e) => setUsername(e.target.value)}
												required
											/>
										</div>
										<div className="grid gap-2">
											<Label htmlFor="email">Email</Label>
											<Input
												id="email"
												type="email"
												placeholder="john@example.com"
												value={email}
												onChange={(e) => setEmail(e.target.value)}
												required
											/>
										</div>
										<DialogFooter>
											<motion.div whileTap={{ scale: 0.98 }}>
												<Button type="submit">Save changes</Button>
											</motion.div>
										</DialogFooter>
									</form>
								</motion.section>
							)}

							{activeTab === "connected" && (
								<motion.section
									key="connected"
									initial={{ opacity: 0, x: 24 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -24 }}
									transition={{ duration: 0.22, ease: "easeOut" }}
									className="space-y-6"
								>
									<header className="space-y-1">
										<h3 className="text-base font-semibold">Connected Accounts</h3>
										<p className="text-sm text-muted-foreground">
											Link or unlink your Google and GitHub accounts.
										</p>
									</header>

									<div className="grid gap-4 max-w-2xl">
										{(["google", "github"] as OAuthProvider[]).map((provider) => {
											const connected = accounts?.some((a) => a.provider === provider);
											return (
												<motion.div
													key={provider}
													className="flex items-center justify-between rounded-2xl border p-4"
													initial={{ opacity: 0, y: 6 }}
													animate={{ opacity: 1, y: 0 }}
													exit={{ opacity: 0, y: -6 }}
													transition={{ duration: 0.18, ease: "easeOut" }}
													whileHover={{ y: -2 }}
													whileTap={{ scale: 0.98 }}
												>
													<div className="flex items-center gap-3">
														<div
															className="h-9 w-9 rounded-full border flex items-center justify-center bg-muted"
														>
															<span className="text-xs font-medium">
																{provider === "google" ? <FcGoogle/> : <LuGithub/>}
															</span>
														</div>
														<div>
															<p className="text-sm font-medium capitalize">{provider}</p>
															<p className="text-xs text-muted-foreground">
																{connected ? "Connected" : "Not connected"}
															</p>
														</div>
													</div>
													<div className="flex items-center gap-2">
														{connected ? (
															<motion.div whileTap={{ scale: 0.98 }}>
																<Button
																variant="secondary"
																onClick={() => handleUnlink(provider)}
																disabled={loadingAccounts}
																>
																	Disconnect
																</Button>
															</motion.div>
														) : (
															<motion.div whileTap={{ scale: 0.98 }}>
																<Button
																onClick={() => signInClient(provider, { redirect: true })}
																disabled={loadingAccounts}
																>
																	Connect
																</Button>
															</motion.div>
														)}
													</div>
												</motion.div>
											);
										})}
									</div>

									{loadingAccounts && (
										<p className="text-xs text-muted-foreground">Loading connections…</p>
									)}
							</motion.section>
							)}

							{activeTab === "danger" && (
								<motion.section
									key="danger"
									initial={{ opacity: 0, x: 24 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -24 }}
									transition={{ duration: 0.22, ease: "easeOut" }}
									className="space-y-6"
								>
									<header>
										<h3 className="text-base font-semibold">Danger Zone</h3>
										<p className="text-sm text-muted-foreground">
											Permanently delete your account and all associated data.
										</p>
									</header>
									<form onSubmit={handleDeleteAccount} className="space-y-4 max-w-md">
										<div className="rounded-2xl border p-4 bg-destructive/5">
											<p className="flex items-center gap-2 text-sm ">
												<AlertTriangleIcon /> This action cannot be undone. Please proceed with caution.
											</p>
										</div>
										<DialogFooter>
											<motion.div whileTap={{ scale: 0.98 }}>
												<Button type="submit" variant="destructive">
													<Trash2 className="mr-2 h-4 w-4" /> Delete account
												</Button>
											</motion.div>
										</DialogFooter>
									</form>
								</motion.section>
							)}
							</AnimatePresence>

						

							
						</div>
					</SidebarProvider>
				</div>
			</DialogContent>
		</Dialog>
	);
}

