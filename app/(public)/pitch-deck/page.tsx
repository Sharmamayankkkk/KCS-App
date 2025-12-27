import React from 'react';
import type { Metadata } from 'next';
import { Lightbulb, Target, Briefcase, Handshake } from 'lucide-react';

export const metadata: Metadata = {
  title: 'KCS Meet | Investor Pitch Deck',
  description:
    'Our investor pitch for KCS Meet, outlining the vision, market opportunity, business model, and funding requirements to scale globally.',
};

const PitchDeckPage = () => {
  return (
    <div className="bg-white px-4 py-12 text-gray-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            KCS Meet: The Investor Pitch
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base text-gray-600 sm:text-lg md:text-xl">
            India&apos;s First Spiritually Inspired Communication Platform,
            Ready for Global Scale.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-2 lg:gap-12">
          <div className="flex flex-col items-center rounded-xl bg-gray-50 p-8 shadow-lg transition-shadow duration-300 hover:shadow-2xl">
            <Lightbulb className="mb-4 size-12 text-yellow-500" />
            <h2 className="mb-3 text-2xl font-bold text-gray-900">
              1. The Vision
            </h2>
            <p className="leading-relaxed text-gray-600">
              Connecting Communities, Inspiring Growth. KCS Meet is a proven,
              feature-rich video platform born from the Krishna Consciousness
              Society, now ready for public expansion. We blend devotion,
              design, and digital innovation for a global audience.
            </p>
          </div>

          <div className="flex flex-col items-center rounded-xl bg-gray-50 p-8 shadow-lg transition-shadow duration-300 hover:shadow-2xl">
            <Target className="mb-4 size-12 text-red-500" />
            <h2 className="mb-3 text-2xl font-bold text-gray-900">
              2. The Problem & Opportunity
            </h2>
            <p className="leading-relaxed text-gray-600">
              The market needs more than just a meeting tool. Generic platforms
              lack community-centric features. The global creator economy is
              booming, with a massive, underserved niche in the spiritual and
              wellness space.
            </p>
          </div>

          <div className="flex flex-col items-center rounded-xl bg-gray-50 p-8 shadow-lg transition-shadow duration-300 hover:shadow-2xl">
            <Briefcase className="mb-4 size-12 text-blue-500" />
            <h2 className="mb-3 text-2xl font-bold text-gray-900">
              3. The Solution & Business Model
            </h2>
            <p className="leading-relaxed text-gray-600">
              A complete platform with unique features like{' '}
              <strong>Super Chat</strong>, social broadcasting, and tiered
              subscriptions. Our freemium model and creator monetization
              strategy ensure diverse and scalable revenue streams.
            </p>
          </div>

          <div className="flex flex-col items-center rounded-xl bg-gray-50 p-8 shadow-lg transition-shadow duration-300 hover:shadow-2xl">
            <Handshake className="mb-4 size-12 text-green-500" />
            <h2 className="mb-3 text-2xl font-bold text-gray-900">
              4. The Ask
            </h2>
            <p className="leading-relaxed text-gray-600">
              We are seeking seed funding to accelerate our public launch, scale
              our infrastructure, and invest in marketing to capture the global
              creator market. This investment will create a sustainable revenue
              source for the Krishna Consciousness Society.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PitchDeckPage;
