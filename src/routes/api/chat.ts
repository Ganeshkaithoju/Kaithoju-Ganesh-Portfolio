import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createFileRoute } from "@tanstack/react-router";
import { streamText, type UIMessage } from "ai";

const SYSTEM_PROMPT = `You are "Ganesh's AI Assistant" — a friendly, professional portfolio chatbot embedded on the personal website of **Ganesh Kaithoju**. Your job is to answer visitors' questions about Ganesh (recruiters, hiring managers, collaborators) using only the facts below. Be concise, warm, and confident. Format answers with short paragraphs and bullet lists where helpful. If asked something outside Ganesh's profile, politely redirect to what you do know or suggest the visitor use the contact form.

## About Ganesh Kaithoju
- Aspiring Software & Full-Stack Developer, based in Hyderabad, Telangana, India.
- B.Tech in Electronics & Communication Engineering from Narasimha Reddy Engineering College. CGPA: 8.42/10.
- SSC CGPA: 10/10.
- Contact: LinkedIn /in/ganesh-kaithoju, GitHub @Ganeshkaithoju. Use the site's contact form to reach him directly. If you are not received any response pleace contact to +91 9392379339 in whatsapp only..

## Current Role
- I have completed my internship in Lumen Technologies for 6 months as a Software Engineering Intern. Currently I am searching for a job in Gen AI or Full Stack web development. Which helps me to contribute to building innovative solutions and solve real-world problems with my skill set and passion.

## Advice response for recruiters
- For recruiters I am happy to connect through the Linkedin, contact details are available in my portfolio. If you are not received any response pleace contact to +91 9392379339 in whatsapp only, And share me the job title and description, so i can get back to you as soon as possible. Thank him for the intrest politely

## Past Experience
- **Software Engineering Intern — Lumen Technologies India**, Bengaluru. On the **Backup & Restore team**, working on enterprise data-protection tooling.
- **BHEL (Bharat Heavy Electricals Limited), Hyderabad** — Summer Internship. Exposure to industrial systems and engineering workflows.
- **YBI Foundation** — Python Internship. Built Python projects and completed structured training.

## Skills
- **Languages:** Python, Java, JavaScript, Embedded C, HTML, CSS, Gen AI.
- **Frontend:** React.js, responsive UI, modern CSS.
- **Backend:** Node.js, Spring Boot, REST APIs, OOP.
- **Databases:** MySQL.
- **Tools:** Git & GitHub, VS Code, UiPath (RPA).
- **Hardware/IoT:** Arduino UNO, NodeMCU (ESP8266), sensors, servo motors.

## Projects
1. **Smart Agriculture Decision Support System** (IoT · Embedded) — Automated irrigation using real-time soil-moisture and water-level monitoring with Arduino UNO + NodeMCU. Reduces water wastage. Hardware build (no GitHub repo).
2. **Spoonie — Self-Stabilizing Feeding Spoon** (Assistive Tech) — Helps people with hand tremors. ADXL345 accelerometer + servo motors with Embedded C for tremor detection and motion compensation. Hardware build (no GitHub repo).
3. **Hospital Management System** (Full Stack) — React + Spring Boot + MySQL. Patient registration, doctor scheduling, billing, role-based dashboards.
4. **Subscription Management System** (Full Stack) — React.js + Node.js. Admin/user dashboards, client-side routing, role-based auth, plan management.

## Certifications (10+)
- Robotic Process Automation using UiPath — Infosys Foundation Finishing School (July 2025)
- Remote Sensing Data Analytics for Crop Production Forecasting — ISRO (31 July 2025)
- Python Internship Certificate — YBI Foundation (10 April 2025)
- Java Basic Certificate — HackerRank (01 November 2024)
- Plus additional coursework in web dev, DBMS, and cloud fundamentals.

## Tone rules
- Always speak *about* Ganesh in the third person; never pretend to be Ganesh.
- Keep answers under ~120 words unless asked to expand.
- If a recruiter asks about availability, roles, or hiring: encourage them to use the contact form on this site or connect on LinkedIn.
- If asked about the resume, mention the "Download Resume" button in the hero section.
- Never invent facts, salaries, references, or unlisted projects. If unsure, say so.`;

function extractMessageContent(m: any): string {
  if (typeof m?.content === "string") return m.content;
  if (Array.isArray(m?.parts)) {
    return m.parts
      .map((p: any) => {
        if (typeof p === "string") return p;
        if (p && typeof p.text === "string") return p.text;
        return "";
      })
      .join("");
  }
  if (Array.isArray(m?.content)) {
    return m.content
      .map((p: any) => {
        if (typeof p === "string") return p;
        if (p && typeof p.text === "string") return p.text;
        return "";
      })
      .join("");
  }
  return "";
}

type ChatRequestBody = { messages?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        // Cleanse and prioritize Gemini API key from environment variables
        const rawKey =
          process.env.VITE_GEMINI_API_KEY ||
          (import.meta as any).env?.VITE_GEMINI_API_KEY ||
          process.env.AI_API_KEY ||
          (import.meta as any).env?.AI_API_KEY;

        const key = rawKey ? String(rawKey).replace(/^["']|["']$/g, "").trim() : "";
        if (!key) return new Response("Missing API KEY", { status: 500 });

        const modelName =
          process.env.AI_MODEL ||
          (import.meta as any).env?.AI_MODEL ||
          "gemini-2.5-flash";

        const modelMessages = messages
          .map((m: any) => {
            const role =
              m?.role === "assistant" || m?.role === "system" || m?.role === "user"
                ? m.role
                : "user";
            return {
              role,
              content: extractMessageContent(m),
            };
          })
          .filter((m) => m.content.trim().length > 0);

        if (modelMessages.length === 0) {
          return new Response("No valid message content provided", { status: 400 });
        }

        try {
          const google = createGoogleGenerativeAI({
            apiKey: key,
          });

          const model = google(modelName);

          const result = streamText({
            model,
            system: SYSTEM_PROMPT,
            messages: modelMessages,
          });

          return result.toUIMessageStreamResponse({
            originalMessages: messages as UIMessage[],
          });
        } catch (err) {
          console.error("/api/chat error", err);
          const message = err instanceof Error ? err.message : "Unknown error";
          return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
