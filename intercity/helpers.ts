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

  const modeStartRegex = /^\s*(?:[\*\-\+]|\d+[\.\)])?\s*([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])/u;
  const transportEmojis = ['🚌', '🚂', '✈️', '🚢', '🚗', '🚕', '🚲', '🚇', '🚠', '⛵', '🚤', '🚆', '🚍', '🚊', '🚁'];

  // 1. Separate the Footer/Booking Links / Rules
  const footerHeaders = [
    '**Booking Links:**', '**বুকিং লিংক:**', '### Booking', '### বুকিং',
    '📱 Booking', '📱 বুকিং', '🎯 Critical Rules', '⚠️ Rules', '💡 General Travel Tips',
    '📱 Booking & Information Resources'
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

  // 2. Separate Intro from Modes
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

  // Fallback: If no mode header, look for the first transport emoji start or "By Bus" line
  if (!modesContent) {
    const lines = mainContent.split('\n');
    let splitIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const match = line.match(modeStartRegex);
      if (match) {
        const icon = match[1];
        if (transportEmojis.includes(icon) || line.toLowerCase().includes('by ')) {
          // If we are past the first 2 lines, this is likely the start of modes
          if (i > 1) {
            splitIndex = i;
            break;
          }
        }
      }
    }

    if (splitIndex !== -1) {
      const allLines = mainContent.split('\n');
      intro = allLines.slice(0, splitIndex).join('\n').trim();
      modesContent = allLines.slice(splitIndex).join('\n').trim();
    }
  }

  // 3. Special handling for "Comparison Summary" or similar tables at the end of modes
  const summaryHeaders = [
    '**Comparison Summary:**', '**তুলনামূলক সারসংক্ষেপ:**',
    '### Comparison', '### তুলনা', '💰 Cost Comparison', '💰 তুলনা'
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

  // 4. Parse individual modes
  const modes: ParsedMode[] = [];
  const lines = modesBody.split('\n');
  let currentMode: Partial<ParsedMode> | null = null;
  let buffer = '';

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.length === 0) {
      if (currentMode) buffer += '\n';
      return;
    }

    const match = trimmed.match(modeStartRegex);
    const isLikelyHeader = match && (trimmed.length < 50 || trimmed.toLowerCase().includes('by '));

    if (isLikelyHeader) {
      if (currentMode) {
        currentMode.fullContent = buffer.trim();
        modes.push(currentMode as ParsedMode);
      }

      const icon = match![1];
      let text = trimmed.substring(trimmed.indexOf(icon) + icon.length).trim();

      const titleMatch = text.match(/\*{0,2}([^*]+)\*{0,2}/);
      const title = titleMatch ? titleMatch[1].replace(/\*\*/g, '').trim() : text;

      let summary = "";
      if (text.includes('–')) {
        summary = text.split('–')[1].trim();
      } else if (text.includes('-')) {
        const parts = text.split('-');
        if (parts.length > 1) {
          summary = parts[parts.length - 1].trim();
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
    } else {
      intro += '\n' + line;
    }
  });

  if (currentMode) {
    currentMode.fullContent = buffer.trim();
    modes.push(currentMode as ParsedMode);
  }

  if (summaryContent) {
    if (modes.length > 0) {
      modes[modes.length - 1].fullContent += '\n\n' + summaryContent;
    } else {
      intro += '\n\n' + summaryContent;
    }
  }

  return {
    intro: intro.trim(),
    modes,
    footer: footer.trim()
  };
};