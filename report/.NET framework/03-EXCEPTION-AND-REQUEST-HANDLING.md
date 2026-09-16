# 03. এক্সেপশন ও রিকোয়েস্ট হ্যান্ডলিং পাইপলাইন (Exception & Request Handling)

---

### ১. ASP.NET Core মিডলওয়্যার পাইপলাইন (HTTP Pipeline Flow)

ASP.NET Core-এ প্রতিটি ইনকামিং HTTP রিকোয়েস্ট এক বা একাধিক মিডলওয়্যার (Middleware)-এর মধ্য দিয়ে একটি নির্দিষ্ট ক্রমানুসারে (Pipeline) প্রবাহিত হয়। মিডলওয়্যার হলো এমন সফটওয়্যার কম্পোনেন্ট যা রিকোয়েস্ট আসার সময় এবং রেসপন্স যাওয়ার সময় উভয় ক্ষেত্রে এক্সিকিউট হয় (Russian Doll Model)।

আমাদের `Program.cs` ফাইলে মিডলওয়্যার পাইপলাইনটি নিম্নরূপে সাজানো হয়েছে:

```
[ Incoming HTTP Request from Next.js (Port: 3000) ]
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Kestrel Web Server (Port 5001)                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. ExceptionHandlingMiddleware (Custom Global Error Handler)│ ◄───┐
└──────────────────────┬──────────────────────────────────────┘     │
                       │                                            │
                       ▼                                            │ Catches all
┌─────────────────────────────────────────────────────────────┐     │ downstream
│ 3. Swagger & SwaggerUI (API Documentation)                  │     │ errors!
└──────────────────────┬──────────────────────────────────────┘     │
                       │                                            │
                       ▼                                            │
┌─────────────────────────────────────────────────────────────┐     │
│ 4. HttpsRedirection (HTTPS Enforcement)                     │     │
└──────────────────────┬──────────────────────────────────────┘     │
                       │                                            │
                       ▼                                            │
┌─────────────────────────────────────────────────────────────┐     │
│ 5. UseCors ("AllowFrontend" Policy)                         │     │
└──────────────────────┬──────────────────────────────────────┘     │
                       │                                            │
                       ▼                                            │
┌─────────────────────────────────────────────────────────────┐     │
│ 6. UseAuthentication (JWT Bearer Token Validation)          │     │
└──────────────────────┬──────────────────────────────────────┘     │
                       │                                            │
                       ▼                                            │
┌─────────────────────────────────────────────────────────────┐     │
│ 7. UseAuthorization (Role-based Checks: Admin/Dealer/User)  │     │
└──────────────────────┬──────────────────────────────────────┘     │
                       │                                            │
                       ▼                                            │
┌─────────────────────────────────────────────────────────────┐     │
│ 8. Endpoint Routing & Action Execution (Controllers)        │─────┘
└─────────────────────────────────────────────────────────────┘
```

> **শিক্ষকের জন্য গুরুত্বপূর্ণ পয়েন্ট**: কেন `ExceptionHandlingMiddleware` সবার শুরুতে বসানো হয়?
> **উত্তর**: কারণ পাইপলাইনে কোনো কম্পোনেন্ট সবার আগে থাকলে, পরবর্তী যেকোনো মিডলওয়্যার বা কন্ট্রোলারে তৈরি হওয়া যেকোনো ত্রুটি (Exception) বাবল-আপ (Bubble up) হয়ে প্রথম কম্পোনেন্টে ধরা পড়ে। যদি এটি নিচে থাকতো, তবে উপরের মিডলওয়্যারগুলোর ক্র্যাশ হ্যান্ডেল করা যেতো না।

---

### ২. কাস্টম Global Exception Handling Middleware

আমাদের সিস্টেমে সব কন্ট্রোলারে বারবার `try-catch` ব্লক লেখার পরিবর্তে একটি সেন্ট্রালাইজড মিডলওয়্যার ব্যবহার করা হয়েছে (`backend/src/ECommerce.API/Middleware/ExceptionHandlingMiddleware.cs`)।

#### কোড ইমপ্লিমেন্টেশন ও বিশ্লেষণ:
```csharp
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            // পরবর্তী মিডলওয়্যার বা কন্ট্রোলারে রিকোয়েস্ট পাঠানো হচ্ছে
            await _next(context);
        }
        catch (Exception ex)
        {
            // ত্রুটি ঘটলে টার্মিনালে লগ রাখা হচ্ছে
            _logger.LogError(ex, "An unhandled exception occurred");
            // ক্লায়েন্টের জন্য সুসংগঠিত JSON প্রস্তুত করা হচ্ছে
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        var message = "An unexpected error occurred.";
        var errors = new Dictionary<string, string[]>();

        // ডোমেইন এক্সেপশন টাইপ অনুযায়ী সুনির্দিষ্ট স্ট্যাটাস কোড ম্যাপিং
        switch (exception)
        {
            case KeyNotFoundException:
                context.Response.StatusCode = (int)HttpStatusCode.NotFound; // 404
                message = exception.Message;
                break;

            case UnauthorizedAccessException:
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized; // 401
                message = exception.Message;
                break;

            case InvalidOperationException:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest; // 400
                message = exception.Message;
                break;

            case ArgumentException:
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest; // 400
                message = exception.Message;
                break;

            default:
                message = "An unexpected error occurred. Please try again later."; // 500
                break;
        }

        var response = new
        {
            message,
            errors
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
```

