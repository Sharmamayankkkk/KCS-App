# App Permissions Documentation

**App Name:** KCS Meet  
**Package Name:** com.kcs.meet  
**Version:** 1.0.0  
**Last Updated:** December 27, 2024

This document explains all permissions required by KCS Meet, their purposes, and how they are used.

---

## Overview

KCS Meet requests only the permissions necessary for core video conferencing functionality. All permissions are requested at runtime with clear explanations, and the app provides graceful degradation when permissions are denied.

---

## Required Permissions

### 1. CAMERA Permission

**Android Manifest Declaration:**
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="false" />
```

**Purpose:**  
Enable video calling functionality by accessing the device's camera.

**When Requested:**  
- When joining a video meeting
- When turning on video in an ongoing meeting
- When setting up virtual backgrounds

**What Happens if Denied:**
- User can still join meetings with audio only
- Profile picture upload functionality unavailable
- Virtual backgrounds unavailable
- Audio-only participation is fully supported

**User-Facing Explanation:**  
"KCS Meet needs camera access to enable video during meetings. You can still join with audio only if you prefer."

**Can App Function Without It?**  
✅ Yes - Audio-only mode available

---

### 2. RECORD_AUDIO / MICROPHONE Permission

**Android Manifest Declaration:**
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

**Purpose:**  
Capture audio for voice communication during video calls.

**When Requested:**  
- When joining any meeting (video or audio)
- Essential for all meeting participation

**What Happens if Denied:**
- User cannot join meetings
- Cannot participate in any audio/video calls
- App suggests granting permission to use core features

**User-Facing Explanation:**  
"KCS Meet requires microphone access to enable audio communication during meetings. This is essential for participating in calls."

**Can App Function Without It?**  
❌ No - Core functionality requires audio

---

### 3. INTERNET Permission

**Android Manifest Declaration:**
```xml
<uses-permission android:name="android.permission.INTERNET" />
```

**Purpose:**  
Connect to KCS Meet servers for:
- Authentication
- Video/audio streaming
- Chat messaging
- Data synchronization
- API calls

**When Requested:**  
Automatically granted by system (no runtime prompt).

**What Happens if Denied:**  
Network connectivity unavailable (system-level denial only).

**User-Facing Explanation:**  
Not shown to user (normal permission).

**Can App Function Without It?**  
❌ No - All features require network connectivity

---

### 4. ACCESS_NETWORK_STATE Permission

**Android Manifest Declaration:**
```xml
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

**Purpose:**  
Check network connectivity status to:
- Detect WiFi vs cellular data
- Show offline/online status
- Adjust video quality based on connection
- Provide appropriate error messages

**When Requested:**  
Automatically granted by system (no runtime prompt).

**What Happens if Denied:**  
App cannot detect network status (system-level denial only).

**User-Facing Explanation:**  
Not shown to user (normal permission).

**Can App Function Without It?**  
⚠️ Partially - Core features work but without network status detection

---

### 5. FOREGROUND_SERVICE Permission

**Android Manifest Declaration:**
```xml
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION" 
                 android:minSdkVersion="34" />
```

**Purpose:**  
Maintain active call connection when app is in background:
- Keep video/audio streaming active
- Maintain WebRTC connection
- Continue receiving chat messages
- Show persistent notification during calls

**When Requested:**  
Automatically granted by system (no runtime prompt).

**What Happens if Denied:**  
Calls may disconnect when app goes to background.

**User-Facing Explanation:**  
Persistent notification shown: "KCS Meet - In a call"

**Can App Function Without It?**  
⚠️ Partially - Calls may not persist in background

---

### 6. VIBRATE Permission

**Android Manifest Declaration:**
```xml
<uses-permission android:name="android.permission.VIBRATE" />
```

**Purpose:**  
Provide haptic feedback for:
- Incoming call notifications
- Meeting started alerts
- Important in-app events

**When Requested:**  
Automatically granted by system (no runtime prompt).

**What Happens if Denied:**  
No vibration feedback (system-level denial only).

