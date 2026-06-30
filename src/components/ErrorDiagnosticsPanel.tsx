/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, ChevronDown, ChevronUp, Terminal, Copy, Check, Radio, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ErrorDiagnosticsPanelProps {
  errorMsg: string;
  apiDetails?: {
    url: string;
    method: string;
    status: number;
    responseBody?: string;
    contentType?: string;
    durationMs?: number;
    probableRootCause?: string;
    errorStack?: string;
  } | null;
}

export default function ErrorDiagnosticsPanel({ errorMsg, apiDetails }: ErrorDiagnosticsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!errorMsg && !apiDetails) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCleanResponseBody = () => {
    if (!apiDetails?.responseBody) return '[No response content]';
    try {
      const parsed = JSON.parse(apiDetails.responseBody);
      return JSON.stringify(parsed, null, 2);
    } catch (_) {
      return apiDetails.responseBody.trim();
    }
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-slate-300 font-mono text-xs">
      {/* Toggle Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3.5 bg-slate-950 flex items-center justify-between text-left hover:bg-slate-900 transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-2 text-rose-400 font-bold">
          <AlertTriangle className="w-4 h-4 animate-bounce" />
          <span>SMART ERROR ANALYZER DIAGNOSTICS</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold">
          <span>{isOpen ? 'COLLAPSE' : 'EXPAND PANEL'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Panel Body */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-slate-800"
          >
            <div className="p-4 space-y-4">
              
              {/* Probable Cause Block */}
              <div className="p-3.5 bg-rose-950/20 border border-rose-900/40 rounded-xl space-y-1">
                <span className="text-[10px] text-rose-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" /> Diagnostic Verdict & Fixes:
                </span>
                <p className="text-slate-200 leading-relaxed font-semibold text-[11px] mt-1">
                  {apiDetails?.probableRootCause || 
                    (errorMsg.includes('non-JSON') 
                      ? 'The Vercel Serverless Function crashed or restarted on startup. Look for syntax errors, missing environment variables, or filesystem write failures outside /tmp.'
                      : 'Client execution failed due to a standard JavaScript exception.')
                  }
                </p>
                <div className="mt-2 text-[10px] text-slate-400 leading-relaxed border-t border-rose-900/20 pt-2 space-y-1">
                  <div className="font-bold text-slate-300">💡 Recommended Checklist:</div>
                  <div>1. Ensure you have defined <code className="bg-slate-800 px-1 py-0.5 rounded text-slate-100">DEV_MODE=true</code> if executing in production.</div>
                  <div>2. Open the <code className="bg-slate-800 px-1 py-0.5 rounded text-slate-100">/dev</code> hidden workspace path directly to access full logs.</div>
                  <div>3. Verify file paths in server endpoints and avoid modifying write-protected directories in Vercel.</div>
                </div>
              </div>

              {/* API Route Failure Details */}
              {apiDetails && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 text-indigo-400" /> API Route Failure Info
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-2.5 p-3 bg-slate-950 rounded-xl border border-white/5 text-[10px]">
                    <div>
                      <span className="text-slate-500">Failed Endpoint</span>
                      <p className="text-slate-200 mt-0.5 truncate font-semibold">{apiDetails.method} {apiDetails.url}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">HTTP Status Code</span>
                      <p className="text-rose-400 mt-0.5 font-bold">{apiDetails.status || 'ERR_CONNECTION_REFUSED'}</p>
                    </div>
                    <div className="mt-2">
                      <span className="text-slate-500">Latency / Response Time</span>
                      <p className="text-slate-200 mt-0.5">{apiDetails.durationMs || 0}ms</p>
                    </div>
                    <div className="mt-2">
                      <span className="text-slate-500">Response Format</span>
                      <p className="text-slate-200 mt-0.5 truncate">{apiDetails.contentType || 'unknown'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Exception stack trace if present */}
              {apiDetails?.errorStack && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">JavaScript Error Stack:</h4>
                  <pre className="bg-black/40 p-3 rounded-xl border border-white/5 text-[10px] overflow-x-auto text-rose-300/80 max-h-40 whitespace-pre">
                    {apiDetails.errorStack}
                  </pre>
                </div>
              )}

              {/* Raw response payload */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Raw Server response body:</h4>
                  <button
                    type="button"
                    onClick={() => handleCopy(apiDetails?.responseBody || errorMsg, 'body')}
                    className="text-[9px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-bold cursor-pointer"
                  >
                    {copiedId === 'body' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedId === 'body' ? 'COPIED' : 'COPY'}
                  </button>
                </div>
                <pre className="bg-black/50 p-3.5 rounded-xl border border-white/5 text-[10px] overflow-x-auto text-slate-300 max-h-48 whitespace-pre-wrap">
                  {getCleanResponseBody()}
                </pre>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
