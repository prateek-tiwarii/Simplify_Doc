import { SessionProvider } from "@/utils/session-provider";
import { auth } from "@/auth";
import { Toaster } from "sonner";

export async function Providers({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <SessionProvider session={session}>
      <Toaster />
      {children}
    </SessionProvider>
  );
}