**User-Facing Explanation:**  
Not shown to user (normal permission).

**Can App Function Without It?**  
✅ Yes - All features work without vibration

---

### 7. WAKE_LOCK Permission

**Android Manifest Declaration:**
```xml
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

**Purpose:**  
Prevent device from sleeping during active calls:
- Keep screen on during video meetings
- Maintain CPU wake state for audio processing
- Prevent call disconnection due to device sleep

**When Requested:**  
Automatically granted by system (no runtime prompt).

**What Happens if Denied:**  
Device may sleep during calls, causing disconnection.

**User-Facing Explanation:**  
Not shown to user (normal permission).

**Can App Function Without It?**  
⚠️ Partially - Calls may disconnect if device sleeps

---

## Optional Permissions (Not Currently Requested)

These permissions are NOT requested by KCS Meet but may be added in future versions:

### WRITE_EXTERNAL_STORAGE (Not Used)
- **Status:** Not requested
- **Reason:** Using scoped storage (Android 10+) for recordings and downloads
- **Future Use:** None planned

### READ_EXTERNAL_STORAGE (Not Used)
- **Status:** Not requested
- **Reason:** Using photo picker API for profile pictures
- **Future Use:** None planned

### ACCESS_FINE_LOCATION (Not Used)
- **Status:** Not requested
- **Reason:** Only approximate location needed (from IP), not GPS
- **Future Use:** None planned

### BLUETOOTH / BLUETOOTH_CONNECT (Not Yet Used)
- **Status:** Not currently requested
- **Future Use:** Bluetooth headset support planned for v2.0

### CONTACTS (Not Used)
- **Status:** Not requested
- **Reason:** No contact integration planned
- **Future Use:** May add for contact-based meeting invites

### CALENDAR (Not Used)
- **Status:** Not requested
- **Future Use:** Calendar integration for scheduled meetings (v2.0)

---

## Permission Request Flow

### First-Time Permission Request

1. **Context Provided First**
   - Show explanation dialog before requesting permission
   - Explain why permission is needed
   - Provide examples of how permission will be used

2. **System Permission Dialog**
   - Android system dialog appears
   - User can Allow/Deny
   - User can select "Don't ask again"

3. **Response Handling**
   - **Granted:** Feature enabled
   - **Denied:** Show alternative options
   - **Denied Permanently:** Show settings link

### Example: Camera Permission Flow

```
User clicks "Turn On Video"
  ↓
App checks permission status
  ↓
If not granted:
  → Show explanation: "Camera needed for video"
  → User clicks "OK"
  → System permission dialog appears
  → User allows/denies
