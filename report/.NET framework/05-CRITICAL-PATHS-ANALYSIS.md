# 05. ক্রিটিক্যাল পাথসমূহ বিশ্লেষণ (Critical Paths Analysis)

---

### ১. ক্রিটিক্যাল পাথ (Critical Path) কি এবং কেন এটি গুরুত্বপূর্ণ?

সফটওয়্যার আর্কিটেকচারে **ক্রিটিক্যাল পাথ (Critical Path)** হলো এমন কিছু মূল বিজনেস ফ্লো বা কাজের ধারাবাহিক ক্রম, যার যেকোনো একটি ধাপে ব্যর্থতা ঘটলে পুরো সিস্টেমের বিশ্বাসযোগ্যতা, আর্থিক লেনদেন বা সিকিউরিটি ক্ষতিগ্রস্ত হয়। 

আমাদের মাল্টিভেন্ডর ই-কমার্স প্ল্যাটফর্মে **৪টি প্রধান ক্রিটিক্যাল পাথ** রয়েছে যা যেকোনো প্রযুক্তিগত নিরীক্ষা বা শিক্ষক পরীক্ষার প্রধান কেন্দ্রবিন্দু।

---

### ২. ক্রিটিক্যাল পাথ ১: ইউজার অথেনটিকেশন ও টোকেন লাইফসাইকেল (Auth Lifecycle)

ইউজারের সঠিক পরিচিতি ও ডাটা নিরাপত্তা নিশ্চিত করার সম্পূর্ণ প্রবাহ:

```
[Registration Request]
       │
       ▼
1. FluentValidation Checks (ইমেইল ফরম্যাট, পাসওয়ার্ডের জটিলতা যাচাই)
       │
       ▼
2. Password Hashing (`PasswordHasher.cs`)
   - ক্রিপ্টোগ্রাফিক সল্ট (Salt) তৈরি।
   - সল্ট সহযোগে পাসওয়ার্ড হ্যাশ তৈরি (প্লেইন টেক্সট পাসওয়ার্ড ডাটাবেসে কখনোই জমা হয় না)।
       │
       ▼
3. Customer/Dealer Entity Persistence (Supabase PostgreSQL-এ ইউজার সংরক্ষণ)
       │
       ▼
[Login Request]
       │
       ▼
4. Credential Verification (`AuthService.LoginAsync`)
   - ডাটাবেস থেকে ইউজারের হ্যাশ ও সল্ট ফেচ।
   - ইউজারের ইনপুট পাসওয়ার্ড হ্যাশ করে মিলিয়ে দেখা।
       │
       ▼
5. Token Generation (`JwtTokenGenerator.cs`)
   - **Access Token (JWT)**: ইউজারের Claims (UserId, Role, Email) এনকোড করে HMAC-SHA256 অ্যালগরিদমে সাইন করা (মেয়াদ: ৬০ মিনিট)।
   - **Refresh Token**: ক্রিপ্টোগ্রাফিক র‍্যান্ডম স্ট্রিং তৈরি করে ডাটাবেসে মেয়াদসহ সংরক্ষণ (মেয়াদ: ৭ দিন)।
       │
       ▼
6. Client-Side Persistence
   - ফ্রন্টএন্ড অ্যাক্সেস টোকেন ও রিফ্রেশ টোকেন ব্রাউজারের `localStorage`-এ স্টোর করে।
```

---

### ৩. ক্রিটিক্যাল পাথ ২: অর্ডার প্লেসমেন্ট ও স্টক ট্রানজ্যাকশন (Order & Stock Transaction)

এটি সিস্টেমের সবচেয়ে সংবেদনশীল ব্যবসায়িক পাথ। এখানে সামান্য ভুল হলে ইউজারের টাকা কাটা গেলেও পণ্য স্টক না থাকা বা অতিরিক্ত স্টক বিক্রি হয়ে যাওয়ার ঝুঁকি থাকে (Overselling)।

#### স্টেপ-বাই-স্টেপ এক্সিকিউশন (`backend/src/ECommerce.Application/Services/OrderService.cs`):

