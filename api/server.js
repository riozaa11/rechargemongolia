import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
import cors from "cors";

// ✅ Render + localhost аль алийг зөвшөөрнө
const ALLOWED_ORIGINS = [
  "https://rechargemongolia.onrender.com",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
];

app.use(
  cors({
    origin: function (origin, cb) {
      // origin байхгүй үед (зарим curl/preview) зөвшөөрнө
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
  })
);

// ✅ OPTIONS preflight (утас / safari дээр чухал)
app.options("*", cors());

const PORT = process.env.PORT || 5050;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const dbFile = path.join(process.cwd(), "db.json");
if (!fs.existsSync(dbFile)) {
  fs.writeFileSync(dbFile, JSON.stringify({ admins: [], orders: [] }, null, 2));
}

const readDB = () => JSON.parse(fs.readFileSync(dbFile, "utf-8"));
const writeDB = (d) => fs.writeFileSync(dbFile, JSON.stringify(d, null, 2));

/* ===== BOOTSTRAP SUPER ADMIN ===== */
const { SUPER_ADMIN_USERNAME, SUPER_ADMIN_PASSWORD } = process.env;
if (SUPER_ADMIN_USERNAME && SUPER_ADMIN_PASSWORD) {
  const db = readDB();
  const exists = db.admins.find(a => a.username === SUPER_ADMIN_USERNAME);
  if (!exists) {
    db.admins.push({
      id: 1,
      username: SUPER_ADMIN_USERNAME,
      password: SUPER_ADMIN_PASSWORD,
      role: "SUPER_ADMIN"
    });
    writeDB(db);
    console.log("[BOOTSTRAP] SUPER_ADMIN created:", SUPER_ADMIN_USERNAME);
  }
}

/* ===== ADMIN LOGIN ===== */
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  const db = readDB();
  const admin = db.admins.find(
    a => a.username === username && a.password === password
  );
  if (!admin) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { id: admin.id, username: admin.username, role: admin.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
  res.json({ token, admin: { username: admin.username, role: admin.role } });
});

/* ===== AUTH MIDDLEWARE ===== */
function auth(req, res, next) {
  const h = req.headers.authorization;
  if (!h) return res.sendStatus(401);
  try {
    req.user = jwt.verify(h.split(" ")[1], JWT_SECRET);
    next();
  } catch {
    res.sendStatus(401);
  }
}

/* ===== ORDERS ===== */
app.post("/api/orders", (req, res) => {
  const db = readDB();
  const orderId = Math.random().toString(36).slice(2, 8).toUpperCase();
  db.orders.push({
    id: orderId,
    ...req.body,
    status: "PENDING",
    created_at: new Date().toISOString()
  });
  writeDB(db);
  res.json({ orderId });
});

app.get("/api/orders/:id", (req, res) => {
  const db = readDB();
  const o = db.orders.find(x => x.id === req.params.id);
  if (!o) return res.status(404).json({ error: "Not found" });
  res.json(o);
});

app.get("/api/admin/orders", auth, (req, res) => {
  const db = readDB();
  res.json({ orders: db.orders });
});

app.patch("/api/admin/orders/:id/status", auth, (req, res) => {
  const db = readDB();
  const o = db.orders.find(x => x.id === req.params.id);
  if (!o) return res.status(404).json({ error: "Not found" });
  o.status = req.body.status;
  writeDB(db);
  res.json({ ok: true });
});

app.delete("/api/admin/orders/:id", auth, (req, res) => {
  const db = readDB();
  db.orders = db.orders.filter(x => x.id !== req.params.id);
  writeDB(db);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log("API running on http://localhost:" + PORT);
});
