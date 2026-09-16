# 07 — Setup Guide

## Prerequisites

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 18+](https://nodejs.org/)
- PostgreSQL access (Supabase cloud or local)

---

## Quick Start

### 1. Database Setup

The database is hosted on **Supabase** (cloud). Connection details are in `backend/src/ECommerce.API/appsettings.Development.json`.

To reseed the database from scratch:
```bash
psql "host=aws-0-ap-south-1.pooler.supabase.com port=6543 dbname=postgres user=postgres.pqkgfmbnvvrsntoqhhoo password=L8hgSMS\$zD-6.2w sslmode=require" \
  -f SQL/database.sql
```

### 2. Backend Setup

```bash
cd backend
dotnet restore
cd src/ECommerce.API
ASPNETCORE_ENVIRONMENT=Development dotnet run --urls "http://localhost:5001"
```

API will be available at `http://localhost:5001` with Swagger at `/swagger`.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:3000`.

### 4. Verify

```bash
# Test backend
curl http://localhost:5001/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecommerce.com","password":"Admin@123"}'

# Test frontend
open http://localhost:3000
```

---

## Environment Configuration

### Backend (`appsettings.Development.json`)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=aws-0-ap-south-1.pooler.supabase.com;Port=6543;Database=postgres;Username=postgres.pqkgfmbnvvrsntoqhhoo;Password=L8hgSMS%24zD-6.2w;SSL Mode=Require;Command Timeout=120;Timeout=60;Keepalive=30;Pooling=false"
  },
  "JwtSettings": {
    "SecretKey": "SUPER_SECRET_KEY_MUST_BE_LONG_ENOUGH_1234567890",
    "Issuer": "ECommerceAPI",
    "Audience": "ECommerceApp",
    "AccessTokenExpiryMinutes": 15,
    "RefreshTokenExpiryDays": 7
  }
}
```

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_APP_NAME=E-Commerce Platform
```

---

## Troubleshooting

### "Login failed" / No demo users
- Ensure Supabase database is accessible
- Check connection string in `appsettings.Development.json`
- Verify demo credentials in `Documents/06-DEMO-CREDENTIALS.md`

### "relation admins does not exist"
- Database tables not created. Run `SQL/database.sql` on Supabase

### CORS Error
- Ensure `NEXT_PUBLIC_API_URL=http://localhost:5001/api` in `frontend/.env.local`
- Ensure backend CORS allows `http://localhost:3000`

### "Cannot find module './682.js'" (Next.js)
- Corrupted `.next` build cache:
```bash
cd frontend
rm -rf .next
npm run dev
```

### Port 5001 Already in Use
- Kill stale process:
```bash
lsof -ti:5001 | xargs kill -9
```

### Supabase Connection Issues
- Supabase free tier has connection limits
- Backend uses `Pooling=false` to avoid pool exhaustion
- If timeouts occur, increase `Command Timeout` in connection string
- Password contains `$` — use `%24` in Npgsql connection strings, raw `$` in JSON config
