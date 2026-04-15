"use server";

import { signIn } from "@/auth";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import { User } from "@/lib/models";
import { AuthFormData, AuthState, SignupFormData } from "@/types/auth.type";

export const authenticate = async (
  prevState: AuthState | null,
  formData: AuthFormData
): Promise<{ message: string; error?: string }> => {
  try {
    const result = await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false, // Important: Set this to false to handle redirects manually
    });

    if (!result) {
      return { message: "error", error: "Authentication failed" };
    }

    if (result.error) {
      return { message: "error", error: result.error };
    }

    // Successfully authenticated
    return { message: "success" };
  } catch (error: unknown) {
    console.error("Authentication error:", error);

    if (error instanceof Error) {
      return {
        message: "error",
        error: error.message.includes("credentials")
          ? "Invalid credentials"
          : "An unexpected error occurred",
      };
    }

    return { message: "error", error: "An unexpected error occurred" };
  }
};

export const signup = async (
  prevState: null,
  formData: SignupFormData
): Promise<{ message: string; error?: string }> => {
  const { name, email, password, imageSrc } = formData;

  try {
    // Connect to MongoDB
    await dbConnect();

    // Check if a user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return {
        message: "error",
        error: "An account with this email already exists. Please login.",
      };
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user in the database
    await User.create({
      name,
      email,
      password: hashedPassword,
      image: imageSrc || null,
      authType: "credentials",
    });

    return { message: "success" };
  } catch (err: unknown) {
    console.error("Signup error:", err);

    // Check for duplicate key error (Mongo error code E11000)
    if (err instanceof Error && err.message.includes("E11000")) {
      return {
        message: "error",
        error: "An account with this email already exists. Please login.",
      };
    }

    return {
      message: "error",
      error: "An unexpected error occurred",
    };
  }
};