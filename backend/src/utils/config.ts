import dotenv from "dotenv";

dotenv.config();

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
};

export const PORT = Number(process.env.PORT ?? 3001);
export const SECRET = required("SECRET");
export const GEMINI_KEY = required("GEMINI_KEY");
export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.5-flash";
export const DATABASE = required("DATABASE");
export const SUPABASE_KEY = required("SUPABASE_KEY");
export const SUPABASE_BUCKET = required("SUPABASE_BUCKET");
export const SUPABASE_URL = required("SUPABASE_URL");
export const SUPABASE_UPLOAD_EXPIRES = Number(process.env.SUPABASE_UPLOAD_EXPIRES ?? 3600);
