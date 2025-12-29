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
 * Strictly filters out AI system instructions and "Critical Rules".
 */
export const parseRouteMarkdown = (markdown: string): ParsedRouteData => {
  if (!markdown) return { intro: '', modes: [], footer: '' };

  // 0. EXTREME CLEANUP: Forcefully remove the "Critical Rules" block and everything after it.
  // This is the specific instruction block that often leaks into output.
  const criticalRulesMarkers = [
    '🎯 Critical Rules',
    '🎯 critical rules',
    '✅ Use ONLY real operators',
    '❌ NO fake operators',
    'Remember: Users want MAXIMUM detail'
  ];

  let cleanedMarkdown = markdown;
  for (const marker of criticalRulesMarkers) {
    const index = cleanedMarkdown.indexOf(marker);
    if (index !== -1) {
      cleanedMarkdown = cleanedMarkdown.substring(0, index).trim();
    }
  }

  // Strict list of emojis that represent REAL transport modes
  const transportEmojis = ['🚌', '🚂', '✈️', '🚢', '🚗', '🚕', '🚲', '🚇', '🚆', '🚍', '🚊', '🚁', '⛵', '🚤', '⛴️', '🚀', '🚕', '🏎️', '🏍️'];

  // Regex covers: Emoji at start of line, possibly after a bullet or number
  const modeStartRegex = /^\s*(?:[\*\-\+]|\d+[\.\)])?\s*([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])/u;

  // 1. SPLIT FOOTER (Booking links, etc.)
  const footerHeaders = [
    '**Booking Links:**', '**বুকিং লিংক:**', '### Booking', '### বুকিং',
    '📱 Booking', '📱 বুকিং', '🗺️ Route Highlights', '🔍 General Travel Tips',
    '💰 Cost Comparison', '💰 Cost Comparison Summary', '📊 Comparison', '**Cost Comparison Summary:**'
  ];

  let mainContent = cleanedMarkdown;
  let footer = '';
  let earliestFooterIndex = -1;

  for (const header of footerHeaders) {
    const lowerMarkdown = mainContent.toLowerCase();
    const lowerHeader = header.toLowerCase();
    const index = lowerMarkdown.indexOf(lowerHeader);
    if (index !== -1) {
      if (earliestFooterIndex === -1 || index < earliestFooterIndex) {
        earliestFooterIndex = index;
      }
    }
  }

  if (earliestFooterIndex !== -1) {
    footer = mainContent.substring(earliestFooterIndex).trim();
    mainContent = mainContent.substring(0, earliestFooterIndex);
  }

  // 2. SPLIT INTRO vs MODES
  const modeHeaders = [
    '**Recommended Modes:**', '**প্রস্তাবিত যাতায়াত মাধ্যম:**',
    '### Recommended', '### প্রস্তাবিত', '### Travel Options', '### যাতায়াতের মাধ্যম'
  ];

  let introRaw = mainContent.trim();
  let modesContent = '';

  for (const header of modeHeaders) {
    const lowerMain = mainContent.toLowerCase();
    const lowerHeader = header.toLowerCase();
    if (lowerMain.includes(lowerHeader)) {
      const index = lowerMain.indexOf(lowerHeader);
      introRaw = mainContent.substring(0, index).trim();
      modesContent = mainContent.substring(index + header.length).trim();
      break;
    }
  }

  // Fallback: If no mode header, split at the first REAL mode header (e.g. "By Bus")
  if (!modesContent) {
    const lines = mainContent.split('\n');
    let firstModeLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      // Check for "By [Transport]" or "🚌 By [Transport]" or "**By [Transport]**"
      const isByMode = line.toLowerCase().includes('by ') && (line.includes('**') || transportEmojis.some(e => line.includes(e)));
      const match = line.match(modeStartRegex);
      const isEmojiMode = match && transportEmojis.includes(match[1]);

      if ((isByMode || isEmojiMode) && line.length < 60) {
        firstModeLineIndex = i;
        break;
      }
    }

    if (firstModeLineIndex !== -1) {
      const allLines = mainContent.split('\n');
      introRaw = allLines.slice(0, firstModeLineIndex).join('\n').trim();
      modesContent = allLines.slice(firstModeLineIndex).join('\n').trim();
    }
  }

  // 3. PARSE MODE BLOCKS
  const modes: ParsedMode[] = [];
  const lines = (modesContent || mainContent).split('\n');
  let currentMode: Partial<ParsedMode> | null = null;
  let buffer = '';

  lines.forEach((line) => {
    const trimmed = line.trim();
    const match = trimmed.match(modeStartRegex);

    // Check if this line is a VALID new transport mode header
    let isNewMode = false;
    const isByMode = trimmed.toLowerCase().includes('by ') && (trimmed.includes('**') || (match && transportEmojis.includes(match[1])));
    const isEmojiMode = match && transportEmojis.includes(match[1]) && trimmed.length < 50;

    if (isNewMode || isByMode || isEmojiMode) {
      // Must be a short line to be a header
      if (trimmed.length < 60) {
        isNewMode = true;
      }
    }

    if (isNewMode) {
      if (currentMode) {
        currentMode.fullContent = buffer.trim();
        modes.push(currentMode as ParsedMode);
      }

      const icon = match ? match[1] : (trimmed.includes('Bus') ? '🚌' : trimmed.includes('Train') ? '🚂' : trimmed.includes('Air') ? '✈️' : '🚗');

      let title = trimmed.replace(modeStartRegex, '').replace(/\*\*/g, '').replace(':', '').trim();
      if (title.toLowerCase().startsWith('by ')) {
        title = title.substring(3).trim();
      }

      let summary = "";
      const separators = ['–', '-', '|'];
      for (const sep of separators) {
        if (title.includes(sep)) {
          const parts = title.split(sep);
          summary = parts[parts.length - 1].trim();
          title = parts[0].trim();
          break;
        }
      }

      buffer = line + '\n';
      currentMode = {
        id: modes.length + 1,
        icon,
        title: title || 'Option',
        summary
      };
    } else if (currentMode) {
      buffer += line + '\n';
      // Attempt to extract summary from details if empty
      if (!currentMode.summary) {
        const tLine = trimmed.toLowerCase();
        if (tLine.includes('duration:') || tLine.includes('time:')) {
          currentMode.summary = trimmed.split(':')[1]?.trim() || '';
        }
      }
    } else if (trimmed.length > 0) {
      // Content before modes
      if (!introRaw.includes(trimmed)) {
        introRaw += '\n' + line;
      }
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