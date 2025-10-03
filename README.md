<div align="center">
  <img src="https://github.com/Sharmamayankkkk/KCS-App/blob/main/public/icons/KCS-Logo.png" alt="KCS Meet Logo" width="250" style="border-radius: 25px; box-shadow: 0 10px 20px rgba(0,0,0,0.2);"/>

  # KCS Meet: Divine Connections Beyond Boundaries

  **Connecting Souls, Transcending Distances - Inspired by Krishna's Universal Vision**

  ![Spiritual Technology](https://img.shields.io/badge/Spiritual-Technology-orange?style=for-the-badge&logo=dharma&logoColor=white)
  ![Divine Connectivity](https://img.shields.io/badge/Divine-Connectivity-saffron?style=for-the-badge&logo=om&logoColor=white)
</div>

---

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
  - [Authentication & User Management](#1-authentication--user-management)
  - [Meeting Management](#2-meeting-management)
  - [Video & Audio Controls](#3-video--audio-controls)
  - [Virtual Backgrounds](#4-virtual-backgrounds)
  - [Chat & Communication](#5-chat--communication)
  - [Super Chat (Monetization)](#6-super-chat-monetization)
  - [Interactive Polls](#7-interactive-polls)
  - [Recording & Storage](#8-recording--storage)
  - [Live Broadcasting](#9-live-broadcasting)
  - [Admin Controls](#10-admin-controls)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🌸 About the Project

> "Yoga is the journey of the self, through the self, to the self." - Bhagavad Gita

KCS Meet is a comprehensive video conferencing platform designed specifically for spiritual communities, particularly the Krishna Consciousness Society. It embodies the timeless wisdom of Lord Krishna, bringing spiritual seekers together through modern technology, transcending physical limitations.

The platform combines real-time video communication with spiritual-focused features like Super Chat donations, interactive polls, virtual backgrounds, and live streaming to social media platforms, creating an immersive experience for spiritual gatherings, lectures, and community interactions.

---

## ✨ Features

### 1. Authentication & User Management

**Clerk Authentication Integration**
- Secure user authentication using Clerk
- Support for multiple sign-in methods
- Email-based authentication
- User profile management with avatar support
- Session management and token-based security
- Protected routes with middleware

**User Roles & Permissions**
- **Admin Users**: Can create meetings, manage polls, control recordings, and moderate sessions
- **Regular Users**: Can join meetings, participate in chat, send Super Chats, and vote in polls
- Role-based access control (RBAC) configured via environment variables

### 2. Meeting Management

**Instant Meetings**
- Create and start meetings immediately
- Auto-generated unique meeting IDs
- Real-time participant tracking
- Meeting state management

**Scheduled Meetings**
- Schedule meetings for future dates and times
- Timezone-aware scheduling with automatic detection
- Meeting descriptions and metadata
- Shareable meeting links
- Calendar integration support

**Join Meetings**
- Join via direct meeting link
- Enter meeting ID manually
- Pre-meeting device setup screen
- Audio/video preview before joining

**Meeting Features**
- Support for multiple participants
- Real-time video and audio streaming using Stream.io
- Grid and speaker layout modes
- Participant list with online indicators
- Meeting lobby (optional)
- Call quality statistics

### 3. Video & Audio Controls

**Media Controls**
- Toggle video on/off
- Toggle audio (microphone) on/off
- Speaker volume control
- Device selection (camera, microphone, speakers)
- Speaking indicators when muted notifications
- Real-time media quality adjustment

**Video Settings**
- Camera device selection
- Video quality settings
- Mirror video option
- Video layout preferences (Grid, Speaker, Custom)

**Audio Settings**
- Microphone device selection
- Speaker/output device selection
- Audio quality settings
- Noise suppression (when available)
- Echo cancellation

### 4. Virtual Backgrounds

**Background Options**
- **No Background**: Use original camera feed
- **Blur Background**: Apply AI-powered background blur
- **Custom Images**: Replace background with custom images

**Implementation**
- Uses TensorFlow.js and MediaPipe for real-time person segmentation
- Body segmentation for precise background separation
- 30 FPS processing for smooth video
- Supports multiple background images
- Background selector in pre-meeting setup and during calls

**Performance**
- Optimized for low latency
- GPU acceleration when available
- Fallback to original video if processing fails

### 5. Chat & Communication

**Text Chat**
- Real-time text messaging during meetings
- Public messages visible to all participants
- Message history persistence in database
- Sender identification
- Timestamp for each message

**Chat Features**
- Scrollable chat window
- New message notifications
- Message counter
- Chat panel toggle
- Auto-scroll to latest messages

### 6. Super Chat (Monetization)

**Overview**
Super Chat is a monetization feature allowing viewers to send highlighted, timed messages during live sessions to support content creators.

**Pricing Tiers**

| Amount | Name | Duration | Description |
|--------|------|----------|-------------|
| ₹25 | Nitya Seva | 30 seconds | Basic support tier |
| ₹50 | Bhakti Boost | 1 minute 10 seconds | Enhanced visibility |
| ₹100 | Gopi Glimmer | 2 minutes 30 seconds | Prominent display |
| ₹250 | Vaikuntha Vibes | 6 minutes | Extended highlight |
| ₹500 | Raja Bhakta Blessing | 12 minutes | Premium support |
| ₹1000 | Parama Bhakta Offering | 25 minutes | Top-tier contribution |
| ₹5000 | Goloka Mahadhaan | 1 hour 10 minutes | Ultimate support |

**Features**
- 200 character limit per message
- Color-coded by tier for visual distinction
- Pinned at the top of chat during duration
- Payment via Cashfree integration
- Real-time payment status tracking
- Webhook support for payment confirmation
- Order management system

**Payment Flow**
1. User selects Super Chat tier
2. Enters message (max 200 characters)
3. Cashfree payment gateway opens
4. Payment processed securely
5. Webhook confirms payment
6. Message appears highlighted in chat
7. Message stays pinned for tier duration

**Payment Integration**
- Cashfree Payment Gateway
- Support for UPI, cards, wallets
- Secure transaction handling
- Payment status polling
- Order tracking with unique IDs
- Refund policy compliance

### 7. Interactive Polls

**Poll Creation (Admin Only)**
- Create polls with custom questions
- Add multiple options (2-6 options)
- Set poll duration
- Activate/deactivate polls in real-time

**Poll Features**
- Real-time voting
- Live vote count updates
- Visual progress bars showing vote distribution
- One vote per user per poll
- Vote history tracking
- Active and past polls sections

**Poll Display**
- Shows current active poll prominently
- Displays vote percentages in real-time
- Archives completed polls
- Click to view detailed poll results
- Admin controls to end polls early

**Technical Implementation**
- Supabase real-time subscriptions for live updates
- PostgreSQL database for poll storage
- Vote integrity with unique constraints
- Efficient query optimization

### 8. Recording & Storage

**Recording Features**
- Start/stop recording during meetings (admin only)
- Cloud-based recording storage
- Automatic recording metadata capture
- Recording start/end timestamps

**Recording Management**
- View all past recordings
- Recording playback interface
- Download recordings
- Recording metadata (date, duration, participants)
- Automatic cleanup of old recordings (configurable)

**Storage**
- Cloud storage integration via Stream.io
- Secure access controls
- Recording URLs with expiration
- Scalable storage solution

### 9. Live Broadcasting

**Platform Support**
- YouTube Live streaming
- Facebook Live streaming
- Simultaneous multi-platform broadcasting (RTMP)

**Broadcasting Features**
- Configure stream URL and key
- Start/stop broadcast controls (admin only)
- Real-time broadcast status
- Stream quality configuration
- Recording while broadcasting

**Configuration**
- Environment variables for default stream settings
- Per-meeting custom stream configuration
- Support for custom RTMP servers

### 10. Admin Controls

**Admin Panel Features**
- Participant management
- Remove participants
- Mute/unmute participants
- Recording controls
- Broadcast controls
- Poll management
- Meeting end capability

**Admin Identification**
- Email-based admin verification
- Environment variable configuration
- Crown icon for admin users
- Admin-only UI elements

**Moderation Tools**
- Control meeting settings
- Manage participant permissions
- Monitor chat messages
- Control Super Chat display

---

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend & Services
- **Authentication**: Clerk
- **Video/Audio**: Stream.io Video SDK
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Real-time subscriptions
- **Payment Gateway**: Cashfree

### AI & Media Processing
- **Background Processing**: TensorFlow.js
- **Body Segmentation**: MediaPipe Selfie Segmentation
- **Video Processing**: Canvas API

### Infrastructure
- **Hosting**: Vercel (recommended)
- **Analytics**: Vercel Analytics
- **Performance Monitoring**: Vercel Speed Insights

### Development Tools
- **Linting**: ESLint
- **Code Formatting**: Prettier
- **Package Manager**: npm/pnpm

---

## 🏗 Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Next.js App Router                                   │  │
│  │  ├─ (auth): Sign-in/Sign-up pages                    │  │
│  │  ├─ (root): Protected meeting pages                  │  │
│  │  └─ (public): Services, Terms, Contact pages         │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
   ┌────────┐  ┌─────────┐  ┌──────────┐
   │ Clerk  │  │Stream.io│  │ Supabase │
   │  Auth  │  │  Video  │  │    DB    │
   └────────┘  └─────────┘  └──────────┘
        │            │            │
        └────────────┼────────────┘
                     │
                     ▼
            ┌────────────────┐
            │ Payment Gateway│
            │   (Cashfree)   │
            └────────────────┘
```

### Database Schema

The application uses Supabase (PostgreSQL) with the following main tables:

**Tables Overview**
- `users`: User profiles and authentication data
- `calls`: Meeting/call records
- `participants`: Call participation tracking
- `recordings`: Recording metadata
- `chat_messages`: In-meeting chat history
- `polls`: Poll questions and metadata
- `poll_options`: Poll answer options
- `poll_votes`: User votes on polls
- `superchats`: Super Chat transactions

(See [Database Schema](#-database-schema) section for detailed schema)

### Component Structure

```
components/
├── MeetingRoom.tsx          # Main meeting interface
├── MeetingSetup.tsx         # Pre-meeting device setup
├── MeetingTypeList.tsx      # Meeting creation options
├── MeetingModal.tsx         # Modal for meeting actions
├── CallControls.tsx         # Audio/video controls
├── AdminPanel.tsx           # Admin-only controls
├── BackgroundSelector.tsx   # Virtual background UI
├── CustomGridLayout.tsx     # Custom video layout
├── superchat/
│   ├── send-superchat-modal.tsx
│   ├── superchat-panel.tsx
│   └── superchat-message.tsx
├── poll/
│   ├── polls-manager.tsx
│   ├── create-poll-modal.tsx
│   └── active-poll.tsx
└── ui/                      # Reusable UI components
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or pnpm package manager
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sharmamayankkkk/KCS-App.git
   cd KCS-App
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local  # If example exists
   # or create manually
   ```

   See [Environment Variables](#-environment-variables) section for required variables.

4. **Set up the database**
   
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Run the SQL from `database.sql` in the Supabase SQL editor
   - Enable real-time for required tables

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### First-Time Setup

1. **Create an admin account**
   - Sign up through the application
   - Add your email to `NEXT_PUBLIC_ADMIN_EMAILS` environment variable
   - Restart the development server

2. **Test basic features**
   - Create an instant meeting
   - Test audio/video controls
   - Try virtual backgrounds
   - Test chat functionality

---

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

### Required Variables

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

# Cashfree Payment Gateway
NEXT_PUBLIC_CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
NEXT_PUBLIC_CASHFREE_MODE=TEST  # or PROD for production

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

### Optional Variables

```env
# YouTube Live Streaming
NEXT_PUBLIC_YOUTUBE_STREAM_URL=rtmp://a.rtmp.youtube.com/live2
NEXT_PUBLIC_YOUTUBE_STREAM_KEY=your_stream_key

# Facebook Live Streaming  
NEXT_PUBLIC_FACEBOOK_STREAM_URL=your_facebook_rtmp_url
NEXT_PUBLIC_FACEBOOK_STREAM_KEY=your_facebook_stream_key
```

### Environment Variable Details

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key for client-side auth | Yes |
| `CLERK_SECRET_KEY` | Clerk secret key for server-side auth | Yes |
| `NEXT_PUBLIC_STREAM_API_KEY` | Stream.io API key for video | Yes |
| `STREAM_SECRET_KEY` | Stream.io secret for token generation | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `NEXT_PUBLIC_CASHFREE_APP_ID` | Cashfree application ID | Yes* |
| `CASHFREE_SECRET_KEY` | Cashfree secret key | Yes* |
| `NEXT_PUBLIC_ADMIN_EMAILS` | Comma-separated admin emails | Yes |
| `NEXT_PUBLIC_YOUTUBE_STREAM_URL` | YouTube RTMP URL | No |
| `NEXT_PUBLIC_YOUTUBE_STREAM_KEY` | YouTube stream key | No |

*Required only if using Super Chat feature

---

## 💾 Database Schema

The application uses PostgreSQL via Supabase. Execute the `database.sql` file to set up the schema.

### Core Tables

**users**
```sql
- id: TEXT PRIMARY KEY
- email: TEXT NOT NULL UNIQUE
- username: TEXT NOT NULL
- first_name: TEXT
- last_name: TEXT
- image_url: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**calls**
```sql
- id: TEXT PRIMARY KEY
- created_by_id: TEXT REFERENCES users(id)
- state: JSONB
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- started_at: TIMESTAMP
```

**participants**
```sql
- id: SERIAL PRIMARY KEY
- call_id: TEXT REFERENCES calls(id)
- user_id: TEXT REFERENCES users(id)
- joined_at: TIMESTAMP
- left_at: TIMESTAMP
- UNIQUE(call_id, user_id)
```

**recordings**
```sql
- id: TEXT PRIMARY KEY
- call_id: TEXT REFERENCES calls(id)
- filename: TEXT NOT NULL
- start_time: TIMESTAMP
- end_time: TIMESTAMP
- url: TEXT NOT NULL
```

**chat_messages**
```sql
- id: BIGSERIAL PRIMARY KEY
- call_id: TEXT
- sender: TEXT
- text: TEXT
- created_at: TIMESTAMP
```

**polls**
```sql
- id: BIGSERIAL PRIMARY KEY
- call_id: TEXT
- question: TEXT
- is_active: BOOLEAN DEFAULT true
- duration_seconds: INTEGER
- end_time: TIMESTAMP
- created_at: TIMESTAMP
```

**poll_options**
```sql
- id: BIGSERIAL PRIMARY KEY
- poll_id: BIGINT REFERENCES polls(id)
- text: TEXT
- position: SMALLINT
- created_at: TIMESTAMP
```

**poll_votes**
```sql
- id: BIGSERIAL PRIMARY KEY
- poll_id: BIGINT REFERENCES polls(id)
- poll_option_id: BIGINT REFERENCES poll_options(id)
- user_id: TEXT
- created_at: TIMESTAMP
```

**superchats**
```sql
- id: SERIAL PRIMARY KEY
- call_id: TEXT REFERENCES calls(id)
- sender_id: TEXT
- sender_name: TEXT
- message: TEXT NOT NULL
- amount: NUMERIC(10, 2) NOT NULL
- payment_status: TEXT DEFAULT 'pending'
- order_reference: TEXT UNIQUE
- currency: TEXT
- is_pinned: BOOLEAN DEFAULT false
- timestamp: TIMESTAMP
```

### Realtime Configuration

Enable Supabase real-time for:
- `polls`
- `poll_options`
- `poll_votes`
- `chat_messages`
- `superchats`

---

## 📡 API Documentation

### Payment API Endpoints

#### Create Cashfree Order
```
POST /api/create-cashfree-order
```

**Request Body:**
```json
{
  "amount": 100,
  "userId": "user_123",
  "callId": "call_456",
  "orderId": "SC-call_456-1234567890",
  "currency": "INR"
}
```

**Response:**
```json
{
  "payment_session_id": "session_abc123",
  "order_id": "SC-call_456-1234567890"
}
```

#### Check Payment Status
```
GET /api/check-payment-status?orderId=SC-call_456-1234567890
```

**Response:**
```json
{
  "status": "SUCCESS",
  "orderId": "SC-call_456-1234567890"
}
```

#### Cashfree Webhook
```
POST /api/cashfree-webhook
```

Receives payment confirmation from Cashfree and updates database.

---

## 🌐 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Configure environment variables
   - Deploy

3. **Post-Deployment**
   - Update `NEXT_PUBLIC_BASE_URL` with your Vercel URL
   - Configure webhook URLs in Cashfree dashboard
   - Update allowed origins in Clerk dashboard
   - Test all features in production

### Custom Deployment

The app can be deployed on any platform supporting Next.js:

- **Build the application**
  ```bash
  npm run build
  ```

- **Start production server**
  ```bash
  npm start
  ```

### Environment Configuration

Ensure all environment variables are set in your deployment platform.

---

## 🤝 Contributing

We welcome contributions to improve KCS Meet! Here's how you can help:

### Ways to Contribute

1. **Report Bugs**
   - Open an issue with detailed bug description
   - Include steps to reproduce
   - Add screenshots if applicable

2. **Suggest Features**
   - Open an issue with feature description
   - Explain use case and benefits
   - Provide mockups if available

3. **Submit Pull Requests**
   - Fork the repository
   - Create a feature branch
   - Make your changes
   - Submit a pull request

### Development Guidelines

- Follow existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

### Code Style

- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Keep components focused and reusable
- Use Tailwind CSS for styling

---

## 📜 License

This project is distributed under the MIT License. See `LICENSE` file for more information.

---

## 📞 Contact

### Support & Inquiries

- **Email**: [divineconnectionkcs@gmail.com](mailto:divineconnectionkcs@gmail.com)
- **Website**: [Krishna Consciousness Society](https://meet.krishnaconsciousnesssociety.com/)
- **GitHub**: [@Sharmamayankkkk](https://github.com/Sharmamayankkkk)

### Address

Krishna Consciousness Society  
F-408, Ghar Aangan Flats  
Muhana Mandi, 302029  
Jaipur, Rajasthan, India

---

## 🙏 Acknowledgments

- Stream.io for video infrastructure
- Clerk for authentication services
- Supabase for real-time database
- Cashfree for payment processing
- The Krishna Consciousness community for inspiration

---

<div align="center">
  <strong>🕉️ Bridging Souls, One Digital Moment at a Time 🕉️</strong>
  
  Made with 💖 for the spiritual community
</div>
