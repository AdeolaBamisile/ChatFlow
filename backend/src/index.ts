import dns from "node:dns/promises";
process.env.NODE_ENV !== "production" && dns.setServers(["8.8.8.8", "1.1.1.1"]);

import { PORT } from "./utils/config.js";
import { connectToDatabase } from "./utils/db.js";

import startServer from "./server.js";
import "./models/index.js";

const main = async (): Promise<void> => {
  try {
    await connectToDatabase();
    await startServer(PORT);
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

await main();
