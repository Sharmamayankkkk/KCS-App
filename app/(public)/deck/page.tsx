import React from 'react';
import type { Metadata } from 'next';
import { Rocket, Target, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'KCS Meet | Expansion Strategy Deck',
  description:
    'An overview of the KCS Meet expansion strategy, outlining our vision, business rationale, and strategic goals for becoming a global platform.',
};

const DeckPage = () => {
  return (
    <div className="bg-gray-50 px-4 py-12 text-gray-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            KCS Meet: The Expansion Strategy
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg md:text-xl">
            From a dedicated internal tool to a powerful global platform.
          </p>
        </div>

        <div className="space-y-12">
          <div className="rounded-2xl bg-white p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl">
            <h2 className="mb-4 flex items-center gap-3 text-3xl font-bold text-gray-900">
              <Rocket className="size-8 text-blue-600" />
              1. The Vision: Devotion Meets Connection
            </h2>
            <ul className="list-inside list-disc space-y-3 text-lg text-gray-600">
              <li>
                <strong>Our Roots:</strong> Born within the Krishna
                Consciousness Society as an internal communication tool.
              </li>
              <li>
                <strong>Our Evolution:</strong> Matured into a feature-rich
                platform rivaling global competitors.
              </li>
              <li>
                <strong>Our Future:</strong> To become India’s first spiritually
                inspired, public communication platform, creating a sustainable
                revenue stream for KCS.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl">
            <h2 className="mb-4 flex items-center gap-3 text-3xl font-bold text-gray-900">
              <TrendingUp className="size-8 text-green-600" />
              2. The Business Rationale: Why Now?
            </h2>
            <ul className="list-inside list-disc space-y-3 text-lg text-gray-600">
              <li>
                <strong>Untapped Market:</strong> A growing global market for
                creator and community platforms, with a unique niche in the
                spiritual/wellness sector.
              </li>
              <li>
                <strong>Product-Market Fit:</strong> We have a proven,
                feature-complete product already validated by the KCS community.
              </li>
              <li>
                <strong>Strategic Alignment:</strong> Expansion creates a
                self-sustaining financial engine for the Krishna Consciousness
                Society.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl">
            <h2 className="mb-4 flex items-center gap-3 text-3xl font-bold text-gray-900">
              <Target className="size-8 text-red-600" />
              3. Strategic Goals
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-xl font-semibold text-gray-800">
                  Year 1 Goals
                </h3>
                <ul className="list-inside list-disc space-y-2 text-gray-600">
                  <li>Successfully launch KCS Meet to the public.</li>
                  <li>Achieve first 10,000 active users.</li>
                  <li>
                    Establish key partnerships with 5 spiritual organizations.
                  </li>
                  <li>
                    Generate initial revenue through Super Chat & subscriptions.
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold text-gray-800">
                  Year 3 Goals
                </h3>
                <ul className="list-inside list-disc space-y-2 text-gray-600">
                  <li>
                    Become the leading communication platform for spiritual
                    communities in India.
                  </li>
                  <li>Achieve 100,000+ active users.</li>
                  <li>
                    Expand service offerings (paid workshops, API access).
                  </li>
                  <li>
                    Contribute a significant recurring revenue share to KCS.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeckPage;
