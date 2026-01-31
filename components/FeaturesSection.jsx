import React from 'react'
import { Menu, X, Terminal, Video, Users, Rocket, Shield, ChevronRight, ArrowRight, CheckCircle2, Upload, FileText } from 'lucide-react';
import Lottie from 'lottie-react';



const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="group bg-white border border-slate-200 rounded-xl p-8 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
      <Icon className="text-blue-600 group-hover:text-white transition-colors duration-300" size={24} />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed mb-6 text-sm">{description}</p>
    <a href="#register" className="inline-flex items-center gap-2 text-blue-700 font-semibold text-sm group-hover:gap-3 transition-all">
      Learn more <ChevronRight size={16} />
    </a>
  </div>
);

const FeaturesSection = () => {
  // Lottie animation data - you can replace this URL with your own Lottie file
  const [animationData, setAnimationData] = React.useState(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    // Fetch Lottie animation JSON from public folder
    fetch('/animations/features/trophy.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load animation: ${response.status}`);
        }
        return response.json();
      })
      .then(data => setAnimationData(data))
      .catch(err => {
        console.error('Error loading animation:', err);
        setError(err.message);
      });
  }, []);

  return (
    <section id="features" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-blue-700 font-bold tracking-wider text-xs uppercase mb-3 block">Why Choose Us</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">Everything You Need to Succeed</h2>
          <p className="text-lg text-slate-600 mb-8">Comprehensive learning experience designed for career transformation</p>
          
          {/* Lottie Animation */}
          {animationData && (
            <div className="flex justify-center mb-8">
              <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                <Lottie 
                  animationData={animationData}
                  loop={true}
                  speed={0.1}
                  className="w-full h-auto"
                />
              </div>
            </div>
          )}
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <FeatureCard icon={Terminal} title="Hands-On Cloud Labs" description="Access real Azure and AWS environments. Build, deploy, and manage cloud infrastructure with guided projects." />
          <FeatureCard icon={Video} title="Expert-Led Mock Interviews" description="Practice with industry professionals through personalized 1:1 sessions. Get detailed feedback on skills." />
          <FeatureCard icon={Users} title="Vibrant Learning Community" description="Connect with peers, share knowledge, and collaborate. Access exclusive job opportunities." />
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection
