"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { signup, authenticate } from "@/lib/authenticate";
import { toast } from "sonner";
import { AuthFormData, SignupFormData } from "@/types/auth.type";
import { useRouter } from "next/navigation";

type CredentialsFormProps = {
  variant: "login" | "register";
};

export default function CredentialsForm({ variant }: CredentialsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);

      if (variant === "login") {
        const data: AuthFormData = {
          email: formData.get("email") as string,
          password: formData.get("password") as string,
        };

        const result = await authenticate(null, data);

        if (result?.message === "success") {
          toast.success("Logged in successfully");
          // Add a small delay to allow the toast to show
          setTimeout(() => {
            router.push("/dashboard");
            router.refresh(); // Refresh to update authentication state
          }, 1000);
        } else {
          toast.error(result?.error || "Invalid credentials");
        }
      } else {
        const data: SignupFormData = {
          name: formData.get("name") as string,
          email: formData.get("email") as string,
          password: formData.get("password") as string,
          imageSrc: formData.get("imageSrc") as string,
        };

        const result = await signup(null, data);

        if (result?.message === "success") {
          toast.success("Account created successfully");
          // Add a small delay to allow the toast to show
          setTimeout(() => {
            router.push("/login");
          }, 1000);
        } else {
          toast.error(result?.error || "An error occurred during signup");
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4">
        {variant === "register" && (
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-white">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              className=" text-white placeholder:text-neutral-400 rounded-full"
              required
              disabled={isLoading}
            />
          </div>
        )}
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="email@example.com"
            className=" rounded-full placeholder:text-neutral-400"
            required
            disabled={isLoading}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="********"
            className=" rounded-full  placeholder:text-neutral-400"
            required
            disabled={isLoading}
          />
        </div>
        {variant === "register" && (
          <div className="grid gap-2">
            <Label htmlFor="imageSrc" className="text-white">
              Profile Image URL
            </Label>
            <Input
              id="imageSrc"
              name="imageSrc"
              type="url"
              placeholder="https://example.com/image.jpg"
              className="border-neutral-800 text-white placeholder:text-neutral-400 rounded-full"
              disabled={isLoading}
            />
          </div>
        )}
        <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
          {isLoading
            ? "Please wait..."
            : variant === "login"
            ? "Login"
            : "Create account"}
        </Button>
      </div>
    </form>
  );
}
