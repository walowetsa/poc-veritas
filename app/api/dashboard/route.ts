import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { ParsedData } from "@/lib/parser";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type ChartType = "bar" | "line" | "pie" | "area";

export type ChartConfig = {
  id: string;
  type: ChartType;
  title: string;
  description: string;
  dataKey: string;       // the numeric value field
  categoryKey: string;  // the x-axis / label field
  data: Record<string, unknown>[];
  color: string;
};

export type DashboardConfig = {
  summary: string;
  charts: ChartConfig[];
  relevantColumns: string[]; // ordered list of most meaningful columns for the preview table
};

// Only send a sample of rows to avoid blowing the context window
const MAX_SAMPLE_ROWS = 100;

function buildSample(parsed: ParsedData) {
  return {
    fileName: parsed.fileName,
    headers: parsed.headers,
    rowCount: parsed.rowCount,
    sample: parsed.rows.slice(0, MAX_SAMPLE_ROWS),
  };
}

const SYSTEM_PROMPT = `You are a data analyst. You will receive a dataset and must return a JSON dashboard configuration.

Analyse the data and return 3-4 meaningful charts that reveal the most interesting patterns, trends, or distributions.

Rules:
- Return ONLY valid JSON — no markdown, no backticks, no explanation
- Choose chart types wisely: use "bar" for comparisons, "line" for trends over time, "pie" for proportions (max 8 segments), "area" for cumulative trends
- Each chart must use fields that actually exist in the dataset
- Aggregate the data yourself if needed (e.g. sum by category, count by group)
- The "data" array in each chart should be ready to render — pre-aggregated and clean
- Maximum 20 data points per chart for readability
- Pick distinct hex colors for each chart
- For relevantColumns: choose 4-6 of the most informative columns from the raw dataset for a preview table. Prioritise identifier/name columns first, then the most analytically meaningful numeric or categorical columns. Use exact header names from the dataset.

Return this exact shape:
{
  "summary": "2-3 sentence plain English summary of what this dataset contains and its key patterns",
  "relevantColumns": ["col1", "col2", "col3", "col4"],
  "charts": [
    {
      "id": "unique_string",
      "type": "bar" | "line" | "pie" | "area",
      "title": "Chart title",
      "description": "One sentence explaining what this chart shows",
      "categoryKey": "the field name used for labels/x-axis",
      "dataKey": "the field name used for the numeric value",
      "data": [ { "<categoryKey>": "...", "<dataKey>": 123 } ],
      "color": "#hexcolor"
    }
  ]
}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { data: ParsedData };

    if (!body.data) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    const sample = buildSample(body.data);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.3,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Here is the dataset to analyse:\n\n${JSON.stringify(sample, null, 2)}`,
        },
      ],
    });

    const raw = response.choices[0].message.content ?? "";

    // Strip any accidental markdown fences
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    let config: DashboardConfig;
    try {
      config = JSON.parse(cleaned) as DashboardConfig;
    } catch {
      console.error("Failed to parse OpenAI response:", cleaned);
      return NextResponse.json(
        { error: "The AI returned an invalid response. Please try again." },
        { status: 500 }
      );
    }

    // Basic validation
    if (!config.charts || !Array.isArray(config.charts) || config.charts.length === 0) {
      return NextResponse.json(
        { error: "No charts could be generated from this data." },
        { status: 422 }
      );
    }

    return NextResponse.json({ success: true, dashboard: config });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate dashboard";
    console.error("Dashboard generation error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}