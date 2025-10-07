# MeetingRoom.tsx Component Documentation

## Overview

The `MeetingRoom.tsx` component is a comprehensive and feature-rich React component that provides a complete video conferencing experience. It integrates with Stream.io for video and audio, Supabase for real-time chat and polls, and includes advanced features like virtual backgrounds, RTMP broadcasting, and a superchat monetization system. The component is designed to be highly interactive and customizable, with separate UI and logic for regular users and administrators.

## Props

The component accepts the following props:

-   **`apiKey`** (string): The Stream.io API key.
-   **`userToken`** (string): The Stream.io user token for authentication.
-   **`userData`** (object): An object containing user information, including `id`, `fullName`, and `primaryEmailAddress`.

## State Management

The component manages a wide range of state variables to handle the UI and application logic:

-   **`layout`**: Controls the layout of the video participants (grid, speaker-left, speaker-right).
-   **`activePanel`**: Manages which side panel is currently open (participants, chat, superchat, or none).
-   **`showPollsPanel`**: Toggles the visibility of the polls panel.
-   **`hasNewPoll`**: A boolean to indicate if a new poll has been created.
-   **`showSendSuperchat`**: Toggles the modal for sending a superchat.
-   **`activeBroadcasts`**: An array of active RTMP broadcasts.
-   **`showControls`**: Manages the visibility of the bottom control bar.
-   **`selectedBackground`**: Stores the currently selected virtual background.
-   **`unreadMessages`**: Tracks the number of unread chat messages.

## Features

### Video and Audio Communication

-   **Stream.io Integration**: Utilizes the `@stream-io/video-react-sdk` for core video and audio functionality.
-   **Call State Management**: Manages the call state, showing a loader until the user has successfully joined the call.
-   **Call Controls**: Provides standard call controls like mute, camera on/off, and hang up.

### Layouts and UI

-   **Dynamic Layouts**: Users can switch between "Grid", "Speaker Left", and "Speaker Right" layouts.
-   **Responsive Design**: The UI is designed to be responsive and work on different screen sizes.
-   **Auto-Hiding Controls**: The bottom control bar automatically hides after a period of inactivity and reappears on user interaction.

### Interactive Panels

-   **Participants Panel**: Displays a list of all participants in the call.
-   **Chat Panel**: A real-time chat powered by Supabase, with an unread message indicator.
-   **Superchat Panel**: Displays superchats (paid messages) sent during the call.
-   **Polls Panel**: Allows admins to create and manage polls, and users to vote.

### Broadcasting

-   **RTMP Broadcasting**: Admins can broadcast the meeting to RTMP-compatible platforms like YouTube and Facebook.
-   **Broadcast Management**: Provides a UI for starting and stopping broadcasts, and for entering stream URLs and keys.

### Virtual Backgrounds

-   **Background Selection**: Users can choose from a selection of virtual backgrounds, including blur and custom images.
-   **Background Processing**: Uses a custom hook (`useBackgroundProcessor`) to process the video stream and apply the selected background.
-   **localStorage Persistence**: The selected background is saved to `localStorage` for persistence across sessions.

### Admin Features

-   **Admin Panel**: Admins have access to an exclusive admin panel with advanced controls.
-   **Role-Based Access**: The component checks for admin privileges based on the user's email address.
-   **Broadcast Control**: Only admins can start and stop broadcasts.
-   **Poll Management**: Only admins can create and manage polls.

### Monetization

-   **Superchat**: Users can send "superchats," which are highlighted, paid messages.
-   **Superchat Modal**: A dedicated modal for sending superchats, which includes a payment flow.

## Dependencies

-   **`@stream-io/video-react-sdk`**: For video and audio communication.
-   **`@supabase/supabase-js`**: For real-time chat and polls.
-   **`lucide-react`**: For icons.
-   **`next/navigation`**: For routing.
-   **`@/lib/utils`**: For utility functions like `cn`.
-   **`@/hooks/use-toast`**: For displaying toast notifications.
-   **`@/hooks/useBackgroundProcessor`**: For processing virtual backgrounds.

This component is a central piece of the application, bringing together many different features to create a seamless and engaging video conferencing experience.
