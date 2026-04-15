import AuthForm from "@/components/auth/auth-form";
import Footer from "@/components/ui/footer";
import { ShredderIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  return (
    <>
      <main className="relative flex flex-col min-h-screen overflow-hidden">
          <Link
          prefetch={false}
          href="/"
          className="flex items-center space-x-3 md:fixed top-3 left-8 z-20"
        >
          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-full  shadow-lg">
              <ShredderIcon className="h-7 w-7 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-foreground text-lg font-bold">Obligence</span>
            <span className="text-muted-foreground -mt-1 text-xs font-light">
              Lightspeed Insights
            </span>
          </div>
        </Link>
          {/* Background gradient */}
    <div className="absolute inset-0 z-0 pointer-events-none">
    {/* <div className="from-primary/20 via-background to-background absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]"></div> */}
    <div className="bg-primary/5 absolute top-0 left-1/2 -z-10 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full blur-3xl"></div>
    </div>
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:16px_16px] opacity-15"></div>
        <div className="flex z-10 h-screen items-center">
          <section className="flex w-full flex-col justify-center ">
            <AuthForm variant="login" />

            <span className="text-neutral-400 text-center block mt-4">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-white underline underline-offset-2"
              >
                Sign up
              </Link>
            </span>
          </section>
          {/* <section className="hidden w-1/2 lg:block">
            <div className="flex h-full items-center justify-center">
              <Image
                src="/images/login.jpg"
                width={800}
                height={800}
                alt="Login"
                className="h-screen object-cover grayscale brightness-50"
              />
            </div>
          </section> */}
        </div>
        <Footer />
      </main>
    </>
  );
}
