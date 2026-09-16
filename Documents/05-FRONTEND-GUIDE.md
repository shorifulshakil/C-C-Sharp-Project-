# 05 — Frontend Guide

## Overview
Next.js 14+ App Router with TypeScript, Tailwind CSS, and React Context for state management.

---

## Route Structure

### Public Pages (with Navbar + Footer)
| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Hero banner, stats, category grid, featured products, products by category |
| `/about` | About | Company story, stats, values, team section |
| `/contact` | Contact | Contact form, FAQ accordion |
| `/products` | Products | Product listing with sidebar filters (search, category, sort, price) |
| `/products/[id]` | Product Detail | Image gallery, product info, quantity selector, related products |

### Authentication Pages
| Route | Page | Description |
|-------|------|-------------|
| `/auth/login` | Login | Email/password form |
| `/auth/register` | Register | Full name, email, phone, password, role selection |

### Customer Pages (require Customer role)
| Route | Page | Description |
|-------|------|-------------|
| `/cart` | Cart | Cart items, quantity controls, order summary |
| `/checkout` | Checkout | Shipping address, order placement |
| `/orders` | Orders | Order history list |
| `/orders/[id]` | Order Detail | Order details with items |
| `/account` | Account | User profile management + password change |

### Dealer Pages (require Dealer role)
| Route | Page | Description |
|-------|------|-------------|
| `/dealer/dashboard` | Dashboard | Stats (products, revenue, orders, items sold), recent products, quick actions |
| `/dealer/products` | Products | Product list with status filter |
| `/dealer/products/new` | New Product | Create product form |
| `/dealer/products/[id]/edit` | Edit Product | Edit product form |
| `/dealer/sales` | Sales | Sales by product — which products sold, to whom, quantities, revenue |
| `/dealer/orders` | Orders | Orders containing dealer's products |

### Admin Pages (require Admin role)
| Route | Page | Description |
|-------|------|-------------|
| `/admin/dashboard` | Dashboard | Stats overview + dealer table with all info |
| `/admin/dealers` | Dealers | Dealer management (filter, CRUD, owner info) |
| `/admin/users` | Customers | Customer management (activate/deactivate) |
| `/admin/products/pending` | Pending Products | Product approval queue |
| `/admin/categories` | Categories | Category management |
| `/admin/stats` | Statistics | Platform statistics |
| `/admin/profile` | Profile | Admin profile management |

---

## Key Components

### UI Kit (`components/ui/`)
| Component | Purpose |
|-----------|---------|
| `Button` | Primary, secondary, danger, ghost variants with loading state |
| `Input` | Text input with label, error state, required indicator |
| `Textarea` | Multi-line text input |
| `Select` | Dropdown select with label |
| `Card` | Card container |
| `Badge` | Colored status badges |
| `Modal` | Modal dialog with overlay |
| `ConfirmDialog` | Confirmation dialog (delete, etc.) |
| `Table` | Data table |
| `Pagination` | Page navigation |
| `Spinner` | Loading spinner (sm/md/lg) |
| `EmptyState` | Empty state with icon, title, description, action |
| `ProductCardSkeleton` | Skeleton loader for product cards with shimmer animation |
| `ProductGridSkeleton` | Grid of skeleton cards (configurable count and columns) |
| `ProductDetailSkeleton` | Full skeleton for product detail page |
| `LoadingProgress` | Top progress bar with percentage badge and animated spinner |

### Loading Animation System
| Component | Purpose |
|-----------|---------|
| `LoadingProgress` | Fixed top progress bar with percentage (0-100%) and shimmer effect |
| `ProductCardSkeleton` | Animated skeleton matching ProductCard layout |
| `ProductGridSkeleton` | Configurable grid of skeleton cards |
| `ProductDetailSkeleton` | Full page skeleton for product detail |
| `useLoadingProgress` | Custom hook for programmatic loading progress control |

### Layout Components (`components/layout/`)
| Component | Purpose |
|-----------|---------|
| `Navbar` | Logo, nav links (Products, About, Contact), user dropdown, mobile menu |
| `Footer` | 5-column: brand/socials, Shop, Company, Support, Newsletter signup |
| `ShopLayout` | Wraps Navbar + Footer around public pages |
| `Sidebar` | Dashboard navigation (admin/dealer specific links) |
| `DashboardLayout` | Sidebar + content wrapper for dashboard pages |

### Feature Components (`features/`)
| Component | Purpose |
|-----------|---------|
| `AuthProvider` | React Context for auth state (login, register, logout) |
| `ProtectedRoute` | Route guard — redirects unauthorized users |
| `ProductCard` | Product card with image, name, price, category, add-to-cart |

---

## API Client (`services/api.ts`)

Axios-based with:
- Base URL from `NEXT_PUBLIC_API_URL`
- Auto-attach Bearer token via request interceptor
- Auto-refresh on 401 response
- Typed methods for every API endpoint

### Usage
```typescript
import { authApi, adminApi, dealerApi, customerApi, publicApi } from '@/services/api';

// Login
const response = await authApi.login({ email, password });

// Admin: get dealers
const dealers = await adminApi.getDealers({ search, category });

// Dealer: create product
await dealerApi.createProduct(productData);

// Dealer: get sales data
const sales = await dealerApi.getSales();

// Customer: add to cart (two arguments: productId, quantity)
await customerApi.addToCart(productId, 1);

// Customer: update cart item
await customerApi.updateCartItem(itemId, newQuantity);

// Customer: remove cart item
await customerApi.removeCartItem(itemId);

// Public: get products
const products = await publicApi.getProducts({ categoryId, pageSize: 20 });
```

---

## Account Page Features

The Account page (`/account`) includes:
1. **Profile Update** — Edit full name, phone number
2. **Password Change** — New password + confirm password with validation
   - Both fields must match
   - Minimum 6 characters
   - Real-time "Passwords do not match" indicator
   - Current password is optional (can change without knowing old password)

---

## Styling

- **Tailwind CSS** for all styling
- **Utility-first** approach — no CSS modules or styled-components
- **Responsive design** — mobile-first with `sm:`, `md:`, `lg:` breakpoints
- **Color palette:** Primary (indigo), neutral (gray), success (green), danger (red), warning (yellow), accent (emerald)
- **Font:** Inter (via next/font), CSS variable `--font-heading`
- **Animations:** Custom shimmer animation for skeleton loaders (defined in `tailwind.config.ts`)
