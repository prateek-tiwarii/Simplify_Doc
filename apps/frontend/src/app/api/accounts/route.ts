import { NextResponse } from "next/server";
import { auth } from "@/auth";
import client from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await client.connect();
    const db = client.db();
    // Resolve the user's ObjectId robustly
    let userObjectId: ObjectId | null = null;
    const rawId = (session.user as any)._id as string | undefined;
    if (rawId && ObjectId.isValid(rawId)) {
      userObjectId = new ObjectId(rawId);
    } else if (session.user.email) {
      const userDoc = await db.collection("users").findOne({ email: session.user.email });
      if (userDoc?._id) {
        userObjectId = userDoc._id as ObjectId;
      }
    }

    if (!userObjectId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const accounts = await db
      .collection("accounts")
      .find({ userId: userObjectId })
      .project<{ provider: string; providerAccountId: string }>({
        provider: 1,
        providerAccountId: 1,
      })
      .toArray();

    return NextResponse.json({ accounts });
  } catch (err) {
    console.error("GET /api/accounts error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
