import { NextRequest, NextResponse } from "next/server";
import { parseCSV, parseExcel } from "@/lib/parser";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileName = file.name;
    const ext = fileName.split(".").pop()?.toLowerCase();

    if (!["csv", "xlsx", "xls"].includes(ext ?? "")) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a CSV or Excel file." },
        { status: 400 }
      );
    }

    let parsed;

    if (ext === "csv") {
      const text = await file.text();
      parsed = parseCSV(text, fileName);
    } else {
      const buffer = await file.arrayBuffer();
      parsed = await parseExcel(buffer, fileName);
    }

    if (parsed.rows.length === 0) {
      return NextResponse.json(
        { error: "The file appears to be empty or has no data rows." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: parsed,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to parse file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}