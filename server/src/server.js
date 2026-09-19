import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import http from "http";
import { Server } from "socket.io";
import connectDB from "./database/connect.js";
import { app } from "./app.js";
import { registerWorkerSocket } from "./realtime/worker.socket.js";

const port = Number(process.env.PORT || 5000);
const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: (process.env.CLIENT_ORIGINS || "http://localhost:5173").split(",").map(s => s.trim()), credentials: true } });
app.set("io", io);
registerWorkerSocket(io);

connectDB().then(() => httpServer.listen(port, "0.0.0.0", () => console.log(`Sahayog integrated server running on port ${port}`))).catch((err) => { console.error("MongoDB connect ERROR:", err); process.exit(1); });
