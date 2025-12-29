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

  // Strict list of emojis that represent REAL transport modes
  const transportEmojis = ['🚌', '🚂', '✈️', '🚢', '🚗', '🚕', '🚲', '🚇', '🚆', '🚍', '🚊', '🚁', '⛵', '🚤', '⛴️', '🚀', '🚕'];
  const modeStartRegex = /^\s*(?:[\*\-\+]|\d+[\.\)])?\s*([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])/u;

  // 1. Separate Metadata/Rules into Footer
  const footerHeaders = [
    '🎯 Critical Rules', '🎯 critical rules', '🎯 Recommended Option',
    '⚠️ Rules', '💡 General Travel Tips', '🔍 General Travel Tips',
    'Remember: Users want', '🗺️ Route Highlights', '📱 Booking',
    '**Booking Links:**', '**বুকিং লিংক:**', '### Booking', '### বুকিং',
    '📱 Booking & Information Resources'
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

  // 2. Identify Modes Content
  const modeHeaders = [
    '**Recommended Modes:**', '**প্রস্তাবিত যাতায়াত মাধ্যম:**',
    '### Recommended', '### প্রস্তাবিত', '### Travel Options'
  ];

  let introRaw = '';
  let modesContent = mainContent;

  for (const header of modeHeaders) {
    const index = mainContent.toLowerCase().indexOf(header.toLowerCase());
    if (index !== -1) {
      introRaw = mainContent.substring(0, index).trim();
      modesContent = mainContent.substring(index).trim();
      // Remove the header line from modesContent
      const lines = modesContent.split('\n');
      modesContent = lines.slice(1).join('\n').trim();
      break;
    }
  }

  // 3. Parse Mode Blocks
  const modes: ParsedMode[] = [];
  const lines = modesContent.split('\n');
  let currentMode: Partial<ParsedMode> | null = null;
  let buffer = '';

  lines.forEach((line) => {
    const trimmed = line.trim();
    const match = trimmed.match(modeStartRegex);

    let isNewMode = false;
    if (match && transportEmojis.includes(match[1])) {
      // Must be a header-like line
      if (trimmed.length < 60 || trimmed.toLowerCase().startsWith('by ') || trimmed.includes('**')) {
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

      // Pull out Time/Price for the chip if not found in header
      if (!currentMode.summary || !currentMode.summary.includes('|')) {
        const tLine = trimmed.toLowerCase();
        if (tLine.includes('duration:') || tLine.includes('time:') || tLine.includes('সময়:')) {
          const val = trimmed.split(':')[1]?.trim();
          if (val) currentMode.summary = currentMode.summary ? `${currentMode.summary} | ${val}` : val;
        } else if (tLine.includes('fare:') || tLine.includes('price:') || tLine.includes('ভাড়া:')) {
          const val = trimmed.split(':')[1]?.trim();
          if (val) currentMode.summary = currentMode.summary ? `${currentMode.summary} | ${val}` : val;
        }
      }
    } else if (trimmed.length > 0) {
      introRaw += '\n' + line;
    }
  });

  if (currentMode) {
    currentMode.fullContent = buffer.trim();
    modes.push(currentMode as ParsedMode);
  }

  return {
    intro: introRaw.trim(),
    modes,
    footer: footer.trim()
  };
};