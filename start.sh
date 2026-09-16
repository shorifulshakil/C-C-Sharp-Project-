#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  E-Commerce Platform — Start Script
#  Runs backend (ASP.NET) + frontend (Next.js)
#  All data comes from Supabase — no local DB needed.
# ═══════════════════════════════════════════════════════════

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

# ── 1. Load backend .env ─────────────────────────────────
ENV_FILE="$ROOT/backend/.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "❌  backend/.env not found. Cannot start."
  exit 1
fi
set -a
source "$ENV_FILE"
set +a

# ── 2. Guard — refuse to start without Supabase string ──
if [ -z "$DATABASE_CONNECTION_STRING" ]; then
  echo ""
  echo "❌  DATABASE_CONNECTION_STRING is not set in backend/.env"
  echo "    The app cannot start without a real database connection."
  echo "    Open backend/.env and make sure that variable exists."
  echo ""
  exit 1
fi
echo "✅  Supabase connection string loaded."

# ── 3. Start backend ─────────────────────────────────────
CSPROJ="$ROOT/backend/src/ECommerce.API/ECommerce.API.csproj"
if [ ! -f "$CSPROJ" ]; then
  echo "❌  Project file not found: $CSPROJ"
  echo "    Make sure you are running start.sh from the project root."
  exit 1
fi
echo ""
echo "▶  Starting backend on http://localhost:5001 ..."
cd "$ROOT/backend"
dotnet run --project src/ECommerce.API/ECommerce.API.csproj &
BACKEND_PID=$!

# ── 4. Start frontend ────────────────────────────────────
echo "▶  Starting frontend on http://localhost:3000 ..."
cd "$ROOT/frontend"
npm run dev &
FRONTEND_PID=$!

# ── 5. Trap Ctrl+C and kill both ────────────────────────
trap "echo ''; echo 'Shutting down...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

echo ""
echo "═══════════════════════════════════════════"
echo "  ✅  Both servers running."
echo "  🌐  Frontend : http://localhost:3000"
echo "  🔧  Backend  : http://localhost:5001"
echo "  📦  Database : Supabase (cloud)"
echo "  Press Ctrl+C to stop both."
echo "═══════════════════════════════════════════"
echo ""

wait
