import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import client from "@/lib/db";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { provider } = await req.json();
    if (!provider) {
      return NextResponse.json({ error: "Provider required" }, { status: 400 });
    }

    await client.connect();
    const db = client.db();

    const res = await db.collection("accounts").deleteOne({
      userId: new ObjectId(session.user._id),
      provider,
    });

    return NextResponse.json({ success: res.acknowledged, deletedCount: res.deletedCount });
  } catch (err) {
    console.error("POST /api/accounts/unlink error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
