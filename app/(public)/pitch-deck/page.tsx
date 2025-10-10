
import React from 'react';
import type { Metadata } from 'next';
import { Lightbulb, Target, Briefcase, Handshake } from 'lucide-react';

export const metadata: Metadata = {
  title: 'KCS Meet | Investor Pitch Deck',
  description: 'Our investor pitch for KCS Meet, outlining the vision, market opportunity, business model, and funding requirements to scale globally.',
};

const PitchDeckPage = () => {
  return (
    <div className="bg-white text-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">KCS Meet: The Investor Pitch</h1>
          <p className="mt-4 max-w-3xl mx-auto text-base text-gray-600 sm:text-lg md:text-xl">India's First Spiritually Inspired Communication Platform, Ready for Global Scale.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 text-center">

          <div className="p-8 bg-gray-50 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col items-center">
            <Lightbulb className="h-12 w-12 text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">1. The Vision</h2>
            <p className="text-gray-600 leading-relaxed">Connecting Communities, Inspiring Growth. KCS Meet is a proven, feature-rich video platform born from the Krishna Consciousness Society, now ready for public expansion. We blend devotion, design, and digital innovation for a global audience.</p>
          </div>

          <div className="p-8 bg-gray-50 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col items-center">
            <Target className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">2. The Problem & Opportunity</h2>
            <p className="text-gray-600 leading-relaxed">The market needs more than just a meeting tool. Generic platforms lack community-centric features. The global creator economy is booming, with a massive, underserved niche in the spiritual and wellness space.</p>
          </div>

          <div className="p-8 bg-gray-50 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col items-center">
            <Briefcase className="h-12 w-12 text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">3. The Solution & Business Model</h2>
            <p className="text-gray-600 leading-relaxed">A complete platform with unique features like <strong>Super Chat</strong>, social broadcasting, and tiered subscriptions. Our freemium model and creator monetization strategy ensure diverse and scalable revenue streams.</p>
          </div>

          <div className="p-8 bg-gray-50 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col items-center">
            <Handshake className="h-12 w-12 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">4. The Ask</h2>
            <p className="text-gray-600 leading-relaxed">We are seeking seed funding to accelerate our public launch, scale our infrastructure, and invest in marketing to capture the global creator market. This investment will create a sustainable revenue source for the Krishna Consciousness Society.</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PitchDeckPage;
