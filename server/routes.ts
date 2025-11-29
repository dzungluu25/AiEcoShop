import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { queryTransactions, toCSV } from "./transactions";
import { listOrders, getOrder, createOrder } from "./orders";

const BACKEND_URL = "http://localhost:3002";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  app.get("/api/transactions", (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
    const from = req.query.from ? String(req.query.from) : undefined;
    const to = req.query.to ? String(req.query.to) : undefined;
    const q = req.query.q ? String(req.query.q) : undefined;
    const result = queryTransactions({ page, limit, from, to, q });
    res.json(result);
  });

  app.get("/api/transactions/export", (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
    const from = req.query.from ? String(req.query.from) : undefined;
    const to = req.query.to ? String(req.query.to) : undefined;
    const q = req.query.q ? String(req.query.q) : undefined;
    const result = queryTransactions({ page, limit, from, to, q });
    const csv = toCSV(result.items);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=transactions.csv");
    res.send(csv);
  });

  app.get("/api/orders", async (req: Request, res: Response) => {
    const authHeader = req.headers["authorization"] as string | undefined;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      const meResp = await fetch(`${BACKEND_URL}/api/auth/me`, { headers: { authorization: authHeader } });
      if (!meResp.ok) return res.status(401).json({ message: "Unauthorized" });
      const me = await meResp.json();
      const all = listOrders();
      const mine = all.filter(o => String(o.customerEmail).toLowerCase() === String(me.email).toLowerCase());
      res.json(mine);
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Error" });
    }
  });

  app.get("/api/orders/:id", async (req: Request, res: Response) => {
    const authHeader = req.headers["authorization"] as string | undefined;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const o = getOrder(String(req.params.id));
    if (!o) return res.status(404).json({ message: "Not Found" });
    try {
      const meResp = await fetch(`${BACKEND_URL}/api/auth/me`, { headers: { authorization: authHeader } });
      if (!meResp.ok) return res.status(401).json({ message: "Unauthorized" });
      const me = await meResp.json();
      if (String(o.customerEmail).toLowerCase() !== String(me.email).toLowerCase()) {
        return res.status(403).json({ message: "Forbidden" });
      }
      res.json(o);
    } catch (e: any) {
      res.status(500).json({ message: e?.message || "Error" });
    }
  });

  app.post("/api/checkout", async (req: Request, res: Response) => {
    const authHeader = req.headers["authorization"] as string | undefined;
    const body = req.body as any;
    const items = Array.isArray(body?.items) ? body.items.map((i: any) => ({
      productId: String(i.productId),
      name: String(i.name),
      image: String(i.image || "https://placehold.co/400x400"),
      category: i.category ? String(i.category) : undefined,
      price: Number(i.price || 0),
      quantity: Number(i.quantity || 1),
    })) : [];
    if (items.length === 0) return res.status(400).json({ message: "Empty order" });

    // Attempt authenticated checkout first
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const meResp = await fetch(`${BACKEND_URL}/api/auth/me`, { headers: { authorization: authHeader } });
        if (meResp.ok) {
          const me = await meResp.json();
          const order = createOrder(String(me.fullname || me.email || "User"), String(me.email || ""), items, "Processing");
          return res.json(order);
        }
      } catch {}
    }

    // Development fallback: allow guest checkout without auth
    if (process.env.NODE_ENV !== "production") {
      const order = createOrder("Guest", "guest@local", items, "Processing");
      return res.json({ ...order, unauthenticated: true });
    }

    return res.status(401).json({ message: "Unauthorized" });
  });

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
