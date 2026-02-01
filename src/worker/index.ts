import { Hono } from "hono";

type Env = {
  APP_NAME: string;
  MODE: string;
};

const app = new Hono<{ Bindings: Env }>();

app.get("/api/health", (c) =>
  c.json({
    status: "ok",
    app: c.env.APP_NAME,
    mode: c.env.MODE,
  })
);

app.post("/api/robot/command", async (c) => {
  const body = await c.json();

  return c.json({
    accepted: true,
    command: body,
    timestamp: Date.now(),
  });
});

app.get("/api/robot/status", () =>
  new Response(
    JSON.stringify({
      state: "idle",
      lastSeen: Date.now(),
    }),
    { headers: { "Content-Type": "application/json" } }
  )
);

export default app;
