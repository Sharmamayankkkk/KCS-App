# Deep Linking & App Links Implementation Guide

**App Name:** KCS Meet  
**Package Name:** com.kcs.meet  
**Last Updated:** December 27, 2024

This document provides comprehensive guidance on implementing deep links and Android App Links to enable meeting links to open directly in the KCS Meet app instead of the browser.

---

## Overview

**Deep Linking** allows external links to open content directly within the KCS Meet app. When a user clicks on a meeting link shared via WhatsApp, email, SMS, or any other medium, the app will launch and navigate to the meeting directly, providing a seamless user experience.

### Types of Links Supported

1. **Meeting Links**: `https://meet.krishnaconsciousnesssociety.com/meeting/[meeting-id]`
2. **Join Links**: `https://meet.krishnaconsciousnesssociety.com/join/[meeting-id]`
3. **Scheduled Meeting**: `https://meet.krishnaconsciousnesssociety.com/meeting/scheduled/[meeting-id]`
4. **Profile Links**: `https://meet.krishnaconsciousnesssociety.com/profile/[user-id]`
5. **Recording Links**: `https://meet.krishnaconsciousnesssociety.com/recordings/[recording-id]`

---

## Benefits

✅ **Seamless User Experience**: No need to copy meeting IDs manually  
✅ **One-Click Join**: Click link → Open app → Join meeting  
✅ **Better Engagement**: Reduce friction in joining meetings  
✅ **Professional**: Matches behavior of competitors (Zoom, Google Meet)  
✅ **Cross-Platform**: Works on Android, iOS, and falls back to web  

---

## Implementation Strategy

### Phase 1: Deep Links (Custom URL Scheme)
**Timeline:** Immediate (can be implemented now)  
**Complexity:** Low  
**Android Support:** All versions

### Phase 2: Android App Links (HTTPS URLs)
**Timeline:** Before production launch (required)  
**Complexity:** Medium  
**Android Support:** Android 6.0+ (API 23+)

### Phase 3: iOS Universal Links
**Timeline:** iOS app development  
**Complexity:** Medium  
**iOS Support:** iOS 9+

---

## Android Implementation

### 1. Deep Links (Custom URL Scheme)

#### 1.1 URL Scheme Format

**Custom Scheme:** `kcsmeet://`

**Supported URLs:**
```
kcsmeet://meeting/[meeting-id]
kcsmeet://join/[meeting-id]
kcsmeet://profile/[user-id]
kcsmeet://recording/[recording-id]
```

**Example:**
```
kcsmeet://meeting/abc-123-xyz
```

#### 1.2 Android Manifest Configuration

Add the following to your main activity in `AndroidManifest.xml`:

```xml
<activity
    android:name=".MainActivity"
    android:launchMode="singleTask"
    android:exported="true">
    
    <!-- Default launcher intent -->
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
    
    <!-- Deep Link: Custom Scheme -->
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        
        <data
            android:scheme="kcsmeet"
            android:host="meeting"
            android:pathPrefix="/" />
    </intent-filter>
    
    <!-- Additional paths for different features -->
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        
        <data
            android:scheme="kcsmeet"
            android:host="join"
            android:pathPrefix="/" />
    </intent-filter>
    
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        
        <data
            android:scheme="kcsmeet"
            android:host="profile"
            android:pathPrefix="/" />
    </intent-filter>
    
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        
        <data
            android:scheme="kcsmeet"
            android:host="recording"
            android:pathPrefix="/" />
    </intent-filter>
</activity>
```

#### 1.3 Handling Deep Links in Code

**React Native (Next.js with Capacitor/React Native Web View):**

