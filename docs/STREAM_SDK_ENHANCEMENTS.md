# Stream Video SDK Enhancements - Implementation Guide

This document describes all the new features and enhancements implemented for the KCS Video Meeting Application based on Stream.io Video SDK.

## Table of Contents

1. [Screen Sharing](#screen-sharing)
2. [Device Management](#device-management)
3. [Audio Settings](#audio-settings)
4. [Participant Management](#participant-management)
5. [Notifications & Sounds](#notifications--sounds)
6. [Meeting Queries](#meeting-queries)
7. [Recording Features](#recording-features)
8. [Permission System](#permission-system)

---

## Screen Sharing

### Implementation
Screen sharing has been fully implemented with desktop-only support.

### Features
- **Desktop-Only Detection**: Automatically detects if the device is desktop/mobile
- **Permission Handling**: Proper error handling for denied permissions
- **Visual Indicators**: Shows "Sharing" badge on participant view
- **Toggle Control**: Easy-to-use toggle in the call controls menu

### Usage
```typescript
// Screen sharing is available in CallControls component
// Located at: components/CallControls.tsx

// The feature automatically:
// - Detects if device supports screen sharing
// - Disables on mobile devices
// - Shows proper UI feedback
```

### API Methods
```typescript
// Start screen sharing
await call.publishScreenShare();

// Stop screen sharing
await call.stopPublish('screenShare');

// Check if someone is sharing
const hasOngoingScreenShare = useHasOngoingScreenShare();

// Check if local user is sharing
const isScreenSharing = localParticipant?.publishedTracks.includes('screenShare');
```

---

## Device Management

### User-Friendly Device Labels

Instead of generic labels like "Camera 1" or "Camera 2", the system now displays:
- **Front Camera** / **Rear Camera** for mobile devices
- **Built-in Microphone** for internal mics
- **External Camera 1** for USB cameras
- **Bluetooth Microphone** for wireless devices
- **Default Camera/Microphone** for the first device

### Implementation
Device utility functions are located in `lib/device-utils.ts`:

```typescript
import { 
  getFriendlyCameraLabel, 
  getFriendlyMicrophoneLabel,
  isScreenShareSupported 
} from '@/lib/device-utils';

// Get friendly label for a camera
const label = getFriendlyCameraLabel(device, index);

// Get friendly label for a microphone
const label = getFriendlyMicrophoneLabel(device, index);

// Check if screen sharing is supported
const canShare = isScreenShareSupported();
```

### Device Selection
Users can select their preferred devices in the meeting setup screen:
- Camera selection with dropdown
- Microphone selection with dropdown
- Automatic device detection on change
- Preview before joining

---

## Audio Settings

### Noise Cancellation
Advanced noise cancellation using browser's built-in audio processing.

```typescript
// Enable noise cancellation
await call.microphone.enable({
  noiseSuppression: true,
  echoCancellation: true,
  autoGainControl: true,
});
```

### Hi-Fi Audio Quality
Toggle between standard and high-fidelity audio quality:
- **Standard Quality**: Balanced for bandwidth and quality
- **Hi-Fi Quality**: Maximum quality for music and presentations

### Stereo Audio
Enable stereo audio for enhanced spatial audio experience.

### Usage
The AudioSettings component is located at `components/AudioSettings.tsx` and is integrated into CallControls.

Features include:
- Dropdown menu for audio settings
- Persistent settings (saved to localStorage)
- Real-time audio processing

---

## Participant Management

### Custom Participant View

Enhanced participant view with the following features:

#### Visual Indicators
- **Connection Quality**: Shows signal strength (excellent/good/poor/bad)
- **Audio Status**: Microphone on/off badge
- **Video Status**: Camera status with avatar fallback
- **Dominant Speaker**: Highlighted border for active speakers
- **Screen Sharing**: Visual indicator when sharing
- **Audio Level**: Real-time audio level visualization

#### Pin Functionality
- Pin important participants
- Yellow border for pinned participants
- Click to pin/unpin

### Implementation
```typescript
import { CustomParticipantView } from '@/components/CustomParticipantView';

<CustomParticipantView
  participant={participant}
  showConnectionQuality={true}
  showAudioLevel={true}
  isPinned={false}
  onPin={() => handlePin(participant.userId)}
/>
```

---

## Notifications & Sounds

### Event Sounds
The system plays subtle notification sounds for various events:

#### Join Sound
- **Trigger**: When a participant joins
- **Sound**: Ascending tone (C5 → E5)

#### Leave Sound
- **Trigger**: When a participant leaves
- **Sound**: Descending tone (E5 → C5)

#### Reaction Sound
- **Trigger**: When someone sends a reaction
- **Sound**: Quick chirp (A5)

### Usage
```typescript
import { useNotificationSounds } from '@/hooks/useNotificationSounds';

// In your component
const { toggleSounds, soundEnabled } = useNotificationSounds();

// Toggle sounds on/off
toggleSounds(false); // Disable sounds
toggleSounds(true);  // Enable sounds
```

### Recording Notification
A prominent red banner appears when recording is in progress:
- Fixed position at top center
- Animated pulsing indicator
- Auto-appears/disappears based on recording state

---

## Meeting Queries

### API Endpoints

#### 1. Get All Meetings
```
GET /api/meetings
```
Returns active upcoming meetings from the last 24 hours.

#### 2. Get Scheduled Meetings
```
GET /api/meetings/scheduled?limit=50&offset=0&includePrivate=false
```
Returns only future scheduled meetings.

**Parameters:**
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset (default: 0)
- `includePrivate`: Include private meetings (default: false)

#### 3. Get Completed Meetings
```
GET /api/meetings/completed?limit=50&offset=0
```
Returns meetings that have ended or are older than 24 hours.

**Parameters:**
- `limit`: Number of results
- `offset`: Pagination offset

#### 4. Advanced Query
```
GET /api/meetings/query?status=upcoming&isPrivate=false&sortBy=start_time&sortOrder=asc
```
Advanced filtering and sorting capabilities.

**Parameters:**
- `status`: 'upcoming' | 'live' | 'completed'
- `isPrivate`: 'true' | 'false'
- `isActive`: 'true' | 'false'
- `startDate`: ISO date string
- `endDate`: ISO date string
- `limit`: Number (default: 50, max: 100)
- `offset`: Number (default: 0)
- `sortBy`: 'start_time' | 'created_at' | 'title'
- `sortOrder`: 'asc' | 'desc'

### Usage Example

```typescript
// Fetch scheduled meetings
const response = await fetch('/api/meetings/scheduled?limit=10');
const { meetings, total } = await response.json();

// Query with filters
const queryParams = new URLSearchParams({
  status: 'upcoming',
  isPrivate: 'false',
  sortBy: 'start_time',
  sortOrder: 'asc',
  limit: '20'
});
const response = await fetch(`/api/meetings/query?${queryParams}`);
const { meetings, total, filters } = await response.json();

// Get completed meetings
const response = await fetch('/api/meetings/completed?limit=25&offset=0');
const { meetings, total } = await response.json();
```

---

## Recording Features

### Recording In Progress Notification
A visual indicator shows when recording is active:
- Red banner at top of screen
- Pulsing record indicator
- "Recording in Progress" text
- Auto-shows/hides based on recording state

### Recording Controls
Available in the CallControls dropdown menu:
- **Start Recording**: Begins recording the meeting
- **Stop Recording**: Ends the recording
- Visual indicator (red dot) shows recording state

---

## Permission System

### Admin Permission Requests
Admins receive visual notifications when participants request permissions:

#### Supported Permission Types
- **Unmute Microphone** (send-audio)
- **Enable Camera** (send-video)
- **Share Screen** (screenshare)

### Features
- Real-time permission request notifications
- Approve/Deny buttons for each request
- Shows requester name
- Displays requested permissions with icons
- Auto-dismisses on action
- Only visible to admins

### Implementation
```typescript
import { PermissionRequests } from '@/components/PermissionRequests';

<PermissionRequests isAdmin={isAdmin} />
```

The component automatically:
- Listens for permission requests
- Displays notification cards
- Handles approve/deny actions
- Manages multiple requests

---

## Configuration

### Environment Variables
Ensure these are set in your `.env.local`:

```env
NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

### Database Setup
Run the unified database schema:

```bash
# Execute the SQL file in your Supabase SQL Editor
docs/database-unified.sql
```

This creates all necessary tables, indexes, and views.

---

## Best Practices

### Screen Sharing
1. Always check if device supports screen sharing before enabling the button
2. Handle permission denials gracefully with user feedback
3. Limit to one active screen share at a time

### Audio Settings
1. Save user preferences to localStorage
2. Apply settings before joining the call
3. Provide visual feedback for active settings

### Notifications
1. Keep sounds subtle and brief
2. Allow users to disable sounds
3. Use visual indicators alongside audio cues

### Meetings Query
1. Always implement pagination for large datasets
2. Cache results when appropriate
3. Use specific endpoints (/scheduled, /completed) for better performance
4. Use /query endpoint for advanced filtering needs

---

## Troubleshooting

### Screen Sharing Not Working
- Verify browser supports `getDisplayMedia`
- Check that device is desktop (not mobile)
- Ensure user granted permissions
- Check console for permission errors

### No Audio Devices Detected
- Request microphone permissions
- Check browser security settings
- Verify device drivers are installed
- Try refreshing the page

### Recording Not Starting
- Verify admin permissions
- Check Stream API credentials
- Ensure sufficient bandwidth
- Check browser console for errors

### Permission Requests Not Showing
- Verify user is admin (check NEXT_PUBLIC_ADMIN_EMAILS)
- Ensure call is properly initialized
- Check that events are being emitted
- Verify WebSocket connection

---

## Future Enhancements

Potential features for future implementation:
- Virtual backgrounds using AI
- Beauty filters and effects
- Breakout rooms
- Live transcription
- Meeting analytics dashboard
- Enhanced recording features (cloud storage)
- Advanced noise cancellation with Krisp integration
- Simulcast for adaptive quality

---

## Support

For issues or questions:
1. Check the Stream.io documentation: https://getstream.io/video/docs/react/
2. Review the codebase comments
3. Check browser console for errors
4. Ensure all dependencies are up to date

## License

This implementation follows the same license as the main KCS App project.
