import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
        <main className="w-full min-h-screen hero-glow-bg flex flex-col items-center justify-center overflow-hidden font-sans antialiased selection:bg-indigo-500 selection:text-white" data-purpose="application-viewport">
      <style>{`
        .hero-glow-bg {
          background-color: #f8fafc;
          background-image: 
            radial-gradient(circle at 18% 46%, rgba(191, 219, 254, 0.55) 0%, rgba(219, 234, 254, 0.35) 28%, rgba(241, 245, 249, 0.1) 60%),
            radial-gradient(circle at 85% 20%, rgba(243, 244, 246, 0.6) 0%, transparent 45%);
        }
        .font-space {
          font-family: 'Space Grotesk', sans-serif;
        }
      `}</style>
      
      {/* BEGIN: Welcome Modal Card */}
      <section className="w-full max-w-[580px] px-6 text-center flex flex-col items-center relative transition" data-purpose="welcome-dialog">
          
          {/* Header Section with Hospital Badge & Branding */}
          <div className="flex flex-col items-center w-full">
            {/* Institutional Emblem Badge */}
            <div className="relative mb-5 group">
              <div className="absolute -inset-2.5 rounded-full bg-gradient-to-tr from-sky-400/20 via-teal-300/20 to-blue-500/20 blur-md opacity-70 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative w-[62px] h-[62px] rounded-full shadow-md flex items-center justify-center overflow-hidden">
                <img alt="Hospital de Yumbel" className="w-full h-full object-cover rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnlb_Qek0e-k-UYeE3t5ZspyVUV1JKd7q2PrDfISINdEgDiEAQxBazBDTZ6DbFQJtfEbM1BKTFNAmCOGk6DHHa-xyqFVD_B8wfVLt6NkAjYw9fXfSTtvzp9XAeEecdGvKAsEaO5DBhWugyKPaZOSulylIuVy3v20xOgzxz-oGJe9LcDcX4OCWe4RQfGosf53mUP9xGTVx3bpqn-Svo5N4IxP4oRihjGMmBmAaQIwvYq-yoEh5PjPHju8XJW45ZSdSTJREWFSNN9KjjzPk" />
              </div>
            </div>
            
            {/* Title & Description */}
            <h1 className="text-[23px] font-bold text-slate-900 tracking-tight leading-snug font-space">
              Sistema de Turnos SOME
            </h1>
            <p className="text-[12.5px] text-slate-500 font-normal mt-1.5 leading-relaxed tracking-normal max-w-[340px]">
              Plataforma de Control Operativo y Visor de Sala
            </p>
          </div>
          
          {/* Three Interactive Entry Portal Cards */}
          <nav aria-label="Opciones de acceso institucional" className="flex flex-col gap-2.5 mt-7 w-full max-w-[380px]">
            
            {/* Portal Card 1: Ingreso Administración */}
            <Link to="/loginS" style={{ textDecoration: "none" }} className="no-underline group relative flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 active:translate-y-0 transition duration-200 text-left border border-slate-800/80 overflow-hidden" role="button">
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-white/15 transition duration-200">
                  <span className="material-symbols-outlined text-[17px] text-slate-200">admin_panel_settings</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold tracking-tight text-white">
                    Ingreso Administración
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal leading-tight mt-0.5">
                    Gestión global y configuración
                  </span>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-white/15 transition duration-200 relative z-10">
                <span className="material-symbols-outlined text-[14px] text-slate-300 group-hover:text-white transition-all">arrow_forward</span>
              </div>
            </Link>
            
            {/* Portal Card 2: Ingreso Operadores */}
            <Link to="/login" style={{ textDecoration: "none" }} className="no-underline group relative flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md hover:shadow-lg hover:shadow-blue-600/25 hover:-translate-y-0.5 active:translate-y-0 transition duration-200 text-left border border-blue-400/30 overflow-hidden" role="button">
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 border border-white/15 group-hover:bg-white/25 transition duration-200">
                  <span className="material-symbols-outlined text-[17px] text-white">badge</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold tracking-tight text-white">
                    Ingreso Operadores
                  </span>
                  <span className="text-[11px] text-blue-100 font-normal leading-tight mt-0.5">
                    Atención y llamado de pacientes
                  </span>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center shrink-0 group-hover:bg-white/25 transition duration-200 relative z-10">
                <span className="material-symbols-outlined text-[14px] text-white transition-transform">arrow_forward</span>
              </div>
            </Link>
            
            {/* Portal Card 3: Abrir Visor Público */}
            <Link to="/visor" style={{ textDecoration: "none" }} className="no-underline group relative flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md hover:shadow-lg hover:shadow-emerald-600/25 hover:-translate-y-0.5 active:translate-y-0 transition duration-200 text-left border border-emerald-400/30 overflow-hidden" role="button">
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 border border-white/15 group-hover:bg-white/25 transition duration-200">
                  <span className="material-symbols-outlined text-[17px] text-white">tv</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold tracking-tight text-white">
                    Abrir Visor Público
                  </span>
                  <span className="text-[11px] text-emerald-100 font-normal leading-tight mt-0.5">
                    Pantalla de turnos para sala TV
                  </span>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center shrink-0 group-hover:bg-white/25 transition duration-200 relative z-10">
                <span className="material-symbols-outlined text-[14px] text-white transition-transform">arrow_forward</span>
              </div>
            </Link>
            
          </nav>
          
          {/* Refined Operational Status & Security Footer */}
          <div className="mt-7 pt-3 w-full max-w-[380px] flex items-center justify-center text-[11px] text-slate-400 px-1">
            <div className="font-mono text-[10.5px] text-slate-400 tracking-tight">
              v1.0
            </div>
          </div>
          
        </section>
      </main>
  );
}
