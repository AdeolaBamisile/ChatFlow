import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const backendRoot = process.cwd();
const frontendDist = path.resolve(backendRoot, "../frontend/dist");
const backendDist = path.resolve(backendRoot, "dist");

await mkdir(backendDist, { recursive: true });
await rm(backendDist, { recursive: true, force: true });
await cp(frontendDist, backendDist, { recursive: true });

console.log("Frontend dist copied to backend/dist");
