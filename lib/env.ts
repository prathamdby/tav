import { z } from "zod";

const envSchema = z.object({
  CEREBRAS_API_KEY: z.string().min(1, "CEREBRAS_API_KEY is required"),
  TAVILY_API_KEY: z.string().min(1, "TAVILY_API_KEY is required"),
});

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues.map((i) => i.message).join(", ");
    throw new Error(`Missing environment variables: ${missing}`);
  }
  return parsed.data;
}

let _env: z.infer<typeof envSchema> | null = null;

export function getEnv() {
  if (!_env) {
    _env = validateEnv();
  }
  return _env;
}
