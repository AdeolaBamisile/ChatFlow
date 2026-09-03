import dns from "node:dns/promises";

process.env.NODE_ENV !== "production" && dns.setServers(["8.8.8.8", "1.1.1.1"]);

import dotenv from "dotenv";
dotenv.config();

import startServer from "./server.ts";

const PORT = process.env.PORT;

const main = async () => {
  startServer(PORT!);
};

main();
