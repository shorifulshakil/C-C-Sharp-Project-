# 02. MVC আর্কিটেকচার ও রাউটিং মেকানিজম (Routing Management)

---

### ১. Web API-তে MVC প্যাটার্ন কিভাবে কাজ করে?

সাধারণত ট্র্যাডিশনাল MVC (Model-View-Controller) প্যাটার্নে View হিসেবে Razor বা HTML রেন্ডার হয়। কিন্তু আধুনিক সিঙ্গেল পেজ অ্যাপ্লিকেশন (SPA) বা Next.js ফ্রন্টএন্ড আর্কিটেকচারে ব্যাকএন্ড কাজ করে **Headless RESTful Web API** হিসেবে। 

আমাদের সিস্টেমে MVC-এর বিন্যাস নিম্নরূপ:

```
┌────────────────────────────────────────────────────────────────────────┐
│ MODEL (M):                                                             │
│ - Domain Entities: User, Customer, Dealer, Product, Order             │
│ - Data Transfer Objects (DTOs): LoginRequest, OrderRequest, DTOs       │
│ - ব্যবসায়িক ডেটা এবং ভ্যালিডেশন নিয়মসমূহ সংরক্ষণ করে।                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ CONTROLLER (C):                                                        │
│ - ControllerBase ক্লাস থেকে ইনহেরিট করা REST API কন্ট্রোলার।           │
│ - HTTP রিকোয়েস্ট (GET, POST, PUT, DELETE) গ্রহণ করে।                  │
│ - রিকোয়েস্ট ডেটা ভ্যালিডেট করে এবং সার্ভিস লেয়ারে পাঠায়।                │
│ - সুনির্দিষ্ট HTTP Status Code সহ রেসপন্স জেনারেট করে।                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ VIEW (V):                                                              │
│ - আমাদের ব্যাকএন্ড কোনো স্ট্যাটিক HTML ভিউ পাঠায় না।                   │
│ - View হিসেবে কাজ করে স্ট্রাকচার্ড JSON (JavaScript Object Notation)।  │
│ - Next.js ফ্রন্টএন্ড এই JSON ডেটা গ্রহণ করে ডায়নামিক UI রেন্ডার করে।    │
└────────────────────────────────────────────────────────────────────────┘
```

---

### ২. রাউটিং প্রকারভেদ ও ASP.NET Core মেকানিজম

রাউটিং হলো এমন একটি প্রসেস যার মাধ্যমে ইনকামিং HTTP Request-এর URL এবং HTTP Method পরীক্ষা করে নির্দিষ্ট কন্ট্রোলারের নির্দিষ্ট মেথড (Action)-এ পাঠানো হয়।

ASP.NET Core-এ মূলত দুই ধরণের রাউটিং থাকে:
1. **Conventional Routing (প্রথাগত রাউটিং)**: একটি সেন্ট্রাল প্যাটার্ন যেমন `{controller=Home}/{action=Index}/{id?}` দ্বারা নির্ধারিত হয়। এটি সাধারণত পুরনো MVC অ্যাপ্লিকেশনে ব্যবহৃত হতো।
2. **Attribute Routing (অ্যাট্রিবিউট রাউটিং)**: সরাসরি কন্ট্রোলার এবং অ্যাকশন মেথডের ওপরে C# অ্যাট্রিবিউট যেমন `[Route(...)]`, `[HttpGet(...)]` ইত্যাদি ডিক্লেয়ার করে রাউট নির্ধারণ করা হয়। **আমাদের পুরো প্রজেক্টে এই সর্বাধুনিক Attribute Routing মেকানিজম ব্যবহার করা হয়েছে।**

#### কেন Attribute Routing শ্রেষ্ঠ?
- সুনির্দিষ্ট ও পরিষ্কার URL প্যাটার্ন তৈরি করা যায়।
- একই মেথড নেম থাকলেও আলাদা আলাদা URL এবং HTTP Verb অ্যাসাইন করা সম্ভব।
- মাইক্রোসার্ভিস বা RESTful API আর্কিটেকচারের জন্য এটি ইন্ডাস্ট্রি স্ট্যান্ডার্ড।

---

### ৩. আমাদের প্রজেক্টে ব্যবহৃত রাউটিং টেকনিকসমূহ

#### ক. টোকেন সাবস্টিটিউশন (Token Replacement)
```csharp
[ApiController]
[Route("api/[controller]")] // [controller] টোকেনটি ক্লাস নেমের সাথে অটোমেটিক রিপ্লেস হয়
public class ProductsController : ControllerBase
{
    // এর বেস রাউট হবে: /api/products
}
```

#### খ. এক্সপ্লিসিট বা ফিক্সড রাউটিং (Explicit Routing)
```csharp
[ApiController]
[Route("api/orders")] // সরাসরি ফিক্সড পাথ নির্ধারণ
[Authorize]
public class OrderController : ControllerBase
{
    // এর বেস রাউট হবে: /api/orders
}
```

