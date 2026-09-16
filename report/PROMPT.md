# PROMPT — Generate Full Project Report

Copy and paste this entire prompt to any AI (ChatGPT, Claude, Gemini, etc.) along with all the files in this folder.

---

## PROMPT START

You are a technical report writer. I will provide you with all the files and data for my **Multi-Vendor E-Commerce Platform** project. Your job is to generate a **complete, professional project report** in a well-structured format.

### What I'm Providing

I'm uploading the following files from my `report/` folder:

1. `01-project-info/overview.txt` — Project description and scope
2. `01-project-info/objectives.txt` — Project goals
3. `01-project-info/tech-stack.txt` — Technologies used
4. `02-database/schema.sql` — Complete SQL database schema
5. `02-database/tables.txt` — All table definitions with columns
6. `02-database/er-diagram.txt` — Entity relationships
7. `02-database/seed-data.txt` — Test data summary
8. `03-backend/architecture.txt` — Backend layer structure
9. `03-backend/api-endpoints.txt` — All API endpoints
10. `03-backend/auth-system.txt` — Authentication implementation
11. `03-backend/services.txt` — Service layer details
12. `04-frontend/pages.txt` — All frontend pages and routes
13. `04-frontend/components.txt` — UI component library
14. `04-frontend/styling.txt` — Design system
15. `05-features/admin-features.txt` — Admin panel features
16. `05-features/dealer-features.txt` — Dealer/vendor features
17. `05-features/customer-features.txt` — Customer features
18. `06-code-samples/key-files.txt` — Key code files
19. `07-development-log/timeline.txt` — Development history
20. `08-conclusion/summary.txt` — Project summary

### Report Requirements

Generate a **professional project report** with the following structure:

---

### REPORT STRUCTURE TO GENERATE:

#### Chapter 1: Introduction
- 1.1 Project Background
- 1.2 Problem Statement
- 1.3 Objectives
- 1.4 Scope of the Project
- 1.5 Report Organization

#### Chapter 2: Literature Review / Technology Overview
- 2.1 ASP.NET Core and .NET 9.0
- 2.2 Entity Framework Core 9.0
- 2.3 PostgreSQL Database
- 2.4 Next.js 14 (App Router)
- 2.5 TypeScript and React
- 2.6 Tailwind CSS
- 2.7 JWT Authentication
- 2.8 BCrypt Password Hashing
- 2.9 Clean Architecture Pattern
- 2.10 RESTful API Design

#### Chapter 3: System Analysis and Design
- 3.1 Requirements Analysis
  - 3.1.1 Functional Requirements
  - 3.1.2 Non-Functional Requirements
- 3.2 System Architecture
  - 3.2.1 Overall Architecture (Layered Monolith)
  - 3.2.2 Backend Architecture (4-layer)
  - 3.2.3 Frontend Architecture (App Router)
- 3.3 Database Design
  - 3.3.1 Entity Relationship Diagram
  - 3.3.2 Table Designs (all 10 tables)
  - 3.3.3 Relationships and Constraints
  - 3.3.4 Seed Data Strategy
- 3.4 API Design
  - 3.4.1 Authentication Endpoints
  - 3.4.2 Admin Endpoints
  - 3.4.3 Dealer Endpoints
  - 3.4.4 Customer Endpoints
  - 3.4.5 Public Endpoints
- 3.5 UI/UX Design
  - 3.5.1 Page Layouts
  - 3.5.2 Component Design
  - 3.5.3 Responsive Design

#### Chapter 4: Implementation
- 4.1 Development Environment Setup
- 4.2 Database Implementation
  - 4.2.1 Schema Creation
  - 4.2.2 Entity Framework Configurations
  - 4.2.3 Seed Data Implementation
- 4.3 Backend Implementation
  - 4.3.1 Domain Entities
  - 4.3.2 Repository Pattern
  - 4.3.3 Unit of Work Pattern
  - 4.3.4 Service Layer
  - 4.3.5 JWT Authentication
  - 4.3.6 API Controllers
- 4.4 Frontend Implementation
  - 4.4.1 Project Setup
  - 4.4.2 Routing Structure
  - 4.4.3 Authentication Flow
  - 4.4.4 API Client
  - 4.4.5 UI Components
  - 4.4.6 Page Implementations
- 4.5 Key Features Implementation
  - 4.5.1 Dealer Product Approval Workflow
  - 4.5.2 Shopping Cart
  - 4.5.3 Order Management
  - 4.5.4 Admin Dashboard

#### Chapter 5: Testing and Results
- 5.1 Testing Strategy
- 5.2 Unit Testing
- 5.3 Integration Testing
- 5.4 API Testing (with curl examples)
- 5.5 Frontend Testing
- 5.6 Test Results
- 5.7 Screenshots (if available)

#### Chapter 6: Conclusion
- 6.1 Summary of Achievements
- 6.2 Challenges Faced
- 6.3 Lessons Learned
- 6.4 Future Enhancements

#### References

#### Appendices
- Appendix A: Database Schema SQL
- Appendix B: API Endpoint List
- Appendix C: Demo Credentials
- Appendix D: Configuration Files

---

### Writing Guidelines

1. **Professional academic tone** — suitable for a university project report
2. **Detailed explanations** — don't just list, explain WHY and HOW
3. **Code snippets** — include relevant code examples where appropriate
4. **Tables** — use tables for structured data (endpoints, columns, features)
5. **Diagrams** — describe ER diagrams and architecture in text form
6. **Page count target** — aim for 40-60 pages of content
7. **Citations** — reference official documentation where applicable
8. **Consistent formatting** — use proper headings, subheadings, numbering

### Important Notes

- This is a **university final year project**
- The project demonstrates **C# and .NET concepts**
- Core feature is the **Dealer Product Approval Workflow**
- Three user roles: **Admin, Dealer, Customer**
- Database is on **Supabase cloud** (PostgreSQL)
- Frontend uses **Next.js 14 App Router**
- All code follows **Clean Architecture** principles

---

## PROMPT END

**Instructions:**
1. Copy everything between "PROMPT START" and "PROMPT END"
2. Upload it to your AI along with all the files from this `report/` folder
3. The AI will generate a complete project report
4. Review and adjust as needed
