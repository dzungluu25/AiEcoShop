import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

const BACKEND_URL = "http://localhost:3001";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  app.all("/api/*", async (req: Request, res: Response) => {
    try {
      const target = `${BACKEND_URL}${req.originalUrl}`;
      const headers: Record<string, string> = {};
      for (const [key, value] of Object.entries(req.headers)) {
        if (typeof value === "string") headers[key] = value;
      }
      delete headers.host;

      const init: any = {
        method: req.method,
        headers,
      };
      if (req.rawBody) {
        init.body = req.rawBody as Buffer;
        init.duplex = "half";
      }

      const resp = await fetch(target, init);
      const contentType = resp.headers.get("content-type") || "application/json";
      res.status(resp.status);
      res.setHeader("content-type", contentType);
      const bodyBuffer = Buffer.from(await resp.arrayBuffer());
      res.send(bodyBuffer);
    } catch (e: any) {
      res.status(502).json({ message: e?.message || "Bad Gateway" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
