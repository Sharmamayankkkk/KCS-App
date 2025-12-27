# Data Safety - Google Play Store

**App Name:** KCS Meet  
**Package Name:** com.kcs.meet  
**Developer:** Krishna Consciousness Society  
**Last Updated:** December 27, 2024

This document provides detailed information about data collection and handling practices for the Google Play Store Data Safety section.

---

## Summary

KCS Meet collects and processes user data to provide video conferencing services for spiritual communities. All data is encrypted in transit using TLS 1.2+. We do not sell user data to third parties or use it for advertising purposes.

---

## Data Collection Overview

### Does your app collect or share any of the required user data types?
**Answer:** YES

---

## Data Types Collected

### 1. Personal Information

#### 1.1 Name
- **Collected:** YES
- **Purpose:** 
  - Account functionality
  - App functionality
  - Personalization
- **Collection Method:** User provides directly during registration
- **Data Shared:** NO
- **Encrypted in Transit:** YES
- **User Can Request Deletion:** YES

#### 1.2 Email Address
- **Collected:** YES
- **Purpose:**
  - Account functionality
  - App functionality
  - Account management
- **Collection Method:** User provides directly during registration
- **Data Shared:** NO
- **Encrypted in Transit:** YES
- **User Can Request Deletion:** YES

#### 1.3 User IDs
- **Collected:** YES
- **Purpose:**
  - Account functionality
  - App functionality
  - Analytics
- **Collection Method:** Auto-generated upon account creation
- **Data Shared:** NO
- **Encrypted in Transit:** YES
- **User Can Request Deletion:** YES

### 2. Financial Information

#### 2.1 User Payment Info
- **Collected:** YES (processed through Cashfree, not stored by us)
- **Purpose:**
  - App functionality (Super Chat donations)
- **Collection Method:** User provides during payment
- **Data Shared:** YES (with payment processor Cashfree only)
- **Encrypted in Transit:** YES
- **User Can Request Deletion:** Limited (retained for 7 years for tax compliance)

#### 2.2 Purchase History
- **Collected:** YES
- **Purpose:**
  - App functionality
  - Analytics
- **Collection Method:** Auto-recorded during transactions
- **Data Shared:** NO
- **Encrypted in Transit:** YES
- **User Can Request Deletion:** Limited (retained for 7 years for tax compliance)

### 3. Location

#### 3.1 Approximate Location
- **Collected:** YES
- **Purpose:**
  - App functionality (regional content delivery)
  - Analytics
- **Collection Method:** Derived from IP address
- **Data Shared:** NO
- **Encrypted in Transit:** YES
- **User Can Request Deletion:** YES

**Note:** We do NOT collect precise location (GPS coordinates).

### 4. Messages

#### 4.1 Other In-App Messages
- **Collected:** YES
- **Purpose:**
  - App functionality (in-meeting chat)
- **Collection Method:** User sends messages during meetings
- **Data Shared:** NO
- **Encrypted in Transit:** YES
- **User Can Request Deletion:** YES

### 5. Photos and Videos

#### 5.1 Photos
- **Collected:** YES (optional, for profile pictures only)
- **Purpose:**
  - App functionality
  - Personalization
- **Collection Method:** User uploads voluntarily
- **Data Shared:** NO
- **Encrypted in Transit:** YES
- **User Can Request Deletion:** YES

### 6. Audio Files

#### 6.1 Voice or Sound Recordings
- **Collected:** YES (during meetings, only when recording is enabled)
- **Purpose:**
  - App functionality (meeting recordings)
- **Collection Method:** Recorded when host enables recording feature
- **Data Shared:** NO
- **Encrypted in Transit:** YES
- **User Can Request Deletion:** YES

**Note:** Audio is only stored when meeting recording is explicitly enabled by meeting host. Real-time audio during meetings is not stored.

### 7. Files and Docs

#### 7.1 Files and Docs
- **Collected:** NO
- **Purpose:** N/A
- **Collection Method:** N/A
- **Data Shared:** NO

### 8. App Activity

#### 8.1 App Interactions
- **Collected:** YES
- **Purpose:**
  - Analytics
  - App functionality
- **Collection Method:** Auto-collected during app usage
- **Data Shared:** NO
- **Encrypted in Transit:** YES
- **User Can Request Deletion:** YES

### 9. App Info and Performance

#### 9.1 Crash Logs
- **Collected:** YES
- **Purpose:**
  - Analytics
  - App functionality improvement
