import { signIn } from "@/auth";
import { LuGithub } from "react-icons/lu";
import { FcGoogle } from "react-icons/fc";
import { Button } from "../ui/button";

interface SignInButtonProps {
  method: string;
}

const SignInButton = async ({ method }: SignInButtonProps) => {
  return (
    <form
      action={async () => {
        "use server";
        await signIn(method, {
          redirect: true,
          redirectTo: "/",
        });
      }}
    >
      <Button
        variant="outline"
        className="border-neutral-800 rounded-full hover:bg-neutral-900 w-32 sm:w-40"
      >
        {method === "github" ? (
          <LuGithub className="mr-2 h-4 w-4" />
        ) : (
          <FcGoogle className="mr-2 h-4 w-4" />
        )}
        {method === "github" ? "GitHub" : "Google"}
      </Button>
    </form>
  );
};

export default SignInButton;
