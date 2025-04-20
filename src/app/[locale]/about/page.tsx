"use client";

import { useTranslations } from 'next-intl';

export default function About() {
  const t = useTranslations();

  return (
    <div className="container mx-auto p-4">
      {/* Hero Section */}
      <section className="text-center py-12 bg-blue-50">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">{t('aboutUs')}</h1>
        <p className="text-xl text-gray-600">
          {t('connectWithPeople')}
        </p>
      </section>

      {/* Mission Section */}
      <section className="py-12 bg-white">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          {t('ourMission')}
        </h2>
        <p className="text-lg text-center text-gray-600 max-w-3xl mx-auto">
          {t('missionDescription')}
        </p>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-blue-50">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          {t('whyChooseUs')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="text-center p-6 border rounded-md shadow-md bg-white">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('globalReach')}</h3>
            <p className="text-gray-600">
              {t('globalReachDescription')}
            </p>
          </div>

          <div className="text-center p-6 border rounded-md shadow-md bg-white">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('easyToUse')}</h3>
            <p className="text-gray-600">
              {t('easyToUseDescription')}
            </p>
          </div>

          <div className="text-center p-6 border rounded-md shadow-md bg-white">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('interactiveFeatures')}</h3>
            <p className="text-gray-600">
              {t('interactiveFeaturesDescription')}
            </p>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-12 bg-white">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          {t('ourVision')}
        </h2>
        <p className="text-lg text-center text-gray-600 max-w-3xl mx-auto">
          {t('visionDescription')}
        </p>
      </section>

      {/* Call to Action Section */}
      <section className="py-12 bg-blue-50 text-center">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">
          {t('joinUsToday')}
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          {t('callToActionDescription')}
        </p>
        <a
          href="/signup"
          className="inline-block bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600"
        >
          {t('signUpNow')}
        </a>
      </section>
    </div>
  );
}
