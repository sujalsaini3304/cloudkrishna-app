import React, { useState, useEffect } from 'react';
import { Menu, X, Terminal, Video, Users, Rocket, Shield, ChevronRight, ArrowRight, CheckCircle2, Upload, FileText } from 'lucide-react';


const Navigation = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all border-b ${scrolled ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/95 border-transparent backdrop-blur-md'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <a href="#home" className="flex items-center gap-3">
            <img src="/logo.png" alt="Cloud Krishna" className="w-10 h-10" onError={(e) => e.target.src = 'https://cdn-icons-png.flaticon.com/512/6104/6104523.png'} />
            <span className="text-xl font-bold text-slate-900 tracking-tight">Cloud Krishna</span>
          </a>
          <div className="hidden lg:flex items-center gap-2">
            {['Home', 'Features', 'Curriculum', 'Testimonials'].map((item, i) => (
              <a key={i} href={`#${item.toLowerCase()}`} className="text-slate-600 font-medium px-4 py-2 rounded-lg hover:text-blue-700 hover:bg-blue-50 transition-all">{item}</a>
            ))}
            <a href="#register" className="ml-4 bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-800 transition-colors shadow-sm">Get Started</a>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-slate-700">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 shadow-xl px-4 py-6 space-y-3">
          {['Home', 'Features', 'Curriculum', 'Testimonials'].map((item, i) => (
            <a key={i} href={`#${item.toLowerCase()}`} className="block text-slate-600 px-4 py-3 rounded-lg hover:bg-slate-50 hover:text-blue-700" onClick={() => setMobileOpen(false)}>{item}</a>
          ))}
          <a href="#register" className="block bg-blue-700 text-white px-6 py-3 rounded-lg text-center font-medium" onClick={() => setMobileOpen(false)}>Get Started</a>
        </div>
      )}
    </nav>
  );
};



export default Navigation