```csharp
public async Task<OrderResponse> CreateAsync(Guid customerId, OrderRequest request)
{
    // ধাপ ১: কাস্টমার ভ্যালিডেশন
    var customer = await _unitOfWork.Customers.GetByIdAsync(customerId)
        ?? throw new KeyNotFoundException("Customer not found.");

    // ধাপ ২: কার্ট ও আইটেম রিকভারি
    var cart = await _unitOfWork.Carts.GetQueryable()
        .Include(c => c.Items)
        .FirstOrDefaultAsync(c => c.CustomerId == customerId)
        ?? throw new InvalidOperationException("Cart is empty.");

    if (!cart.Items.Any())
        throw new InvalidOperationException("Cart is empty.");

    var orderItems = new List<OrderItem>();
    decimal total = 0;

    // ধাপ ৩: প্রতিটি কার্ট আইটেমের অ্যাপ্রুভাল ও স্টক ভ্যালিডেশন
    foreach (var cartItem in cart.Items)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(cartItem.ProductId)
            ?? throw new KeyNotFoundException($"Product {cartItem.ProductId} not found.");

        // পণ্যটি এডমিন কর্তৃক অনুমোদিত কিনা
        if (product.ApprovalStatus != ApprovalStatus.Approved)
            throw new InvalidOperationException($"Product '{product.Name}' is not available.");

        // পর্যাপ্ত স্টক আছে কিনা যাচাই (Concurrency / Race condition prevention)
        if (product.StockQuantity < cartItem.Quantity)
            throw new InvalidOperationException($"Insufficient stock for '{product.Name}'. Available: {product.StockQuantity}");

        var subtotal = cartItem.Quantity * product.Price;
        total += subtotal;

        // প্রাইস স্ন্যাপশট: পণ্যটির বর্তমান মূল্য OrderItem-এ ফ্রিজ করে রাখা
        orderItems.Add(new OrderItem
        {
            Id = Guid.NewGuid(),
            OrderId = Guid.Empty,
            ProductId = product.Id,
            DealerId = product.DealerId,
            Quantity = cartItem.Quantity,
            UnitPriceAtPurchase = product.Price,
            Subtotal = subtotal
        });

        // পার্সিস্টেন্ট স্টক ডিডাকশন
        product.StockQuantity -= cartItem.Quantity;
        product.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.Products.UpdateAsync(product);
    }

    // ধাপ ৪: অর্ডার অবজেক্ট প্রস্তুতকরণ
    var order = new Order
    {
        Id = Guid.NewGuid(),
        CustomerId = customer.Id,
        Status = OrderStatus.Pending,
        TotalAmount = total,
        ShippingAddress = request.ShippingAddress,
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow
    };

    foreach (var item in orderItems)
    {
        item.OrderId = order.Id;
        order.Items.Add(item);
    }

    // ধাপ ৫: ডাটাবেসে অর্ডার যুক্ত করা
    await _unitOfWork.Orders.AddAsync(order);

    // ধাপ ৬: কাস্টমারের কার্ট ফাঁকা করা
    foreach (var item in cart.Items.ToList())
    {
        await _unitOfWork.CartItems.DeleteAsync(item);
    }

    // ধাপ ৭: অ্যাটমিক ট্রানজ্যাকশন কমিট (Unit of Work Commit)
    await _unitOfWork.SaveChangesAsync();

    return _mapper.Map<OrderResponse>(order);
}
```

#### এই পাথের প্রধান টেকনিক্যাল বৈশিষ্ট্যসমূহ:
1. **মূল্য অপরিবর্তনীয়তা (Price Freezing / Snapshot)**: পণ্যটির মূল্য ভবিষ্যতে ডিলার পরিবর্তন করলেও অর্ডারের হিস্টোরি বিকৃত হবে না, কারণ `UnitPriceAtPurchase` ফিল্ডে অর্ডারের সময়ের দাম আলাদাভাবে সংরক্ষণ করা হয়েছে।
2. **অ্যাটমিক ট্রানজ্যাকশন (Atomic Transaction via Unit of Work)**: স্টক কমানো, অর্ডার ক্রিয়েট এবং কার্ট ক্লিয়ার—এই ৩টি কাজ ডাটাবেসে একটি মাত্র ট্রানজ্যাকশনে `SaveChangesAsync()` দ্বারা এক্সিকিউট হয়। এর মাঝে কোনো এরর হলে স্বয়ংক্রিয়ভাবে Rollback হয়ে যায়, ডাটাবেসের অখণ্ডতা বজায় থাকে (ACID Compliance)।

---

### ৪. ক্রিটিক্যাল পাথ ৩: ডিলার প্রোডাক্ট লাইফসাইকেল ও অনুমোদন (Approval Workflow)

একটি মাল্টিভেন্ডর সিস্টেমে ডিলার যেন যেকোনো ফেক বা বিভ্রান্তিকর পণ্য সরাসরি লাইভ স্টোরে না দিতে পারে, তার জন্য কঠোর এপ্রুভাল পাইপলাইন তৈরি করা হয়েছে:

```
[Dealer Submits New Product]
            │
            ▼
1. Status Initialized to `ApprovalStatus.Pending`
            │
            ▼
2. Excluded from Public Storefront
   - `ProductsController.GetProducts` মেথডে ফিল্টার: `p.ApprovalStatus == ApprovalStatus.Approved`.
   - ফলে সাধারণ কাস্টমাররা এটি ব্রাউজ করতে পারে না।
            │
            ▼
3. Admin Moderation (`AdminController.cs`)
   - এডমিন তার ড্যাশবোর্ডে `/api/admin/products/pending` এন্ডপয়েন্টে পেন্ডিং তালিকা পর্যবেক্ষণ করে।
   - দুটি সিদ্ধান্ত হতে পারে:
       ├─► [Approve] -> Status পরিবর্তিত হয়ে `Approved` হয় -> পাবলিক স্টোরে দৃশ্যমান হয়।
       └─► [Reject]  -> এডমিন কারণ (Rejection Reason) উল্লেখ করে -> ডিলার ড্যাশবোর্ডে কারণসহ শো করে।
```

---

### ৫. ক্রিটিক্যাল পাথ ৪: রোল-বেসড সিকিউরিটি ও ডাটা আইসোলেশন (Data Isolation)

মাল্টি-টেন্যান্ট প্ল্যাটফর্মে সবচেয়ে বড় ঝুঁকি হলো এক ডিলারের ডাটা অন্য ডিলার দেখতে পাওয়া। আমাদের সিস্টেমে এই আইসোলেশন নিশ্চিত করা হয়েছে:

```
[HTTP Request with JWT]
       │
       ▼
Controller extracts UserId & Role from Claims:
Guid userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
       │
       ▼
Service Layer Enforces Strict Tenant Filtering:
- `DealerService.GetProductsAsync(Guid dealerId)`:
  কোয়েরিতে স্পষ্টভাবে `where p.DealerId == dealerId` শর্ত প্রয়োগ করা হয়।
- কোনো ডিলার অন্য ডিলারের আইডি প্যারামিটারে পাস করে রিকোয়েস্ট করলেও JWT টোকেনের আইডির সাথে না মিললে সিস্টেম স্বয়ংক্রিয়ভাবে `UnauthorizedAccessException` ছুড়ে দেয়।
```
