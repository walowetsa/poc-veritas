import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextRequest } from "next/server";
import { ParsedData } from "@/lib/parser";

export const maxDuration = 30;

const MAX_CONTEXT_ROWS = 200;

function buildSystemPrompt(data: ParsedData): string {
  const isSampled = data.rowCount > MAX_CONTEXT_ROWS;
  const sample    = data.rows.slice(0, MAX_CONTEXT_ROWS);

  return `You are a data analyst assistant embedded in a tool called Veritas. The user has uploaded a dataset and you are here to help them explore and understand it.

DATASET OVERVIEW:
- File: ${data.fileName}
- Total rows: ${data.rowCount.toLocaleString()}
- Columns (${data.headers.length}): ${data.headers.join(", ")}
${isSampled ? `- Note: You are working from a sample of the first ${MAX_CONTEXT_ROWS} rows out of ${data.rowCount.toLocaleString()} total. Caveat any answers that may be affected by this.` : ""}

DATASET SAMPLE:
${JSON.stringify(sample, null, 2)}

INSTRUCTIONS:
- Answer questions about this dataset clearly and concisely
- When doing calculations (totals, averages, counts, etc.), work through them using the data above
- If a question cannot be answered from the available data, say so clearly rather than guessing
- Format numbers readably (e.g. 1,240 not 1240, $14.5k not $14500 where appropriate)
- Use markdown for structure when helpful — bullet points, bold for key figures, tables for comparisons
- Keep answers focused and actionable — the user wants insights, not essays
- If the dataset is sampled and the answer may differ for the full dataset, mention it briefly`;
}

export async function POST(req: NextRequest) {
  const { messages, data } = await req.json() as {
    messages: { role: "user" | "assistant"; content: string }[];
    data: ParsedData;
  };

  if (!data) {
    return new Response("No dataset provided", { status: 400 });
  }

  const result = streamText({
    model: openai("gpt-4o"),
    system: buildSystemPrompt(data),
    messages,
    temperature: 0.3,
  });

  return result.toTextStreamResponse();
}