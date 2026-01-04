# Setup and Installation Guide

This guide will walk you through setting up the KCS Meet application from scratch.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Step 1: Clone the Repository](#step-1-clone-the-repository)
- [Step 2: Install Dependencies](#step-2-install-dependencies)
- [Step 3: Set Up Clerk Authentication](#step-3-set-up-clerk-authentication)
- [Step 4: Set Up Stream.io Video](#step-4-set-up-streamio-video)
- [Step 5: Set Up Supabase Database](#step-5-set-up-supabase-database)
- [Step 6: Set Up Cashfree Payments](#step-6-set-up-cashfree-payments)
- [Step 7: Configure Environment Variables](#step-7-configure-environment-variables)
- [Step 8: Run the Application](#step-8-run-the-application)
- [Step 9: Set Up Admin Account](#step-9-set-up-admin-account)
- [Step 10: Configure Broadcasting (Optional)](#step-10-configure-broadcasting-optional)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** or **pnpm** package manager (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- A modern code editor (VS Code recommended)
- A GitHub account
- Email account for admin setup

---

## Step 1: Clone the Repository

Open your terminal and run:

```bash
git clone https://github.com/Sharmamayankkkk/KCS-App.git
cd KCS-App
```

---

## Step 2: Install Dependencies

Install all required packages:

```bash
npm install
```

Or if you prefer pnpm:

```bash
pnpm install
```

This will install all dependencies listed in `package.json`.

---

## Step 3: Set Up Clerk Authentication

Clerk provides the authentication system for KCS Meet.

### 3.1 Create a Clerk Account

1. Go to [clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application

### 3.2 Configure Clerk Settings

1. In your Clerk dashboard, go to **API Keys**
2. Copy the following keys:
   - Publishable Key (starts with `pk_`)
   - Secret Key (starts with `sk_`)

3. In Clerk dashboard, configure:
   - **Paths**: 
     - Sign-in URL: `/sign-in`
     - Sign-up URL: `/sign-up`
     - After sign-in URL: `/`
     - After sign-up URL: `/`
   
4. Enable email authentication (you can enable others if needed)

### 3.3 Set Environment Variables

Note these values for the `.env.local` file (Step 7).

---

## Step 4: Set Up Stream.io Video

Stream.io powers the video conferencing functionality.

### 4.1 Create Stream Account

1. Go to [getstream.io](https://getstream.io)
2. Sign up for a free account
3. Create a new app

### 4.2 Get API Credentials

1. In your Stream dashboard, go to your app
2. Navigate to **Dashboard**
3. Copy the following:
   - API Key
   - API Secret

### 4.3 Configure Stream Settings

1. In Stream dashboard, go to **Roles & Permissions**
2. Ensure appropriate permissions are set for:
   - Admin users (full control)
   - Regular users (basic video/audio)

---

## Step 5: Set Up Supabase Database

Supabase provides the PostgreSQL database and real-time functionality.

### 5.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project
4. Choose a strong database password
5. Select a region close to your users
6. Wait for the project to be provisioned (~2 minutes)

### 5.2 Get Supabase Credentials

1. In your Supabase project dashboard
2. Go to **Settings** → **API**
3. Copy the following:
   - Project URL
   - Anon/Public Key
   - Service Role Key (keep this secure!)

### 5.3 Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Open the `database.sql` file from the repository
3. Copy all SQL queries
4. Paste into the SQL Editor
5. Click **Run** to execute

This will create all necessary tables:
- users
- calls
- participants
- recordings
- chat_messages
- polls
- poll_options
- poll_votes
- superchats

### 5.4 Enable Real-time

1. Go to **Database** → **Replication**
2. Enable real-time for the following tables:
   - `polls`
   - `poll_options`
   - `poll_votes`
   - `chat_messages`
   - `superchats`

---

## Step 6: Set Up Cashfree Payments

Cashfree handles Super Chat payments. This is optional if you don\'t need monetization.

### 6.1 Create Cashfree Account

1. Go to [cashfree.com](https://cashfree.com)
2. Sign up for a business account
3. Complete KYC verification
4. Navigate to **Developers** section

### 6.2 Get Cashfree Credentials

1. In Cashfree dashboard, go to **API Keys**
2. Create credentials for TEST mode
3. Copy:
   - App ID
   - Secret Key

### 6.3 Configure Webhook

1. In Cashfree dashboard, go to **Webhooks**
2. Add webhook URL: `https://yourdomain.com/api/cashfree-webhook`
3. Select events: Payment Success, Payment Failed
4. Save the configuration

**Note**: You\'ll need to update this URL after deployment.

---

## Step 7: Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
touch .env.local
```

Add the following variables (replace with your actual values):

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Stream.io Video
NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key
STREAM_SECRET_KEY=your_stream_secret_key

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cashfree Payment (Optional)
NEXT_PUBLIC_CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
NEXT_PUBLIC_CASHFREE_MODE=TEST

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_EMAILS=your-email@example.com

# Optional: YouTube Live Streaming
NEXT_PUBLIC_YOUTUBE_STREAM_URL=rtmp://a.rtmp.youtube.com/live2
NEXT_PUBLIC_YOUTUBE_STREAM_KEY=your_youtube_stream_key

# Optional: Facebook Live Streaming
NEXT_PUBLIC_FACEBOOK_STREAM_URL=your_facebook_rtmp_url
NEXT_PUBLIC_FACEBOOK_STREAM_KEY=your_facebook_stream_key
```

### Important Notes:

- Replace all placeholder values with your actual credentials
- Keep `.env.local` secure and never commit it to Git
- The file is already in `.gitignore`
- For production, use production keys (not test keys)

---

## Step 8: Run the Application

### 8.1 Start Development Server

```bash
npm run dev
```

The application will start at `http://localhost:3000`

### 8.2 Verify Installation

1. Open your browser
2. Navigate to `http://localhost:3000`
3. You should see the sign-in page
4. Check the terminal for any errors

---

## Step 9: Set Up Admin Account

### 9.1 Create Your Account

1. Navigate to `http://localhost:3000/sign-up`
2. Sign up with your email
3. Complete the registration process

### 9.2 Make Yourself Admin

1. Stop the development server (Ctrl+C)
2. Open `.env.local`
3. Add your email to `NEXT_PUBLIC_ADMIN_EMAILS`:
   ```env
   NEXT_PUBLIC_ADMIN_EMAILS=your-email@example.com
   ```
4. Save the file
5. Restart the server: `npm run dev`
6. Sign in again
7. You should now see a crown icon next to your name

### 9.3 Test Admin Features

1. Try creating an instant meeting
2. Check if you can see admin controls
3. Test recording features
4. Try creating a poll

---

## Step 10: Configure Broadcasting (Optional)

If you want to stream meetings to YouTube or Facebook:

### 10.1 YouTube Live Setup

1. Go to [YouTube Studio](https://studio.youtube.com)
2. Click **Create** → **Go Live**
3. Set up your stream
4. Copy the **Stream URL** and **Stream Key**
5. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_YOUTUBE_STREAM_URL=rtmp://a.rtmp.youtube.com/live2
   NEXT_PUBLIC_YOUTUBE_STREAM_KEY=your_key_here
   ```

### 10.2 Facebook Live Setup

1. Go to your Facebook Page
2. Click **Live Video**
3. Choose **Streaming Software**
4. Copy the **Stream URL** and **Stream Key**
5. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_FACEBOOK_STREAM_URL=your_facebook_rtmp_url
   NEXT_PUBLIC_FACEBOOK_STREAM_KEY=your_key_here
   ```

### 10.3 Test Broadcasting

1. Start a meeting as admin
2. Click the broadcast button
3. Select YouTube or Facebook
4. Start the broadcast
5. Check your YouTube/Facebook page to verify the stream

---

## Troubleshooting

### Issue: Application won\'t start

**Solution**:
- Check if all dependencies are installed: `npm install`
- Verify Node.js version: `node --version` (should be 18+)
- Check for port conflicts (port 3000)
- Look at terminal error messages

### Issue: Authentication not working

**Solution**:
- Verify Clerk keys in `.env.local`
- Check Clerk dashboard for correct URLs
- Clear browser cookies and cache
- Ensure Clerk app is active

### Issue: Video not working

**Solution**:
- Verify Stream.io keys in `.env.local`
- Check browser permissions for camera/microphone
- Try a different browser (Chrome recommended)
- Check Stream.io dashboard for API limits

### Issue: Database errors

**Solution**:
- Verify Supabase credentials in `.env.local`
- Check if database schema was created correctly
- Verify real-time is enabled for required tables
- Check Supabase logs for errors

### Issue: Payment not working

**Solution**:
- Verify Cashfree credentials
- Ensure you\'re using TEST mode for development
- Check Cashfree dashboard for transaction logs
- Verify webhook URL is correct

### Issue: Build fails

**Solution**:
- Run `npm run build` to see detailed errors
- Check TypeScript errors
- Verify all imports are correct
- Clear `.next` folder and rebuild

### Issue: Environment variables not loading

**Solution**:
- Ensure file is named `.env.local` (not `.env`)
- Restart development server after changes
- Check for typos in variable names
- Variables starting with `NEXT_PUBLIC_` are exposed to browser

---

## Next Steps

After successful setup:

1. **Customize the Application**
   - Update branding/logo
   - Modify color scheme
   - Add custom backgrounds

2. **Test All Features**
   - Create meetings
   - Test video/audio
   - Try Super Chat
   - Create polls
   - Test recordings

3. **Deploy to Production**
   - See `DEPLOYMENT.md` for deployment guide
   - Update environment variables for production
   - Configure domain and SSL

4. **Monitor and Maintain**
   - Set up error tracking
   - Monitor usage and performance
   - Keep dependencies updated

---

## Getting Help

If you encounter issues:

1. Check the [FEATURES.md](./FEATURES.md) for feature details
2. Review the [README.md](./README.md) for additional info
3. Open an issue on GitHub
4. Contact: divineconnectionkcs@gmail.com

---

## Security Checklist

Before going live:

- [ ] All API keys are secure
- [ ] `.env.local` is not committed to Git
- [ ] Clerk authentication is properly configured
- [ ] Database has proper access controls
- [ ] Webhook URLs are using HTTPS
- [ ] Admin emails are correct
- [ ] Production keys are used (not test keys)
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled for payment APIs

---

**Congratulations!** 🎉 You\'ve successfully set up KCS Meet!
