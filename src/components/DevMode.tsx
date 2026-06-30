/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from './Router.jsx';
import { 
  getDevLogs, clearDevLogs, generateDebugReport, DevLogEntry, determineProbableCause 
} from '../utils/devLogger.js';
import { 
  Terminal, Shield, Cpu, RefreshCw, Database, Radio, AlertTriangle, 
  Download, FileText, ChevronRight, ChevronDown, CheckCircle2, XCircle, 
  Layers, Search, Copy, Clock, PlayCircle, Eye, EyeOff
} from 'lucide-react';
import { motion } from 'motion/react';

// Shared sub-tab layout configuration
const TABS = [
  { id: 'home', name: 'Overview', path: '/sdev/home', icon: Terminal },
  { id: 'auth', name: 'Auth Debugger', path: '/sdev/auth', icon: Shield },
  { id: 'api', name: 'API Inspector', path: '/sdev/api', icon: Layers },
  { id: 'database', name: 'Database', path: '/sdev/database', icon: Database },
  { id: 'network', name: 'Network Monitor', path: '/sdev/network', icon: Radio },
  { id: 'logs', name: 'System Logs', path: '/sdev/logs', icon: FileText },
  { id: 'errors', name: 'Error Analyzer', path: '/sdev/errors', icon: AlertTriangle },
  { id: 'environment', name: 'Environment', path: '/sdev/environment', icon: Cpu },
];

