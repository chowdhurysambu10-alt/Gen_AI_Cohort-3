# Security Architecture & Threat Defense Model: Personal Gemini Journal

This document outlines the security controls, architectural guarantees, and threat mitigations implemented across the **Personal Gemini Journal** Supabase + Next.js application.

---

## 1. Threat Matrix & Defense Breakdown

| Component | Target Threat / Attack Vector | Implemented Defense Mechanism |
| :--- | :--- | :--- |
| **Authentication Enforcement** (`supabase.auth.getUser`) | **Broken Authentication / Anonymous Spoofing** | Next.js route handlers verify the cryptographically signed Supabase JWT access token on every request before proceeding. |
| **UID Derivation** (`user.id`) | **Broken Object Level Authorization (BOLA / IDOR)** | Caller `user_id` is derived **exclusively** from the verified Supabase Auth JWT token (`user.id`). Client payloads cannot specify, spoof, or override target `user_id`. |
| **Row Level Security (RLS)** (`schema.sql`) | **Direct Database Access / Bypass Attack** | Defense-in-depth at PostgreSQL datastore layer: `profiles`, `conversations`, `messages`, and `journal_entries` tables strictly enforce `auth.uid() = user_id`. No cross-user reads or writes are permitted. |
| **Input Validation** (`/api/chat`, `/api/summarize`) | **Denial of Service / Prompt Overflow / Injection** | Enforces maximum message length (capped at 4,000 characters) and non-empty content validation. |
| **Server-Side API Keys** (`GEMINI_API_KEY`) | **Credential Leakage & Exfiltration** | Gemini API key is accessed exclusively on the server runtime in Next.js Route Handlers. It is never exposed to browser bundles or client-side storage. |
| **Sanitized Error Handling** | **Information Disclosure / Stack Trace Leakage** | All exceptions are caught and sanitized before responding to clients, preventing vendor internals or keys from leaking. |

---

## 2. Zero-Trust Data Flow

```
+-----------------------------------+
| Next.js Client (React 18)         |
+-----------------+-----------------+
                  | 1. Supabase JWT Bearer Token
                  v
+-------------------------------------------------------+
| Next.js Route Handlers (/api/chat, /api/summarize)    |
| - Verify Auth Context with Supabase Auth              |
| - Validate input (Message length cap, sanitized IDs)  |
| - Load context turns for verified user_id             |
+--------+----------------------------+-----------------+
         |                            |
         | 2. PostgreSQL Query        | 3. Model Request
         | (Protected by RLS)         | (Server-side Gemini Key)
         v                            v
+--------------------------------+  +--------------------+
| Supabase PostgreSQL Database   |  | Google Gemini API  |
| (Row Level Security Enforced)  |  +--------------------+
+--------------------------------+
```

---

## 3. Defense-in-Depth Verification

- **Dual-Layer Isolation**: Even if direct client queries are executed against Supabase, PostgreSQL Row Level Security (RLS) policies strictly restrict operations to rows where `auth.uid() = user_id`.
- **Client Blindness to LLM Keys**: The frontend has zero knowledge of the Gemini API key; all LLM interactions occur strictly in secure server-side route handlers.
