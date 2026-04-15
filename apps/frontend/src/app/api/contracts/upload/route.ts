import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?._id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentTypeIn = req.headers.get("content-type");
    console.log("[upload] incoming content-type:", contentTypeIn);
    const inForm = await req.formData();
    console.log("[upload] incoming form keys:", Array.from(inForm.keys()));
    const file = inForm.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }
    console.log("[upload] file:", {
      name: (file as File).name,
      type: (file as File).type,
      size: (file as File).size,
    });

    // Accept either a pre-bundled JSON metadata field or individual fields
    let metadataObj: any | undefined;
    const metaField = inForm.get("metadata");
    if (typeof metaField === "string") {
      try {
        metadataObj = JSON.parse(metaField);
        console.log("[upload] parsed metadata (string):", metadataObj);
      } catch {
        return NextResponse.json({ error: "metadata must be valid JSON" }, { status: 400 });
      }
    } else if (metaField instanceof File) {
      try {
        const text = await metaField.text();
        metadataObj = JSON.parse(text);
        console.log("[upload] parsed metadata (file):", metadataObj);
      } catch {
        return NextResponse.json({ error: "metadata file must contain valid JSON" }, { status: 400 });
      }
    }

    // If not provided as JSON, synthesize from individual fields
    if (!metadataObj) {
      const name = inForm.get("name");
      const description = inForm.get("description");
      const tag = inForm.get("tag");
      const template = inForm.get("template");
      metadataObj = {
        name: typeof name === "string" ? name : "",
        description: typeof description === "string" ? description : "",
        tag: typeof tag === "string" ? tag : "",
        template: typeof template === "string" ? template : "",
      };
      console.log("[upload] synthesized metadata from individual fields:", metadataObj);
    } else {
      // Ensure required keys exist
      metadataObj = {
        name: metadataObj.name ?? "",
        description: metadataObj.description ?? "",
        tag: metadataObj.tag ?? "",
        template: metadataObj.template ?? "",
      };
      console.log("[upload] normalized metadata:", metadataObj);
    }

    // Build outgoing multipart form for backend
    const outForm = new FormData();
    outForm.append("file", file, (file as File).name || "upload" );
    // Attach metadata as JSON string; many FastAPI handlers accept this as a simple field
    const metadataJson = JSON.stringify(metadataObj);
    outForm.append("metadata", metadataJson);
  // Backend requires 'user' in body (not just query), per 422 error
  outForm.append("user", String(userId));

    // Log outgoing form keys for verification
  const outEntries = Array.from(outForm.entries()).map(([k, v]) => (
      v instanceof File
        ? { key: k, file: { name: v.name, type: v.type, size: v.size } }
        : { key: k, valuePreview: typeof v === 'string' ? (v.length > 120 ? v.slice(0, 120) + '…' : v) : typeof v }
    ));
    console.log("[upload] outgoing form entries:", outEntries);

    // Assumption: backend expects userid as query param (consistent with other routes)
    const url = `${BACKEND_URL}/api/contracts/upload?userid=${encodeURIComponent(userId)}`;
    console.log("[upload] proxying to:", url);
    console.time("[upload] proxy duration");
    const res = await fetch(url, {
      method: "POST",
      body: outForm,
    });
    console.timeEnd("[upload] proxy duration");

    const contentType = res.headers.get("content-type") || "";
    const rawText = await res.text();
    if (!res.ok) {
      console.error("[upload] backend error:", res.status, contentType, rawText);
    } else {
      console.log("[upload] backend success:", res.status, contentType);
    }
    let body: any = rawText;
    if (contentType.includes("application/json")) {
      try {
        body = JSON.parse(rawText || "null");
      } catch {
        // leave as text
      }
    }
    return new NextResponse(typeof body === "string" ? body : JSON.stringify(body), {
      status: res.status,
      headers: {
        "content-type": contentType.includes("application/json") ? "application/json" : "text/plain",
      },
    });
  } catch (err) {
    console.error("POST /api/contracts/upload error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
