# 01. .NET Framework ও Clean Architecture বিশদ বিশ্লেষণ

---

### ১. .NET 9.0 ফ্রেমওয়ার্ক পরিচিতি এবং কেন এটি বেছে নেওয়া হয়েছে?

এই প্রজেক্টের ব্যাকএন্ড নির্মাণে মাইক্রোসফটের সর্বাধুনিক **.NET 9.0 (ASP.NET Core Web API)** ব্যবহার করা হয়েছে। 

#### কেন .NET 9.0?
1. **সর্বোচ্চ পারফরম্যান্স (High Throughput & Low Latency)**: TechEmpower বেঞ্চমার্ক অনুযায়ী ASP.NET Core পৃথিবীর অন্যতম দ্রুতগতির ওয়েব ফ্রেমওয়ার্ক। এটি কোটি কোটি সমসাময়িক রিকোয়েস্ট হ্যান্ডেল করতে পারে Kestrel ওয়েব সার্ভারের অপ্টিমাইজড অ্যাসিঙ্ক পাইপলাইনের মাধ্যমে।
2. **ক্রস-প্ল্যাটফর্ম সুবিধা (Cross-Platform Execution)**: .NET Core/9 সম্পূর্ণ ক্রস-প্ল্যাটফর্ম। এটি Windows, macOS এবং Linux সব জায়গায় একই দক্ষতায় রান করতে পারে।
3. **টাইপ সেফটি ও কম্পাইল-টাইম ভ্যালিডেশন (C# 13 Strong Typing)**: রানটাইমে কোনো অপ্রত্যাশিত টাইপ এরর হওয়ার সুযোগ নেই। ডাটা ট্রান্সফার ও প্রসেসিংয়ে কঠোর টাইপ নিরাপত্তা নিশ্চিত করা হয়েছে।
4. **ইন-বিল্ট ডিপেন্ডেন্সি ইনজেকশন (Built-in Dependency Injection)**: কোনো থার্ড পার্টি লাইব্রেরি ছাড়াই মাইক্রোসফটের নেটিভ DI কন্টেইনার আর্কিটেকচারকে অত্যন্ত মডুলার ও টেস্টেবল করে তুলেছে।
5. **এন্টারপ্রাইজ লেভেল নিরাপত্তা (Enterprise-grade Security)**: JWT Bearer অথেনটিকেশন, ডাটা প্রোটেকশন, রোল-বেসড পলিসি এবং সুরক্ষিত পাসওয়ার্ড হ্যাশিং নেটিভ সাপোর্ট।

---

### ২. Clean Architecture (৪টি স্বতন্ত্র লেয়ারের কাঠামো)

সফটওয়্যার ইঞ্জিনিয়ারিংয়ের অন্যতম শ্রেষ্ঠ আর্কিটেকচার হলো রবার্ট সি. মার্টিন (Uncle Bob)-এর **Clean Architecture** বা Onion Architecture। আমাদের সলিউশন ফাইলে (`backend/src`) ব্যাকএন্ড কোডকে ৪টি সম্পূর্ণ আলাদা প্রকল্পে বিভক্ত করা হয়েছে:

```
                  ┌─────────────────────────────────────┐
                  │          ECommerce.API              │  (Presentation Layer)
                  │   Controllers, Middlewares, Program │
                  └──────────────────┬──────────────────┘
                                     │ References
                  ┌──────────────────▼──────────────────┐
                  │       ECommerce.Application         │  (Application Layer)
                  │   Services, DTOs, Mappings, Fluent  │
                  └──────────────────┬──────────────────┘
                    References       │      References
         ┌───────────────────────────┤───────────────────────────┐
         │                                                       │
┌────────▼──────────────┐                               ┌────────▼──────────────┐
│  ECommerce.Domain     │                               │ECommerce.Infrastructure│
│Entities, Enums, Rules │                               │EF Core, DbContext, JWT│
└───────────────────────┘                               └───────────────────────┘
```

#### ক. ডোমেইন লেয়ার (`ECommerce.Domain`)
- **দায়িত্ব**: ব্যবসার মূল সত্ত্বা (Core Business Entities), এনাম (Enums) এবং ইন্টারফেস (Repository/UnitOfWork Interfaces)।
- **বৈশিষ্ট্য**: এই লেয়ারটি কোনো থার্ড পার্টি ফ্রেমওয়ার্কের ওপর নির্ভরশীল নয় (Zero External Dependencies)।
- **মূল উপাদানসমূহ**:
  - `User`, `Customer`, `Dealer`, `Product`, `Order`, `OrderItem`, `Cart`, `CartItem`, `Category`
  - `UserRole`, `ApprovalStatus`, `OrderStatus` এনামসমূহ
  - `IUnitOfWork`, `IRepository<T>` ইন্টারফেসসমূহ

#### খ. অ্যাপ্লিকেশন লেয়ার (`ECommerce.Application`)
- **দায়িত্ব**: ব্যবসার লজিক (Use Cases / Business Logic), ইনপুট/আউটপুট ডাটা স্থানান্তর (DTOs), ডাটা ভ্যালিডেশন এবং মডেল ম্যাপিং।
- **মূল উপাদানসমূহ**:
  - **সার্ভিসসমূহ**: `AuthService`, `ProductService`, `OrderService`, `DealerService`, `CartService`, `AdminService`, `CategoryService`।
  - **DTOs**: `LoginRequest`, `RegisterRequest`, `OrderRequest`, `ProductFilter` ইত্যাদি।
  - **ভ্যালিডেটর**: `FluentValidation` ব্যবহার করে ইউজারের ইনপুট ডাটা কন্ট্রোলারে আসার আগেই যাচাই করা।
  - **AutoMapper**: ডোমেইন এনটিটি এবং DTO-এর মধ্যে সহজে ডাটা কনভার্ট করার প্রোফাইল।

#### গ. ইনফ্রাস্ট্রাকচার লেয়ার (`ECommerce.Infrastructure`)
- **দায়িত্ব**: ডাটাবেস পারসিস্টেন্স (Database Persistence), এক্সটার্নাল সার্ভিস এবং টেকনিক্যাল ইমপ্লিমেন্টেশন।
- **মূল উপাদানসমূহ**:
  - `AppDbContext`: Entity Framework Core 9 এর মাধ্যমে PostgreSQL ডাটাবেস ম্যাপিং ও কনফিগারেশন।
  - `UnitOfWork` & `Repository<T>`: ডাটাবেস অপারেশন অ্যাবস্ট্রাকশন ও ট্রানজ্যাকশন কন্ট্রোল।
  - `JwtTokenGenerator`: সিক্রেট কী দিয়ে ক্রিপ্টোগ্রাফিক HMAC-SHA256 JWT টোকেন জেনারেট করা।
  - `PasswordHasher`: ক্রিপ্টোগ্রাফিক সল্ট (Salt) সহযোগে পাসওয়ার্ড হ্যাশিং ও ভেরিফিকেশন।

#### ঘ. প্রেজেন্টেশন / এপিআই লেয়ার (`ECommerce.API`)
- **দায়িত্ব**: HTTP রিকোয়েস্ট গ্রহণ, রাউটিং, রেসপন্স প্রদান, এবং মিডলওয়্যার কনফিগারেশন।
- **মূল উপাদানসমূহ**:
  - **কন্ট্রোলারসমূহ**: `AuthController`, `ProductsController`, `OrderController`, `DealerController`, `AdminController`, `CartController`।
  - **মিডলওয়্যার**: `ExceptionHandlingMiddleware`।
  - **বুটস্ট্র্যাপ ফাইল**: `Program.cs`।

---

### ৩. ডিপেন্ডেন্সি ইনজেকশন (Dependency Injection) ও সার্ভিস লাইফসাইকেল

ডিপেন্ডেন্সি ইনজেকশন হলো এমন একটি ডিজাইন প্যাটার্ন যেখানে কোনো ক্লাসের ভেতরের অবজেক্ট বাইরে থেকে সরবরাহ করা হয় (Inversion of Control - IoC)।

ASP.NET Core-এ ৩ ধরণের লাইফসাইকেল থাকে:
1. **Transient (`AddTransient`)**: প্রতিবার চাওয়ার সাথে সাথে নতুন অবজেক্ট তৈরি হয়।
2. **Scoped (`AddScoped`)**: প্রতিটি HTTP Request-এর জন্য একটি ইউনিক অবজেক্ট তৈরি হয় এবং রিকোয়েস্ট শেষ হওয়া পর্যন্ত ওই ইনস্ট্যান্স ব্যবহৃত হয়। রিকোয়েস্ট শেষ হলে এটি মেমরি থেকে মুক্ত হয়।
3. **Singleton (`AddSingleton`)**: অ্যাপ্লিকেশনের পুরো লাইফটাইমে একবার তৈরি হয় এবং সব রিকোয়েস্টে একই ইনস্ট্যান্স শেয়ার করা হয়।

#### আমাদের প্রজেক্টের কোড (`Program.cs`):
```csharp
// ডাটাবেস কনটেক্সট এবং রিপোজিটরি Scoped হিসেবে রেজিস্টার করা হয়েছে,
// কারণ একটি HTTP রিকোয়েস্টে একই ডাটাবেস কানেকশন শেয়ার হওয়া প্রয়োজন।
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IDealerService, DealerService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IAdminService, AdminService>();
```

> **শিক্ষকের জন্য গুরুত্বপূর্ণ পয়েন্ট**: কেন আমাদের সার্ভিসগুলো `AddScoped` করা হলো?
> **উত্তর**: কারণ প্রতিটি HTTP Request-এর নিজস্ব ডাটা কনটেক্সট ও ট্রানজ্যাকশন থাকা আবশ্যক। Singleton করলে এক ইউজারের ট্রানজ্যাকশন আরেক ইউজারের সাথে মিশে কনকারেন্সি কনফ্লিক্ট হতো, আবার Transient করলে অপ্রয়োজনীয় ডাটাবেস কানেকশন তৈরি হয়ে সার্ভারে লোড বাড়তো। Scoped হচ্ছে ওয়েব অ্যাপ্লিকেশনের জন্য গোল্ড স্ট্যান্ডার্ড।

---

### ৪. Kestrel ওয়েব সার্ভার ও রানটাইম কনফিগারেশন

আমাদের ব্যাকএন্ডটি মাইক্রোসফটের হাই-পারফরম্যান্স **Kestrel** সার্ভারে রান করে।

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.WebHost.ConfigureKestrel(options =>
{
    // কনফ্লিক্ট এড়াতে ব্যাকএন্ডকে পোর্ট 5001-এ লিসেন করানো হচ্ছে
    options.ListenLocalhost(5001);
});
```
- **পোর্ট**: `5001`
- **সুবিধা**: Kestrel একটি এসিনক্রোনাস I/O ইভেন্ট-লুপ চালিত সার্ভার যা লিনাক্স, ম্যাক এবং উইন্ডোজে সরাসরি নেটিভ সকেটের মাধ্যমে মিলি-সেকেন্ডের ভগ্নাংশে রেসপন্স রিটার্ন করে।

---

### ৫. ডাটাবেস কানেকশন ও Entity Framework Core (EF Core 9)

ব্যাকএন্ডটি ক্লাউড-হোস্টেড **PostgreSQL (Supabase)** ডাটাবেসের সাথে সংযুক্ত।

```csharp
var connectionString = builder.Configuration.GetValue<string>("DATABASE_CONNECTION_STRING")
    ?? builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("DATABASE_CONNECTION_STRING is not set.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString, npgsql =>
    {
        npgsql.CommandTimeout(120); // দীর্ঘ কোয়েরির জন্য ১২০ সেকেন্ড টাইমআউট
        npgsql.EnableRetryOnFailure(3, TimeSpan.FromSeconds(10), null); // নেটওয়ার্ক ত্রুটিতে ৩ বার অটো রিট্রাই
    })
    .EnableSensitiveDataLogging(false)
    .EnableDetailedErrors(false));
```

#### প্রধান বৈশিষ্ট্যসমূহ:
1. **অটোমেটিক রিট্রাই পলিসি (`EnableRetryOnFailure`)**: ক্লাউড ডাটাবেসে ক্ষণস্থায়ী নেটওয়ার্ক ড্রপ হলে ব্যাকএন্ড নিজে থেকেই ৩ বার ১০ সেকেন্ডের ব্যবধানে কানেক্ট করার চেষ্টা করে।
2. **কানেকশন পুলিং (Connection Pooling)**: Npgsql ড্রাইভার স্বয়ংক্রিয়ভাবে কানেকশন পুল ধরে রাখে, ফলে প্রতিটি কোয়েরিতে নতুন TCP হ্যান্ডশেক করতে হয় না।
3. **রিপোজিটরি ও ইউনিট অব ওয়ার্ক প্যাটার্ন**: সমস্ত ডেটা এক্সেস `IUnitOfWork` এবং `IRepository<T>` ইন্টারফেসের আড়ালে লুকানো থাকে, ফলে বিজনেস সার্ভিসগুলো সরাসরি এসকিউএল কোড থেকে সম্পূর্ণ স্বাধীন থাকে।
