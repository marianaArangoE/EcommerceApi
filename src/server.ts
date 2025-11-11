import "dotenv/config";      
import http from "http";
import app from "./app";
import { connectMongo } from "./infrastructure/db/mongo";

const PORT = Number(process.env.PORT ?? 3000);
const MONGODB_URI = process.env.MONGODB_URI ?? "";

(async () => {
  try {
    await connectMongo(MONGODB_URI);           

    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`API lista en http://localhost:${PORT}`);
      console.log(`Healthcheck: GET http://localhost:${PORT}/api/v1/health`);
    });
  } catch (err) {
    console.error("[startup] error conectando a Mongo:", err);
    process.exit(1);
  }
})();
