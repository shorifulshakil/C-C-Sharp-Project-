# How to Run the Project

> **Quickest option:** Run `./start.sh` from the project root — it starts both servers automatically.

---

## Prerequisites

- [.NET SDK](https://dotnet.microsoft.com/download) (8.0+)
- [Node.js](https://nodejs.org/) (18+) and npm
- `backend/.env` file with a valid `DATABASE_CONNECTION_STRING`

---

## Option A — One command (recommended)

From the **project root** (`C-Project/`):

```bash
bash start.sh
```

This starts both the backend (port 5001) and frontend (port 3000). Press **Ctrl+C** to stop both.

---

## Option B — Run each server manually

### 1. Backend (.NET API) — Terminal 1

Run from the **project root**:

```bash
cd backend
dotnet run --project src/ECommerce.API/ECommerce.API.csproj
```

Or navigate directly into the API folder:

```bash
cd backend/src/ECommerce.API
dotnet run
```

The API will be available at **http://localhost:5001**

> **Tip:** To run on a different port use:
> `dotnet run --urls="http://localhost:8080"`

### 2. Frontend (Next.js) — Terminal 2

```bash
cd frontend
npm install   # only needed the first time
npm run dev
```

The frontend will be available at **http://localhost:3000**

---

## Common Issues

| Problem | Fix |
|---|---|
| `cd: no such file or directory: backend/src/ECommerce.API` | Make sure you're starting from the **project root** (`C-Project/`) |
| `Couldn't find a project to run` | Use `dotnet run --project src/ECommerce.API/ECommerce.API.csproj` from inside `backend/` |
| `DATABASE_CONNECTION_STRING is not set` | Create/update `backend/.env` with the Supabase connection string |
| `npm: command not found` | Install Node.js from https://nodejs.org |

## Fix Error
bash start.sh



## Run All In One Command

cd /Users/md.prantoislam/Desktop/C-Project
./start.sh
