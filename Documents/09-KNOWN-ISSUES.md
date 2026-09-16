# 09 — Known Issues

> Track bugs, limitations, and technical debt here. Remove items as they get fixed.

---

## Bugs

| # | Issue | Severity | Status | Notes |
|---|-------|----------|--------|-------|
| 1 | Dealer filtering in `GetAllDealersAsync` broken | Medium | Open | Returns all dealers regardless of `search` or `category` query params |

---

## Fixed Issues

| # | Issue | Fixed On | Notes |
|---|-------|----------|-------|
| 1 | Cart add-to-cart calling PUT instead of POST | 2026-08-16 | `ProductCard.tsx` and Home page used `updateCartItem` with product ID |
| 2 | `.next` build cache corruption | — | Workaround: delete `.next` folder |
| 3 | Stale backend processes on port 5001 | — | Workaround: kill with `lsof -ti:5001 \| xargs kill -9` |

---

## Limitations

| # | Limitation | Impact | Notes |
|---|-----------|--------|-------|
| 1 | `EnsureCreated()` used instead of EF Core migrations | Can't modify schema after creation | Schema managed via SQL scripts |
| 2 | Refresh tokens not persisted in DB | Refresh endpoint always returns 401 | Demo-only limitation |
| 3 | File upload for product images not implemented | Products use placeholder images | Would need blob storage |
| 4 | Payment integration not implemented | Checkout is order creation only | No actual payment processing |
| 5 | Email notifications not implemented | No order confirmations, etc. | Would need SMTP service |
| 6 | HTTPS not configured for local dev | Backend runs on HTTP only | Fine for development |

---

## Technical Debt

| # | Item | Priority | Notes |
|---|------|----------|-------|
| 1 | Upgrade AutoMapper (NU1903 vulnerability) | Medium | Known security vulnerability |
| 2 | Generate EF Core migrations | High | Required for production deployment |
| 3 | Add refresh token persistence | Medium | Required for production auth |
| 4 | Add product image upload | Medium | Currently using placeholder URLs |
| 5 | Add pagination to admin dealer list | Low | Currently loads all dealers |

---

## Future Enhancements (Not in Scope)

- Real payment processing (Stripe, PayPal)
- Email notifications (order confirmations, shipping updates)
- Product image upload with cloud storage
- Search engine optimization (SEO)
- Multi-language support
- Mobile app (React Native)
- Admin analytics dashboard with charts
- Dealer sales reports
- Customer reviews and ratings
