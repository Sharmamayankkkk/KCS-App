import React from 'react';
import { CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KCS Meet | The Ultimate Feature Comparison',
  description:
    'A detailed comparison of KCS Meet, Zoom, and Google Meet, highlighting our unique community-focused features and creator monetization tools.',
};

const comparisonData = {
  monetization: {
    title: 'Monetization & Community Support',
    features: [
      {
        feature: 'Integrated Super Chat',
        kcs: true,
        zoom: false,
        google: false,
      },
      {
        feature: 'Multiple Pricing Tiers (7)',
        kcs: true,
        zoom: false,
        google: false,
      },
      {
        feature: 'Real-time Payment Gateway',
        kcs: true,
        zoom: 'neutral',
        google: false,
        note: 'Via 3rd Party Apps',
      },
      {
        feature: 'Message Pinning by Tier',
        kcs: true,
        zoom: false,
        google: false,
      },
      {
        feature: 'Transaction & Order Management',
        kcs: true,
        zoom: false,
        google: false,
      },
    ],
  },
  admin: {
    title: 'Admin, Recording & Broadcasting',
    features: [
      {
        feature: 'Live Stream to YouTube/Facebook',
        kcs: true,
        zoom: 'neutral',
        google: 'neutral',
        note: 'Paid Add-on',
      },
      {
        feature: 'Cloud Recording',
        kcs: true,
        zoom: 'neutral',
        google: 'neutral',
        note: 'Paid Feature',
      },
      {
        feature: 'Interactive Poll Management',
        kcs: true,
        zoom: true,
        google: 'neutral',
        note: 'Paid Feature',
      },
      {
        feature: 'Community Role Management (Admin/User)',
        kcs: true,
        zoom: true,
        google: true,
      },
      {
        feature: 'Remove / Mute Participants',
        kcs: true,
        zoom: true,
        google: true,
      },
    ],
  },
  communication: {
    title: 'Communication & Engagement',
    features: [
      { feature: 'HD Video & Audio', kcs: true, zoom: true, google: true },
      { feature: 'Real-time Text Chat', kcs: true, zoom: true, google: true },
      {
        feature: 'Screen Sharing with Audio',
        kcs: true,
        zoom: true,
        google: true,
      },
      { feature: 'Emoji Reactions', kcs: true, zoom: true, google: true },
      {
        feature: 'AI-Powered Virtual Backgrounds',
        kcs: true,
        zoom: true,
        google: true,
      },
      {
        feature: 'Breakout Rooms',
        kcs: false,
        zoom: true,
        google: 'neutral',
        note: 'Paid Feature',
      },
    ],
  },
  platform: {
    title: 'Platform & Accessibility',
    features: [
      {
        feature: 'Web-First (No Downloads Required)',
        kcs: true,
        zoom: 'neutral',
        google: true,
        note: 'App Recommended',
      },
      {
        feature: 'Simple, Community-Focused Pricing',
        kcs: true,
        zoom: false,
        google: false,
        note: 'Per-host/user tiers',
      },
      {
        feature: '3rd Party Corporate Integrations',
        kcs: false,
        zoom: true,
        google: true,
      },
      {
        feature: 'Generous Participant Limits',
        kcs: true,
        zoom: 'neutral',
        google: 'neutral',
        note: 'Varies by Tier',
      },
    ],
  },
};

const Icon = ({
  status,
  note,
}: {
  status: boolean | string;
  note?: string;
}) => {
  let icon;
  if (status === true) {
    icon = <CheckCircle className="text-green-500" />;
  } else if (status === false) {
    icon = <XCircle className="text-red-500" />;
  } else {
    icon = <MinusCircle className="text-gray-400" />;
  }
  return (
    <td className="px-2 py-4 text-center md:px-6">
      <div className="flex flex-col items-center justify-center">
        {icon}
        {note && <span className="mt-1 text-xs text-gray-500">{note}</span>}
      </div>
    </td>
  );
};

const FeatureTable = ({
  title,
  features,
}: {
  title: string;
  features: any[];
}) => (
  <section>
    <h3 className="mb-4 px-1 text-2xl font-semibold text-gray-800">{title}</h3>
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:px-6">
              Feature
            </th>
            <th className="px-2 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 md:px-6">
              KCS Meet
            </th>
            <th className="px-2 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 md:px-6">
              Zoom
            </th>
            <th className="px-2 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 md:px-6">
              Google Meet
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {features.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="whitespace-normal p-4 text-sm font-medium text-gray-900 md:px-6">
                {item.feature}
              </td>
              <Icon status={item.kcs} note={item.kcs_note} />
              <Icon status={item.zoom} note={item.note} />
              <Icon status={item.google} note={item.note} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

const ComparePage = () => {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          The Definitive Comparison
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
          See how KCS Meet&apos;s community-focused features stack up against
          the competition.
        </p>
      </div>

      <div className="space-y-12">
        <FeatureTable
          title={comparisonData.monetization.title}
          features={comparisonData.monetization.features}
        />
        <FeatureTable
          title={comparisonData.admin.title}
          features={comparisonData.admin.features}
        />
        <FeatureTable
          title={comparisonData.communication.title}
          features={comparisonData.communication.features}
        />
        <FeatureTable
          title={comparisonData.platform.title}
          features={comparisonData.platform.features}
        />
      </div>

      <section
        className="mt-16 rounded-lg p-8 text-center"
        style={{ backgroundColor: '#FAF5F1' }}
      >
        <h2 className="text-3xl font-bold" style={{ color: '#292F36' }}>
          Built for You, Not for Enterprise
        </h2>
        <p
          className="mx-auto mt-4 max-w-2xl text-lg"
          style={{ color: '#8F7A6E' }}
        >
          While other platforms focus on enterprise clients, KCS Meet provides a
          complete, affordable package designed for communities. Our features
          are built with one goal: to help your community connect and thrive.
        </p>
      </section>
    </div>
  );
};

export default ComparePage;
