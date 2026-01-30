import { ChevronLeft , ChevronRight , Star} from 'lucide-react';
import React from 'react'

const TestimonialCarousel = () => {
  const [current, setCurrent] = React.useState(0);
  const testimonials = [
    { name: 'Priya Sharma', role: 'Cloud Engineer at TCS', image: '👩‍💻', text: 'Cloud Krishna transformed my career. The hands-on labs gave me confidence to crack my dream job!' },
    { name: 'Rahul Verma', role: 'DevOps Engineer at Infosys', image: '👨‍💼', text: 'Best investment! Got placed within 2 months of completing the program.' },
    { name: 'Ananya Patel', role: 'Solutions Architect at Wipro', image: '👩‍🔬', text: 'The real-world projects helped me stand out. Highly recommended!' },
    { name: 'Arjun Singh', role: 'Cloud Consultant at Accenture', image: '👨‍💻', text: 'From zero to certified and placed - all thanks to Cloud Krishna!' }
  ];

  return (
    <section id="testimonials" className="py-24 bg-slate-50 border-y border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">What Our Students Say</h2>
        </div>
        <div className="bg-white rounded-2xl p-8 md:p-12 border border-slate-200 shadow-sm relative">
           <div className="absolute top-8 right-8 text-slate-100 pointer-events-none">
               <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" /></svg>
           </div>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-4xl flex-shrink-0 border-4 border-white shadow-sm">
                {testimonials[current].image}
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex justify-center md:justify-start gap-1 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} className="text-orange-400 fill-current" />)}
              </div>
              <p className="text-xl text-slate-800 leading-relaxed italic mb-6">"{testimonials[current].text}"</p>
              <div>
                  <p className="font-bold text-slate-900">{testimonials[current].name}</p>
                  <p className="text-slate-500 text-sm">{testimonials[current].role}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-8 gap-4">
            <button onClick={() => setCurrent((current - 1 + testimonials.length) % testimonials.length)} className="p-2 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-600 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-2 items-center">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} className={`h-2 rounded-full transition-all duration-300 ${current === i ? 'bg-blue-600 w-8' : 'bg-slate-300 w-2 hover:bg-slate-400'}`} />
              ))}
            </div>
            <button onClick={() => setCurrent((current + 1) % testimonials.length)} className="p-2 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-600 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};


export default TestimonialCarousel
