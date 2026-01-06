import express from "express";
import mysql from "mysql";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import multer from "multer";
import fs from "fs";
import path from "path";

const PORT = 8081;
const SALT_ROUNDS = 10;
const JWT_SECRET = "jwt-secret-key";

const app = express();

// ====== Middleware ======
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: ["http://localhost:5173"],
  methods: ["POST", "GET", "PUT"],
  credentials: true
}));

// ====== MySQL connection pool ======
const pool = mysql.createPool({
  host: process.env.DB_HOST || "user-mysql", 
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "signup",
  port: 3306,
  connectionLimit: 10,
  acquireTimeout: 10000,
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});


// Pool error handler
pool.on('error', (err) => {
  console.error('MySQL pool error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Database connection was closed.');
  }
});

// ====== Uploads (avatars) setup ======
const UPLOADS_DIR = path.join(process.cwd(), "uploads", "avatars");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const safe = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, safe);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
  }
});

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ====== Helper: send standardized error ======
function sendServerError(res, err, message = "Server error") {
  console.error(message, err);
  return res.status(500).json({ error: message });
}

// ====== Helper: execute query with pool ======
function query(sql, params) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

// ====== Auth middleware ======
const verifyUser = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: "No token, unauthorized" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    req.user = decoded;
    next();
  });
};

// ====== ROUTES ======

// Health
app.get("/health", (req, res) => res.json({ status: "ok" }));

/* ===== REGISTER ===== */
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "Name, email and password are required" });

    const hash = await bcrypt.hash(password.toString(), SALT_ROUNDS);
    
    const sql = "INSERT INTO login (`name`, `email`, `password`) VALUES (?, ?, ?)";
    const result = await query(sql, [name, email, hash]);
    
    const userId = result.insertId;

    // Create empty profile row
    const createProfileSql = "INSERT INTO profiles (user_id, full_name, bio, avatar, preferences) VALUES (?, ?, ?, ?, ?)";
    try {
      await query(createProfileSql, [userId, null, null, null, JSON.stringify({})]);
    } catch (pfErr) {
      console.error("Failed to create profile row:", pfErr);
      // Not fatal for registration
    }
    
    return res.status(201).json({ status: "Success", id: userId });
  } catch (err) {
    console.error("Register error:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "User with this email already exists" });
    }
    return sendServerError(res, err, "Registration failed");
  }
});

/* ===== LOGIN ===== */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const sql = "SELECT id, name, password FROM login WHERE email = ?";
    const rows = await query(sql, [email]);
    
    if (!rows.length) return res.status(404).json({ error: "User not found" });

    const user = rows[0];
    const match = await bcrypt.compare(password.toString(), user.password);
    
    if (!match) return res.status(401).json({ error: "Password not matched" });

    const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax"
    });

    return res.json({ status: "Success" });
  } catch (err) {
    console.error("Login error:", err);
    return sendServerError(res, err, "Login failed");
  }
});

/* ===== VERIFY token ===== */
app.get("/", verifyUser, (req, res) => {
  return res.json({ status: "Success", name: req.user?.name || null, id: req.user?.id || null });
});

/* ===== LOGOUT ===== */
app.post("/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
  return res.json({ status: "Success" });
});

/* ===== GET PROFILE ===== */
app.get("/profile", verifyUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const sql = "SELECT l.id, l.name, l.email, p.full_name, p.bio, p.avatar, p.preferences FROM login l " +
                "LEFT JOIN profiles p ON p.user_id = l.id WHERE l.id = ? LIMIT 1";
    
    const rows = await query(sql, [userId]);
    
    if (!rows.length) return res.status(404).json({ error: "User not found" });

    const row = rows[0];
    let prefs = {};
    try {
      prefs = row.preferences ? JSON.parse(row.preferences) : {};
    } catch (e) {
      prefs = {};
    }

    const profile = {
      id: row.id,
      name: row.name,
      email: row.email,
      full_name: row.full_name,
      bio: row.bio,
      avatar: row.avatar,
      preferences: prefs
    };

    return res.json({ status: "Success", profile });
  } catch (err) {
    console.error("Get profile error:", err);
    return sendServerError(res, err, "Failed to fetch profile");
  }
});