```typescript
// app/hooks/useDeepLinking.ts
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const useDeepLinking = () => {
  const router = useRouter();

  useEffect(() => {
    // Handle deep link on app launch
    const handleDeepLink = (url: string) => {
      console.log('Deep link received:', url);
      
      // Parse the URL
      const parsedUrl = new URL(url);
      const scheme = parsedUrl.protocol.replace(':', '');
      const host = parsedUrl.hostname;
      const path = parsedUrl.pathname;
      
      // Route based on the deep link
      if (scheme === 'kcsmeet') {
        if (host === 'meeting' || host === 'join') {
          const meetingId = path.replace('/', '');
          router.push(`/meeting/${meetingId}`);
        } else if (host === 'profile') {
          const userId = path.replace('/', '');
          router.push(`/profile/${userId}`);
        } else if (host === 'recording') {
          const recordingId = path.replace('/', '');
          router.push(`/recordings/${recordingId}`);
        }
      }
    };

    // Listen for incoming deep links
    if (typeof window !== 'undefined') {
      // Check if opened via deep link
      const currentUrl = window.location.href;
      if (currentUrl.startsWith('kcsmeet://')) {
        handleDeepLink(currentUrl);
      }

      // Listen for app state changes (Android)
      const handleAppStateChange = (event: any) => {
        if (event.url) {
          handleDeepLink(event.url);
        }
      };

      // Add event listener for deep links (if using React Native)
      // Linking.addEventListener('url', handleAppStateChange);
      
      return () => {
        // Cleanup
        // Linking.removeEventListener('url', handleAppStateChange);
      };
    }
  }, [router]);
};
```

**Usage in App:**

```typescript
// app/layout.tsx or app/page.tsx
'use client';

import { useDeepLinking } from '@/hooks/useDeepLinking';

export default function RootLayout() {
  useDeepLinking(); // Initialize deep linking
  
  return (
    // Your app layout
  );
}
```

#### 1.4 Testing Custom Scheme Deep Links

**Via ADB (Android Debug Bridge):**

```bash
# Test meeting deep link
adb shell am start -W -a android.intent.action.VIEW -d "kcsmeet://meeting/abc-123-xyz" com.kcs.meet

# Test join deep link
adb shell am start -W -a android.intent.action.VIEW -d "kcsmeet://join/abc-123-xyz" com.kcs.meet

# Test profile deep link
adb shell am start -W -a android.intent.action.VIEW -d "kcsmeet://profile/user-123" com.kcs.meet
```

**Via HTML Link (Test in Browser):**

```html
<a href="kcsmeet://meeting/abc-123-xyz">Join Meeting</a>
```

---

### 2. Android App Links (HTTPS URLs)

Android App Links allow your app to be designated as the default handler for your HTTPS URLs, providing a more seamless experience.

#### 2.1 URL Format

**HTTPS URLs:**
```
https://meet.krishnaconsciousnesssociety.com/meeting/[meeting-id]
https://meet.krishnaconsciousnesssociety.com/join/[meeting-id]
https://meet.krishnaconsciousnesssociety.com/profile/[user-id]
https://meet.krishnaconsciousnesssociety.com/recordings/[recording-id]
```

**Example:**
```
https://meet.krishnaconsciousnesssociety.com/meeting/abc-123-xyz
```

#### 2.2 Android Manifest Configuration

Add App Links intent filters to `AndroidManifest.xml`:

```xml
<activity
    android:name=".MainActivity"
    android:launchMode="singleTask"
    android:exported="true">
    
    <!-- App Link: Meeting -->
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        
        <data
            android:scheme="https"
            android:host="meet.krishnaconsciousnesssociety.com"
            android:pathPrefix="/meeting/" />
    </intent-filter>
    
    <!-- App Link: Join -->
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        
        <data
            android:scheme="https"
            android:host="meet.krishnaconsciousnesssociety.com"
            android:pathPrefix="/join/" />
    </intent-filter>
    
    <!-- App Link: Profile -->
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        
        <data
            android:scheme="https"
            android:host="meet.krishnaconsciousnesssociety.com"
            android:pathPrefix="/profile/" />
    </intent-filter>
    
    <!-- App Link: Recordings -->
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        
        <data
            android:scheme="https"
            android:host="meet.krishnaconsciousnesssociety.com"
            android:pathPrefix="/recordings/" />
    </intent-filter>
    
    <!-- Support for www subdomain -->
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        
        <data
            android:scheme="https"
            android:host="www.meet.krishnaconsciousnesssociety.com"
            android:pathPattern="/meeting/.*" />
        <data
            android:scheme="https"
            android:host="www.meet.krishnaconsciousnesssociety.com"
            android:pathPattern="/join/.*" />
    </intent-filter>
</activity>
```

**Key Points:**
- `android:autoVerify="true"` enables automatic verification
- Must support both HTTP and HTTPS
- Must include `BROWSABLE` category

