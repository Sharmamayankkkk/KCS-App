import React from 'react';

const services = [
  {
    title: '1. Live Video Meetings',
    description:
      'Engage in real-time video conferencing sessions, facilitating spiritual discussions, lectures, and community interactions.',
  },
  {
    title: '2. Audio and Video Sharing',
    description:
      'Participants can share their audio and video streams during meetings, enhancing the interactive experience.',
  },
  {
    title: '3. Text Chat Functionality',
    description:
      'Utilize the integrated chat feature to send messages during meetings, allowing for questions, comments, and shared insights.',
  },
  {
    title: '4. Meeting Recording and Storage',
    description:
      'Sessions can be recorded and stored on the platform, enabling users to revisit past discussions and share them with others.',
  },
  {
    title: '5. Social Media Distribution',
    description:
      'Recorded content may be shared on our official social media channels, including Facebook, YouTube, Instagram, and Telegram, to reach a broader audience.',
  },
  {
    title: '6. Super Chat Feature',
    description: (
      <>
        <p>Support content creators by sending highlighted messages during live sessions. Available Super Chat packages:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>₹50 – Highlighted for 30 Seconds</li>
          <li>₹100 – Highlighted for 1 minute</li>
          <li>₹200 – Highlighted for 2 minutes</li>
          <li>₹500 – Highlighted for 3 minutes</li>
          <li>₹1000 – Highlighted for 5 minutes</li>
        </ul>
        <p className="mt-2 italic text-sm">Note: Each Super Chat message can contain up to 200 characters.</p>
      </>
    ),
  },
];

const Services = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-gray-800">
      <h1 className="text-3xl font-bold mb-8 text-center">Services Offered</h1>
      <div className="space-y-8">
        {services.map((service, idx) => (
          <div key={idx}>
            <h2 className="text-xl font-semibold mb-2">{service.title}</h2>
            <div className="text-gray-700 text-base">{service.description}</div>
          </div>
        ))}
      </div>
      <div className="mt-10 text-center text-sm text-gray-600">
        For more information or assistance, please contact us at{' '}
        <a
          href="mailto:support@krishnaconsciousnesssociety.com"
          className="text-blue-600 underline"
        >
          support@krishnaconsciousnesssociety.com
        </a>
        .
      </div>
    </div>
  );
};

export default Services;
