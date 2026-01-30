import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer';
import TestimonialCarousel from '../components/TestimonialCarousel';
import CurriculumSection from '../components/CurriculumSection';
import RegistrationForm from '../components/RegistrationForm';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import Navigation from '../components/Navigation';

export default function Index() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <CurriculumSection />
      <TestimonialCarousel />
      <RegistrationForm />
      <Footer />
      <style>{`
        .bg-grid-slate-100 {
          background-image: linear-gradient(to right, rgb(226 232 240) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(226 232 240) 1px, transparent 1px);
          background-size: 32px 32px;
        }
      `}</style>
    </div>
  );
}