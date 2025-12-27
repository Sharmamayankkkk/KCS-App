import React from 'react';
import type { Metadata } from 'next';
import { ShieldCheck, Server, Layers } from 'lucide-react';

export const metadata: Metadata = {
  title: 'KCS Meet | Technical & Compliance Overview',
  description:
    'An overview of the technical architecture, security protocols, and compliance standards for the KCS Meet platform, ensuring a secure and reliable experience.',
};

const TechnicalCompliancePage = () => {
  return (
    <div className="bg-gray-50 px-4 py-12 text-gray-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Technical & Compliance Overview
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base text-gray-600 sm:text-lg md:text-xl">
            Built on a modern, secure, and scalable foundation.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl">
            <h2 className="mb-6 flex items-center gap-3 text-3xl font-bold text-gray-900">
              <Layers className="size-8 text-blue-600" />
              Technical Architecture
            </h2>
            <p className="mb-6 text-lg text-gray-600">
              Our architecture is built on a modern, serverless stack designed
              for global performance and reliability.
            </p>
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-start">
                <Server className="mr-3 mt-1 size-6 shrink-0 text-blue-500" />
                <div>
                  <strong>Frontend:</strong> Next.js 14 on Vercel for a fast,
                  responsive, and globally distributed user experience.
                </div>
              </li>
              <li className="flex items-start">
                <Server className="mr-3 mt-1 size-6 shrink-0 text-blue-500" />
                <div>
                  <strong>Backend Services:</strong> Managed by Clerk
                  (Authentication), Stream.io (Video), and Supabase (Database).
                </div>
              </li>
              <li className="flex items-start">
                <Server className="mr-3 mt-1 size-6 shrink-0 text-blue-500" />
                <div>
                  <strong>Scalability:</strong> Serverless architecture allows
                  for automatic horizontal scaling to meet any demand.
                </div>
              </li>
              <li className="flex items-start">
                <Server className="mr-3 mt-1 size-6 shrink-0 text-blue-500" />
                <div>
                  <strong>Multi-Region Support:</strong> Vercel&apos;s Edge
                  Network ensures low latency for users worldwide.
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl">
            <h2 className="mb-6 flex items-center gap-3 text-3xl font-bold text-gray-900">
              <ShieldCheck className="size-8 text-green-600" />
              Security & Compliance
            </h2>
            <p className="mb-6 text-lg text-gray-600">
              Security is at the core of KCS Meet. We are committed to
              protecting user data and ensuring a safe environment.
            </p>
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-start">
                <ShieldCheck className="mr-3 mt-1 size-6 shrink-0 text-green-500" />
                <div>
                  <strong>End-to-End Encryption (E2EE):</strong> All video and
                  audio streams are end-to-end encrypted by default.
                </div>
              </li>
              <li className="flex items-start">
                <ShieldCheck className="mr-3 mt-1 size-6 shrink-0 text-green-500" />
                <div>
                  <strong>Data Privacy:</strong> User data is managed with
                  strict privacy controls and row-level security in our
                  database.
                </div>
              </li>
              <li className="flex items-start">
                <ShieldCheck className="mr-3 mt-1 size-6 shrink-0 text-green-500" />
                <div>
                  <strong>Payment Compliance:</strong> All financial
                  transactions are handled by a PCI DSS compliant gateway.
                </div>
              </li>
              <li className="flex items-start">
                <ShieldCheck className="mr-3 mt-1 size-6 shrink-0 text-green-500" />
                <div>
                  <strong>Compliance Plan:</strong> We are committed to being
                  fully compliant with GDPR and Indian data protection laws.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalCompliancePage;
