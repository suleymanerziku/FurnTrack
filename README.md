# FurnTrack - Furniture Manufacturing Management

This is a Next.js application built with Firebase Studio to help manage a furniture manufacturing business. It includes features for financial tracking, employee and task management, and AI-powered insights.

## Getting Started

To get the application running locally, you'll need to set up a Supabase project for the backend database and authentication.

### 1. Create a Supabase Project

1.  Go to [supabase.com](https://supabase.com/) and sign in or create an account.
2.  On the dashboard, click **"New project"**.
3.  Choose an organization, give your project a **Name**, and generate a secure **Database Password**. **Save this password securely**, as you may need it later.
4.  Choose a **Region** that is closest to your users.
5.  Click **"Create project"** and wait for it to be set up.

### 2. Set Up Environment Variables

You need to connect your local application to your new Supabase project.

1.  Create a new file named `.env.local` in the root of your project directory.
2.  Copy the contents of `.env.example` into your new `.env.local` file.
3.  In your Supabase project dashboard, go to **Project Settings** (the gear icon at the bottom of the left sidebar).
4.  Click on the **API** page.
5.  You will find your **Project URL** and **Project API Keys**. You need the `anon` `public` key.
6.  Copy the **Project URL** and paste it as the value for `NEXT_PUBLIC_SUPABASE_URL` in your `.env.local` file.
7.  Copy the `anon` `public` key and paste it as the value for `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your `.env.local` file.
8.  You will also need a Google AI API key for the AI Insights feature. Get one from [Google AI Studio](https://aistudio.google.com/app/apikey) and add it as `GOOGLE_API_KEY`.

Your `.env.local` file should look like this:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GOOGLE_API_KEY=your-google-ai-api-key
```

### 3. Set Up the Database Schema

The application requires specific tables in your database. I've provided a SQL script to create them all at once.

1.  In your Supabase project dashboard, go to the **SQL Editor** (the icon with `<>` in the left sidebar).
2.  Click **"+ New query"**.
3.  Open the `supabase/schema.sql` file in this project.
4.  Copy the **entire contents** of `supabase/schema.sql`.
5.  Paste the SQL script into the Supabase SQL Editor.
6.  Click the **"RUN"** button.

After the script finishes, you will see all the necessary tables (`users`, `roles`, `employees`, etc.) in your **Table Editor**.

### 4. Install Dependencies and Run the App

Now you can run the application locally.

1.  Open your terminal.
2.  Install the project dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```

The application should now be running at [http://localhost:3000](http://localhost:3000). You can start by registering a new user. The first user registered will be a "Staff" member. You'll need to update their role in the `users` table in Supabase to "Admin" to get full access.
