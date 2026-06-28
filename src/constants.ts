/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category } from './types.js';

export const CATEGORIES: Category[] = [
  'Confession',
  'Roast',
  'Question',
  'Suggestion',
  'Compliment',
  'Random',
  'Crush'
];

export const CATEGORY_EMOJIS: { [key in Category]: string } = {
  Confession: '🤫',
  Roast: '🔥',
  Question: '🤔',
  Suggestion: '💡',
  Compliment: '💖',
  Random: '🎲',
  Crush: '💌'
};

export interface CardTheme {
  id: string;
  name: string;
  bgClass: string;          // Page / App background
  cardBgClass: string;      // Profile Card / Message Card background
  textClass: string;        // Primary text
  accentTextClass: string;  // Accent text (e.g. username, subheaders)
  borderClass: string;      // Border styles
  badgeClass: string;       // Badge style
  buttonClass: string;      // Main CTA button style
}

export const CARD_THEMES: CardTheme[] = [
  {
    id: 'ngl',
    name: 'NGL Inspired',
    bgClass: 'bg-gradient-to-tr from-[#fe3b30] via-[#ff5e36] to-[#ff9500]',
    cardBgClass: 'bg-white/95 backdrop-blur-md',
    textClass: 'text-slate-900',
    accentTextClass: 'text-[#fe3b30]',
    borderClass: 'border-orange-500/10',
    badgeClass: 'bg-[#fe3b30]/10 text-[#fe3b30] border border-[#fe3b30]/20',
    buttonClass: 'bg-gradient-to-r from-[#fe3b30] to-[#ff5e36] hover:opacity-95 text-white shadow-lg shadow-orange-500/20'
  },
  {
    id: 'minimal_white',
    name: 'Minimal White',
    bgClass: 'bg-slate-50',
    cardBgClass: 'bg-white border border-slate-200/80 shadow-xs',
    textClass: 'text-slate-900',
    accentTextClass: 'text-slate-500',
    borderClass: 'border-slate-200',
    badgeClass: 'bg-slate-100 text-slate-800 border border-slate-200/60',
    buttonClass: 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
  },
  {
    id: 'midnight_black',
    name: 'Midnight Black',
    bgClass: 'bg-black',
    cardBgClass: 'bg-neutral-900 border border-neutral-800 shadow-md',
    textClass: 'text-white',
    accentTextClass: 'text-neutral-400',
    borderClass: 'border-neutral-800',
    badgeClass: 'bg-neutral-800 text-neutral-300 border border-neutral-700/50',
    buttonClass: 'bg-white hover:bg-neutral-200 text-black font-extrabold shadow-md'
  },
  {
    id: 'purple_neon',
    name: 'Purple Neon',
    bgClass: 'bg-[#0a001a]',
    cardBgClass: 'bg-purple-950/40 border border-purple-500/40 backdrop-blur-md shadow-lg shadow-purple-950/40',
    textClass: 'text-purple-100',
    accentTextClass: 'text-purple-400',
    borderClass: 'border-purple-500/30',
    badgeClass: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    buttonClass: 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
  },
  {
    id: 'ocean_blue',
    name: 'Ocean Blue',
    bgClass: 'bg-gradient-to-tr from-sky-950 via-blue-900 to-indigo-950',
    cardBgClass: 'bg-blue-950/50 border border-sky-500/30 backdrop-blur-md',
    textClass: 'text-sky-100',
    accentTextClass: 'text-sky-400',
    borderClass: 'border-sky-500/20',
    badgeClass: 'bg-sky-500/20 text-sky-200 border border-sky-500/30',
    buttonClass: 'bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/20'
  },
  {
    id: 'forest_green',
    name: 'Forest Green',
    bgClass: 'bg-gradient-to-tr from-emerald-950 via-green-900 to-teal-950',
    cardBgClass: 'bg-emerald-950/40 border border-emerald-500/30 backdrop-blur-md',
    textClass: 'text-emerald-100',
    accentTextClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/20',
    badgeClass: 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30',
    buttonClass: 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20'
  },
  {
    id: 'sunset_orange',
    name: 'Sunset Orange',
    bgClass: 'bg-gradient-to-br from-orange-950 via-red-950 to-stone-950',
    cardBgClass: 'bg-orange-950/40 border border-orange-500/30 backdrop-blur-md',
    textClass: 'text-orange-100',
    accentTextClass: 'text-orange-400',
    borderClass: 'border-orange-500/20',
    badgeClass: 'bg-orange-500/20 text-orange-200 border border-orange-500/30',
    buttonClass: 'bg-orange-550 hover:bg-orange-500 text-slate-950 font-black shadow-lg shadow-orange-500/20'
  },
  {
    id: 'rose_pink',
    name: 'Rose Pink',
    bgClass: 'bg-gradient-to-tr from-pink-700 via-rose-800 to-red-700',
    cardBgClass: 'bg-pink-950/40 border border-pink-500/30 backdrop-blur-md',
    textClass: 'text-pink-100',
    accentTextClass: 'text-pink-400',
    borderClass: 'border-pink-500/20',
    badgeClass: 'bg-pink-500/20 text-pink-200 border border-pink-500/30',
    buttonClass: 'bg-pink-500 hover:bg-pink-400 text-white shadow-lg shadow-pink-500/20'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    bgClass: 'bg-[#f3f019]',
    cardBgClass: 'bg-black border-4 border-black shadow-[8px_8px_0px_#000]',
    textClass: 'text-white',
    accentTextClass: 'text-[#f3f019] font-mono',
    borderClass: 'border-black',
    badgeClass: 'bg-[#f3f019] text-black font-black uppercase tracking-wider',
    buttonClass: 'bg-black hover:bg-stone-900 border-2 border-[#f3f019] text-[#f3f019] font-mono font-extrabold uppercase py-3 shadow-[4px_4px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all'
  },
  {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    bgClass: 'bg-gradient-to-tr from-indigo-100 via-purple-100 to-pink-100',
    cardBgClass: 'bg-white/40 border border-white/40 backdrop-blur-xl shadow-xl',
    textClass: 'text-purple-950',
    accentTextClass: 'text-purple-600',
    borderClass: 'border-white/35',
    badgeClass: 'bg-purple-200/50 text-purple-900 border border-white/30',
    buttonClass: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md'
  },
  {
    id: 'dark_glass',
    name: 'Dark Glass',
    bgClass: 'bg-slate-950',
    cardBgClass: 'bg-slate-900/40 border border-slate-800/60 backdrop-blur-xl shadow-2xl',
    textClass: 'text-slate-100',
    accentTextClass: 'text-slate-450',
    borderClass: 'border-slate-800/40',
    badgeClass: 'bg-slate-800/60 text-slate-300 border border-slate-700/50',
    buttonClass: 'bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold shadow-md'
  },
  {
    id: 'aurora',
    name: 'Aurora',
    bgClass: 'bg-gradient-to-tr from-[#02111d] via-[#012538] to-[#014163]',
    cardBgClass: 'bg-sky-950/30 border border-emerald-400/30 backdrop-blur-md',
    textClass: 'text-emerald-100',
    accentTextClass: 'text-cyan-400',
    borderClass: 'border-emerald-500/20',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    buttonClass: 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-95 text-sky-950 font-black shadow-lg'
  },
  {
    id: 'space',
    name: 'Space',
    bgClass: 'bg-gradient-to-br from-slate-950 via-[#0e001f] to-zinc-950',
    cardBgClass: 'bg-[#15002a]/50 border border-indigo-500/40 backdrop-blur-md',
    textClass: 'text-indigo-100',
    accentTextClass: 'text-purple-450',
    borderClass: 'border-indigo-500/30',
    badgeClass: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    buttonClass: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
  },
  {
    id: 'matrix',
    name: 'Matrix',
    bgClass: 'bg-black',
    cardBgClass: 'bg-black border border-[#00ff00] shadow-[0_0_10px_rgba(0,255,0,0.2)]',
    textClass: 'text-[#00ff00] font-mono',
    accentTextClass: 'text-[#00aa00] font-mono',
    borderClass: 'border-[#00ff00]/40',
    badgeClass: 'bg-black border border-[#00ff00] text-[#00ff00] font-mono',
    buttonClass: 'bg-black hover:bg-[#003300] text-[#00ff00] font-mono font-bold border border-[#00ff00] shadow-[4px_4px_0px_#005500]'
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    bgClass: 'bg-white',
    cardBgClass: 'bg-white border-2 border-black shadow-xs',
    textClass: 'text-black',
    accentTextClass: 'text-zinc-500 font-mono',
    borderClass: 'border-black',
    badgeClass: 'bg-black text-white border border-black',
    buttonClass: 'bg-black hover:bg-zinc-850 text-white font-bold uppercase tracking-wider'
  },
  {
    id: 'material_design',
    name: 'Material Design',
    bgClass: 'bg-slate-100',
    cardBgClass: 'bg-white shadow-md border border-slate-200/50',
    textClass: 'text-slate-900',
    accentTextClass: 'text-indigo-650',
    borderClass: 'border-slate-250',
    badgeClass: 'bg-indigo-100 text-indigo-800 border border-indigo-200/50',
    buttonClass: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
  },
  {
    id: 'pastel',
    name: 'Pastel',
    bgClass: 'bg-gradient-to-tr from-pink-100 via-purple-100 to-blue-100',
    cardBgClass: 'bg-white/80 border border-white/60 backdrop-blur-md shadow-xs',
    textClass: 'text-slate-800',
    accentTextClass: 'text-purple-500',
    borderClass: 'border-white/40',
    badgeClass: 'bg-pink-100 text-pink-700 border border-pink-200/50',
    buttonClass: 'bg-pink-400 hover:bg-pink-350 text-white font-semibold'
  },
  {
    id: 'retro',
    name: 'Retro',
    bgClass: 'bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950',
    cardBgClass: 'bg-indigo-950/60 border-2 border-pink-500 shadow-[4px_4px_0_#06b6d4]',
    textClass: 'text-pink-300 font-mono',
    accentTextClass: 'text-cyan-400 font-mono',
    borderClass: 'border-pink-500',
    badgeClass: 'bg-pink-500/20 border border-pink-500 text-pink-300 font-mono',
    buttonClass: 'bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-black border border-black shadow-[4px_4px_0_#ec4899]'
  },
  {
    id: 'gaming',
    name: 'Gaming',
    bgClass: 'bg-neutral-950',
    cardBgClass: 'bg-neutral-900 border border-neutral-800 shadow-[0_0_15px_rgba(239,68,68,0.1)]',
    textClass: 'text-neutral-100',
    accentTextClass: 'text-red-500 font-mono',
    borderClass: 'border-neutral-800',
    badgeClass: 'bg-red-950/50 border border-red-500/30 text-red-400',
    buttonClass: 'bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wider'
  },
  {
    id: 'anime_inspired',
    name: 'Anime Inspired',
    bgClass: 'bg-gradient-to-tr from-[#ffdeeb] to-[#e4efff]',
    cardBgClass: 'bg-white/90 border border-[#ffb7d5] shadow-xs',
    textClass: 'text-[#2d2238]',
    accentTextClass: 'text-[#ff5a9d]',
    borderClass: 'border-[#ffcce1]',
    badgeClass: 'bg-[#ffd9e8] text-[#ff3a89] border border-[#ffb7d5]/40',
    buttonClass: 'bg-[#ff5a9d] hover:bg-[#ff3a89] text-white font-bold shadow-xs'
  },
  {
    id: 'aesthetic_beige',
    name: 'Aesthetic Beige',
    bgClass: 'bg-[#f5ebe0]',
    cardBgClass: 'bg-[#e3d5ca]/60 border border-[#d5bdaf]/50 shadow-xs',
    textClass: 'text-[#4f3422]',
    accentTextClass: 'text-[#a28a76]',
    borderClass: 'border-[#d5bdaf]',
    badgeClass: 'bg-[#e3d5ca] text-[#4f3422] border border-[#d5bdaf]/40',
    buttonClass: 'bg-[#4f3422] hover:bg-[#3d281a] text-white font-semibold'
  }
];