- **Collection Method:** Auto-collected when app crashes
- **Data Shared:** YES (with Firebase Crashlytics)
- **Encrypted in Transit:** YES
- **User Can Request Deletion:** YES

#### 9.2 Diagnostics
- **Collected:** YES
- **Purpose:**
  - Analytics
  - App functionality improvement
- **Collection Method:** Auto-collected during usage
- **Data Shared:** NO
- **Encrypted in Transit:** YES
- **User Can Request Deletion:** YES

### 10. Device or Other IDs

#### 10.1 Device or Other IDs
- **Collected:** YES
- **Purpose:**
  - App functionality
  - Analytics
  - Fraud prevention and security
- **Collection Method:** Auto-collected
- **Data Shared:** NO
- **Encrypted in Transit:** YES
- **User Can Request Deletion:** YES

---

## Data Types NOT Collected

The following data types are **NOT** collected by KCS Meet:

- ❌ Address
- ❌ Phone Number
- ❌ Race and Ethnicity
- ❌ Political or Religious Beliefs
- ❌ Sexual Orientation
- ❌ Credit Score
- ❌ Other Financial Info
- ❌ Precise Location (GPS)
- ❌ Web Browsing History
- ❌ Emails (email messages, not email address)
- ❌ SMS or MMS
- ❌ Videos (except meeting recordings when explicitly enabled)
- ❌ Music Files
- ❌ Other Audio Files
- ❌ Health Info
- ❌ Fitness Info
- ❌ Contacts
- ❌ Calendar Events
- ❌ Search History
- ❌ Other User Content

---

## Security Practices

### Is all of the user data collected by your app encrypted in transit?
**Answer:** YES

**Details:**
- All data transmission uses TLS 1.2 or higher encryption
- WebRTC connections use DTLS-SRTP for media encryption
- API calls use HTTPS only
- No unencrypted HTTP connections

### Encryption at Rest
- User credentials hashed with bcrypt
- Sensitive database fields encrypted using AES-256
- Payment information never stored (processed by PCI-DSS compliant payment gateway)

---

## Data Deletion

### Do you provide a way for users to request that their data is deleted?
**Answer:** YES

### Deletion Methods:

**1. In-App Deletion:**
- Settings > Account > Delete Account
- Immediate processing, complete within 30 days

**2. Web Portal:**
- Visit: https://meet.krishnaconsciousnesssociety.com/account/delete
- Follow the guided deletion process

**3. Email Request:**
- Send email to: divineconnectionkcs@gmail.com
- Subject: "Data Deletion Request"
- Include registered email address
- Processing time: 7 business days

### Data Deletion URL:
https://meet.krishnaconsciousnesssociety.com/account/delete

### What Gets Deleted:
- Profile information (name, email, photo)
- Meeting participation history
- Chat messages
- Poll responses
- Account credentials

### What Is Retained (Legal Requirements):
- Payment transaction records (7 years for tax compliance)
- Anonymized analytics data
- Backup copies (deleted within 90 days)

---

## Account Creation Methods

### Which of the following methods of account creation does your app support?

**Selected Method:** Email and Password

**Details:**
- Users create accounts using email address and password
- Password requirements: Minimum 8 characters, complexity enforced
- Email verification required
- OAuth integration with third-party providers (Google, Facebook) - Coming Soon

**We do NOT use:**
- Username and other authentication (without password)
- Phone number authentication
- Anonymous access

---

## External Account Login

### Can users login to your app with accounts created outside of the app?
**Answer:** NO (Currently)

**Future Plans:**
- OAuth integration with Google and Facebook is planned for future releases
- Currently, all accounts must be created within the app using email/password

---

## Data Sharing

### Do you share user data with third parties?
**Answer:** YES (with service providers only)

### Third Parties We Share Data With:

#### 1. Clerk (Authentication)
- **Data Shared:** Email, Name, User ID, Profile Picture
- **Purpose:** User authentication and account management
- **Privacy Policy:** https://clerk.com/privacy

#### 2. Stream.io (Video Infrastructure)
- **Data Shared:** User ID, Name, Meeting participation data
- **Purpose:** Real-time video and audio streaming
- **Privacy Policy:** https://getstream.io/privacy/

#### 3. Supabase (Database)
- **Data Shared:** All user data and app content
- **Purpose:** Data storage and real-time synchronization
- **Privacy Policy:** https://supabase.com/privacy

#### 4. Cashfree (Payments)
- **Data Shared:** Transaction amount, User ID, Email
- **Purpose:** Payment processing for Super Chat
- **Privacy Policy:** https://www.cashfree.com/privacy-policy

