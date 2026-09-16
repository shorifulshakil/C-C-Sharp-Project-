# 01 — Project Overview

## Project Name
Multi-Vendor E-Commerce Platform

## Description
A production-quality multi-vendor e-commerce web application where multiple dealers (vendors) can sell their products. Admin oversees the platform, Dealers manage their shops and products, and Customers browse, purchase, and track orders.

## Core Feature
**Dealer Product Approval Workflow** — New dealer products start as "Pending" and require Admin approval before becoming publicly visible on the storefront.

## Objectives
- Build a complete, functional multi-vendor e-commerce platform
- Demonstrate C# and .NET concepts (OOP, EF Core, JWT auth, DI, middleware)
- Implement role-based authorization with 3 roles (Admin, Dealer, Customer)
- Provide realistic demo data for testing all features
- Clean, documented, production-quality code

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend | C# / ASP.NET Core Web API | .NET 9.0 |
| ORM | Entity Framework Core | 9.0 |
| Database | PostgreSQL (Supabase cloud) | 14+ |
| Auth | JWT Bearer + BCrypt | BCrypt.Net-Next 4.2.0 |
| Frontend | Next.js (App Router) + TypeScript + React | Next.js 14+ |
| Styling | Tailwind CSS | 3.x |
| API Docs | Swagger / OpenAPI | Built-in |

---

## Features by Role

### Admin
- View platform statistics (users, dealers, products, orders, revenue)
- Manage dealers (view, create, edit, delete, approve)
- Manage customers (activate/deactivate accounts)
- Approve/reject dealer products
- Manage categories (create, edit, delete)
- Clear demo data for fresh testing

### Dealer (Vendor)
- Manage dealer profile (shop name, description, category, address)
- CRUD products (create, read, update, delete)
- Products start as "Pending" until admin approves
- View orders containing their products
- Dashboard with stats and recent products

### Customer
- Browse approved products with search, filter, sort
- View product details with images
- Add to cart, update quantities, remove items
- Checkout with shipping address
- View order history and order details
- Manage account profile and change password

---

## File: `README.md` (root)
The root `README.md` provides a quick-start guide with setup instructions, demo credentials, and a project structure overview. Refer to it for immediate setup needs.
