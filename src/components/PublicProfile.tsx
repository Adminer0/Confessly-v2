/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from './Router.jsx';
import { CARD_THEMES, CATEGORIES, CATEGORY_EMOJIS } from '../constants.js';
import { Category } from '../types.js';
import { Share2, Sparkles, AlertCircle, Copy, Check, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PublicProfile() {
  const { params, navigate } = useRouter();
  const username = params.username || '';

  // Profile data state
  const [profile, setProfile] = useState<{
    username: string;
    displayName: string;
    bio: string;
    selectedTheme: string;
    avatarUrl: string;
  } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Submission states
  const [message, setMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Confession');
  const [nickname, setNickname] = useState('');
  
  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [autoBlocked, setAutoBlocked] = useState(false);

  // Location/coords
  const [coords, setCoords] = useState<{ latitude?: number; longitude?: number }>({});

  const [isSavingTheme, setIsSavingTheme] = useState(false);

  const handleThemeChange = async (themeId: string) => {
    if (!profile) return;
    
    // Instant live preview
    setProfile(prev => prev ? { ...prev, selectedTheme: themeId } : null);
    
    setIsSavingTheme(true);
    try {
      const response = await fetch(`/api/public/profile/${username.replace(/^@/, '').toLowerCase()}/theme`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: themeId })
      });
      if (!response.ok) {
        console.error('Failed to automatically save selected theme.');
      }
    } catch (err) {
      console.error('Network error saving theme selection:', err);
    } finally {
      setIsSavingTheme(false);
    }
  };

  useEffect(() => {
    if (!username) return;

    setLoading(true);
    fetch(`/api/public/profile/${username}`)
      .then((res) => {
        if (!res.ok) throw new Error('Could not find this profile. Please check the username.');
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    // Request geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Geolocation access skipped or denied', error);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [username]);

  const copyProfileLink = () => {
    const link = `${window.location.origin}/@${username}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= 300) {
      setMessage(text);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setSubmitError('The message cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      targetUsername: username.replace(/^@/, '').toLowerCase(),
      message: message.trim(),
      category: selectedCategory,
      emoji: CATEGORY_EMOJIS[selectedCategory],
      theme: profile?.selectedTheme || 'ngl',
      nickname: nickname.trim() || undefined,
      resolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      latitude: coords.latitude,
      longitude: coords.longitude
    };

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit confession. Please try again.');
      }

      setIsSubmitting(false);
      setSubmitSuccess(true);
      setAutoBlocked(!!data.autoBlocked);
    } catch (err: any) {
      setIsSubmitting(false);
      setSubmitError(err.message || 'Network error occurred. Please try again.');
    }
  };

  // Resolve active theme configuration or fallback to first theme
  const activeTheme = CARD_THEMES.find(t => t.id === profile?.selectedTheme) || CARD_THEMES[0];

  return (
    <div className={`min-h-screen relative flex flex-col justify-between transition-colors duration-500 overflow-hidden ${activeTheme.bgClass}`}>
      {/* Dynamic Background Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.15)_0%,transparent_80%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_40%,rgba(0,0,0,0.1)_100%)] pointer-events-none" />

      {/* Header with quick navigations */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/80 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Home
        </button>
        <span className="text-[10px] font-mono tracking-widest text-white/50 uppercase">Confessly App</span>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 max-w-lg mx-auto w-full py-8">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-white">
            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono tracking-wider opacity-80">Loading @{username}...</p>
          </div>
        ) : error || !profile ? (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center text-white shadow-2xl max-w-sm w-full">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-2">Profile Unavailable</h2>
            <p className="text-white/70 text-xs leading-relaxed mb-6">
              {error || 'This user profile does not exist.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-white text-slate-900 font-semibold py-2.5 rounded-xl text-xs hover:bg-slate-100 transition-all cursor-pointer"
            >
              Go Back Home
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {!submitSuccess ? (
              <motion.div
                key="submission-card-view"
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -15 }}
                transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
                className="w-full space-y-6"
              >
                {/* Profile Identity Details */}
                <div className="flex flex-col items-center text-center space-y-2 mb-2 text-white">
                  {/* High Contrast Avatar with initials */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-white/25 rounded-full blur-xs group-hover:blur-sm transition-all" />
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.displayName}
                        referrerPolicy="no-referrer"
                        className="relative h-20 w-20 rounded-full border-2 border-white object-cover shadow-lg"
                      />
                    ) : (
                      <div className="relative h-20 w-20 bg-white text-slate-900 rounded-full border-2 border-white flex items-center justify-center font-black text-3xl shadow-lg">
                        {profile.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h1 className="text-xl font-extrabold tracking-tight drop-shadow-sm flex items-center justify-center gap-1.5">
                      {profile.displayName}
                    </h1>
                    <p className="text-xs font-mono tracking-wider opacity-85">
                      @{profile.username}
                    </p>
                  </div>

                  {profile.bio && (
                    <p className="text-xs opacity-75 max-w-xs leading-relaxed italic drop-shadow-xs">
                      "{profile.bio}"
                    </p>
                  )}
                </div>

                {/* Horizontally Scrollable Theme Selector */}
                <div className="w-full bg-black/15 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-white space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-85 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Choose Profile Theme
                    </span>
                    {isSavingTheme && (
                      <span className="text-[9px] font-mono opacity-85 bg-white/10 px-2 py-0.5 rounded-md animate-pulse">
                        Saving...
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1.5 select-none scrollbar-none scroll-smooth">
                    {CARD_THEMES.map((theme) => {
                      const isSelected = (profile?.selectedTheme || 'ngl') === theme.id;
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => handleThemeChange(theme.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 cursor-pointer ${
                            isSelected
                              ? 'bg-white text-slate-950 border-white scale-[1.03] shadow-md'
                              : 'bg-black/25 border-white/10 hover:bg-black/35 hover:border-white/20 text-white'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded-full ${theme.bgClass} border border-white/20 shrink-0`} />
                          <span className="truncate max-w-[110px]">{theme.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Premium Interactive Submission Card */}
                <form onSubmit={handleSubmit} className="w-full">
                  <div className={`rounded-3xl p-6 sm:p-7 shadow-2xl border flex flex-col justify-between relative transition-all duration-300 ${activeTheme.cardBgClass} ${activeTheme.borderClass}`}>
                    
                    {/* Speech bubble header */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${activeTheme.badgeClass}`}>
                        {CATEGORY_EMOJIS[selectedCategory]} Send {selectedCategory}
                      </span>
                    </div>

                    <h2 className={`text-base font-black leading-tight mb-3.5 tracking-tight ${activeTheme.textClass}`}>
                      Send me anonymous messages!
                    </h2>

                    {/* Confession text area */}
                    <textarea
                      id="confession-text"
                      rows={5}
                      required
                      placeholder={`type something honest... (300 char max)`}
                      value={message}
                      onChange={handleMessageChange}
                      className={`w-full bg-black/5 hover:bg-black/10 focus:bg-black/10 rounded-2xl p-4 text-sm font-semibold placeholder:opacity-50 outline-none transition-colors leading-relaxed border border-black/5 focus:border-black/10 resize-none ${activeTheme.textClass}`}
                    />

                    {/* Character limit feedback */}
                    <div className="flex justify-end mt-1">
                      <span className={`text-[10px] font-mono opacity-60 ${activeTheme.textClass}`}>
                        {message.length} / 300
                      </span>
                    </div>

                    {/* Category Selection Carousel */}
                    <div className="mt-4 pt-4 border-t border-black/5">
                      <label className={`block text-[10px] uppercase tracking-wider font-extrabold opacity-60 mb-2.5 ${activeTheme.textClass}`}>
                        Choose Card Category
                      </label>
                      <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-black/15">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setSelectedCategory(cat);
                              setSubmitError(null);
                            }}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 cursor-pointer ${
                              selectedCategory === cat
                                ? `${activeTheme.badgeClass} scale-[1.03]`
                                : 'bg-black/5 border-transparent opacity-65 hover:opacity-90'
                            } ${activeTheme.textClass}`}
                          >
                            <span>{CATEGORY_EMOJIS[cat]}</span>
                            <span>{cat}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Optional Nickname input */}
                    <div className="mt-4 pt-3 border-t border-black/5">
                      <label htmlFor="nickname-input" className={`block text-[10px] uppercase tracking-wider font-extrabold opacity-60 mb-1.5 ${activeTheme.textClass}`}>
                        Optional Nickname <span className="opacity-60">(Anonymous if empty)</span>
                      </label>
                      <input
                        id="nickname-input"
                        type="text"
                        maxLength={25}
                        placeholder="e.g. Secret admirer, Bestie"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className={`w-full bg-black/5 hover:bg-black/10 focus:bg-black/10 rounded-xl py-2 px-3.5 text-xs font-bold placeholder:opacity-40 outline-none transition-colors border border-black/5 focus:border-black/10 ${activeTheme.textClass}`}
                      />
                    </div>

                    {/* Submit Error */}
                    {submitError && (
                      <div className="mt-4 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    {/* Submit message action */}
                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full font-black py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider active:scale-[0.98] cursor-pointer ${activeTheme.buttonClass}`}
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Message!
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </form>

                {/* Secondary Board Actions */}
                <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                  <button
                    onClick={copyProfileLink}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white border border-white/25 hover:border-white/45 font-bold py-3.5 px-5 rounded-2xl transition-all text-xs cursor-pointer shadow-lg"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                    {copied ? 'Copied Link!' : 'Share My Link'}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success-card-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-10 text-center text-white shadow-2xl max-w-sm w-full"
              >
                <div className="mx-auto w-14 h-14 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-300 mb-6 animate-bounce">
                  <CheckCircle2 className="w-7 h-7" />
                </div>

                <h1 className="text-2xl font-black tracking-tight mb-2">Message Sent! 🤫</h1>
                <p className="text-white/80 text-xs leading-relaxed mb-8">
                  {autoBlocked 
                    ? 'Your message was successfully sent, but flag filters triggered. It was redirected to the spam queue.'
                    : 'Your message has been delivered anonymously to the queue. Keep them coming!'
                  }
                </p>

                <button
                  onClick={() => {
                    setSubmitSuccess(false);
                    setMessage('');
                    setAutoBlocked(false);
                  }}
                  className={`w-full py-3.5 font-bold rounded-2xl transition-all text-xs uppercase tracking-wider ${activeTheme.buttonClass}`}
                >
                  Send Another Message
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-5 text-center text-[10px] text-white/50 tracking-wider">
        Guaranteed 100% Anonymous. Powered by Confessly.
      </footer>
    </div>
  );
}
