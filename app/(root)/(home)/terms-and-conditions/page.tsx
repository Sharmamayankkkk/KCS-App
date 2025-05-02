import React from 'react';

const TermsAndConditions = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Services Offered</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Live Meetings: Real-time video and audio conferencing sessions with multiple participants.</li>
          <li>Audio and Video Sharing: Participants can share their webcam video and microphone audio streams during meetings.</li>
          <li>Text Chat: In-meeting text chat allows participants to send public or private messages.</li>
          <li>Recording and Storage: Meetings may be recorded and stored on the platform for later viewing or distribution.</li>
          <li>Social Media Distribution: We may share or broadcast recorded meeting content on our official social media channels.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">User Data Collection</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Account Information: Email address and password. Profile pictures are optional.</li>
          <li>Meeting Content: Audio and video streams when enabled.</li>
          <li>Chat and Messages: Text messages sent or received during meetings.</li>
          <li>Additional Data: Technical and usage data (e.g. timestamps, device info).</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Account Creation</h2>
        <p>
          To use the service, users must create an account with a valid email and password. Profile pictures are optional.
          You are responsible for your account's security and must notify us of any unauthorized use.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Content Ownership and Licensing</h2>
        <h3 className="text-lg font-medium mt-4 mb-1">Your Content</h3>
        <p>You retain all rights to content you create or upload (videos, audio, messages, etc.).</p>

        <h3 className="text-lg font-medium mt-4 mb-1">License to Us</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Display and promote Your Content on our platform and social media.</li>
          <li>Use Your Content in promotional materials without compensation.</li>
        </ul>

        <h3 className="text-lg font-medium mt-4 mb-1">Responsibility for Rights</h3>
        <p>
          You confirm you have the rights to upload content and that it doesn’t violate anyone else's rights.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Age and Regional Restrictions</h2>
        <p>
          Our service is globally available. If you're a minor, a parent or guardian should agree to these terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Disclaimers and Limitations of Liability</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>The platform is provided "AS IS" and "AS AVAILABLE".</li>
          <li>No guarantees for service availability, accuracy, or security.</li>
          <li>No liability for any damages, data loss, or indirect harm.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Intellectual Property and DMCA</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Do not upload content that violates copyrights.</li>
          <li>We respond to valid DMCA takedown requests.</li>
          <li>Repeat infringers will have their accounts terminated.</li>
        </ul>
        <p className="mt-2">
          A proper DMCA notice must clearly identify the copyrighted work,
          infringing content, and its location on our platform.
        </p>
      </section>
    </div>
  );
};

export default TermsAndConditions;
