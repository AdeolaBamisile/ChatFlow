import http from "node:http";
import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/use/ws";
import path from "node:path";

import type { Context } from "./types.js";
import { getUserFromToken } from "./utils/auth.js";
import { pubsub } from "./utils/pubsub.js";
import typeDefs from "./schema.js";
import resolvers from "./resolvers.js";
import { Friendship, User } from "./models/index.js";

const getBearerToken = (authorization?: string): string | undefined => {
  if (!authorization?.toLowerCase().startsWith("bearer ")) return undefined;
  return authorization.slice(7).trim();
};

const websocketConnections = new Map<string, number>();

const setPresence = async (userId: string, online: boolean): Promise<void> => {
  const user = await User.findByPk(userId);

  if (!user) return;
  await user.update({ online });
  const friendships = await Friendship.findAll({
    where: { userId: user.id },
  });

  for (const friendship of friendships) {
    await pubsub.publish(`PRESENCE_${friendship.friendId}`, {
      userPresenceChanged: user,
    });
  }
};

const startServer = async (port: number): Promise<void> => {
  const app = express();
  const httpServer = http.createServer(app);
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx): Promise<Context> => {
        const payload = ctx.connectionParams?.authorization;
        const authorization = typeof payload === "string" ? payload : undefined;

        return {
          currentUser: await getUserFromToken(getBearerToken(authorization)),
        };
      },

      onConnect: async (ctx) => {
        const authorization = ctx.connectionParams?.authorization;

        if (authorization !== undefined && typeof authorization !== "string")
          throw new Error("Invalid authorization");

        const user = await getUserFromToken(
          getBearerToken(
            typeof authorization === "string" ? authorization : undefined,
          ),
        );

        if (!user) throw new Error("Unauthorized");
        {
          const count = (websocketConnections.get(user.id) ?? 0) + 1;
          websocketConnections.set(user.id, count);
          if (count === 1) await setPresence(user.id, true);
        }
        return true;
      },

      onDisconnect: async (ctx) => {
        const authorization = ctx.connectionParams?.authorization;

        if (typeof authorization !== "string") return;
        const user = await getUserFromToken(getBearerToken(authorization));

        if (!user) return;
        const count = Math.max((websocketConnections.get(user.id) ?? 1) - 1, 0);

        if (count === 0) {
          websocketConnections.delete(user.id);
          await setPresence(user.id, false);
        } else {
          websocketConnections.set(user.id, count);
        }
      },
    },
    wsServer,
  );

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  app.use(
    "/graphql",
    express.json({ limit: "2mb" }),
    expressMiddleware(server, {
      context: async ({ req }): Promise<Context> => ({
        currentUser: await getUserFromToken(
          getBearerToken(req.headers.authorization),
        ),
      }),
    }),
  );

  app.use(express.static("dist"));

  app.use((_req, res) => {
    res.sendFile(path.resolve("dist", "index.html"));
  });

  httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

export default startServer;
