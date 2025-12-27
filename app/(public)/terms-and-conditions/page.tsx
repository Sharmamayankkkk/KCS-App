import React from 'react';

const TermsAndConditions = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 text-gray-800">
      <h1 className="mb-6 text-3xl font-bold">Terms & Conditions</h1>

      <section className="mb-8">
        <h2 className="mb-2 text-2xl font-semibold">Services Offered</h2>
        <ul className="list-inside list-disc space-y-1">
          <li>
            Live Meetings: Real-time video and audio conferencing sessions with
            multiple participants.
          </li>
          <li>
            Audio and Video Sharing: Participants can share their webcam video
            and microphone audio streams during meetings.
          </li>
          <li>
            Text Chat: In-meeting text chat allows participants to send public
            or private messages.
          </li>
          <li>
            Recording and Storage: Meetings may be recorded and stored on the
            platform for later viewing or distribution.
          </li>
          <li>
            Social Media Distribution: We may share or broadcast recorded
            meeting content on our official social media channels.
          </li>
          <li>
            Super Chat: Send highlighted paid messages during live sessions to
            support content creators.
          </li>
        </ul>
        <p className="mt-2 text-sm text-gray-700">
          Super Chat messages may be highlighted for 30 seconds to 5 minutes
          based on the selected amount. Each message can contain up to 200
          characters.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-2xl font-semibold">User Data Collection</h2>
        <ul className="list-inside list-disc space-y-1">
          <li>
            Account Information: Email address and password. Profile pictures
            are optional.
          </li>
          <li>Meeting Content: Audio and video streams when enabled.</li>
          <li>
            Chats and Messages: Text messages sent or received during meetings.
          </li>
          <li>
            Additional Data: Technical and usage data (e.g. timestamps, device
            info).
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-2xl font-semibold">Account Creation</h2>
        <p>
          To use the service, users must create an account with a valid email
          and password. While profile pictures are optional, you are responsible
          for your account&apos;s security and must notify us of any unauthorized
          use.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-2xl font-semibold">
          Content Ownership and Licensing
        </h2>

        <h3 className="mb-1 mt-4 text-lg font-medium">Your Content</h3>
        <p>
          You retain all rights to content you create or upload (videos, audio,
          messages, etc.).
        </p>

        <h3 className="mb-1 mt-4 text-lg font-medium">License to Us</h3>
        <ul className="list-inside list-disc space-y-1">
          <li>
            Display and promote Your Content on our platform and social media.
          </li>
          <li>
            Use Your Content in promotional materials without compensation.
          </li>
        </ul>

        <h3 className="mb-1 mt-4 text-lg font-medium">
          Responsibility for Rights
        </h3>
        <p>
          You confirm you have the rights to upload content and that it doesn’t
          violate anyone else's rights.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-2xl font-semibold">
          Age and Regional Restrictions
        </h2>
        <p>
          Our service is globally available. If you&apos;re a minor, a parent or
          guardian must review and agree to these terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-2xl font-semibold">
          Disclaimers and Limitations of Liability
        </h2>
        <ul className="list-inside list-disc space-y-1">
          <li>The platform is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot;.</li>
          <li>
            No guarantees for service availability, accuracy, or security.
          </li>
          <li>No liability for any damages, data loss, or indirect harm.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-2xl font-semibold">
          Intellectual Property and DMCA
        </h2>
        <ul className="list-inside list-disc space-y-1">
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