/* ===== PUT PROFILE ===== */
app.put("/profile", verifyUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, full_name, bio } = req.body;

    // Update login.name
    await query("UPDATE login SET name = ? WHERE id = ?", [name, userId]);
    
    // Update profiles
    await query("UPDATE profiles SET full_name = ?, bio = ? WHERE user_id = ?", [full_name, bio, userId]);
    
    return res.json({ status: "Success" });
  } catch (err) {
    console.error("Update profile error:", err);
    return sendServerError(res, err, "Failed to update profile");
  }
});

/* ===== PUT /profile/password ===== */
app.put("/profile/password", verifyUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ error: "Missing fields" });

    const rows = await query("SELECT password FROM login WHERE id = ?", [userId]);
    if (!rows.length) return res.status(404).json({ error: "User not found" });

    const currentHash = rows[0].password;
    const match = await bcrypt.compare(oldPassword, currentHash);
    
    if (!match) return res.status(401).json({ error: "Old password incorrect" });

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await query("UPDATE login SET password = ? WHERE id = ?", [newHash, userId]);
    
    return res.json({ status: "Success" });
  } catch (err) {
    console.error("Change password error:", err);
    return sendServerError(res, err, "Failed to change password");
  }
});

/* ===== PUT /profile/preferences ===== */
app.put("/profile/preferences", verifyUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const newPrefs = req.body || {};

    const rows = await query("SELECT preferences FROM profiles WHERE user_id = ?", [userId]);
    const current = rows[0] && rows[0].preferences ? JSON.parse(rows[0].preferences) : {};
    const merged = { ...current, ...newPrefs };
    
    await query("UPDATE profiles SET preferences = ? WHERE user_id = ?", [JSON.stringify(merged), userId]);
    
    return res.json({ status: "Success", preferences: merged });
  } catch (err) {
    console.error("Update preferences error:", err);
    return sendServerError(res, err, "Failed to update preferences");
  }
});

/* ===== POST /profile/avatar ===== */
app.post("/profile/avatar", verifyUser, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await query("UPDATE profiles SET avatar = ? WHERE user_id = ?", [avatarUrl, req.user.id]);
    
    return res.json({ status: "Success", avatar: avatarUrl });
  } catch (err) {
    console.error("Upload avatar error:", err);
    return sendServerError(res, err, "Failed to upload avatar");
  }
});

/* ===== POST /profile/avatar/remove ===== */
app.post("/profile/avatar/remove", verifyUser, async (req, res) => {
  try {
    const rows = await query("SELECT avatar FROM profiles WHERE user_id = ?", [req.user.id]);
    const avatar = rows[0]?.avatar;

    if (avatar) {
      // Remove leading "/" before joining
      const filePath = path.join(process.cwd(), avatar.replace(/^\//, ""));
      
      try {
        await fs.promises.unlink(filePath);
      } catch (fsErr) {
        console.warn("Failed to delete avatar file:", fsErr);
        // Continue even if file deletion fails
      }
    }

    await query("UPDATE profiles SET avatar = NULL WHERE user_id = ?", [req.user.id]);
    
    return res.json({ status: "Success" });
  } catch (err) {
    console.error("Remove avatar error:", err);
    return sendServerError(res, err, "Failed to remove avatar");
  }
});

// ===== Start server =====
export default app;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

function connectWithRetry() {
  pool.getConnection((err, connection) => {
    if (err) {
      console.log("DB not ready, retrying in 3s...");
      setTimeout(connectWithRetry, 3000);
    } else {
      console.log("✅ Connected to MySQL");
      connection.release();
    }
  });
}

connectWithRetry();