#### 2.3 Digital Asset Links (assetlinks.json)

To verify your app links, you need to host a Digital Asset Links JSON file on your domain.

**File Location:**
```
https://meet.krishnaconsciousnesssociety.com/.well-known/assetlinks.json
```

**File Content:**

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.kcs.meet",
      "sha256_cert_fingerprints": [
        "YOUR_APP_SHA256_FINGERPRINT_HERE"
      ]
    }
  }
]
```

**How to Get SHA256 Fingerprint:**

**For Debug Build:**
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**For Release Build:**
```bash
keytool -list -v -keystore /path/to/your/release.keystore -alias your-key-alias
```

**Or via Play Console:**
1. Go to Play Console
2. Select your app
3. Setup → App signing
4. Copy SHA-256 certificate fingerprint

**Example assetlinks.json:**

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.kcs.meet",
      "sha256_cert_fingerprints": [
        "14:6D:E9:83:C5:73:06:50:D8:EE:B9:95:2F:34:FC:64:16:A0:83:42:E6:1D:BE:A8:8A:04:96:B2:3F:CF:44:E5"
      ]
    }
  }
]
```

#### 2.4 Hosting assetlinks.json

**Option 1: Vercel Configuration**

Create `public/.well-known/assetlinks.json`:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.kcs.meet",
      "sha256_cert_fingerprints": [
        "YOUR_SHA256_FINGERPRINT"
      ]
    }
  }
]
```

Add to `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/.well-known/assetlinks.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

**Option 2: Manual Server Configuration**

For Apache (`.htaccess`):
```apache
<Files "assetlinks.json">
    Header set Content-Type "application/json"
    Header set Access-Control-Allow-Origin "*"
</Files>
```

For Nginx:
```nginx
location /.well-known/assetlinks.json {
    default_type application/json;
    add_header Access-Control-Allow-Origin *;
}
```

#### 2.5 Verifying App Links Setup

**Google's Statement List Generator:**
https://developers.google.com/digital-asset-links/tools/generator

**Test App Links:**

```bash
# Test if assetlinks.json is accessible
curl https://meet.krishnaconsciousnesssociety.com/.well-known/assetlinks.json

# Test deep link on device
adb shell am start -W -a android.intent.action.VIEW -d "https://meet.krishnaconsciousnesssociety.com/meeting/abc-123-xyz" com.kcs.meet

# Check App Links verification status
adb shell dumpsys package domain-preferred-apps
```

**Manual Verification Steps:**

1. Visit: https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://meet.krishnaconsciousnesssociety.com&relation=delegate_permission/common.handle_all_urls

2. Should return your app's package name and fingerprint

---

### 3. Handling Deep Links in Your App

#### 3.1 Next.js App Router Configuration

Create a dedicated handler for deep links:

```typescript
// app/deep-link-handler.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function DeepLinkHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if we have a deep link on initial load
    const handleInitialUrl = () => {
      // For web
      if (typeof window !== 'undefined') {
        const url = window.location.href;
        
        // Check if it's a deep link URL
        if (url.includes('meeting/') || url.includes('join/')) {
          // Already handled by Next.js routing
          return;
        }
      }
    };

    handleInitialUrl();
  }, [router]);

  return null; // This component doesn't render anything
}
```

#### 3.2 Enhanced Meeting Page

Update your meeting page to handle direct access:

```typescript
// app/meeting/[id]/page.tsx
'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import MeetingRoom from '@/components/MeetingRoom';

export default function MeetingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const [autoJoin, setAutoJoin] = useState(false);
  
  const meetingId = params.id as string;

  useEffect(() => {
    // Check if this is a deep link with auto-join parameter
    const shouldAutoJoin = searchParams.get('autoJoin') === 'true';
    setAutoJoin(shouldAutoJoin);
    
    // Log analytics for deep link usage
    if (shouldAutoJoin) {
      console.log('User joined via deep link:', meetingId);
      // Track in your analytics
      // analytics.track('deep_link_join', { meetingId });
    }
  }, [meetingId, searchParams]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!user) {
    // Redirect to sign-in, but preserve the meeting ID for after login
    const returnUrl = `/meeting/${meetingId}?autoJoin=true`;
    window.location.href = `/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`;
    return null;
  }

  return (
    <div>
      <MeetingRoom 
        meetingId={meetingId} 
        autoJoin={autoJoin}
      />
    </div>
  );
}
```

