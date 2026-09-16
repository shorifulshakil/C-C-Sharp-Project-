# Documentation Index

> **Project:** Multi-Vendor E-Commerce Platform  
> **Stack:** C# / .NET 9.0 Backend + Next.js 14 Frontend + PostgreSQL  
> **Last Updated:** 2026-08-16

This folder contains the complete project documentation. Each file serves a specific purpose:

---

## Document List

| # | File | Purpose | Audience |
|---|------|---------|----------|
| 01 | [Project Overview](./01-PROJECT-OVERVIEW.md) | What the project is, objectives, tech stack, feature list | Everyone |
| 02 | [Architecture](./02-ARCHITECTURE.md) | System architecture, layer responsibilities, design decisions | Developers |
| 03 | [Database Design](./03-DATABASE-DESIGN.md) | ER diagram, table schemas, relationships, seed data | Backend devs |
| 04 | [API Reference](./04-API-REFERENCE.md) | All API endpoints with request/response examples | Frontend devs |
| 05 | [Frontend Guide](./05-FRONTEND-GUIDE.md) | Pages, routes, components, styling, file structure | Frontend devs |
| 06 | [Demo Credentials](./06-DEMO-CREDENTIALS.md) | All test accounts (Admin, Dealer, Customer) | Testers |
| 07 | [Setup Guide](./07-SETUP-GUIDE.md) | How to install, configure, and run the project | New developers |
| 08 | [Progress Log](./08-PROGRESS-LOG.md) | Step-by-step development history with dates | Project tracking |
| 09 | [Known Issues](./09-KNOWN-ISSUES.md) | Bugs, limitations, TODOs, technical debt | Developers |
| 10 | [Handover Document](./10-HANDOVER.md) | Quick-start guide for AI agents or new developers | AI agents |

---

## How to Use These Documents

### For AI Agents / Report Generation
Start with **[10-HANDOVER.md](./10-HANDOVER.md)** — it contains everything needed to understand the current state. Then read specific documents as needed.

### For Writing a Project Report
1. Read **[01-PROJECT-OVERVIEW.md](./01-PROJECT-OVERVIEW.md)** for project description
2. Read **[02-ARCHITECTURE.md](./02-ARCHITECTURE.md)** for technical architecture
3. Read **[03-DATABASE-DESIGN.md](./03-DATABASE-DESIGN.md)** for database design
4. Read **[04-API-REFERENCE.md](./04-API-REFERENCE.md)** for API design
5. Read **[05-FRONTEND-GUIDE.md](./05-FRONTEND-GUIDE.md)** for frontend design
6. Read **[08-PROGRESS-LOG.md](./08-PROGRESS-LOG.md)** for development timeline

### For New Developers
1. Read **[07-SETUP-GUIDE.md](./07-SETUP-GUIDE.md)** to set up your environment
2. Read **[02-ARCHITECTURE.md](./02-ARCHITECTURE.md)** to understand the codebase
3. Read **[06-DEMO-CREDENTIALS.md](./06-DEMO-CREDENTIALS.md)** to log in

---

## Document Maintenance Rule

**After any significant code change, update the relevant document(s):**

| Change Type | Update These |
|-------------|-------------|
| New API endpoint | 04-API-REFERENCE.md |
| New frontend page/route | 05-FRONTEND-GUIDE.md |
| Database schema change | 03-DATABASE-DESIGN.md |
| Bug fix | 09-KNOWN-ISSUES.md (remove from list) |
| New feature completed | 08-PROGRESS-LOG.md |
| Architecture change | 02-ARCHITECTURE.md |
| New demo account | 06-DEMO-CREDENTIALS.md |
| Setup change | 07-SETUP-GUIDE.md |

---

## Root-Level Files

| File | Purpose |
|------|---------|
| [README.md](../README.md) | Quick project overview, setup instructions, and demo credentials |
| Documents/ | This folder — detailed project documentation |
