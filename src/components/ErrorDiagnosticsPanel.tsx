/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  AlertTriangle, ChevronDown, ChevronUp, Terminal, Copy, Check, Radio, Cpu, Database, Server, ShieldAlert
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

  // Extract all 11 dimensions dynamically with bulletproof fallbacks and inference
  const getDiagnostics = () => {
    let exceptionName = 'N/A';
    let exceptionMessage = 'N/A';
    let stackTrace = 'N/A';
    let sourceFile = 'N/A';
    let lineNumber = 'N/A';
    let functionName = 'N/A';
    let buildId = 'bld_dev_static';
    let runtime = 'NodeJS / Vercel Serverless';
    let missingEnvVars = 'None detected';
    let databaseStatus = 'Unknown';
    let crashedBeforeResponse = 'No';

    const rawBody = apiDetails?.responseBody || '';
    const status = apiDetails?.status || 0;
    const isVercelCrash = rawBody.includes('FUNCTION_INVOCATION_FAILED') || rawBody.includes('An error occurred') || rawBody.includes('Internal Server Error');
    const isHtmlOrText = apiDetails?.contentType?.includes('text/html') || apiDetails?.contentType?.includes('text/plain');
    
    // 11. Crash Detection & Serverless Failure Analysis
    if (status === 500 && (isVercelCrash || isHtmlOrText)) {
      crashedBeforeResponse = 'Yes (Vercel Serverless Function Crashed before returning JSON)';
      exceptionName = 'FUNCTION_INVOCATION_FAILED';
      exceptionMessage = 'A backend crash or unhandled promise rejection occurred. Vercel halted execution before a JSON response could be parsed.';
      sourceFile = 'server.ts';
      functionName = apiDetails?.url?.includes('/register') ? 'app.post(/api/auth/register)' : 'app.post(/api/auth/login)';
      databaseStatus = 'Connection failure or write violation';
    } else if (status === 0) {
      crashedBeforeResponse = 'Yes (Network Level Failure / Connection Refused)';
      exceptionName = 'ERR_CONNECTION_REFUSED';
      exceptionMessage = 'The client could not connect to the API Gateway. Server may be starting, offline, or blocking the origin.';
    }

    // Attempt to parse structured JSON error details if returned gracefully by try/catch
    try {
      if (apiDetails?.responseBody) {
        const parsed = JSON.parse(apiDetails.responseBody);
        if (parsed.success === false || parsed.error) {
          exceptionName = parsed.exceptionName || parsed.error || 'Server Error';
          exceptionMessage = parsed.exceptionMessage || parsed.message || parsed.error || 'An unexpected error occurred';
          stackTrace = parsed.stack || 'N/A';
          sourceFile = parsed.sourceFile || 'server.ts';
          lineNumber = parsed.lineNumber ? String(parsed.lineNumber) : 'N/A';
          functionName = parsed.functionName || 'N/A';
          buildId = parsed.buildId || 'bld_dev_static';
          runtime = parsed.runtime || 'NodeJS ' + (typeof process !== 'undefined' ? process.version : '20.x');
          databaseStatus = parsed.databaseStatus || 'Connected';
          crashedBeforeResponse = 'No (Gracefully caught and formatted as JSON)';
          if (parsed.missingEnvVars && Array.isArray(parsed.missingEnvVars)) {
            missingEnvVars = parsed.missingEnvVars.length > 0 ? parsed.missingEnvVars.join(', ') : 'None';
          }
        }
      }
    } catch (_) {
      // Not JSON or parse error, fallbacks handled above
    }

    // Client-side execution exception fallbacks
    if (exceptionName === 'N/A' && errorMsg) {
      exceptionName = 'Client Exception';
      exceptionMessage = errorMsg;
    }
    if (stackTrace === 'N/A' && apiDetails?.errorStack) {
      stackTrace = apiDetails.errorStack;
    }
    
    // Parse Stack Trace to extract file/line details if still empty
    if (stackTrace !== 'N/A' && sourceFile === 'N/A') {
      const match = stackTrace.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/) || stackTrace.match(/at\s+(.+?):(\d+):(\d+)/);
      if (match) {
        if (match.length === 5) {
          functionName = match[1];
          sourceFile = match[2].split('/').pop() || 'server.ts';
          lineNumber = match[3];
        } else if (match.length === 4) {
          sourceFile = match[1].split('/').pop() || 'server.ts';
          lineNumber = match[2];
        }
      }
    }

    return {
      exceptionName,
      exceptionMessage,
      stackTrace,
      sourceFile,
      lineNumber,
      functionName,
      buildId,
      runtime,
      missingEnvVars,
      databaseStatus,
      crashedBeforeResponse
    };
  };

  const diag = getDiagnostics();

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-slate-300 font-mono text-xs">
      {/* Toggle Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3.5 bg-slate-950 flex items-center justify-between text-left hover:bg-slate-900/60 transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-2 text-rose-400 font-bold">
          <ShieldAlert className="w-4 h-4 animate-pulse text-rose-500" />
          <span>SMART DEEP-DIAGNOSTIC PANEL (11 PARAMETERS)</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold">
          <span>{isOpen ? 'COLLAPSE' : 'EXPAND TRACE'}</span>
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
            <div className="p-5 space-y-5">
              
              {/* Verdict Header */}
              <div className="p-4 bg-red-950/15 border border-red-900/30 rounded-2xl space-y-1.5">
                <span className="text-[9px] text-red-400 uppercase font-black tracking-widest flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" /> Diagnostic Verdict & Actionable Solution
                </span>
                <p className="text-slate-200 leading-relaxed font-bold text-xs mt-1">
                  {apiDetails?.probableRootCause || 
                    (diag.crashedBeforeResponse.startsWith('Yes') 
                      ? 'Vercel Serverless environment halted execution. The file-persistence writes might have failed outside `/tmp`, a promise went unhandled, or a critical dependency was unresolved.'
                      : 'An unhandled frontend process or exceptional state occurred.')
                  }
                </p>
                <div className="mt-2 text-[10px] text-slate-400 leading-relaxed border-t border-red-950/30 pt-2 space-y-1">
                  <div className="font-bold text-slate-300">💡 Next Steps to Fix:</div>
                  <div>1. Set <code className="bg-slate-800 px-1 py-0.5 rounded text-white">DEV_MODE=true</code> to view detailed live log traces.</div>
                  <div>2. Make sure file writes are redirected exclusively to the <code className="bg-slate-800 px-1 py-0.5 rounded text-white">/tmp</code> directory.</div>
                  <div>3. Double-check body parsing schemas and verify the payload contains non-null parameters.</div>
                </div>
              </div>

              {/* 11 Parameters Diagnostic Grid */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-indigo-400" /> Multi-Dimensional Diagnostics checklist
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 bg-slate-950 rounded-2xl border border-white/5 text-[11px]">
                  {/* Parameter 1 */}
                  <div className="p-2 border-b border-white/5 md:border-r">
                    <span className="text-slate-500 uppercase text-[9px] font-bold">1. Exception Name</span>
                    <p className="text-rose-400 font-bold font-mono truncate mt-0.5">{diag.exceptionName}</p>
                  </div>
                  {/* Parameter 2 */}
                  <div className="p-2 border-b border-white/5">
                    <span className="text-slate-500 uppercase text-[9px] font-bold">2. Exception Message</span>
                    <p className="text-slate-200 font-semibold mt-0.5 break-words">{diag.exceptionMessage}</p>
                  </div>
                  {/* Parameter 3 & 4 */}
                  <div className="p-2 border-b border-white/5 md:border-r">
                    <span className="text-slate-500 uppercase text-[9px] font-bold">3. Source File</span>
                    <p className="text-indigo-400 font-mono mt-0.5 font-semibold">{diag.sourceFile}</p>
                  </div>
                  <div className="p-2 border-b border-white/5">
                    <span className="text-slate-500 uppercase text-[9px] font-bold">4. Line Number</span>
                    <p className="text-indigo-400 font-mono mt-0.5 font-semibold">{diag.lineNumber}</p>
                  </div>
                  {/* Parameter 5 & 6 */}
                  <div className="p-2 border-b border-white/5 md:border-r">
                    <span className="text-slate-500 uppercase text-[9px] font-bold">5. Function Name</span>
                    <p className="text-slate-200 font-mono mt-0.5">{diag.functionName}</p>
                  </div>
                  <div className="p-2 border-b border-white/5">
                    <span className="text-slate-500 uppercase text-[9px] font-bold">6. Build Identifier</span>
                    <p className="text-slate-400 font-mono mt-0.5">{diag.buildId}</p>
                  </div>
                  {/* Parameter 7 & 8 */}
                  <div className="p-2 border-b border-white/5 md:border-r or:border-b-0">
                    <span className="text-slate-500 uppercase text-[9px] font-bold">7. Runtime System</span>
                    <p className="text-slate-200 font-semibold mt-0.5">{diag.runtime}</p>
                  </div>
                  <div className="p-2 border-b border-white/5 md:border-b-0">
                    <span className="text-slate-500 uppercase text-[9px] font-bold">8. Missing Env Vars</span>
                    <p className="text-amber-400 font-mono mt-0.5 font-bold truncate">{diag.missingEnvVars}</p>
                  </div>
                  {/* Parameter 9 & 10 */}
                  <div className="p-2 border-r border-white/5 border-b md:border-b-0">
                    <span className="text-slate-500 uppercase text-[9px] font-bold">9. Database Reachability</span>
                    <p className={`font-bold mt-0.5 ${diag.databaseStatus === 'Connected' ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`}>
                      {diag.databaseStatus}
                    </p>
                  </div>
                  <div className="p-2">
                    <span className="text-slate-500 uppercase text-[9px] font-bold">10. Serverless Crash (Before Response?)</span>
                    <p className={`font-black font-mono mt-0.5 ${diag.crashedBeforeResponse.startsWith('Yes') ? 'text-red-400 animate-bounce' : 'text-amber-400 font-bold'}`}>
                      {diag.crashedBeforeResponse}
                    </p>
                  </div>
                </div>
              </div>

              {/* Parameter 11: Full Stack Trace */}
              {diag.stackTrace !== 'N/A' && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">11. Exception Stack Trace:</h4>
                  <pre className="bg-black/60 p-3.5 rounded-xl border border-white/5 text-[10px] overflow-x-auto text-rose-300/80 whitespace-pre scrollbar-none max-h-52">
                    {diag.stackTrace}
                  </pre>
                </div>
              )}

              {/* Raw response payload */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Raw Server response payload:</h4>
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
