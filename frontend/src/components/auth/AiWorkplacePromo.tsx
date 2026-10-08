import React from "react";
import { Sparkles, Video, MessageSquare, ShieldCheck, Zap } from "lucide-react";

export const AiWorkplacePromo: React.FC = () => {
  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-[#1E2038] via-[#232333] to-[#171724] border border-zoom-border p-8 overflow-hidden flex flex-col justify-between shadow-2xl">
      {/* Ambient background glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-zoom-blue/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-zoom-orange/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Wordmark */}
      <div className="relative z-10 space-y-4">
        <div className="inline-flex items-center gap-2 bg-zoom-blue/15 border border-zoom-blue/30 px-3 py-1 rounded-full text-zoom-blue text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Zoom Workplace AI Platform</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-zoom-white leading-tight">
          Reimagine how your team connects and collaborates.
        </h2>

        <p className="text-sm text-zoom-subtle-text leading-relaxed">
          Experience frictionless video meetings, live waiting rooms, automated host controls, and lightning-fast WebRTC signaling.
        </p>
      </div>

      {/* Feature Highlights Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
        <div className="bg-zoom-card-surface/60 border border-zoom-border/60 rounded-2xl p-4 space-y-1.5 backdrop-blur-sm">
          <div className="h-8 w-8 rounded-xl bg-zoom-blue/20 text-zoom-blue flex items-center justify-center mb-2">
            <Video className="h-4 w-4" />
          </div>
          <h4 className="text-xs font-bold text-zoom-white">HD Video &amp; Audio</h4>
          <p className="text-[11px] text-zoom-muted-text">Low latency WebRTC mesh with active speaker detection.</p>
        </div>

        <div className="bg-zoom-card-surface/60 border border-zoom-border/60 rounded-2xl p-4 space-y-1.5 backdrop-blur-sm">
          <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <h4 className="text-xs font-bold text-zoom-white">Waiting Room Guard</h4>
          <p className="text-[11px] text-zoom-muted-text">Real-time host admission gatekeeper for guest privacy.</p>
        </div>

        <div className="bg-zoom-card-surface/60 border border-zoom-border/60 rounded-2xl p-4 space-y-1.5 backdrop-blur-sm">
          <div className="h-8 w-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2">
            <MessageSquare className="h-4 w-4" />
          </div>
          <h4 className="text-xs font-bold text-zoom-white">In-Meeting Chat</h4>
          <p className="text-[11px] text-zoom-muted-text">Synchronized group discussions &amp; real-time reactions.</p>
        </div>

        <div className="bg-zoom-card-surface/60 border border-zoom-border/60 rounded-2xl p-4 space-y-1.5 backdrop-blur-sm">
          <div className="h-8 w-8 rounded-xl bg-zoom-orange/20 text-zoom-orange flex items-center justify-center mb-2">
            <Zap className="h-4 w-4" />
          </div>
          <h4 className="text-xs font-bold text-zoom-white">FastAPI + Next.js</h4>
          <p className="text-[11px] text-zoom-muted-text">Zero-latency SQLite WAL with typed OpenAPI contracts.</p>
        </div>
      </div>

      {/* Footer Note */}
      <div className="relative z-10 pt-4 border-t border-zoom-border/60 flex items-center justify-between text-xs text-zoom-muted-text">
        <span>Scaler AI Assignment</span>
        <span className="text-zoom-white font-medium">Production Ready Web Client</span>
      </div>
    </div>
  );
};