#### 3.3 Deep Link Generation

Create a utility to generate shareable meeting links:

```typescript
// lib/deepLinkUtils.ts

export interface DeepLinkOptions {
  meetingId: string;
  type?: 'meeting' | 'join' | 'scheduled';
  autoJoin?: boolean;
  userName?: string;
}

export class DeepLinkGenerator {
  private static baseUrl = 'https://meet.krishnaconsciousnesssociety.com';
  private static customScheme = 'kcsmeet://';

  /**
   * Generate HTTPS App Link (preferred)
   */
  static generateAppLink(options: DeepLinkOptions): string {
    const { meetingId, type = 'meeting', autoJoin = true } = options;
    
    let url = `${this.baseUrl}/${type}/${meetingId}`;
    
    const params = new URLSearchParams();
    if (autoJoin) params.set('autoJoin', 'true');
    if (options.userName) params.set('name', options.userName);
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    return url;
  }

  /**
   * Generate Custom Scheme Deep Link (fallback)
   */
  static generateDeepLink(options: DeepLinkOptions): string {
    const { meetingId, type = 'meeting' } = options;
    return `${this.customScheme}${type}/${meetingId}`;
  }

  /**
   * Generate Universal Link (works on web and app)
   */
  static generateUniversalLink(options: DeepLinkOptions): {
    webUrl: string;
    appLink: string;
    deepLink: string;
    shareText: string;
  } {
    const appLink = this.generateAppLink(options);
    const deepLink = this.generateDeepLink(options);
    
    return {
      webUrl: appLink,
      appLink: appLink,
      deepLink: deepLink,
      shareText: this.generateShareText(appLink, options.meetingId),
    };
  }

  /**
   * Generate share text for different platforms
   */
  private static generateShareText(url: string, meetingId: string): string {
    return `Join my KCS Meet video call!\n\nMeeting ID: ${meetingId}\nLink: ${url}\n\nDownload KCS Meet: https://play.google.com/store/apps/details?id=com.kcs.meet`;
  }

  /**
   * Create QR code-friendly URL
   */
  static generateQRCodeUrl(meetingId: string): string {
    return `${this.baseUrl}/join/${meetingId}?source=qr`;
  }
}

// Usage examples:
// const link = DeepLinkGenerator.generateAppLink({ meetingId: 'abc-123' });
// const universal = DeepLinkGenerator.generateUniversalLink({ meetingId: 'abc-123', userName: 'John' });
```

#### 3.4 Share Meeting Component

```typescript
// components/ShareMeetingModal.tsx
'use client';

import { useState } from 'react';
import { Share2, Copy, QrCode, MessageSquare, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeepLinkGenerator } from '@/lib/deepLinkUtils';

interface ShareMeetingModalProps {
  meetingId: string;
  meetingTitle?: string;
}