#### 5. Vercel (Hosting)
- **Data Shared:** All data transmitted through the app
- **Purpose:** Application hosting and content delivery
- **Privacy Policy:** https://vercel.com/legal/privacy-policy

#### 6. Firebase (Analytics)
- **Data Shared:** Device info, usage analytics, crash logs
- **Purpose:** App analytics and crash reporting
- **Privacy Policy:** https://firebase.google.com/support/privacy

**We do NOT:**
- ❌ Sell user data to any third party
- ❌ Share data for advertising purposes
- ❌ Share data with social media platforms (except for live streaming features)
- ❌ Share meeting content without user consent

---

## Compliance with Family Policy

### Does your app comply with the Google Play Families Policy?
**Answer:** NO

**Reason:** KCS Meet is designed for users aged 13 and above. The app is not specifically designed for children and does not participate in the Designed for Families program.

**Age Restriction:** 13+

---

## Independent Security Review

### Has your app successfully completed an independent security review according to the Mobile Application Security Assessment (MASA) framework?
**Answer:** NO

**Status:** 
- We conduct internal security audits regularly
- Third-party security assessment is planned for Q2 2025
- We follow OWASP Mobile Security Project guidelines

---

## Data Transfer to User Device

### Is user data transferred off the device?
**Answer:** YES

**Transferred Data:**
- Profile information (for display to other users)
- Meeting participation data
- Chat messages
- Audio and video streams (during meetings)

**Purpose of Transfer:**
- Essential for providing video conferencing functionality
- Enabling real-time communication between users
- Storing user-generated content

---

## Data Collection Purposes (Detailed)

### App Functionality
- User authentication and authorization
- Video and audio conferencing
- Real-time chat messaging
- Meeting scheduling and management
- Virtual backgrounds processing
- Poll creation and voting
- Super Chat donations
- Meeting recordings

### Analytics
- Understanding user behavior and preferences
- Identifying popular features and usage patterns
- Measuring app performance and reliability
- Tracking user retention and engagement

### Developer Communications
- Service announcements and updates
- Feature releases and improvements
- Maintenance notifications
- Support responses

### Account Management
- Password reset and recovery
- Email verification
- Profile updates
- Account deletion

### Personalization
- Displaying user name and profile picture
- Remembering user preferences
- Customizing user interface

### Fraud Prevention, Security, and Compliance
- Detecting and preventing unauthorized access
- Identifying suspicious activities
- Complying with legal obligations
- Enforcing Terms and Conditions

---

## Data Handling Questionnaire (Google Play Console)

### Section 1: Data Collection and Sharing

**Q: Does your app collect or share any of the required user data types?**  
A: Yes

**Q: Is all of the user data collected by your app encrypted in transit?**  
A: Yes

**Q: Do you provide a way for users to request that their data is deleted?**  
A: Yes

### Section 2: Data Types

**Q: Which data types does your app collect?**  
A: 
- Personal info: Name, Email address, User IDs
- Financial info: User payment info, Purchase history
- Location: Approximate location
- Messages: Other in-app messages
- Photos and videos: Photos (optional)
- Audio files: Voice or sound recordings (when recording enabled)
- App activity: App interactions
- App info and performance: Crash logs, Diagnostics
- Device or other IDs: Device or other IDs

### Section 3: Data Usage

**Q: For what purposes is user data collected?**  
A: App functionality, Analytics, Developer communications, Account management, Personalization, Fraud prevention, security, and compliance

### Section 4: Data Sharing

**Q: Is user data shared with third parties?**  
A: Yes, with service providers only (Clerk, Stream.io, Supabase, Cashfree, Vercel, Firebase)

**Q: Is user data used or shared for advertising purposes?**  
A: No

**Q: Is user data transferred off the device?**  
A: Yes, for app functionality and cloud storage

---

## Contact Information for Privacy Inquiries

**Developer:** Krishna Consciousness Society  
**Email:** divineconnectionkcs@gmail.com  
**Privacy Policy URL:** https://meet.krishnaconsciousnesssociety.com/privacy-policy  
**Data Deletion URL:** https://meet.krishnaconsciousnesssociety.com/account/delete  

**Support Website:** https://meet.krishnaconsciousnesssociety.com/contact-us  
**Response Time:** Within 7 business days

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | December 27, 2024 | Initial data safety declaration for Play Store launch |

---

**Note:** This data safety information must be kept up-to-date in the Google Play Console. Any changes to data collection, usage, or sharing practices must be reflected in both this document and the Play Store listing within 7 days of implementation.