```

---

## Permission Management

### Checking Permissions

```kotlin
// Check if permission is granted
if (ContextCompat.checkSelfPermission(context, 
    Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
    // Permission granted
    enableCamera()
} else {
    // Request permission
    requestCameraPermission()
}
```

### Requesting Permissions

```kotlin
// Request permission with rationale
ActivityCompat.requestPermissions(
    activity,
    arrayOf(Manifest.permission.CAMERA),
    CAMERA_PERMISSION_REQUEST_CODE
)
```

### Handling Denial

```kotlin
override fun onRequestPermissionsResult(
    requestCode: Int,
    permissions: Array<out String>,
    grantResults: IntArray
) {
    when (requestCode) {
        CAMERA_PERMISSION_REQUEST_CODE -> {
            if (grantResults.isEmpty() || 
                grantResults[0] != PackageManager.PERMISSION_GRANTED) {
                // Permission denied
                showAudioOnlyOption()
            } else {
                // Permission granted
                enableCamera()
            }
        }
    }
}
```

---

## User Settings

### In-App Permission Management

Users can manage permissions from:

**App Settings:**
1. Open KCS Meet
2. Go to Profile/Settings
3. Navigate to Privacy & Permissions
4. View permission status
5. Link to system settings for each permission

**System Settings:**
1. Open device Settings
2. Apps > KCS Meet
3. Permissions
4. Toggle individual permissions

---

## Permission Rationale

### Why Each Permission Is Essential

| Permission | Essential? | Rationale |
|------------|-----------|-----------|
| Camera | No | Audio-only option available |
| Microphone | Yes | Required for any call participation |
| Internet | Yes | Cloud-based service |
| Network State | Recommended | For optimal performance |
| Foreground Service | Recommended | For background call handling |
| Vibrate | No | Nice to have for notifications |
| Wake Lock | Recommended | Prevents call disconnection |

---

## Privacy Considerations

### Data Access
- **Camera:** Video frames processed in real-time, not stored unless recording enabled
- **Microphone:** Audio processed in real-time, not stored unless recording enabled
- **Network:** All data encrypted in transit (TLS 1.2+)

### Data Storage
- No media files stored without explicit user action (recording)
- Recording files encrypted at rest
- Users can delete recordings at any time

### Data Sharing
- Camera/microphone data shared only with call participants
- No data sent to third parties except service providers
- No video/audio used for advertising or analytics

---

## Troubleshooting

### Permission Issues

**Camera Not Working:**
1. Check if permission granted in Settings
2. Restart app after granting permission
3. Check if another app is using camera
4. Restart device if issue persists

**Microphone Not Working:**
1. Check if permission granted
2. Test microphone in phone's voice recorder
3. Check if headphones/Bluetooth connected
4. Restart app

**Call Disconnects in Background:**
1. Check battery optimization settings
2. Allow background data for KCS Meet
3. Disable battery saver during calls
4. Add KCS Meet to unrestricted apps list

---

## Developer Notes

### Testing Permissions

**Grant Permission:**
```bash
adb shell pm grant com.kcs.meet android.permission.CAMERA
```

**Revoke Permission:**
```bash
adb shell pm revoke com.kcs.meet android.permission.CAMERA
```

**Reset Permissions:**
```bash
adb shell pm reset-permissions
```

### Best Practices Followed

1. ✅ Request permissions at runtime (Android 6.0+)
2. ✅ Provide clear rationale before requesting
3. ✅ Handle denial gracefully
4. ✅ Don't request unnecessary permissions
5. ✅ Group related permission requests
6. ✅ Request in context of user action
7. ✅ Provide alternative flows when denied
8. ✅ Link to settings for permanently denied permissions

---

## Future Permission Requests

Potential permissions for future features:

| Permission | Feature | Version |
|------------|---------|---------|
| BLUETOOTH_CONNECT | Bluetooth headset support | v2.0 |
| READ_CALENDAR | Calendar integration | v2.0 |
| WRITE_CALENDAR | Add meetings to calendar | v2.0 |
| CONTACTS | Contact-based invites | v2.0 |
| POST_NOTIFICATIONS | Android 13+ notification permission | v1.1 |

---

## Compliance

### Google Play Requirements
- ✅ All permissions declared in manifest
- ✅ Sensitive permissions requested at runtime
- ✅ Clear explanations provided
- ✅ Graceful degradation when denied
- ✅ No deceptive permission requests

### Privacy Laws
- ✅ GDPR compliant - permissions explained clearly
- ✅ CCPA compliant - users can control data collection
- ✅ Indian IT Act compliant - explicit consent obtained

---

## User Education

### Help Center Articles

**"Why Does KCS Meet Need Camera Access?"**
- Video calling requires camera access
- You can join with audio only
- Camera is only active during video calls
- We never record without your permission

**"Managing App Permissions"**
- How to grant permissions
- How to revoke permissions
- What happens when permissions are denied
- How to change permissions later

---

## Contact Support

For permission-related issues:

**Email:** divineconnectionkcs@gmail.com  
**In-App:** Settings > Help & Support > Permissions Help  
**Website:** https://meet.krishnaconsciousnesssociety.com/support

**Response Time:** Within 24 hours

---

**Last Updated:** December 27, 2024  
**Document Version:** 1.0  
**App Version:** 1.0.0
