
import React from 'react';
import type { Metadata } from 'next';
import { Globe, Users, Target } from 'lucide-react';

export const metadata: Metadata = {
  title: 'KCS Meet | Vision & Mission',
    description: 'Discover the vision and mission of KCS Meet, from its origins as a community tool to its future as a global, spiritually inspired communication platform.',
};

const VisionPage = () => {
  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">Our Vision & Mission</h1>
            <p className="mt-4 max-w-2xl mx-auto text-base text-gray-600 sm:text-lg md:text-xl">From a community tool to a global platform, our journey is guided by a deep-rooted mission.</p>
        </div>

        <div className="space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12">
                <div className="order-2 md:order-1">
                    <h2 className="text-3xl font-bold mb-4 flex items-center gap-3"><Users className="h-8 w-8 text-blue-600"/>From Community to Globe</h2>
                    <p className="text-lg text-gray-600 mb-4">KCS Meet was born from a simple need: to connect our community within the Krishna Consciousness Society (KCS). It was built in India, by our community, for our community.</p>
                    <p className="text-lg text-gray-600">As the platform matured, it evolved into a powerful, modern video conferencing solution. We recognized its potential to serve a much broader audience.</p>
                </div>
                <div className="order-1 md:order-2 flex justify-center">
                    <Globe className="h-40 w-40 md:h-56 md:w-56 text-blue-200" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12">
                <div className="flex justify-center">
                    <img src="/icons/KCS-Logo.png" alt="KCS Logo" className="h-40 w-auto md:h-48" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold mb-4 flex items-center gap-3"><Target className="h-8 w-8 text-blue-600" />The Expansion: A New Chapter</h2>
                    <p className="text-lg text-gray-600">We now aim to expand KCS Meet beyond the society, transforming it into a public, revenue-generating platform to empower individuals, organizations, and creators worldwide.</p>
                </div>
            </div>

            <div className="text-center bg-[#FAF5F1] p-8 rounded-lg shadow-inner">
                <h2 className="text-3xl font-bold text-[#292F36] mb-4">Our Core Mission</h2>
                <blockquote className="text-xl italic text-[#A41F13] max-w-3xl mx-auto">
                “Our goal is to build India’s first spiritually inspired communication platform — blending devotion, design, and digital innovation — and to establish a sustainable source of growth and income for the Krishna Consciousness Society.”
                </blockquote>
            </div>
        </div>
    </div>
  );
};

export default VisionPage;