export function ShareMeetingModal({ meetingId, meetingTitle }: ShareMeetingModalProps) {
  const [copied, setCopied] = useState(false);

  const shareLink = DeepLinkGenerator.generateAppLink({ 
    meetingId, 
    autoJoin: true 
  });

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = `Join my KCS Meet: ${meetingTitle || meetingId}\n${shareLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  const handleEmailShare = () => {
    const subject = `Join KCS Meet: ${meetingTitle || meetingId}`;
    const body = `You're invited to join a KCS Meet video conference.\n\nMeeting Link: ${shareLink}\n\nMeeting ID: ${meetingId}`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join KCS Meet: ${meetingTitle || meetingId}`,
          text: 'Join my video meeting',
          url: shareLink,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">Share Meeting</h3>
      
      <div className="flex items-center gap-2 rounded-lg border bg-gray-50 p-3">
        <code className="flex-1 text-sm">{shareLink}</code>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleCopyLink}
        >
          {copied ? 'Copied!' : <Copy className="size-4" />}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={handleWhatsAppShare}>
          <MessageSquare className="mr-2 size-4" />
          WhatsApp
        </Button>
        
        <Button variant="outline" onClick={handleEmailShare}>
          <Mail className="mr-2 size-4" />
          Email
        </Button>
        
        {navigator.share && (
          <Button variant="outline" onClick={handleNativeShare} className="col-span-2">
            <Share2 className="mr-2 size-4" />
            More Options
          </Button>
        )}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500">Meeting ID: {meetingId}</p>
      </div>
    </div>
  );
}
```

---

## Testing Checklist

### Pre-Launch Testing

- [ ] Test custom scheme deep links (kcsmeet://)
- [ ] Test HTTPS app links (https://meet.krishnaconsciousnesssociety.com/)
- [ ] Verify assetlinks.json is accessible and valid
- [ ] Test on multiple Android versions (8, 9, 10, 11, 12, 13, 14)
- [ ] Test with app installed vs not installed
- [ ] Test with user logged in vs logged out
- [ ] Test from different sources:
  - [ ] WhatsApp
  - [ ] Email clients (Gmail, Outlook)
  - [ ] SMS
  - [ ] Browser (Chrome, Firefox, Samsung Internet)
  - [ ] Other apps

### Deep Link Scenarios

**Scenario 1: App Installed, User Logged In**
- Click meeting link → App opens → Meeting loads immediately

**Scenario 2: App Installed, User Logged Out**
- Click meeting link → App opens → Login screen → After login → Meeting loads

**Scenario 3: App Not Installed**
- Click meeting link → Opens in browser → Shows "Download App" prompt → Can join via web or download app

**Scenario 4: Multiple Apps Support Same Domain**
- Click meeting link → Android shows app chooser → User selects KCS Meet → App opens

---

## User Flow Examples

### Example 1: WhatsApp Meeting Invitation

```
1. Host creates meeting in KCS Meet app
2. Host clicks "Share Meeting"
3. Host selects "WhatsApp"
4. WhatsApp opens with pre-filled message:
   "Join my KCS Meet video call!
   
   Meeting ID: abc-123-xyz
   Link: https://meet.krishnaconsciousnesssociety.com/meeting/abc-123-xyz
   
   Download: https://play.google.com/store/apps/details?id=com.kcs.meet"
5. Host sends to contacts
6. Recipient clicks link
7. If app installed: App opens directly to meeting
8. If app not installed: Web page opens with join options
```

### Example 2: Email Meeting Invitation

```
1. Scheduled meeting created with calendar
2. Email sent with meeting details
3. Email contains clickable link
4. Recipient clicks link in email
5. Android intercepts link
6. KCS Meet app opens
7. Meeting setup screen appears
8. User clicks "Join" → Enters meeting
```

---

## Troubleshooting

### Issue: Links Open in Browser Instead of App

**Causes:**
1. assetlinks.json not accessible
2. SHA256 fingerprint mismatch
3. App Links verification failed
4. User manually set browser as default handler

**Solutions:**
1. Verify assetlinks.json URL: `curl https://meet.krishnaconsciousnesssociety.com/.well-known/assetlinks.json`
2. Check SHA256 fingerprint matches
3. Clear app defaults: Settings → Apps → KCS Meet → Open by default → Clear defaults
4. Reinstall app to trigger verification

### Issue: App Opens But Doesn't Navigate to Meeting

**Causes:**
1. Deep link handler not implemented correctly
2. Router not processing URL parameters
3. Authentication required but not handled

**Solutions:**
1. Check console logs for deep link URL
2. Verify routing logic in deep link handler
3. Implement authentication redirect with return URL

### Issue: App Chooser Always Appears

**Causes:**
1. Other apps also handle same domain
2. App Links verification not completed
3. User disabled automatic opening

**Solutions:**
1. Ensure App Links verification passes
2. Check if other apps claim same domain
3. Ask user to set KCS Meet as default handler

---

## Implementation Checklist

