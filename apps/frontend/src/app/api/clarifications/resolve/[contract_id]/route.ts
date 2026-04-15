import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

function buildBackendUrl(clarificationId: string, response: string) {
	return `${BACKEND_URL}/api/contracts/clarification/resolve/${encodeURIComponent(
		clarificationId
	)}?response=${encodeURIComponent(response)}`;
}

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ contract_id: string }> }
) {
	try {
		const session = await auth();
		if (!session?.user?._id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const urlObj = new URL(req.url);
		const responseParam = urlObj.searchParams.get("response");
		if (!responseParam) {
			return NextResponse.json(
				{ error: "'response' query parameter is required" },
				{ status: 400 }
			);
		}

		const { contract_id } = await params; // folder named [contract_id], but this is the clarification id
		const clarificationId = contract_id;
		if (!clarificationId) {
			return NextResponse.json(
				{ error: "clarification_id is required" },
				{ status: 400 }
			);
		}

		const url = buildBackendUrl(clarificationId, responseParam);
		const res = await fetch(url, { method: "POST" });

		const contentType = res.headers.get("content-type") || "";
		const body = contentType.includes("application/json")
			? await res.json()
			: await res.text();

		return new NextResponse(
			typeof body === "string" ? body : JSON.stringify(body),
			{
				status: res.status,
				headers: {
					"content-type": contentType.includes("application/json")
						? "application/json"
						: "text/plain",
				},
			}
		);
	} catch (err) {
		console.error("POST /api/clarifications/resolve/[contract_id] error", err);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}

