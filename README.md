# 🚀 Smart Bookmark App

A production-ready **real-time bookmark management application** built using **Next.js 14 (App Router)** and **Supabase**.

Users can securely log in using **Google OAuth**, manage personal bookmarks, and experience **instant real-time synchronization across multiple tabs**, all secured with **Row Level Security (RLS)**.

---

## 🌐 Live Demo

🔗 https://smart-bookmark-pi.vercel.app

---

# ✨ Features

- 🔐 Google OAuth Authentication (No email/password)
- 👤 User-specific bookmarks (RLS secured)
- ➕ Add bookmarks (Title + URL)
- ❌ Delete bookmarks
- ⚡ Real-time sync across multiple tabs
- 🔄 Cross-tab session synchronization
- 🎨 Modern SaaS-style UI with Avatar & Name
- 🚀 Fully deployed on Vercel

---

# 🛠 Tech Stack

| Category | Technology |
|-----------|------------|
| Frontend | Next.js 14 (App Router) |
| Backend | Supabase |
| Database | PostgreSQL |
| Authentication | Google OAuth |
| Realtime | Supabase Realtime |
| Security | Row Level Security (RLS) |
| Styling | Tailwind CSS |
| Hosting | Vercel |

---

# 📂 Project Structure

```
src/
 ├── app/
 │    ├── page.tsx              # Login Page
 │    ├── dashboard/page.tsx    # Main Dashboard
 ├── lib/
 │    └── supabase.ts           # Supabase Client
```

---

# ⚙️ Environment Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/web-developer-sn/Smart-Bookmark.git
cd smart-bookmark-app
```

## 2️⃣ Install Dependencies

```bash
npm install
```

## 3️⃣ Setup Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 4️⃣ Run Locally

```bash
npm run dev
```

App will run at:

```
http://localhost:3000
```

---

# 🗄 Supabase Database Setup

## 1️⃣ Create Table

```sql
create extension if not exists "pgcrypto";

create table bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  url text not null,
  created_at timestamptz default now()
);
```

---

## 2️⃣ Enable Row Level Security

```sql
alter table bookmarks enable row level security;
```

---

## 3️⃣ Create RLS Policies

### 🔹 SELECT Policy

```sql
create policy "Users can view own bookmarks"
on bookmarks
for select
using (auth.uid() = user_id);
```

### 🔹 INSERT Policy

```sql
create policy "Users can insert own bookmarks"
on bookmarks
for insert
with check (auth.uid() = user_id);
```

### 🔹 DELETE Policy

```sql
create policy "Users can delete own bookmarks"
on bookmarks
for delete
using (auth.uid() = user_id);
```

---

# 🔄 Realtime Setup

1. Go to:
   ```
   Database → Replication → Publications
   ```

2. Ensure `bookmarks` table is included in:
   ```
   supabase_realtime
   ```

3. Realtime Subscription Code:

```ts
supabase
  .channel(`bookmarks-${user.id}`)
  .on("postgres_changes", {
    event: "*",
    schema: "public",
    table: "bookmarks",
    filter: `user_id=eq.${user.id}`,
  }, () => {
    fetchBookmarks();
  })
  .subscribe();
```

---

# 🔐 Google OAuth Setup

## Google Cloud Console

### Authorized JavaScript Origins

```
http://localhost:3000
https://smart-bookmark-pi.vercel.app
```

### Authorized Redirect URI

```
https://<SUPABASE_PROJECT_ID>.supabase.co/auth/v1/callback
```

---

# 🚀 Deployment (Vercel)

## 1️⃣ Add Environment Variables in Vercel

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## 2️⃣ Supabase → Authentication → URL Configuration

**Site URL:**

```
https://smart-bookmark-pi.vercel.app
```

**Redirect URLs:**

```
http://localhost:3000
https://smart-bookmark-pi.vercel.app
```

## 3️⃣ Use Dynamic Redirect

```ts
redirectTo: `${window.location.origin}/dashboard`
```

---

# ⚠️ Critical Problems Faced & Solutions

## 🔴 1. OAuth Error – `redirect_uri_mismatch`

**Cause:** Redirect URI not added in Google Console.  
**Solution:** Added Supabase callback URL correctly.

---

## 🔴 2. DELETE Not Working

**Cause:** Missing RLS delete policy.  
**Solution:** Created proper delete policy using `auth.uid()`.

---

## 🔴 3. Data Not Visible After Refresh

**Cause:** Missing SELECT RLS policy.  
**Solution:** Added SELECT policy to allow users to read their own data.

---

## 🔴 4. Realtime Not Syncing Across Tabs

**Cause:** `bookmarks` table not added to `supabase_realtime` publication.  
**Solution:** Enabled replication and configured proper realtime subscription.

---

## 🔴 5. `bad_oauth_state` After Deployment

**Cause:**
- Hardcoded localhost redirect
- Supabase Site URL not updated
- Missing Vercel environment variables

**Solution:**
- Used dynamic redirect (`window.location.origin`)
- Updated Supabase URL configuration
- Added environment variables in Vercel
- Redeployed project

---

## 🔴 6. Session Not Syncing Across Tabs

**Cause:** Missing auth state listener.  
**Solution:** Implemented:

```ts
supabase.auth.onAuthStateChange(...)
```

---

# 🧠 Key Learnings

- OAuth requires exact redirect configuration.
- RLS must include SELECT policy to read data.
- Production & localhost must both be configured.
- Never hardcode localhost in production.
- Realtime requires proper replication setup.
- Combine realtime + manual refresh for stability.

---

# 📈 Future Improvements

- ✏️ Edit bookmark feature
- 🌙 Dark mode toggle
- 🔎 Search & filtering
- 📂 Bookmark categories
- 🧪 Add automated testing (Jest / Playwright)

---

# 👨‍💻 Author

**Satendra (SN)**  
Full Stack Developer (MERN + Supabase)

---

⭐ If you found this project helpful, feel free to star the repository!