#### গ. রাউট প্যারামিটার ও ডাইনামিক সেগমেন্ট (Route Parameters)
URL-এর মধ্যে ডাইনামিক আইডি বা ইউনিক আইডেন্টিফায়ার পাস করার নিয়ম:
```csharp
[HttpGet("{id}")] // URL: GET /api/products/4f2a7e12-8c76-4a41-8d2b-98f98d9c1234
public async Task<IActionResult> GetProduct(Guid id)
{
    var product = await _productService.GetPublicProductAsync(id);
    if (product == null) return NotFound();
    return Ok(product);
}
```

#### ঘ. কোয়েরি স্ট্রিং ও মডেল বাইন্ডিং (Query String Binding)
পেজিনেশন, সার্চ এবং ফিল্টারিংয়ের জন্য `[FromQuery]` অ্যাট্রিবিউট ব্যবহার:
```csharp
[HttpGet] // URL: GET /api/products?categoryId=123&page=1&pageSize=10&search=mobile
public async Task<IActionResult> GetProducts([FromQuery] ProductFilter filter)
{
    var result = await _productService.GetPublicProductsAsync(filter);
    return Ok(new { items = result.Items, total = result.Total, page = filter.Page, pageSize = filter.PageSize });
}
```

#### ঙ. রিকোয়েস্ট বডি বাইন্ডিং (Request Body Binding)
ইউজারের পাঠানো JSON পে-লোডকে C# ক্লাসে রূপান্তর:
```csharp
[HttpPost("login")] // URL: POST /api/auth/login
public async Task<IActionResult> Login([FromBody] LoginRequest request)
{
    var response = await _authService.LoginAsync(request);
    return Ok(response);
}
```

#### চ. নেস্টেড বা অ্যাকশন পাথ রাউটিং (Nested & Sub-routes)
```csharp
[HttpPut("{id}/status")] // URL: PUT /api/orders/550e8400-e29b-41d4-a716-446655440000/status
[Authorize(Roles = "Admin,Dealer")]
public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusRequest request)
{
    // ...
}
```

---

### ৪. অ্যাকশন রেজাল্ট ও স্ট্যান্ডার্ড HTTP স্ট্যাটাস কোড (HTTP Status Codes)

আমাদের প্রতিটি কন্ট্রোলার মেথড স্ট্যান্ডার্ড `IActionResult` রিটার্ন করে, যা ফ্রন্টএন্ডকে সঠিক স্ট্যাটাস কোড দেয়:

| মেথড / রেজাল্ট | HTTP Code | তাৎপর্য ও ব্যবহার |
| :--- | :--- | :--- |
| `Ok(data)` | **200 OK** | রিকোয়েস্ট সফলভাবে প্রসেস হয়েছে এবং ডাটা রেসপন্সে পাঠানো হয়েছে। |
| `CreatedAtAction(...)` | **201 Created** | নতুন রিসোর্স তৈরি হয়েছে (যেমন: অর্ডার বা প্রোডাক্ট ক্রিয়েট)। এর সাথে নতুন রিসোর্সের লোকেশন হেডার দেওয়া হয়। |
| `BadRequest(...)` | **400 Bad Request** | ক্লায়েন্টের পাঠানো ডাটায় ত্রুটি বা বিজনেস লজিক ভায়োলেশন। |
| `Unauthorized(...)` | **401 Unauthorized** | ইউজার লগইন ছাড়া সুরক্ষিত রাউটে এক্সেস করার চেষ্টা করেছে বা টোকেন ইনভ্যালিড। |
| `Forbid()` | **403 Forbidden** | ইউজার লগইন করেছে, কিন্তু ওই রাউটে এক্সেস করার রোল বা পারমিশন নেই (যেমন কাস্টমার ডিলার পেজে গেলে)। |
| `NotFound()` | **404 Not Found** | কাঙ্ক্ষিত আইডি বা রিসোর্স ডাটাবেসে খুঁজে পাওয়া যায়নি। |

---

### ৫. প্রজেক্টের সম্পূর্ণ রাউটিং টেবিল (All 32+ Endpoints)

#### ক. AuthController (`/api/auth`)
| Method | Route | অ্যাক্সেস লেভেল | বিবরণ |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | পাবলিক | নতুন কাস্টমার বা ডিলার রেজিস্ট্রেশন |
| `POST` | `/api/auth/login` | পাবলিক | ইমেইল ও পাসওয়ার্ড দিয়ে লগইন ও JWT জেনারেট |
| `POST` | `/api/auth/refresh` | পাবলিক | রিফ্রেশ টোকেন দিয়ে নতুন এক্সেস টোকেন গ্রহণ |
| `GET` | `/api/auth/me` | Authorize | বর্তমান লগইন থাকা ইউজারের প্রোফাইল ফেচ |
| `PUT` | `/api/auth/me` | Authorize | নিজের প্রোফাইল ইনফরমেশন আপডেট |

