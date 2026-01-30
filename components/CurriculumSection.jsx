import React from 'react'
import { Menu, X, Terminal, Video, Users, Rocket, Star, Shield, ChevronRight, ArrowRight, CheckCircle2, Cloud, Database, Code, Lock, ChevronDown, ChevronLeft, Upload, FileText } from 'lucide-react';


const CurriculumSection = () => {
  const [expanded, setExpanded] = React.useState(0);
  const modules = [
    { title: 'Cloud Fundamentals', icon: Cloud, duration: '4 weeks', topics: ['Cloud Computing Intro', 'Service Models', 'Azure & AWS', 'Pricing Models'] },
    { title: 'Infrastructure & Networking', icon: Database, duration: '6 weeks', topics: ['Virtual Machines', 'Storage Accounts', 'VNETs & Subnets', 'Load Balancers'] },
    { title: 'DevOps & Automation', icon: Code, duration: '5 weeks', topics: ['CI/CD Pipelines', 'Terraform (IaC)', 'Docker Fundamentals', 'Kubernetes Orchestration'] },
    { title: 'Security & Compliance', icon: Lock, duration: '4 weeks', topics: ['Identity Access Management', 'Encryption Standards', 'Security Best Practices', 'Compliance Frameworks'] }
  ];

  return (
    <section id="curriculum" className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-blue-700 font-bold tracking-wider text-xs uppercase mb-3 block">Syllabus</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">Structured Learning Path</h2>
          <p className="text-lg text-slate-600">Industry-aligned curriculum designed by cloud experts</p>
        </div>
        <div className="space-y-4">
          {modules.map((m, i) => (
            <div key={i} className={`border rounded-xl transition-all duration-300 ${expanded === i ? 'border-blue-200 shadow-md ring-1 ring-blue-100' : 'border-slate-200 hover:border-blue-200'}`}>
              <button onClick={() => setExpanded(expanded === i ? -1 : i)} className="w-full px-8 py-6 flex items-center justify-between bg-white rounded-xl">
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${expanded === i ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <m.icon size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className={`text-lg font-bold transition-colors ${expanded === i ? 'text-blue-900' : 'text-slate-900'}`}>{m.title}</h3>
                    <p className="text-sm text-slate-500 font-medium">{m.duration}</p>
                  </div>
                </div>
                <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${expanded === i ? 'rotate-180 text-blue-600' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded === i ? 'max-h-96' : 'max-h-0'}`}>
                <div className="px-8 pb-8 pt-2 ml-16 border-t border-dashed border-slate-200">
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {m.topics.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <CheckCircle2 size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


export default CurriculumSection
