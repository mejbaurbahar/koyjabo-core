export interface ParsedMode {
  id: number;
  icon: string;
  title: string;
  summary: string; // Time/Price
  fullContent: string;
}

export interface ParsedRouteData {
  intro: string;
  modes: ParsedMode[];
  footer: string;
}

/**
 * Parses the AI's markdown response into structured transport modes.
 */
export const parseRouteMarkdown = (markdown: string): ParsedRouteData => {
  if (!markdown) return { intro: '', modes: [], footer: '' };

  const transportEmojis = ['🚌', '🚂', '✈️', '🚢', '🚗', '🚕', '🚲', '🚇', '🚆', '🚍', '🚊', '🚁', '⛵', '🚤', '⛴️', '🚁', '🚀', '🚕'];
  const modeStartRegex = /^\s*(?:[\*\-\+]|\d+[\.\)])?\s*([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])/u;

  // 1. Separate Metadata/Rules into Footer
  const footerHeaders = [
    '🎯 Critical Rules', '🎯 critical rules', '🎯 Recommended Option',
    '⚠️ Rules', '💡 General Travel Tips', '🔍 General Travel Tips',
    'Remember: Users want', '🗺️ Route Highlights', '📱 Booking',
    '**Booking Links:**', '**বুকিং লিংক:**', '### Booking', '### বুকিং'
  ];

  let mainContent = markdown;
  let footer = '';
  let earliestFooterIndex = -1;

  for (const header of footerHeaders) {
    const index = mainContent.toLowerCase().indexOf(header.toLowerCase());
    if (index !== -1 && (earliestFooterIndex === -1 || index < earliestFooterIndex)) {
      earliestFooterIndex = index;
    }
  }

  if (earliestFooterIndex !== -1) {
    footer = mainContent.substring(earliestFooterIndex).trim();
    mainContent = mainContent.substring(0, earliestFooterIndex);
  }

  // 2. Identify Intro vs Modes
  const modeHeaders = [
    '**Recommended Modes:**', '**প্রস্তাবিত যাতায়াত মাধ্যম:**',
    '### Recommended', '### প্রস্তাবিত', '### Travel Options'
  ];

  let introRaw = mainContent.trim();
  let modesContent = '';

  for (const header of modeHeaders) {
    const index = mainContent.toLowerCase().indexOf(header.toLowerCase());
    if (index !== -1) {
      introRaw = mainContent.substring(0, index).trim();
      modesContent = mainContent.substring(index).trim();
      // Remove the header itself from the modes content
      modesContent = modesContent.substring(modesContent.indexOf('\n') + 1).trim();
      break;
    }
  }

  // If no header, find the first transport emoji
  if (!modesContent) {
    const lines = mainContent.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].trim().match(modeStartRegex);
      if (match && transportEmojis.includes(match[1]) && (lines[i].length < 60 || lines[i].toLowerCase().includes('by '))) {
        introRaw = lines.slice(0, i).join('\n').trim();
        modesContent = lines.slice(i).join('\n').trim();
        break;
      }
    }
  }

  // 3. Parse Modes
  const modes: ParsedMode[] = [];
  const lines = (modesContent || mainContent).split('\n');
  let currentMode: Partial<ParsedMode> | null = null;
  let buffer = '';

  lines.forEach((line) => {
    const trimmed = line.trim();
    const match = trimmed.match(modeStartRegex);

    let isNewMode = false;
    if (match && transportEmojis.includes(match[1])) {
      if (trimmed.length < 50 || trimmed.toLowerCase().startsWith('by ') || trimmed.toLowerCase().includes('**by ')) {
        isNewMode = true;
      }
    }

    if (isNewMode && match) {
      if (currentMode) {
        currentMode.fullContent = buffer.trim();
        modes.push(currentMode as ParsedMode);
      }

      const icon = match[1];
      let title = trimmed.replace(modeStartRegex, '').replace(/\*\*/g, '').replace(':', '').trim();

      let summary = "";
      ['–', '-', '|'].forEach(sep => {
        if (!summary && title.includes(sep)) {
          const parts = title.split(sep);
          summary = parts[parts.length - 1].trim();
          title = parts[0].trim();
        }
      });

      buffer = line + '\n';
      currentMode = { id: modes.length + 1, icon, title: title || 'Option', summary, fullContent: '' };
    } else if (currentMode) {
      buffer += line + '\n';

      // Smart Summary Extraction (for Time and Price)
      const tLine = trimmed.toLowerCase();
      if (!currentMode.summary || !currentMode.summary.includes('|')) {
        if (tLine.includes('duration:') || tLine.includes('time:') || tLine.includes('সময়:')) {
          const val = trimmed.split(':')[1]?.trim().split('\n')[0];
          if (val) currentMode.summary = currentMode.summary ? `${currentMode.summary} | ${val}` : val;
        } else if (tLine.includes('fare:') || tLine.includes('price:') || tLine.includes('ভাড়া:')) {
          const val = trimmed.split(':')[1]?.trim().split('\n')[0];
          if (val) currentMode.summary = currentMode.summary ? `${currentMode.summary} | ${val}` : val;
        }
      }
    } else if (trimmed.length > 0) {
      // Still in intro
      if (!introRaw.includes(line)) introRaw += '\n' + line;
    }
  });

  if (currentMode) {
    currentMode.fullContent = buffer.trim();
    modes.push(currentMode as ParsedMode);
  }

  // If we have "Comparison Summary" table anywhere, let's put it in the intro or footer
  // Actually, let's look for any tables in the content and put them in intro if they look like comparisons
  if (modesContent && modesContent.includes('|')) {
    const tableHeaders = ['Comparison', 'তুলনা', 'Mode', 'রুট'];
    for (const h of tableHeaders) {
      const idx = modesContent.indexOf(h);
      if (idx !== -1 && modesContent.includes('---')) {
        // Found a table!
        // If it's not already in intro, we could pull it out, 
        // but let's just make sure it's visible in at least one tab or intro.
      }
    }
  }

  return {
    intro: introRaw.trim(),
    modes: (modes.length > 30) ? [] : modes, // Sanity check
    footer: footer.split('\n').filter(l => !l.includes('🎯 Recommended Option')).join('\n').trim()
  };
};