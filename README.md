<div align="center">
  <br />
  <img src="https://github.com/Sharmamayankkkk/KCS-App/blob/main/public/icons/KCS-Logo.png" alt="Krishna Consciousness Society">
  <br />  <div>
    <img src="https://img.shields.io/badge/-TypeScript-black?style=for-the-badge&logoColor=white&logo=typescript&color=3178C6" alt="typescript" />
    <img src="https://img.shields.io/badge/-Next_JS-black?style=for-the-badge&logoColor=white&logo=nextdotjs&color=000000" alt="nextdotjs" />
    <img src="https://img.shields.io/badge/-Tailwind_CSS-black?style=for-the-badge&logoColor=white&logo=tailwindcss&color=06B6D4" alt="tailwindcss" />
  </div>  <h3 align="center">Krishna Consciousness Society - The Meet App</h3>
</div>

---

📋 Table of Contents

1. 🤖 Introduction
2. ⚙️ Tech Stack
3. 🔋 Features
4. 🤸 Quick Start




---

🤖 Introduction

Krishna Consciousness Society - The Meet App is an innovative meeting platform designed for seamless real-time interaction, ensuring a user-friendly and secure experience for all participants. It allows users to schedule, manage, and join meetings while ensuring data integrity and privacy.


---

⚙️ Tech Stack

Next.js

TypeScript

Clerk (Authentication)

GetStream (Real-time interactions)

ShadCN (UI components)

Tailwind CSS (Styling)


---

🔋 Features

Authentication: Secure user login and access management using Clerk.

New Meeting Setup: Quick start with configurable camera and mic settings.

Meeting Controls: Comprehensive participant controls (recording, reactions, screen sharing, muting, etc.).

Schedule Future Meetings: Plan meetings in advance and share the link with attendees.

Personal Meeting Room: Dedicated room link for instant meetings.

Real-time Functionality: Secure and real-time interactions.

Responsive Design: Optimized for all devices and screen sizes.


---

🤸 Quick Start

Follow these steps to set up the project locally:

Prerequisites

Ensure the following tools are installed on your machine:

Git

Node.js

npm (comes bundled with Node.js)


Clone the Repository

git clone https://github.com/Sharmamayankkkk/KCS-App.git
cd KCS-App

Install Dependencies

Run the following command to install the required packages:

npm install

Set Up Environment Variables

1. Create a .env file in the root directory of the project.


2. Add the following keys to the file:



NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_STREAM_API_KEY=
STREAM_SECRET_KEY=

Replace the placeholder values with your credentials from Clerk and getstream.

Run the Application

Start the development server:

npm run dev

Open your browser and navigate to http://localhost:3000 to access the app.


---

🚀 Launch Ready

The Krishna Consciousness Society Meet App is live and ready to elevate your meeting experience!

