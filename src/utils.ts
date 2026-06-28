/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export async function exportCardToPng(
  cardId: string,
  message: string,
  category: string,
  nickname: string,
  emoji: string,
  themeId: string,
  reply?: string,
  shareOption: 'download' | 'insta' = 'download'
) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920; // Perfect vertical story aspect ratio!
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Draw background based on theme
  const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
  
  if (themeId === 'ngl') {
    grad.addColorStop(0, '#fe3b30');
    grad.addColorStop(0.5, '#ff5e36');
    grad.addColorStop(1, '#ff9500');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);
  } else if (themeId === 'minimal_white') {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 1080, 1920);
  } else if (themeId === 'midnight_black') {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 1080, 1920);
  } else if (themeId === 'purple_neon') {
    ctx.fillStyle = '#0a001a';
    ctx.fillRect(0, 0, 1080, 1920);
  } else if (themeId === 'ocean_blue') {
    grad.addColorStop(0, '#082f49');
    grad.addColorStop(0.5, '#1e3a8a');
    grad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);
  } else if (themeId === 'forest_green') {
    grad.addColorStop(0, '#022c22');
    grad.addColorStop(0.5, '#064e3b');
    grad.addColorStop(1, '#115e59');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);
  } else if (themeId === 'sunset_orange') {
    grad.addColorStop(0, '#7c2d12');
    grad.addColorStop(0.5, '#450a0a');
    grad.addColorStop(1, '#1c1917');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);
  } else if (themeId === 'rose_pink') {
    grad.addColorStop(0, '#be185d');
    grad.addColorStop(0.5, '#9f1239');
    grad.addColorStop(1, '#be123c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);
  } else if (themeId === 'cyberpunk') {
    ctx.fillStyle = '#f3f019';
    ctx.fillRect(0, 0, 1080, 1920);
  } else if (themeId === 'glassmorphism') {
    grad.addColorStop(0, '#e0e7ff');
    grad.addColorStop(0.5, '#f3e8ff');
    grad.addColorStop(1, '#fce7f3');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);
  } else if (themeId === 'dark_glass') {
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, 1080, 1920);
  } else if (themeId === 'aurora') {
    grad.addColorStop(0, '#02111d');
    grad.addColorStop(0.5, '#012538');
    grad.addColorStop(1, '#014163');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);
  } else if (themeId === 'space') {
    grad.addColorStop(0, '#020617');
    grad.addColorStop(0.5, '#0e001f');
    grad.addColorStop(1, '#18181b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);
  } else if (themeId === 'matrix') {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 1080, 1920);
    // Draw matrix style vertical lines
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.05)';
    ctx.lineWidth = 2;
    for (let x = 40; x < 1080; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1920);
      ctx.stroke();
    }
  } else if (themeId === 'monochrome') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1080, 1920);
  } else if (themeId === 'material_design') {
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, 1080, 1920);
  } else if (themeId === 'pastel') {
    grad.addColorStop(0, '#fce7f3');
    grad.addColorStop(0.5, '#f3e8ff');
    grad.addColorStop(1, '#dbeafe');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);
  } else if (themeId === 'retro') {
    grad.addColorStop(0, '#0f051d');
    grad.addColorStop(0.5, '#1e052d');
    grad.addColorStop(1, '#33001a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);
  } else if (themeId === 'gaming') {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 1080, 1920);
  } else if (themeId === 'anime_inspired') {
    grad.addColorStop(0, '#ffdeeb');
    grad.addColorStop(1, '#e4efff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);
  } else if (themeId === 'aesthetic_beige') {
    ctx.fillStyle = '#f5ebe0';
    ctx.fillRect(0, 0, 1080, 1920);
  } else {
    // fallback
    grad.addColorStop(0, '#fe3b30');
    grad.addColorStop(1, '#ff9500');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);
  }

  // Define Overlay Card Dimensions
  const cardX = 100;
  const cardY = reply ? 280 : 500;
  const cardW = 880;
  const cardH = reply ? 580 : 820;
  const cornerRadius = 48;

  // Set Card Background
  if (themeId === 'cyberpunk' || themeId === 'monochrome') {
    ctx.fillStyle = '#000000';
  } else if (themeId === 'minimal_white' || themeId === 'material_design' || themeId === 'anime_inspired') {
    ctx.fillStyle = '#ffffff';
  } else if (themeId === 'midnight_black' || themeId === 'gaming') {
    ctx.fillStyle = '#171717';
  } else if (themeId === 'aesthetic_beige') {
    ctx.fillStyle = 'rgba(227, 213, 202, 0.75)';
  } else if (themeId === 'glassmorphism' || themeId === 'pastel') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  } else if (themeId === 'matrix') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
  } else {
    // Glassy default
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  }

  // Draw Card Container
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, cornerRadius);
  ctx.fill();

  // Draw Card Border
  if (themeId === 'cyberpunk') {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 10;
  } else if (themeId === 'monochrome') {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
  } else if (themeId === 'minimal_white' || themeId === 'material_design' || themeId === 'anime_inspired' || themeId === 'aesthetic_beige') {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 2;
  } else if (themeId === 'matrix') {
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;
  } else if (themeId === 'retro') {
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 5;
  } else if (themeId === 'purple_neon') {
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
    ctx.lineWidth = 3;
  } else {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 2;
  }
  ctx.stroke();

  // Color Configuration for texts/badges
  let textColor = '#ffffff';
  let badgeTextColor = '#ffffff';
  let badgeBg = 'rgba(255, 255, 255, 0.18)';
  let watermarkColor = 'rgba(255, 255, 255, 0.5)';
  let watermarkSubColor = 'rgba(255, 255, 255, 0.35)';

  if (themeId === 'minimal_white' || themeId === 'material_design') {
    textColor = '#0f172a';
    badgeTextColor = '#475569';
    badgeBg = '#f1f5f9';
    watermarkColor = 'rgba(15, 23, 42, 0.6)';
    watermarkSubColor = 'rgba(15, 23, 42, 0.4)';
  } else if (themeId === 'monochrome') {
    textColor = '#ffffff';
    badgeTextColor = '#000000';
    badgeBg = '#ffffff';
    watermarkColor = '#000000';
    watermarkSubColor = '#52525b';
  } else if (themeId === 'cyberpunk') {
    textColor = '#ffffff';
    badgeTextColor = '#000000';
    badgeBg = '#f3f019';
    watermarkColor = '#000000';
    watermarkSubColor = '#1c1917';
  } else if (themeId === 'matrix') {
    textColor = '#00ff00';
    badgeTextColor = '#00ff00';
    badgeBg = 'rgba(0, 255, 0, 0.1)';
    watermarkColor = '#00ff00';
    watermarkSubColor = '#008800';
  } else if (themeId === 'anime_inspired') {
    textColor = '#2d2238';
    badgeTextColor = '#ff3a89';
    badgeBg = '#ffd9e8';
    watermarkColor = '#ff5a9d';
    watermarkSubColor = 'rgba(255, 90, 157, 0.6)';
  } else if (themeId === 'aesthetic_beige') {
    textColor = '#4f3422';
    badgeTextColor = '#4f3422';
    badgeBg = '#e3d5ca';
    watermarkColor = '#4f3422';
    watermarkSubColor = '#a28a76';
  } else if (themeId === 'glassmorphism' || themeId === 'pastel') {
    textColor = '#1e1b4b';
    badgeTextColor = '#4f46e5';
    badgeBg = '#e0e7ff';
    watermarkColor = '#4f46e5';
    watermarkSubColor = '#818cf8';
  } else if (themeId === 'retro') {
    textColor = '#f472b6';
    badgeTextColor = '#22d3ee';
    badgeBg = 'rgba(34, 211, 238, 0.15)';
    watermarkColor = '#ec4899';
    watermarkSubColor = '#22d3ee';
  } else if (themeId === 'gaming') {
    textColor = '#f5f5f5';
    badgeTextColor = '#ef4444';
    badgeBg = 'rgba(239, 68, 68, 0.12)';
  }

  // Draw Badge (Category)
  ctx.fillStyle = badgeBg;
  ctx.beginPath();
  ctx.roundRect(160, cardY + 80, 280, 70, 20);
  ctx.fill();

  if (themeId === 'gold') {
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Badge Text
  ctx.font = 'bold 32px Inter, sans-serif';
  ctx.fillStyle = badgeTextColor;
  ctx.textAlign = 'center';
  ctx.fillText(`${emoji} ${category}`, 300, cardY + 126);

  // Nickname
  ctx.font = '500 36px Inter, sans-serif';
  ctx.fillStyle = themeId === 'clean' ? '#e11d48' : textColor; // Rose accent for clean nickname
  ctx.textAlign = 'right';
  ctx.fillText(`- ${nickname}`, 880, cardY + 126);

  // Message Text wrapped
  ctx.font = 'italic 46px Inter, sans-serif';
  if (themeId === 'clean') {
    ctx.font = 'normal 46px sans-serif'; // Clean minimal sans
  }
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';

  const textX = 540;
  let textY = cardY + 250;
  const maxWidth = 760;
  const lineHeight = 65;

  // Word wrap helper
  const words = message.split(' ');
  let line = '';
  const lines = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      lines.push(line);
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  for (let i = 0; i < lines.length; i++) {
    if (textY < cardY + cardH - 60) {
      ctx.fillText(lines[i].trim(), textX, textY);
      textY += lineHeight;
    }
  }

  // Draw Reply bubble if provided
  if (reply) {
    const replyX = 100;
    const replyY = 920;
    const replyW = 880;
    const replyH = 450;
    const replyRadius = 48;

    // Background of reply box (contrasting beautiful bubble)
    if (themeId === 'clean') {
      ctx.fillStyle = '#1e293b'; // Slate-800
    } else if (themeId === 'matcha') {
      ctx.fillStyle = '#065f46'; // Emerald-800
    } else if (themeId === 'bubblegum') {
      ctx.fillStyle = '#ec4899'; // Pink-500
    } else if (themeId === 'gold') {
      ctx.fillStyle = '#fbbf24'; // Amber-400
    } else {
      ctx.fillStyle = '#ffffff'; // White for gorgeous high contrast with dark colors
    }

    ctx.beginPath();
    ctx.roundRect(replyX, replyY, replyW, replyH, replyRadius);
    ctx.fill();

    // Draw Reply Label
    ctx.font = 'bold 30px Inter, sans-serif';
    ctx.fillStyle = (themeId === 'clean' || themeId === 'matcha' || themeId === 'bubblegum') ? '#ffffff' : '#0f172a';
    ctx.textAlign = 'left';
    ctx.fillText(`REPLY:`, replyX + 60, replyY + 80);

    // Draw Reply Text wrapped
    ctx.font = 'bold 44px Inter, sans-serif';
    ctx.fillStyle = (themeId === 'clean' || themeId === 'matcha' || themeId === 'bubblegum') ? '#ffffff' : '#0f172a';
    ctx.textAlign = 'center';

    const rTextX = 540;
    let rTextY = replyY + 180;
    const rMaxWidth = 760;
    const rLineHeight = 62;

    const rWords = reply.split(' ');
    let rLine = '';
    const rLines = [];

    for (let r = 0; r < rWords.length; r++) {
      const testRLine = rLine + rWords[r] + ' ';
      const rMetrics = ctx.measureText(testRLine);
      const rTestWidth = rMetrics.width;
      if (rTestWidth > rMaxWidth && r > 0) {
        rLines.push(rLine);
        rLine = rWords[r] + ' ';
      } else {
        rLine = testRLine;
      }
    }
    rLines.push(rLine);

    for (let j = 0; j < rLines.length; j++) {
      if (rTextY < replyY + replyH - 40) {
        ctx.fillText(rLines[j].trim(), rTextX, rTextY);
        rTextY += rLineHeight;
      }
    }
  }

  // Draw Brand Logo Watermark at bottom
  ctx.font = 'bold 50px Inter, sans-serif';
  ctx.fillStyle = watermarkColor;
  ctx.textAlign = 'center';
  ctx.fillText('Confessly', 540, 1520);

  ctx.font = '400 28px Inter, sans-serif';
  ctx.fillStyle = watermarkSubColor;
  ctx.fillText('Submit yours at: confessly.web', 540, 1570);

  // Download & Share logic
  const dataUrl = canvas.toDataURL('image/png');
  const filename = reply ? `reply-${cardId}.png` : `confession-${cardId}.png`;

  if (shareOption === 'insta') {
    let shared = false;
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], filename, { type: 'image/png' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Instagram Confession',
          text: 'Shared from Confessly!'
        });
        shared = true;
      }
    } catch (err) {
      console.error('Web Share failed', err);
    }

    if (!shared) {
      // Fallback: regular download if sharing is not available/failed
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
    }
  } else {
    // Normal download
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }
}
