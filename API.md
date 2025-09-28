# API Documentation

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here

# Video Services (Stream)
NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key
STREAM_SECRET_KEY=your_stream_secret_key

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Payments (Optional - Cashfree)
CASHFREE_CLIENT_ID=your_cashfree_client_id
CASHFREE_CLIENT_SECRET=your_cashfree_client_secret
CASHFREE_APP_ID=your_cashfree_app_id

# Firebase (Optional)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

## Core Features

### 1. Video Meetings
- Real-time video/audio communication
- Screen sharing capabilities
- Background effects
- Recording functionality

### 2. Authentication
- Secure user authentication via Clerk
- User profile management
- Session management

### 3. Database
- Real-time data synchronization
- Polls and voting system
- Superchat messaging
- Meeting analytics

### 4. Payments
- Donation processing
- Superchat monetization
- Secure payment handling

## API Endpoints

### Authentication
- `/api/auth/*` - Clerk authentication webhooks
- User management handled by Clerk

### Video Services
- Stream SDK handles video/audio APIs
- WebRTC for peer-to-peer communication

### Database Operations
- Supabase handles all database operations
- Real-time subscriptions for live updates

### Payment Processing
- `/api/cashfree-webhook` - Payment webhook handler
- Secure transaction processing

## Components Structure

### Core Components
- `MeetingRoom.tsx` - Main meeting interface
- `CallControls.tsx` - Video call controls
- `Navbar.tsx` - Navigation header
- `MobileNav.tsx` - Mobile navigation

### Feature Components
- `poll/` - Polling system components
- `superchat/` - Enhanced messaging system
- `ui/` - Reusable UI components

## Development Guidelines

### Code Organization
```
/components
  /poll - Polling functionality
  /superchat - Enhanced messaging
  /ui - Reusable components
/app
  /(public) - Public pages
  /api - API routes
/lib - Utility functions
/hooks - Custom React hooks
```

### Styling
- Tailwind CSS for styling
- Mobile-first responsive design
- Dark theme support
- Glassmorphism effects

### State Management
- React hooks for local state
- Supabase for global state sync
- Real-time updates via subscriptions

## Deployment

### Prerequisites
- Node.js 18+
- Environment variables configured
- Database setup (Supabase)
- Authentication setup (Clerk)

### Build Process
```bash
npm install
npm run build
npm start
```

### Environment-specific Configurations
- Development: `.env.local`
- Production: Environment variables in hosting platform
- Testing: `.env.test`

## Security Considerations

### Authentication
- Clerk handles secure authentication
- JWT tokens for session management
- Protected routes for authenticated users

### Database Security
- Row Level Security (RLS) in Supabase
- API key restrictions
- Input validation and sanitization

### Payment Security
- PCI compliant payment processing
- Webhook signature verification
- Secure key management

## Troubleshooting

### Common Issues
1. **Build Failures**: Check environment variables
2. **Video Issues**: Verify Stream SDK configuration
3. **Database Errors**: Check Supabase connection
4. **Payment Issues**: Verify Cashfree setup

### Debugging
- Check browser console for errors
- Verify network requests
- Test in different browsers
- Check mobile responsiveness

## Performance Optimization

### Bundle Size
- Dynamic imports for large components
- Tree shaking for unused code
- Image optimization with Next.js

### Runtime Performance
- React memo for expensive components
- Virtual scrolling for long lists
- Optimized re-renders

### Network Performance
- CDN for static assets
- Compressed API responses
- Efficient database queries

## Monitoring

### Analytics
- Vercel Analytics for performance
- User interaction tracking
- Error monitoring

### Logs
- Server-side logging
- Client-side error tracking
- Performance metrics