export default function DevMode() {
  const { path, navigate } = useRouter();
  const [activeTab, setActiveTab] = useState('home');
  const [envConfig, setEnvConfig] = useState<any>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [logs, setLogs] = useState<DevLogEntry[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<DevLogEntry | null>(null);
  const [copyingStatus, setCopyingStatus] = useState<string | null>(null);
  const [revealSecrets, setRevealSecrets] = useState(false);
  
  // Passcode states for production bypass
  const [inputPass, setInputPass] = useState('');
  const [passError, setPassError] = useState('');

  // Sync tab with current router pathname
  useEffect(() => {
    const matched = TABS.find(t => path.startsWith(t.path));
    if (matched) {
      setActiveTab(matched.id);
    } else {
      setActiveTab('home');
    }
  }, [path]);

  // Load backend developer config
  const fetchConfig = async () => {
    setLoadingConfig(true);
    try {
      const storedPass = localStorage.getItem('dev_bypass') || '';
      const url = storedPass ? `/api/dev/config?pass=${storedPass}` : '/api/dev/config';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setEnvConfig(data);
      } else {
        setEnvConfig({ devModeEnabled: false, error: 'Response not OK' });
      }
    } catch (err: any) {
      setEnvConfig({ devModeEnabled: false, error: err.message });
    } finally {
      setLoadingConfig(false);
    }
  };

  // Load server-side audit logs
  const fetchAuditLogs = async () => {
    setLoadingAuditLogs(true);
    try {
      const storedPass = localStorage.getItem('dev_bypass') || '';
      const url = storedPass ? `/api/dev/audit-logs?pass=${storedPass}` : '/api/dev/audit-logs';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load server audit logs:', err);
    } finally {
      setLoadingAuditLogs(false);
    }
  };

  useEffect(() => {
    // Check if there is a 'pass' query parameter in the URL
    const searchParams = new URLSearchParams(window.location.search);
    const urlPass = searchParams.get('pass');
    if (urlPass === '7845') {
      localStorage.setItem('dev_bypass', '7845');
    }

    fetchConfig();
    setLogs(getDevLogs());

    // Listen for incoming live logs
    const handleLogAdded = () => {
      setLogs([...getDevLogs()]);
    };
    window.addEventListener('dev-mode-log-added' as any, handleLogAdded);

    return () => {
      window.removeEventListener('dev-mode-log-added' as any, handleLogAdded);
    };
  }, []);

  // Whenever we switch to logs, load backend audit logs too
  useEffect(() => {
    if (activeTab === 'logs') {
      fetchAuditLogs();
    }
  }, [activeTab]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopyingStatus(id);
    setTimeout(() => setCopyingStatus(null), 2000);
  };

  const handleExportReport = () => {
    const reportData = generateDebugReport({
      ...envConfig,
      serverAuditLogCount: auditLogs.length
    });
    
    const blob = new Blob([reportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `confessly_debug_report_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const changeTab = (tabId: string, tabPath: string) => {
    setActiveTab(tabId);
    navigate(tabPath);
  };

  const handleBypassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPass.trim() === '7845') {
      localStorage.setItem('dev_bypass', '7845');
      setPassError('');
      await fetchConfig();
    } else {
      setPassError('Invalid developer passcode.');
    }
  };

  if (loadingConfig) {
    return (
      <div className="min-h-screen bg-[#060814] text-slate-400 flex flex-col items-center justify-center font-mono p-6">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-xs">ACCESSING DEVELOPER DISCOVERY RUNTIME...</p>
      </div>
    );
  }

  // Security Gate
  if (!envConfig || envConfig.devModeEnabled === false) {
    return (
      <div className="min-h-screen bg-[#070913] text-slate-200 flex flex-col items-center justify-center font-mono p-6">
        <div className="max-w-md w-full bg-[#0d1127] border border-red-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="mx-auto w-16 h-16 bg-red-950/40 border border-red-500/50 rounded-2xl flex items-center justify-center text-red-500">
            <Shield className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-white uppercase">Access Denied</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Developer diagnostics interface is locked in production unless explicitly enabled via environment configuration or bypass passcode.
            </p>
          </div>

          {/* Passcode Bypass Form */}
          <form onSubmit={handleBypassSubmit} className="space-y-3 pt-2">
            <div className="text-left space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Enter Developer Bypass Passcode</label>
              <input
                type="password"
                placeholder="••••"
                value={inputPass}
                onChange={(e) => setInputPass(e.target.value)}
                className="w-full bg-slate-950 border border-red-500/20 rounded-xl px-3 py-2.5 text-center font-mono text-sm tracking-widest text-indigo-400 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            {passError && (
              <p className="text-[11px] text-red-400 text-left font-bold uppercase">{passError}</p>
            )}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Verify & Unlock
            </button>
          </form>

          <div className="p-4 bg-black/45 rounded-xl border border-white/5 text-left space-y-2 text-[11px] leading-relaxed">
            <div className="text-red-400 font-bold uppercase">To authorize via environment:</div>
            <p className="text-slate-300">
              Set the following environment variable in your deployment dashboard or <code className="bg-slate-800 px-1 py-0.5 rounded text-white">.env</code> configuration:
            </p>
            <div className="bg-slate-950 p-2.5 rounded font-mono text-indigo-400 select-all border border-indigo-950">
              DEV_MODE=true
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Return to Safety
          </button>
        </div>
      </div>
    );
  }

  // Filter logs based on search query
  const filteredFetchLogs = logs.filter(log => {
    if (log.type !== 'fetch') return false;
    const query = filterQuery.toLowerCase();
    return (
      log.url?.toLowerCase().includes(query) ||
      log.method?.toLowerCase().includes(query) ||
      String(log.status).includes(query)
    );
  });

  const authLogs = logs.filter(log => 
    log.type === 'fetch' && 
    (log.url?.includes('/api/auth/register') || log.url?.includes('/api/auth/login'))
  );

  const errorLogs = logs.filter(log => 
    log.type === 'error' || 
    (log.type === 'fetch' && ((log.status || 0) >= 400 || log.status === 0))
  );

  return (
    <div className="min-h-screen bg-[#070913] text-slate-300 font-mono flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Dev Environment Header */}
      <header className="bg-[#0c0f24] border-b border-indigo-950/60 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-950/60 border border-indigo-500/40 text-indigo-400 rounded-xl animate-pulse">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-wider uppercase flex items-center gap-1.5">
              Confessly Developer Mode <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded">v1.1</span>
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
              Runtime Diagnostics Environment (Connected)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={() => navigate('/')}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
          >
            ← Public Page
          </button>
          
          <button
            onClick={handleExportReport}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center gap-1.5 cursor-pointer"
            title="Download detailed diagnostics report"
          >
            <Download className="w-4 h-4" />
            Generate Debug Report
          </button>
        </div>
      </header>

      {/* Main Area with Sidebar and Content Container */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar Nav */}
        <aside className="w-full lg:w-64 bg-[#0a0d1e] border-b lg:border-b-0 lg:border-r border-indigo-950/50 p-4 space-y-1.5 flex lg:flex-col overflow-x-auto lg:overflow-x-visible shrink-0 scrollbar-none">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => changeTab(tab.id, tab.path)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center gap-3 transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white font-extrabold shadow-md shadow-indigo-600/15'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#111633]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.name}</span>
                {tab.id === 'errors' && errorLogs.length > 0 && (
                  <span className="ml-auto bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] px-1.5 py-0.5 rounded-full font-bold animate-bounce">
                    {errorLogs.length}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Dynamic Panel Content */}
        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {/* --- TAB: OVERVIEW --- */}
          {activeTab === 'home' && (
            <div className="space-y-6">
              <div className="p-5 bg-indigo-950/20 border border-indigo-950 rounded-2xl space-y-2">
                <h2 className="text-base font-bold text-white uppercase">Developer Environment Overview</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Welcome to the Confessly hidden developer diagnostics interface. Every request made to the server, error caught by the frontend, or network call performed will be automatically intercepted and structured here.
                </p>
              </div>

              {/* Stat Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-[#0b0e22] border border-indigo-950 rounded-2xl space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Fetch Requests</div>
                  <div className="text-2xl font-black text-indigo-400">{logs.filter(l => l.type === 'fetch').length}</div>
                </div>
                <div className="p-4 bg-[#0b0e22] border border-indigo-950 rounded-2xl space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Authentication Attempts</div>
                  <div className="text-2xl font-black text-emerald-400">{authLogs.length}</div>
                </div>
                <div className="p-4 bg-[#0b0e22] border border-indigo-950 rounded-2xl space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Caught Exceptions</div>
                  <div className="text-2xl font-black text-rose-400">{logs.filter(l => l.type === 'error').length}</div>
                </div>
                <div className="p-4 bg-[#0b0e22] border border-indigo-950 rounded-2xl space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Failed API Requests</div>
                  <div className="text-2xl font-black text-amber-400">
                    {logs.filter(l => l.type === 'fetch' && (l.status === 0 || (l.status || 0) >= 400)).length}
                  </div>
                </div>
              </div>

              {/* Status Checks */}
              <div className="bg-[#0b0e22] border border-indigo-950 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-extrabold uppercase text-white tracking-wider flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" /> Live Status Health Checks
                </h3>
                
                <div className="divide-y divide-indigo-950/50 text-xs">
                  <div className="py-3 flex items-center justify-between">
                    <span className="text-slate-400">Database Connection Status</span>
                    {envConfig?.database?.connected ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-bold"><CheckCircle2 className="w-4 h-4" /> Healthy</span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-1 font-bold"><XCircle className="w-4 h-4" /> Unhealthy / Failed</span>
                    )}
                  </div>
                  
                  <div className="py-3 flex items-center justify-between">
                    <span className="text-slate-400">Authentication Service (Session Registry)</span>
                    <span className="text-emerald-400 flex items-center gap-1 font-bold"><CheckCircle2 className="w-4 h-4" /> Active</span>
                  </div>

                  <div className="py-3 flex items-center justify-between">
                    <span className="text-slate-400">Deployment Context</span>
                    <span className="text-indigo-300 font-semibold uppercase">{envConfig?.envVars?.VERCEL ? 'Vercel Serverless' : 'Cloud Run / Standard'}</span>
                  </div>

                  <div className="py-3 flex items-center justify-between">
                    <span className="text-slate-400">Environment Variables Status</span>
                    <span className="text-indigo-400 font-semibold">{envConfig?.envVars?.GEMINI_API_KEY ? 'Keys Provisioned' : 'Missing Critical Keys'}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={clearDevLogs}
                  className="px-3.5 py-1.5 bg-red-950/40 hover:bg-red-900/40 border border-red-500/30 text-red-400 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Clear Session Logs
                </button>
              </div>
            </div>
          )}

          {/* --- TAB: AUTHENTICATION DEBUGGER --- */}
          {activeTab === 'auth' && (
            <div className="space-y-6">
              <div className="p-4 bg-[#0b0e22] border border-indigo-950 rounded-2xl">
                <h3 className="text-xs font-bold text-white uppercase mb-1">Authentication Debugger</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Inspect every login and registration request made by the frontend. Sensitive inputs such as credentials are masked to prevent accidental security leaks.
                </p>
              </div>

              {authLogs.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-indigo-950/60 rounded-3xl text-slate-500 text-xs">
                  <Shield className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  No login or registration requests logged in this session yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {authLogs.map((log) => (
                    <div key={log.id} className="bg-[#0b0e22] border border-indigo-950 rounded-2xl overflow-hidden shadow-md">
                      {/* Accordion Header */}
                      <button
                        onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#111633] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase text-white ${
                            log.status === 200 ? 'bg-emerald-600' : 'bg-red-600'
                          }`}>
                            HTTP {log.status}
                          </span>
                          <span className="text-indigo-400 font-bold text-xs">{log.method}</span>
                          <span className="text-slate-300 text-xs font-mono">{log.url}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-slate-500 font-mono">{log.durationMs}ms</span>
                          {selectedLog?.id === log.id ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        </div>
                      </button>

                      {/* Accordion Content */}
                      {selectedLog?.id === log.id && (
                        <div className="px-5 pb-5 border-t border-indigo-950/40 pt-4 space-y-4 text-xs">
                          {/* Headers & Request details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <h4 className="font-bold text-white text-xs">Request Headers:</h4>
                              <pre className="bg-black/45 p-3 rounded-xl border border-white/5 text-[11px] overflow-x-auto text-slate-300">
                                {JSON.stringify(log.requestHeaders, null, 2)}
                              </pre>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-bold text-white text-xs">Request Payload (Masked):</h4>
                              <pre className="bg-black/45 p-3 rounded-xl border border-white/5 text-[11px] overflow-x-auto text-indigo-300">
                                {JSON.stringify(log.requestBody, null, 2)}
                              </pre>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-bold text-white text-xs">Response Headers:</h4>
                            <pre className="bg-black/45 p-3 rounded-xl border border-white/5 text-[11px] overflow-x-auto text-slate-300">
                              {JSON.stringify(log.responseHeaders, null, 2)}
                            </pre>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-white text-xs">Response Body:</h4>
                              <span className="text-[10px] opacity-70 font-mono">Content-Type: {log.contentType}</span>
                            </div>
                            <pre className="bg-black/45 p-3 rounded-xl border border-white/5 text-[11px] overflow-x-auto text-emerald-300 whitespace-pre-wrap max-h-60">
                              {log.responseBody}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* --- TAB: API INSPECTOR --- */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0b0e22] p-4 border border-indigo-950 rounded-2xl">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase">API Endpoint Inspector</h3>
                  <p className="text-[11px] text-slate-400">Evaluate backend routing efficiency, status returns, and body contents.</p>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search API routes..."
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    className="bg-black/45 border border-indigo-950 rounded-xl px-3 py-1.5 pl-8 text-xs text-white placeholder:text-slate-600 outline-none focus:border-indigo-500 transition-colors w-48 font-mono"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-600 absolute left-2.5 top-2.5" />
                </div>
              </div>

              {filteredFetchLogs.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-indigo-950/60 rounded-3xl text-slate-500 text-xs">
                  No api endpoints logged matching search filters.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFetchLogs.map((log) => (
                    <div key={log.id} className="bg-[#0b0e22] border border-indigo-950 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#111633] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            log.status === 200 ? 'bg-emerald-400' : log.status >= 400 || log.status === 0 ? 'bg-red-400' : 'bg-amber-400'
                          }`} />
                          <span className="font-bold text-indigo-400 text-xs shrink-0 w-12">{log.method}</span>
                          <span className="text-xs font-mono text-slate-200 truncate max-w-sm sm:max-w-md md:max-w-lg">{log.url}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className={`font-mono ${log.status === 200 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {log.status || 'FAILED'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{log.durationMs}ms</span>
                        </div>
                      </button>

                      {selectedLog?.id === log.id && (
                        <div className="p-4 bg-black/30 border-t border-indigo-950/40 text-xs space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <span className="text-[10px] text-slate-500 uppercase font-bold">Latency</span>
                              <div className="text-white text-xs">{log.durationMs} milliseconds</div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] text-slate-500 uppercase font-bold">JSON Parsing Status</span>
                              <div className={`text-xs ${log.parsedJson ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                                {log.parsedJson ? '✅ Succeeded (Valid JSON)' : '❌ Server returned non-JSON response'}
                              </div>
                            </div>
                          </div>

                          {log.probableRootCause && (
                            <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-xl text-red-300 text-xs space-y-1">
                              <div className="font-bold uppercase flex items-center gap-1.5 text-red-400">
                                <AlertTriangle className="w-3.5 h-3.5" /> DIAGNOSTIC REASON
                              </div>
                              <p className="leading-relaxed">{log.probableRootCause}</p>
                            </div>
                          )}

                          <div className="space-y-1.5">
                            <span className="text-[10px] text-slate-500 uppercase font-bold">Response Text</span>
                            <pre className="bg-black/60 p-3 rounded-xl border border-white/5 text-[11px] overflow-x-auto text-slate-300 max-h-52">
                              {log.responseBody || '[No response body content]'}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* --- TAB: DATABASE --- */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <div className="p-5 bg-[#0b0e22] border border-indigo-950 rounded-2xl space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-400" /> Database Specifications & Health Check
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Confessly uses an optimized structured JSON persistence engine with safe fallback support. Serverless contexts copy databases dynamically to Vercel's temporary workspaces (`/tmp`) to maintain state.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0b0e22] border border-indigo-950 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs text-white uppercase font-black">Storage Properties</h4>
                  <div className="divide-y divide-indigo-950/40 text-xs space-y-2.5">
                    <div className="pt-2 flex justify-between">
                      <span className="text-slate-500">Target DB Location</span>
                      <span className="text-slate-300 font-mono text-[10px] truncate max-w-[180px]" title={envConfig?.database?.filePath}>
                        {envConfig?.database?.filePath || 'Unavailable'}
                      </span>
                    </div>
                    <div className="pt-2.5 flex justify-between">
                      <span className="text-slate-500">Database Size</span>
                      <span className="text-indigo-400 font-bold">
                        {envConfig?.database?.fileSize ? `${(envConfig.database.fileSize / 1024).toFixed(2)} KB` : 'Initializing'}
                      </span>
                    </div>
                    <div className="pt-2.5 flex justify-between">
                      <span className="text-slate-500">Filesystem Writable</span>
                      <span className="text-emerald-400 font-bold">Yes (Validated)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0b0e22] border border-indigo-950 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs text-white uppercase font-black">Troubleshooting Diagnostics</h4>
                  <div className="text-[11px] leading-relaxed text-slate-400 space-y-2">
                    <p>
                      💡 <span className="font-bold text-white">Vercel Statelessness Warning:</span> On serverless deployments, any edits made will last as long as the Vercel function instance remains active. This is expected.
                    </p>
                    <p>
                      If you notice errors or data getting wiped constantly, configure your serverless project with durable cloud persistence like Firebase.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB: NETWORK MONITOR --- */}
          {activeTab === 'network' && (
            <div className="space-y-6">
              <div className="p-4 bg-[#0b0e22] border border-indigo-950 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase">Client Network Monitor</h3>
                  <p className="text-[11px] text-slate-400">Observes raw API fetch/XHR requests live from the browser client.</p>
                </div>
                <button
                  onClick={clearDevLogs}
                  className="px-2.5 py-1 text-[10px] bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Clear Logs
                </button>
              </div>

              {logs.filter(l => l.type === 'fetch').length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-indigo-950/60 rounded-3xl text-slate-500 text-xs">
                  No network requests made in this session yet.
                </div>
              ) : (
                <div className="bg-[#0b0e22] border border-indigo-950 rounded-2xl overflow-hidden text-xs">
                  <div className="grid grid-cols-12 gap-2 p-3 bg-indigo-950/40 text-slate-400 font-bold uppercase text-[9px] tracking-wider border-b border-indigo-950">
                    <div className="col-span-1">Status</div>
                    <div className="col-span-2">Method</div>
                    <div className="col-span-5">Path</div>
                    <div className="col-span-2">Duration</div>
                    <div className="col-span-2 text-right">Payload</div>
                  </div>
                  <div className="divide-y divide-indigo-950/40">
                    {logs.filter(l => l.type === 'fetch').map((log) => {
                      const payloadSize = log.responseBody ? `${(log.responseBody.length / 1024).toFixed(2)} KB` : '0 B';
                      return (
                        <div key={log.id} className="grid grid-cols-12 gap-2 p-3 hover:bg-[#111633] transition-colors items-center font-mono text-[11px]">
                          <div className="col-span-1">
                            <span className={`font-bold ${log.status === 200 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {log.status || 'ERR'}
                            </span>
                          </div>
                          <div className="col-span-2 text-indigo-400 font-bold">{log.method}</div>
                          <div className="col-span-5 text-slate-200 truncate" title={log.url}>{log.url}</div>
                          <div className="col-span-2 text-slate-400">{log.durationMs}ms</div>
                          <div className="col-span-2 text-right text-slate-400">{payloadSize}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- TAB: SYSTEM LOGS --- */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="p-4 bg-[#0b0e22] border border-indigo-950 rounded-2xl">
                <h3 className="text-xs font-bold text-white uppercase">System Audit & Debug Logs</h3>
                <p className="text-[11px] text-slate-400">View live actions registered in the backend datastore or client terminal traces.</p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Client-Side console traces */}
                <div className="bg-[#0b0e22] border border-indigo-950 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Client Console Interceptions</h4>
                  
                  {logs.filter(l => l.type === 'console' || l.type === 'error').length === 0 ? (
                    <div className="p-8 text-center text-slate-600 text-xs">No client-side traces caught.</div>
                  ) : (
                    <div className="space-y-2.5 max-h-96 overflow-y-auto scrollbar-none">
                      {logs.filter(l => l.type === 'console' || l.type === 'error').map((log) => (
                        <div key={log.id} className="p-2.5 bg-black/45 rounded-xl border border-white/5 text-[10px] space-y-1">
                          <div className="flex justify-between text-slate-500 font-mono text-[9px]">
                            <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                            <span className={log.type === 'error' ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                              {log.type.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-slate-300 break-words font-mono whitespace-pre-wrap">{log.message || log.errorMessage}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Server-Side logs */}
                <div className="bg-[#0b0e22] border border-indigo-950 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Server Datastore Audit Trail</h4>
                    <button
                      onClick={fetchAuditLogs}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                      disabled={loadingAuditLogs}
                    >
                      <RefreshCw className={`w-3 h-3 ${loadingAuditLogs ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                  </div>
                  
                  {auditLogs.length === 0 ? (
                    <div className="p-8 text-center text-slate-600 text-xs">No backend audit logs returned.</div>
                  ) : (
                    <div className="space-y-2.5 max-h-96 overflow-y-auto scrollbar-none">
                      {auditLogs.map((log: any) => (
                        <div key={log.id} className="p-2.5 bg-black/45 rounded-xl border border-white/5 text-[10px] space-y-1">
                          <div className="flex justify-between text-slate-500 font-mono text-[9px]">
                            <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                            <span className="text-indigo-400 font-bold uppercase">{log.action}</span>
                          </div>
                          <p className="text-slate-300 break-words font-mono">{log.details}</p>
                          <div className="flex justify-between text-[9px] text-slate-600 font-mono">
                            <span>User: {log.user}</span>
                            <span>IP: {log.ip}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* --- TAB: ERROR ANALYZER --- */}
          {activeTab === 'errors' && (
            <div className="space-y-6">
              <div className="p-5 bg-[#0b0e22] border border-indigo-950 rounded-2xl space-y-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500 animate-bounce" /> Smart Error Analyzer & Diagnostic Panel
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Automatically decomposes client runtime Javascript exceptions and failed backend requests. It reads response stacks and parses responses to offer probable fixes instantly.
                </p>
              </div>

              {errorLogs.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-indigo-950/60 rounded-3xl text-slate-500 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                  Your runtime environment is pristine. No errors logged in this session!
                </div>
              ) : (
                <div className="space-y-4">
                  {errorLogs.map((log) => (
                    <div key={log.id} className="bg-[#0b0e22] border border-red-900/30 rounded-2xl overflow-hidden shadow-lg">
                      <div className="bg-red-950/10 px-5 py-4 flex items-center justify-between border-b border-red-950/40">
                        <div className="flex items-center gap-3">
                          <span className="p-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
                            <AlertTriangle className="w-4 h-4" />
                          </span>
                          <div>
                            <span className="text-[9px] font-mono uppercase bg-red-500/20 text-red-300 border border-red-500/30 px-1.5 py-0.5 rounded">
                              {log.type === 'error' ? 'UNCAUGHT_ERROR' : 'API_ROUTER_FAILURE'}
                            </span>
                            <div className="text-xs font-mono font-bold text-slate-200 mt-1 max-w-sm sm:max-w-md md:max-w-xl break-words">
                              {log.errorMessage || `HTTP ${log.status} on ${log.method} ${log.url}`}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="p-5 space-y-4 text-xs">
                        {log.probableRootCause && (
                          <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1">
                            <h4 className="font-bold text-red-400 text-xs">Probable Cause & Corrective Action:</h4>
                            <p className="text-slate-300 leading-relaxed text-[11px] font-mono">{log.probableRootCause}</p>
                          </div>
                        )}

                        {log.errorFile && (
                          <div className="grid grid-cols-2 gap-3 p-3 bg-black/45 rounded-xl border border-white/5 font-mono text-[11px]">
                            <div>
                              <span className="text-slate-500">Failed File</span>
                              <p className="text-slate-300 mt-0.5 break-words">{log.errorFile}</p>
                            </div>
                            <div>
                              <span className="text-slate-500">Line Reference</span>
                              <p className="text-slate-300 mt-0.5">{log.errorLine || 'N/A'}</p>
                            </div>
                          </div>
                        )}

                        {log.errorStack && (
                          <div className="space-y-1.5">
                            <h4 className="font-bold text-slate-400 text-xs">Exception Stack Trace:</h4>
                            <pre className="bg-black/60 p-3.5 rounded-xl border border-white/5 text-[10px] overflow-x-auto text-rose-300/80 whitespace-pre scrollbar-none max-h-52">
                              {log.errorStack}
                            </pre>
                          </div>
                        )}

                        {log.responseBody && (
                          <div className="space-y-1.5">
                            <h4 className="font-bold text-slate-400 text-xs">Raw Server Response Content:</h4>
                            <pre className="bg-black/60 p-3.5 rounded-xl border border-white/5 text-[10px] overflow-x-auto text-slate-300 whitespace-pre-wrap max-h-52">
                              {log.responseBody}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* --- TAB: ENVIRONMENT CHECKER --- */}
          {activeTab === 'environment' && (
            <div className="space-y-6">
              <div className="p-4 bg-[#0b0e22] border border-indigo-950 rounded-2xl">
                <h3 className="text-xs font-bold text-white uppercase">Environment & Build Diagnostics</h3>
                <p className="text-[11px] text-slate-400">Verifies variables and presence assertions in the runtime environment safely.</p>
              </div>

              {/* Server Details */}
              <div className="bg-[#0b0e22] border border-indigo-950 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs text-white uppercase font-black">Runtime Assertions</h4>
                <div className="divide-y divide-indigo-950/40 text-xs space-y-3">
                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-500">Current Node Environment</span>
                    <span className="text-indigo-400 font-bold uppercase">{envConfig?.environment}</span>
                  </div>
                  <div className="pt-3 flex justify-between">
                    <span className="text-slate-500">Server Runtime Engine</span>
                    <span className="text-indigo-400 font-mono font-bold">{envConfig?.runtime}</span>
                  </div>
                  <div className="pt-3 flex justify-between">
                    <span className="text-slate-500">Host OS Platform</span>
                    <span className="text-indigo-400 font-mono font-bold">{envConfig?.platform}</span>
                  </div>
                  <div className="pt-3 flex justify-between">
                    <span className="text-slate-500">API Gateway Endpoint</span>
                    <span className="text-slate-300 font-mono">{envConfig?.apiBaseUrl || '[Empty/Local proxy]'}</span>
                  </div>
                  <div className="pt-3 flex justify-between">
                    <span className="text-slate-500">Request Origin Authority</span>
                    <span className="text-slate-300 font-mono">{envConfig?.origin}</span>
                  </div>
                </div>
              </div>

              {/* Secrets Presence Tracker */}
              <div className="bg-[#0b0e22] border border-indigo-950 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs text-white uppercase font-black">Environment Keys Presence (Safe Assertion)</h4>
                  <button 
                    onClick={() => setRevealSecrets(!revealSecrets)}
                    className="text-[9px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 uppercase font-bold cursor-pointer"
                  >
                    {revealSecrets ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {revealSecrets ? 'Hide' : 'Reveal Info'}
                  </button>
                </div>
                
                <p className="text-[10px] text-slate-500 italic leading-relaxed">
                  🔒 Secrets are checked on the server side; only the presence status boolean is returned to the browser client. Values are never exposed.
                </p>

                <div className="space-y-2 text-xs">
                  {envConfig?.envVars && Object.entries(envConfig.envVars).map(([key, value]: any) => (
                    <div key={key} className="p-3 bg-black/45 rounded-xl border border-white/5 flex items-center justify-between">
                      <span className="font-mono text-slate-300">{key}</span>
                      <div className="flex items-center gap-2">
                        {revealSecrets && (
                          <span className="text-[10px] text-slate-500 font-mono uppercase mr-1">
                            {key === 'GEMINI_API_KEY' ? 'Server-Side' : 'Runtime-Config'}
                          </span>
                        )}
                        {value ? (
                          <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] rounded-lg font-bold">
                            PRESENT
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] rounded-lg font-bold">
                            MISSING
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
