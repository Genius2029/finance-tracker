# Finance Tracker

A personal finance tracking web app — log expenses and income, categorize them, see spending trends on a chart, and filter by date range.

## Tech Stack
- **FastAPI** (fully async) — backend
- **PostgreSQL** with **SQLModel** — database
- **JWT authentication** with **bcrypt** password hashing
- **Vanilla HTML/CSS/JS** frontend (no framework) with **Chart.js** for visualizations

## Features
- User registration & login (JWT-based auth)
- Create custom categories
- Add, edit, and delete transactions (income/expense)
- Filter transactions by date range
- Spending summary grouped by category
- Bar chart of expenses over time — **use the date filter above the chart to narrow the range, the chart updates automatically with the filtered data**
- Responsive layout: stacked on mobile, side-by-side panels on desktop

## Architecture
- `models/` — SQLModel table definitions (User, Category, Transaction)
- `schemas/` — Pydantic request/response schemas
- `routers/` — API endpoints grouped by entity
- `core/security.py` — password hashing, JWT creation/verification
- `static/` — CSS and JS for the frontend
- `templates/` — HTML pages (login, register, dashboard)

## Running locally
1. Clone the repo
2. Create a `.env` file with `DATABASE_URL` and `SECRET_KEY`
3. `python3 -m venv venv && source venv/bin/activate`
4. `pip install -r requirements.txt`
5. `uvicorn app.main:app --reload`
6. Open `http://127.0.0.1:8000/login`