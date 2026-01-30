import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SuccessCard() {
  const [applicationId, setApplicationId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const id = localStorage.getItem("application-id");
    if (!id) {
      navigate("/", { replace: true });
      return;
    }

    setApplicationId(id);
  }, [navigate]);

  return (
    <div className="min-h-screen flex justify-center items-start pt-28 bg-slate-50 px-4">
      
      <div className="w-full max-w-md rounded-2xl bg-white/70 backdrop-blur border border-slate-200 shadow-sm">
        
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b border-slate-100">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50">
            <Check className="w-6 h-6 text-green-600" strokeWidth={2.5} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Registration Successful
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Your application has been submitted
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 text-sm text-slate-600 leading-relaxed">
          <p>
            Thank you for registering with{" "}
            <span className="font-medium text-slate-900">
              Cloud Krishna
            </span>.
            Our team will review your application and notify you via email.
          </p>

          {/* Info */}
          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Application ID</span>
              <span className="font-mono text-slate-800">{applicationId}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Current Status</span>
              <span className="text-green-600 font-medium">
                Under Review
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