#### খ. ProductsController & CategoriesController
| Method | Route | অ্যাক্সেস লেভেল | বিবরণ |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | পাবলিক | ফিল্টার, পেজিনেশন ও সার্চসহ অনুমোদিত প্রোডাক্ট লিস্ট |
| `GET` | `/api/products/{id}` | পাবলিক | একক প্রোডাক্টের বিস্তারিত ভিউ |
| `GET` | `/api/categories` | পাবলিক | সকল অ্যাক্টিভ ক্যাটাগরির লিস্ট |

#### গ. OrderController (`/api/orders`)
| Method | Route | অ্যাক্সেস লেভেল | বিবরণ |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Customer | কার্ট থেকে নতুন অর্ডার তৈরি ও স্টক ডিডাক্ট করা |
| `GET` | `/api/orders` | Customer | কাস্টমারের নিজস্ব অর্ডারের ইতিহাস |
| `GET` | `/api/orders/{id}` | Customer/Dealer/Admin | নির্দিষ্ট অর্ডারের বিস্তারিত তথ্য |
| `PUT` | `/api/orders/{id}/status` | Admin, Dealer | অর্ডারের স্ট্যাটাস আপডেট (Shipped, Delivered ইত্যাদি) |

#### ঘ. CartController (`/api/cart`)
| Method | Route | অ্যাক্সেস লেভেল | বিবরণ |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | Customer | ইউজারের বর্তমান কার্টের প্রোডাক্ট ও মোট দাম |
| `POST` | `/api/cart/items` | Customer | কার্টে নতুন প্রোডাক্ট যোগ করা |
| `PUT` | `/api/cart/items/{id}` | Customer | কার্টের আইটেমের সংখ্যা বৃদ্ধি বা হ্রাস করা |
| `DELETE` | `/api/cart/items/{id}` | Customer | কার্ট থেকে কোনো আইটেম মুছে ফেলা |

#### ঙ. DealerController (`/api/dealers`)
| Method | Route | অ্যাক্সেস লেভেল | বিবরণ |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dealers/profile` | Dealer | ডিলারের শপ প্রোফাইল দেখা |
| `PUT` | `/api/dealers/profile` | Dealer | শপের তথ্য ও লোগো আপডেট |
| `GET` | `/api/dealers/products` | Dealer | ডিলারের নিজস্ব প্রোডাক্টসমূহের লিস্ট (পেন্ডিং/অ্যাপ্রুভড) |
| `POST` | `/api/dealers/products` | Dealer | নতুন প্রোডাক্ট সাবমিট করা (এডমিন অ্যাপ্রুভালের জন্য) |
| `PUT` | `/api/dealers/products/{id}` | Dealer | নিজের প্রোডাক্ট এডিট করা |
| `DELETE` | `/api/dealers/products/{id}` | Dealer | প্রোডাক্ট ডিলিট করা |
| `GET` | `/api/dealers/orders` | Dealer | ডিলারের শপ থেকে বিক্রি হওয়া অর্ডারসমূহ |
| `PUT` | `/api/dealers/orders/{id}/status` | Dealer | নিজের অর্ডারের ডেলিভারি স্ট্যাটাস আপডেট |
| `GET` | `/api/dealers/sales` | Dealer | বিক্রয় রিপোর্ট ও টোটাল আর্নিংস ড্যাশবোর্ড |

#### চ. AdminController (`/api/admin`)
| Method | Route | অ্যাক্সেস লেভেল | বিবরণ |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/users` | Admin | সিস্টেমের সকল ইউজার লিস্ট ও সার্চ |
| `PUT` | `/api/admin/users/{id}/status` | Admin | ইউজার অ্যাকাউন্ট একটিভ বা সাসপেন্ড করা |
| `GET` | `/api/admin/dealers` | Admin | সকল ডিলারের তালিকা |
| `PUT` | `/api/admin/dealers/{id}/approve` | Admin | ডিলারের দোকান অনুমোদন প্রদান |
| `GET` | `/api/admin/products/pending` | Admin | অনুমোদনের অপেক্ষায় থাকা প্রোডাক্ট তালিকা |
| `PUT` | `/api/admin/products/{id}/approve` | Admin | প্রোডাক্ট পাবলিশ করার অনুমতি দেওয়া |
| `PUT` | `/api/admin/products/{id}/reject` | Admin | কারণ দর্শিয়ে প্রোডাক্ট রিজেক্ট করা |
| `GET` | `/api/admin/stats` | Admin | ওভারঅল প্ল্যাটফর্ম মেট্রিক্স ও রেভিনিউ রিপোর্ট |