#### সেন্ট্রালাইজড এক্সেপশন হ্যান্ডলিংয়ের সুবিধা:
1. **DRY (Don't Repeat Yourself) প্রিন্সিপাল**: প্রতিটি অ্যাকশনে repetitive কোড লেখার প্রয়োজন হয় না।
2. **সার্ভার সিকিউরিটি**: ডাটাবেসের অভ্যন্তরীণ টেবিল বা সেনসিটিভ স্ট্যাক-ট্রেস (Stack trace) বাইরের হ্যাকারদের কাছে প্রকাশ পায় না।
3. **কন্সিস্টেন্ট ফ্রন্টএন্ড এরর ফরম্যাট**: ফ্রন্টএন্ড সবসময় একই স্ট্রাকচারের `{ message: string, errors: {} }` JSON পায়, যা সহজে UI-তে টোস্ট (Toast) বা অ্যালার্ট বক্সে দেখানো যায়।

---

### ৩. অন্যান্য গুরুত্বপূর্ণ হ্যান্ডলারসমূহ (Other Handlers)

#### ক. JWT Authentication Handler
- **প্যাকেজ**: `Microsoft.AspNetCore.Authentication.JwtBearer` (v9.0.0)
- **কাজ**: ফ্রন্টএন্ড থেকে আসা `Authorization: Bearer <JWT>` হেডারটি ক্রিপ্টোগ্রাফিক্যালি ডিকোড করে ইউজারের আইডেন্টিটি ভেরিফাই করা।

```csharp
var jwtKey = builder.Configuration["JWT_SECRET_KEY"] ?? "SuperSecretJwtKey1234567890...";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtKey)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true // মেয়াদোত্তীর্ণ টোকেন স্বয়ংক্রিয়ভাবে ব্লক করা হবে
        };
    });
```

#### খ. Role-based Authorization Handler
- ইউজারের ক্লাইম থেকে রোল (`ClaimTypes.Role`) পরীক্ষা করে এক্সেস কন্ট্রোল নিশ্চিত করা।
- **ব্যবহার**:
  - `[Authorize]` -> যেকোনো ভ্যালিড লগইন ইউজার এক্সেস পাবে।
  - `[Authorize(Roles = "Customer")]` -> শুধু কাস্টমার অর্ডার দিতে পারবে।
  - `[Authorize(Roles = "Dealer")]` -> শুধু ডিলার পণ্য যোগ করতে পারবে।
  - `[Authorize(Roles = "Admin,Dealer")]` -> এডমিন অথবা ডিলার স্ট্যাটাস পরিবর্তন করতে পারবে।
- রোল না মিললে ফ্রেমওয়ার্ক স্বয়ংক্রিয়ভাবে **403 Forbidden** রিটার্ন করে।

#### গ. CORS Handler (`AllowFrontend` Policy)
ব্রাউজারের সেম-অরিজিন পলিসির কারণে পোর্ট `3000` (Next.js) থেকে পোর্ট `5001` (.NET Backend)-এ রিকোয়েস্ট পাঠালে ব্রাউজার ক্রস-অরিজিন ব্লক করে। ব্যাকএন্ডে সুনির্দিষ্ট CORS পলিসি কনফিগার করে এটি সমাধান করা হয়েছে:

```csharp
var corsOrigins = builder.Configuration.GetValue<string>("CORS_ALLOWED_ORIGINS") ?? "http://localhost:3000";
var allowedOrigins = corsOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // কুকি বা অথ হেডার পাস করার অনুমতি
    });
});
```

#### ঘ. Model Validation Handler (FluentValidation)
- ইউজারের ইনপুট ডাটা (যেমন: ইমেইল ফরম্যাট সঠিক কিনা, পাসওয়ার্ডে মিনিমাম ক্যারেক্টার আছে কিনা, স্টক ঋণাত্মক কিনা) কন্ট্রোলারে সার্ভিস কল হওয়ার আগেই যাচাই করা হয়।
- `RegisterRequestValidator`, `CreateProductValidator` ইত্যাদি রুল ফেইল করলে স্বয়ংক্রিয়ভাবে **400 Bad Request** এবং ভ্যালিডেশন এরর ডিকশনারি রেসপন্সে পাঠানো হয়।
