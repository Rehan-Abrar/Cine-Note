# 🎬 CineNote — Watchlist & Reviews Web App

CineNote is a modern web application that allows users to **search movies/shows**, **build a personal watchlist**, and **write reviews**. It integrates the [OMDB API](http://www.omdbapi.com/) for movie data and uses [Supabase](https://supabase.com) for authentication and database storage.

Built with **React**, **Vite**, **Tailwind CSS**, and **Shadcn UI**, CineNote offers a responsive, clean user experience — perfect for movie lovers who want to track what they watch and share their thoughts.

---

## 🚀 Features

- 🔍 Search movies and shows via OMDB
- ✅ Add to watchlist with status: _Watching_, _Completed_, _Plan to Watch_
- ✍️ Write, edit, and delete personal reviews
- ⭐ Rate movies (1–10 scale)
- 🔐 User authentication (Supabase Auth)
- 🌗 Dark mode support
- 📱 Responsive design
- ⚡ Fast build using Vite
- ☁️ Deployed on Vercel

---

## 🛠️ Tech Stack

| Layer         | Tech                       |
|---------------|----------------------------|
| Frontend      | React + TypeScript + Vite  |
| Styling       | Tailwind CSS + Shadcn UI   |
| Backend (BaaS)| Supabase (Postgres + Auth) |
| Data Source   | OMDB API                   |
| Deployment    | Vercel                     |

---

## 📦 Folder Structure (Simplified)

```

src/
├── components/        # UI components
├── pages/             # Route views (Search, Reviews, Watchlist, etc.)
├── hooks/             # Custom React hooks
├── integrations/      # Supabase setup
├── lib/               # OMDB API logic
├── contexts/          # Auth context

````

---

## 📄 Setup Instructions

1. **Clone the repo**

git clone https://github.com/Rehan-Abrar/Cine-Note.git
cd Cine-Note


2. **Install dependencies**

npm install

3. **Add environment variables**
   Create a `.env` file:

VITE_OMDB_API_KEY=your_omdb_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

4. **Run the app**

npm run dev

---


## 📃 License

This project is licensed under the MIT License.

