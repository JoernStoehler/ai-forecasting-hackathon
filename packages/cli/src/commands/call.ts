import { writeFile, readFile } from 'node:fs/promises';
import { PreparedPromptSchema, type PreparedPrompt } from '@ai-forecasting/engine';
import { GoogleGenAI, type GenerateContentParameters } from '@google/genai';

export async function runCall(opts: {
  inputPrompt: string;
  outputResponse: string;
  apiKey?: string;
}) {
  const prompt = PreparedPromptSchema.parse(JSON.parse(await readFile(opts.inputPrompt, 'utf-8'))) as PreparedPrompt;
  const genai = new GoogleGenAI({ apiKey: opts.apiKey ?? process.env.GEMINI_API_KEY });
  const request: GenerateContentParameters = {
    model: prompt.request.model,
    contents: prompt.request.contents,
    config: prompt.request.config,
  };
  // Streaming for parity with webapp; CLI still collects full response.
  const stream = await genai.models.generateContentStream(request);
  const chunks: unknown[] = [];
  for await (const part of stream) {
    chunks.push(part);
  }
  const response = chunks[chunks.length - 1] ?? null;
  await writeFile(opts.outputResponse, JSON.stringify({ response, chunks }, null, 2));
}
