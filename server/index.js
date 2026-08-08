import "dotenv/config";
import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import { Readable } from "node:stream";
import { convertToModelMessages, streamText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const app = express();
const port = Number(process.env.PORT || 5000);
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) throw new Error("JWT_SECRET is required");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "portfolio_db",
  waitForConnections: true,
  connectionLimit: 10,
});

const allowedOrigins = new Set(
  (process.env.FRONTEND_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

app.use(
  cors({
    origin: (requestOrigin, callback) => {
      if (
        !requestOrigin ||
        process.env.NODE_ENV !== "production" ||
        allowedOrigins.has(requestOrigin)
      ) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const chatSystemPrompt = `You are Ganesh Kaithoju's portfolio and interview assistant. Answer only from the verified profile below and never invent employers, metrics, responsibilities, technologies, certifications, or achievements.

Verified profile:
- Ganesh is a full-stack developer from Hyderabad with a B.Tech in Electronics and Communication Engineering from Narasimha Reddy Engineering College, CGPA 8.42/10.
- Current role: Intern — Backup & Restore at Lumen Technologies India in Bengaluru. His work involves enterprise data-protection workflows, backup and restore tooling, monitoring, troubleshooting, Agile collaboration, standups, sprints, code reviews, scripting, and debugging.
- BHEL summer internship: contributed to a thermal power systems project, analyzed PLC and CNC processes, and gained exposure to industrial automation and cross-functional teamwork.
- YBI Foundation Python internship: learned core Python and standard libraries, built Tic-Tac-Toe and Rock-Paper-Scissors, and strengthened programming fundamentals and problem-solving.
- Technical skills: Python, Java, JavaScript, React, Node.js, Spring Boot, MySQL, HTML5, CSS3, C, OOP, DSA, DBMS, Git/GitHub, UiPath, Arduino UNO, NodeMCU/ESP8266, Embedded C, sensors, and actuators.
- Smart Agriculture Decision Support System: Arduino UNO and NodeMCU use soil-moisture and water-level monitoring to automate irrigation, control a water pump, reduce water wastage, and provide alerts.
- Spoonie self-stabilizing feeding spoon: uses an ADXL345 accelerometer and servo motors for tremor detection and motion compensation, driven by Embedded C.
- Hospital Management System: React, Spring Boot, and MySQL portal for patient registration, doctor scheduling, billing, reports, and role-based dashboards.
- Subscription Management System: React and Node.js subscription and billing application with client-side routing, role-based authentication, and plan, user, and subscription management.
- Other verified profile details: SSC CGPA 10/10, Intermediate 83.9%, and certifications in UiPath RPA, ISRO remote-sensing data analytics, Python, and Java basics.

Answering rules:
- Always answer in first person as Ganesh, using “I”, “my”, and “me”. Do not refer to Ganesh by name or use “he” or “his” in the answer unless the user explicitly asks for a third-person bio.
- Answer the exact question first. Do not repeat the question, add a meta-introduction, or include an unrelated conclusion.
- Keep normal answers to 2–5 sentences. For interview questions, provide one polished answer of about 60–120 words, followed by at most 3 short **Key points** bullets only when they add useful evidence.
- Use a professional, confident, natural interview tone. Prefer specific facts over promotional language; do not use exaggerated claims such as “invaluable” or “proven” unless directly supported by the profile.
- Use Markdown only to improve scanning: bold the most relevant skills, technologies, or project names, and use short bullets when needed. Do not force headings such as “Why this is relevant” into every answer.
- For behavioral or technical questions not directly answered by the profile, give a concise suggested answer based only on verified experience and label any detail that I should personalize. Never invent metrics, responsibilities, results, or technologies.
- If asked about availability, hiring, contact details, or facts outside this profile, answer briefly and direct the user to the portfolio contact form.`;

function createToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username },
    jwtSecret,
    { expiresIn: "7d" },
  );
}

function authenticate(req, res, next) {
  const header = req.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    req.owner = jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}

function asId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

app.get("/api/comments/approved", async (_req, res, next) => {
  try {
    const [comments] = await pool.execute(
      `SELECT id, name, subject, message, created_at, is_pinned, is_featured
       FROM messages WHERE status = 'approved'
       ORDER BY is_pinned DESC, is_featured DESC, created_at DESC`,
    );
    res.setHeader("Cache-Control", "no-store");
    res.json({ comments });
  } catch (error) {
    next(error);
  }
});

app.post("/api/comments", async (req, res, next) => {
  const { name, email, subject, message } = req.body ?? {};
  if (
    typeof name !== "string" ||
    !name.trim() ||
    name.length > 100 ||
    typeof message !== "string" ||
    !message.trim() ||
    message.length > 2000
  ) {
    return res.status(400).json({ error: "A valid name and message are required" });
  }
  if (email != null && (typeof email !== "string" || email.length > 150)) {
    return res.status(400).json({ error: "A valid email is required" });
  }

  try {
    const [result] = await pool.execute(
      "INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)",
      [
        name.trim(),
        email?.trim() || null,
        typeof subject === "string" ? subject.trim().slice(0, 200) || null : null,
        message.trim(),
      ],
    );
    res.status(201).json({ id: result.insertId, success: true });
  } catch (error) {
    next(error);
  }
});

app.post("/api/chat", async (req, res, next) => {
  const { messages } = req.body ?? {};
  if (!Array.isArray(messages)) return res.status(400).json({ error: "Messages are required" });
  const aiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.AI_API_KEY;
  if (!aiKey) {
    return res.status(503).json({ error: "The chat service is not configured" });
  }

  try {
    const provider = process.env.AI_PROVIDER === "openai"
      ? createOpenAICompatible({
          name: "portfolio-ai",
          baseURL: process.env.AI_BASE_URL,
          apiKey: aiKey,
        })
      : createGoogleGenerativeAI({ apiKey: aiKey });
    const result = streamText({
      model: provider(process.env.AI_MODEL || "gemini-2.5-flash"),
      system: chatSystemPrompt,
      messages: await convertToModelMessages(messages),
      onFinish: async ({ text }) => {
        const lastMessage = [...messages].reverse().find((item) => item.role === "user");
        const query =
          lastMessage?.parts
            ?.filter((part) => part.type === "text")
            .map((part) => part.text)
            .join("") || "";
        if (query && text)
          await pool.execute("INSERT INTO chat_logs (user_query, bot_response) VALUES (?, ?)", [
            query,
            text,
          ]);
      },
    });
    const response = result.toUIMessageStreamResponse({ originalMessages: messages });
    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));
    Readable.fromWeb(response.body).pipe(res);
  } catch (error) {
    next(error);
  }
});

app.post("/api/owner/login", async (req, res, next) => {
  const { email, username, password } = req.body ?? {};
  const identity = typeof username === "string" ? username : email;
  if (
    typeof identity !== "string" ||
    !identity.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    return res.status(400).json({ error: "Username and password are required" });
  }
  try {
    const [users] = await pool.execute(
      "SELECT id, username, password_hash FROM admin_users WHERE username = ?",
      [identity.trim().toLowerCase()],
    );
    const user = users[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).json({ error: "Invalid credentials" });
    res.json({ success: true, token: createToken(user), username: user.username });
  } catch (error) {
    next(error);
  }
});

app.post("/api/owner/reset-password", async (req, res, next) => {
  const { email, username, answer1, answer2, newPassword } = req.body ?? {};
  const identity = typeof username === "string" ? username : email;
  if (
    typeof identity !== "string" ||
    typeof answer1 !== "string" ||
    !answer1 ||
    typeof answer2 !== "string" ||
    !answer2
  ) {
    return res.status(400).json({ error: "Username and security answers are required" });
  }
  try {
    const [users] = await pool.execute(
      "SELECT id, username, password_hash, security_answer_hash FROM admin_users WHERE username = ?",
      [identity.trim().toLowerCase()],
    );
    const user = users[0];
    const answer = `${answer1.trim().toLowerCase()}|${answer2.trim().toLowerCase()}`;
    if (
      !user ||
      !user.security_answer_hash ||
      !(await bcrypt.compare(answer, user.security_answer_hash))
    )
      return res.status(401).json({ error: "Incorrect answers" });
    if (newPassword) {
      if (typeof newPassword !== "string" || newPassword.length < 8)
        return res.status(400).json({ error: "Password must contain at least 8 characters" });
      await pool.execute("UPDATE admin_users SET password_hash = ? WHERE id = ?", [
        await bcrypt.hash(newPassword, 12),
        user.id,
      ]);
    }
    res.json({ success: true, token: createToken(user), redirectTo: "/owner-dashboard" });
  } catch (error) {
    next(error);
  }
});

app.post("/api/owner/logout", authenticate, (_req, res) => {
  res.json({ success: true });
});

app.get("/api/owner/stats", authenticate, async (_req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT COUNT(*) AS total, SUM(status = 'pending') AS pending, SUM(status = 'approved') AS approved, SUM(status = 'hidden') AS hidden, SUM(is_featured = TRUE) AS featured, SUM(is_pinned = TRUE) AS pinned FROM messages`,
    );
    const stats = rows[0];
    res.json(
      Object.fromEntries(Object.entries(stats).map(([key, value]) => [key, Number(value || 0)])),
    );
  } catch (error) {
    next(error);
  }
});

app.get("/api/owner/messages", authenticate, async (req, res, next) => {
  const status = typeof req.query.status === "string" ? req.query.status : "all";
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const requestedLimit = Number(req.query.limit);
  const requestedOffset = Number(req.query.offset);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 100)
    : 20;
  const offset = Number.isFinite(requestedOffset) ? Math.max(Math.trunc(requestedOffset), 0) : 0;
  if (!["all", "pending", "approved", "hidden"].includes(status))
    return res.status(400).json({ error: "Invalid status" });
  const terms = search ? `%${search}%` : null;
  const where =
    `${status === "all" ? "" : "status = ?"}${terms ? `${status === "all" ? "" : " AND "}(name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)` : ""}` ||
    "1";
  const params = [
    ...(status === "all" ? [] : [status]),
    ...(terms ? [terms, terms, terms, terms] : []),
  ];
  try {
    const [[countRow]] = await pool.query(
      `SELECT COUNT(*) AS total FROM messages WHERE ${where}`,
      params,
    );
    const [messages] = await pool.query(
      `SELECT id, name, email, subject, message, created_at, moderated_at, status, is_pinned, is_featured FROM messages WHERE ${where} ORDER BY is_pinned DESC, is_featured DESC, created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      params,
    );
    res.json({ messages, total: Number(countRow.total), limit, offset });
  } catch (error) {
    next(error);
  }
});

async function changeMessage(req, res, next, action) {
  const id = asId(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid message id" });
  try {
    if (action === "approve" || action === "hide")
      await pool.execute(
        "UPDATE messages SET status = ?, moderated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [action === "approve" ? "approved" : "hidden", id],
      );
    if (action === "pin")
      await pool.execute("UPDATE messages SET is_pinned = NOT is_pinned WHERE id = ?", [id]);
    if (action === "feature")
      await pool.execute("UPDATE messages SET is_featured = NOT is_featured WHERE id = ?", [id]);
    if (action === "delete") await pool.execute("DELETE FROM messages WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

for (const action of ["approve", "hide", "pin", "feature", "delete"]) {
  app.patch(`/api/owner/messages/:id/${action}`, authenticate, (req, res, next) =>
    changeMessage(req, res, next, action),
  );
}

app.use((error, _req, res, _next) => {
  console.error(error);
  const detail = error instanceof Error ? error.message : "Unknown server error";
  res.status(500).json({
    error: "Internal server error",
    ...(process.env.NODE_ENV === "production" ? {} : { detail }),
  });
});

app.listen(port, "0.0.0.0", () => console.log(`Portfolio API listening on port ${port}`));
