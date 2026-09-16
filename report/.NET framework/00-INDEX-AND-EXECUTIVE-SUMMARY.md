# .NET Framework & Backend Architecture Report
## E-Commerce Multivendor Platform

---

### 📌 ভূমিকা ও সারসংক্ষেপ (Executive Summary)

বর্তমান ই-কমার্স প্ল্যাটফর্মটির ব্যাকএন্ড সিস্টেমটি মাইক্রোসফটের সর্বাধুনিক **.NET 9.0 (ASP.NET Core Web API)** ফ্রেমওয়ার্ক এবং **Clean Architecture** নীতিমালার ওপর ভিত্তি করে সম্পূর্ণ পেশাদার মানের তৈরি করা হয়েছে। 

এই ডকুমেন্টেশন ফোল্ডারটি (`.NET framework`) বিশেষভাবে তৈরি করা হয়েছে যেন:
1. ব্যাকএন্ডের সম্পূর্ণ অভ্যন্তরীণ প্রক্রিয়া ও মেকানিজম সহজে বোঝা যায়।
2. ফ্রন্টএন্ড (Next.js 14) ওয়েবসাইটের সাথে ব্যাকএন্ডের API সংযোগের বিস্তারিত ব্যাখ্যা পাওয়া যায়।
3. পরীক্ষার সময় শিক্ষক বা এক্সামিনার (Examiner/Teacher) যে যে টেকনিক্যাল প্রশ্ন করতে পারেন, সেগুলোর নিখুঁত ও প্রমাণসহ উত্তর দেওয়া যায়।

---

### 📂 এই ফোল্ডারের ফাইল সূচী (Table of Contents)

| ফাইলের নাম | আলোচ্য বিষয়বস্তু |
| :--- | :--- |
| **`01-DOTNET-FRAMEWORK-AND-CLEAN-ARCHITECTURE.md`** | .NET 9.0 রানটাইম, Clean Architecture-এর ৪টি লেয়ার, Dependency Injection (DI) লাইফসাইকেল, Kestrel সার্ভার এবং EF Core ও Supabase ডাটাবেস সংযোগ। |
| **`02-MVC-AND-ROUTING-MANAGEMENT.md`** | Web API-তে MVC প্যাটার্ন, Attribute Routing, Route Templates, Route Parameters & Constraints, Query Strings ও Model Binding, এবং সকল কন্ট্রোলারের রাউট তালিকা। |
| **`03-EXCEPTION-AND-REQUEST-HANDLING.md`** | HTTP Request Pipeline, কাস্টম Global Exception Handling Middleware, HTTP Status Codes ম্যাপিং, JWT Bearer Auth Handler, Role-based Authorization এবং CORS হ্যান্ডলিং। |
| **`04-FRONTEND-BACKEND-CONNECTION-AND-API-CALLS.md`** | Next.js 14 UI ও .NET API সংযোগ, Axios ক্লায়েন্ট আর্কিটেকচার, Request/Response Interceptors, Bearer Token ইনজেকশন, সাইলেন্ট টোকেন রিফ্রেশ এবং এন্ড-টু-এন্ড ডাটা ফ্লো। |
| **`05-CRITICAL-PATHS-ANALYSIS.md`** | প্ল্যাটফর্মের ৪টি অতি-গুরুত্বপূর্ণ ক্রিটিক্যাল পাথ: Auth Lifecycle, Order Placement & Stock Transaction, Dealer Product Approval Workflow এবং Role Matrix। |
| **`06-TEACHER-VIVA-QUESTIONS-AND-ANSWERS.md`** | শিক্ষকদের সম্ভাব্য ২০+ টেকনিক্যাল ভাইভা প্রশ্ন এবং বাস্তব কোড রেফারেন্সসহ সেগুলোর বিস্তারিত ও সহজবোধ্য উত্তর। |

---

### 🛠️ মূল টেকনিক্যাল স্ট্যাক (Core Tech Stack Summary)

```
+-----------------------------------------------------------------------------------+
| FRONTEND LAYER: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Axios        |
+-----------------------------------------------------------------------------------+
                                         │  HTTP / HTTPS REST (JSON)
                                         │  Port: 5001 (Backend) <-> 3000 (Frontend)
+-----------------------------------------------------------------------------------+
| ASP.NET CORE 9.0 WEB API (Kestrel Web Server)                                     |
|  ├─ Middleware Pipeline (ExceptionHandling, CORS, Authentication, Authorization)   |
|  ├─ Presentation Layer: ECommerce.API (Controllers, Route Engine, Model Binding)   |
|  ├─ Application Layer: ECommerce.Application (Services, DTOs, AutoMapper, Fluent)  |
|  ├─ Infrastructure Layer: ECommerce.Infrastructure (EF Core 9, Repositories, JWT)  |
|  └─ Domain Layer: ECommerce.Domain (Entities, Enums, Interfaces)                   |
+-----------------------------------------------------------------------------------+
                                         │  Npgsql PostgreSQL Driver
+-----------------------------------------------------------------------------------+
| DATABASE: PostgreSQL (Hosted on Supabase Cloud)                                   |
+-----------------------------------------------------------------------------------+
```

---

### 🎯 শিক্ষককে বোঝানোর জন্য মূল ৩টি পয়েন্ট (Key Highlights for Viva)

1. **Clean Architecture Separation**: কন্ট্রোলারে কোনো বিজনেস লজিক বা সরাসরি ডাটাবেস কোড লেখা হয়নি। রিকোয়েস্ট আসে Controller-এ, প্রসেস করে Application Service, আর ডাটাবেস হ্যান্ডেল করে Unit of Work ও Repository (Infrastructure)। ফলে সিস্টেমটি অত্যন্ত স্কেলেবল এবং সহজে টেস্টযোগ্য।
2. **Robust Exception & Request Pipeline**: সিস্টেমে কোনো আনহ্যান্ডলড ক্র্যাশ হয় না। `ExceptionHandlingMiddleware` সব ধরনের এক্সেপশন যেমন `KeyNotFoundException` (404), `UnauthorizedAccessException` (401), `InvalidOperationException` (400) ক্যাচ করে ক্লায়েন্টকে স্ট্যান্ডার্ড JSON রেসপন্স পাঠায়।
3. **Seamless Frontend Connection & Auto Token Refresh**: ফ্রন্টএন্ডে Axios Interceptor ব্যবহার করা হয়েছে। প্রতিটি রিকোয়েস্টে স্বয়ংক্রিয়ভাবে Bearer Token যোগ হয়। কোনো কারণে টোকেনের মেয়াদ শেষ হয়ে 401 এরর আসলে ব্যাকগ্রাউন্ডে স্বয়ংক্রিয়ভাবে Refresh Token দিয়ে নতুন Access Token নিয়ে মূল রিকোয়েস্টটি পুনরায় এক্সিকিউট করে—ইউজার কোনো ইন্টারাপশন ছাড়াই কাজ চালিয়ে যেতে পারে।
