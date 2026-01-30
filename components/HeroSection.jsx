import React from 'react'
import { Menu, X, Terminal, Video, Users, Rocket, Shield, ChevronRight, ArrowRight, CheckCircle2, Upload, FileText } from 'lucide-react';


const HeroSection = () => (
  <section id="home" className="relative bg-white pt-32 pb-20 mt-20 overflow-hidden">
    <div className="absolute inset-0 bg-grid-slate-100 opacity-70"></div>
    <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-blue-50/50 rounded-full blur-3xl -z-10"></div>
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-800 px-4 py-1.5 rounded-full mb-8">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            <span className="text-sm font-semibold tracking-wide uppercase">Trusted by 10,000+ Students</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-tight mb-6">
            Master Cloud Computing
            <span className="block mt-2 text-blue-700">Launch Your Career</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-lg">Transform from a student to a job-ready cloud professional with hands-on labs, expert mentorship, and industry-recognized certifications.</p>
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <a href="#register" className="group inline-flex items-center justify-center gap-2 bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/10">
              Start Learning Today <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="#features" className="inline-flex items-center justify-center bg-white text-slate-700 border border-slate-300 px-8 py-4 rounded-xl font-semibold hover:bg-slate-50 hover:text-slate-900 transition-all">Explore Features</a>
          </div>
          <div className="grid grid-cols-3 gap-8 pt-4">
            {[['95%', 'Placement Rate'], ['500+', 'Hiring Partners'], ['4.9/5', 'User Rating']].map(([num, label], i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-slate-900">{num}</div>
                <div className="text-sm text-slate-500 font-medium mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="bg-white rounded-2xl shadow-2xl p-4 border border-slate-200 ring-1 ring-slate-200/50">
            <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-100 aspect-video flex items-center justify-center">
                 <img src="/students_group.jpg" alt="Platform Interface" className="w-full h-full object-cover opacity-90" onError={(e) => {
                     e.target.onerror = null; 
                     e.target.src = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop';
                 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);


export default HeroSection
