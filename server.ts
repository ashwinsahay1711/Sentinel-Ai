import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "online", version: "1.0.0" });
  });

  // Example "Storage" API for RAG context
  let repositoryContext: any[] = [];
  
  app.post("/api/index", (req, res) => {
    const { files } = req.body;
    // In a real app, we might process these files, chunk them, etc.
    // For now, we'll just store/return them for the frontend to embed.
    repositoryContext = files;
    res.json({ message: "Indexed", count: files.length });
  });

  app.get("/api/context", (req, res) => {
    res.json({ context: repositoryContext });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Sentinel AI Backend running on http://localhost:${PORT}`);
  });
}

startServer();