### Phase 1: Setup (Week 1)
- [ ] Add deep link intent filters to AndroidManifest.xml
- [ ] Implement deep link handler in app
- [ ] Test custom scheme links (kcsmeet://)
- [ ] Update meeting creation to generate deep links

### Phase 2: App Links (Week 2)
- [ ] Generate SHA256 fingerprint
- [ ] Create assetlinks.json file
- [ ] Host assetlinks.json on domain
- [ ] Add App Links intent filters with autoVerify
- [ ] Test HTTPS app links
- [ ] Verify with Google's tools

### Phase 3: User Experience (Week 3)
- [ ] Implement share meeting dialog
- [ ] Add deep link analytics tracking
- [ ] Handle authentication redirects
- [ ] Test all user flows
- [ ] Add QR code generation for meetings

### Phase 4: Polish (Week 4)
- [ ] Add loading states for deep link navigation
- [ ] Implement error handling for invalid links
- [ ] Add fallback for web browser
- [ ] Update documentation
- [ ] Train support team on troubleshooting

---

## Analytics & Monitoring

### Track Deep Link Usage

```typescript
// lib/analytics.ts
export const trackDeepLink = (data: {
  source: 'deep_link' | 'app_link' | 'web';
  meetingId: string;
  success: boolean;
  errorMessage?: string;
}) => {
  // Send to your analytics service
  console.log('Deep link event:', data);
  
  // Example: Firebase Analytics
  // analytics().logEvent('deep_link_used', data);
  
  // Example: Custom analytics
  // fetch('/api/analytics', {
  //   method: 'POST',
  //   body: JSON.stringify(data),
  // });
};
```

### Key Metrics to Monitor

1. **Deep Link Success Rate**: % of deep links that successfully open the app
2. **Time to Join**: Time from link click to meeting joined
3. **Drop-off Rate**: % of users who click link but don't join
4. **Source Breakdown**: Which platforms drive most deep link usage (WhatsApp, Email, SMS)
5. **App vs Web**: % opening in app vs browser

---

## Documentation for Users

### Help Article: "Joining Meetings via Link"

**Title:** How to Join KCS Meet via Meeting Link

**Content:**

When someone shares a KCS Meet link with you, you can join with one click:

**On Android:**
1. Tap the meeting link
2. KCS Meet app will open automatically
3. Tap "Join Meeting"
4. You're in!

**If Link Opens in Browser:**
1. Tap "Open in App" button
2. Or download KCS Meet from Play Store
3. After installing, tap the link again

**Troubleshooting:**
- Make sure KCS Meet app is installed
- Check that you're logged into the app
- Try tapping the link again after logging in

---

## Best Practices

### Do's ✅
- Always test deep links on actual devices
- Support both custom scheme and HTTPS links
- Handle authentication gracefully
- Provide fallback to web if app not installed
- Show loading states during navigation
- Log analytics for deep link usage
- Test on multiple Android versions and manufacturers

### Don'ts ❌
- Don't assume app is always installed
- Don't forget to verify assetlinks.json
- Don't ignore authentication requirements
- Don't break the back button navigation
- Don't forget to handle expired/invalid meeting IDs
- Don't open app without user consent (respect app chooser)

---

## Security Considerations

### Validate Meeting IDs

```typescript
// lib/validation.ts
export const validateMeetingId = (meetingId: string): boolean => {
  // Validate format
  const meetingIdPattern = /^[a-zA-Z0-9\-_]{5,50}$/;
  if (!meetingIdPattern.test(meetingId)) {
    return false;
  }
  
  // Additional validation can be done against database
  return true;
};
```

### Prevent Deep Link Exploits

1. **Validate all parameters** from deep links
2. **Sanitize input** before using in queries
3. **Check authentication** before allowing access
4. **Rate limit** deep link processing
5. **Log suspicious activity** (e.g., invalid meeting IDs)

---

## Future Enhancements

### Planned Features

1. **Smart Banners**: Show app download banner on web
2. **Deferred Deep Linking**: Remember meeting ID during app install
3. **Dynamic Links**: Firebase Dynamic Links for advanced routing
4. **Branch.io Integration**: For attribution and better deep linking
5. **QR Codes**: Generate QR codes for meeting links
6. **Universal Links (iOS)**: When iOS app is developed
7. **Desktop Deep Links**: For desktop app (future)

---

## Support & Resources

**Documentation:**
- Android App Links: https://developer.android.com/training/app-links
- Digital Asset Links: https://developers.google.com/digital-asset-links

**Tools:**
- Statement List Generator: https://developers.google.com/digital-asset-links/tools/generator
- App Links Assistant (Android Studio): Tools → App Links Assistant

**Contact:**
- Development Team: dev@krishnaconsciousnesssociety.com
- Support: divineconnectionkcs@gmail.com

---

**Last Updated:** December 27, 2024  
**Document Version:** 1.0  
**Implementation Status:** 🔄 In Progress
