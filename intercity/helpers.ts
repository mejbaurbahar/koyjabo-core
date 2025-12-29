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

export const parseRouteMarkdown = (markdown: string): ParsedRouteData => {
  if (!markdown) return { intro: '', modes: [], footer: '' };

  // Strict list of emojis that represent transport modes
  const transportEmojis = ['🚌', '🚂', '✈️', '🚢', '🚗', '🚕', '🚲', '🚇', '🚆', '🚍', '🚊', '🚁', '⛵', '🚤', ' लॉन्च'];
  const modeStartRegex = /^\s*(?:[\*\-\+]|\d+[\.\)])?\s*([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])/u;

  // 1. Separate the Footer / Rules / Tips
  const footerHeaders = [
    '**Booking Links:**', '**বুকিং লিংক:**', '### Booking', '### বুকিং',
    '📱 Booking', '📱 বুকিং', '🎯 Critical Rules', '⚠️ Rules', '💡 General Travel Tips',
    '📱 Booking & Information Resources', '🗺️ Route Highlights', '🔍 General Travel Tips',
    'Remember: Users want' // Common AI instruction suffix
  ];
  let mainContent = markdown;
  let footer = '';

  let earliestFooterIndex = -1;
  for (const header of footerHeaders) {
    const lowerMarkdown = markdown.toLowerCase();
    const lowerHeader = header.toLowerCase();
    const index = lowerMarkdown.indexOf(lowerHeader);
    if (index !== -1) {
      if (earliestFooterIndex === -1 || index < earliestFooterIndex) {
        earliestFooterIndex = index;
      }
    }
  }

  if (earliestFooterIndex !== -1) {
    footer = markdown.substring(earliestFooterIndex).trim();
    mainContent = markdown.substring(0, earliestFooterIndex);
  }

  // 2. Initial Selection: Intro vs Modes Content
  const modeHeaders = [
    '**Recommended Modes:**', '**প্রস্তাবিত যাতায়াত মাধ্যম:**',
    '### Recommended', '### প্রস্তাবিত', '### Travel Options', '### যাতায়াতের মাধ্যম'
  ];
  let intro = mainContent.trim();
  let modesContent = '';

  for (const header of modeHeaders) {
    const lowerMain = mainContent.toLowerCase();
    const lowerHeader = header.toLowerCase();
    if (lowerMain.includes(lowerHeader)) {
      const index = lowerMain.indexOf(lowerHeader);
      intro = mainContent.substring(0, index).trim();
      modesContent = mainContent.substring(index + header.length).trim();
      break;
    }
  }

  // FALLBACK: If no explicit Mode Header, find the first Transport Emoji segment
  if (!modesContent) {
    const lines = mainContent.split('\n');
    let firstModeLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const match = line.match(modeStartRegex);
      if (match) {
        const icon = match[1];
        // ONLY split if it's a transport emoji or starts with "By "
        if (transportEmojis.includes(icon) || line.toLowerCase().startsWith('by ') || line.toLowerCase().includes('**by ')) {
          firstModeLineIndex = i;
          break;
        }
      }
    }

    if (firstModeLineIndex !== -1) {
      const allLines = mainContent.split('\n');
      intro = allLines.slice(0, firstModeLineIndex).join('\n').trim();
      modesContent = allLines.slice(firstModeLineIndex).join('\n').trim();
    }
  }

  // 3. Extract Comparison Summary Table
  const summaryHeaders = [
    '**Comparison Summary:**', '**তুলনামূলক সারসংক্ষেপ:**',
    '### Comparison', '### তুলনা', '💰 Cost Comparison', '📊 Comparison'
  ];
  let modesBody = modesContent;
  let summaryContent = '';

  for (const header of summaryHeaders) {
    const lowerModes = modesBody.toLowerCase();
    const lowerHeader = header.toLowerCase();
    if (lowerModes.includes(lowerHeader)) {
      const index = lowerModes.indexOf(lowerHeader);
      summaryContent = modesBody.substring(index).trim();
      modesBody = modesBody.substring(0, index).trim();
      break;
    }
  }

  // 4. Detailed Mode Parsing
  const modes: ParsedMode[] = [];
  const lines = modesBody.split('\n');
  let currentMode: Partial<ParsedMode> | null = null;
  let buffer = '';

  lines.forEach((line) => {
    const trimmed = line.trim();
    const match = trimmed.match(modeStartRegex);

    // Check if this line is actually a new mode header
    let isNewMode = false;
    if (match) {
      const icon = match[1];
      if (transportEmojis.includes(icon) || trimmed.toLowerCase().includes('by ')) {
        // Further verification: Headers are usually short or have specific patterns
        if (trimmed.length < 60) isNewMode = true;
      }
    }

    if (isNewMode && match) {
      // Close previous mode
      if (currentMode) {
        currentMode.fullContent = buffer.trim();
        modes.push(currentMode as ParsedMode);
      }

      const icon = match[1];
      let text = trimmed.substring(trimmed.indexOf(icon) + icon.length).trim();

      // Clean Title (remove bolding)
      const titleMatch = text.match(/\*{0,2}([^*]+)\*{0,2}/);
      const title = titleMatch ? titleMatch[1].replace(/\*\*/g, '').trim() : text;

      // Extract Summary (Time/Price)
      let summary = "";
      const summaryDelimiters = ['–', '-', '|', ':'];
      for (const del of summaryDelimiters) {
        if (text.includes(del)) {
          const parts = text.split(del);
          if (parts.length > 1) {
            summary = parts[parts.length - 1].trim();
            break;
          }
        }
      }

      buffer = line + '\n';
      currentMode = {
        id: modes.length + 1,
        icon,
        title,
        summary
      };
    } else if (currentMode) {
      buffer += line + '\n';
    } else if (trimmed.length > 0) {
      intro += '\n' + line;
    }
  });

  // Push final mode
  if (currentMode) {
    currentMode.fullContent = buffer.trim();
    modes.push(currentMode as ParsedMode);
  }

  // Attach summary content (table) to last mode for visibility
  if (summaryContent) {
    if (modes.length > 0) {
      modes[modes.length - 1].fullContent += '\n\n' + summaryContent;
    } else {
      intro += '\n\n' + summaryContent;
    }
  }

  return {
    intro: intro.trim(),
    modes: (modes.length > 0) ? modes : [],
    footer: footer.trim()
  };
};