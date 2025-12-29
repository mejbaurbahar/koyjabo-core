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

  // 1. Separate the Footer/Booking Links
  const footerHeaders = ['**Booking Links:**', '**বুকিং লিংক:**', '### Booking', '### বুকিং'];
  let mainContent = markdown;
  let footer = '';

  for (const header of footerHeaders) {
    const lowerMarkdown = markdown.toLowerCase();
    const lowerHeader = header.toLowerCase();
    if (lowerMarkdown.includes(lowerHeader)) {
      const index = lowerMarkdown.indexOf(lowerHeader);
      mainContent = markdown.substring(0, index);
      footer = markdown.substring(index).trim();
      break;
    }
  }

  // 2. Separate Intro from Modes
  const modeHeaders = ['**Recommended Modes:**', '**প্রস্তাবিত যাতায়াত মাধ্যম:**', '### Recommended', '### প্রস্তাবিত'];
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

  // 3. Special handling for "Comparison Summary" or similar tables at the end of modes
  const summaryHeaders = ['**Comparison Summary:**', '**তুলনামূলক সারসংক্ষেপ:**', '### Comparison', '### তুলনা'];
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

  // If no modes content was found via headers, check if intro contains icons
  if (!modesContent && intro) {
    const iconRegex = /([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])/u;
    if (iconRegex.test(intro)) {
      // Potentially mixed content, let's try to split it at the first emoji
      const match = intro.match(iconRegex);
      if (match && match.index && match.index > 50) { // Only split if there's significant intro
        modesBody = intro.substring(match.index);
        intro = intro.substring(0, match.index).trim();
      }
    }
  }

  // 4. Parse individual modes
  const modes: ParsedMode[] = [];
  const lines = modesBody.split('\n');
  let currentMode: Partial<ParsedMode> | null = null;
  let buffer = '';

  // Improved regex: optional bullet/number + emoji
  const modeStartRegex = /^\s*(?:[\*\-\+]|\d+[\.\)])?\s*([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])/u;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.length === 0) {
      if (currentMode) buffer += '\n\n';
      return;
    }

    const match = trimmed.match(modeStartRegex);
    if (match) {
      // Save previous mode
      if (currentMode) {
        currentMode.fullContent = buffer.trim();
        modes.push(currentMode as ParsedMode);
      }

      const icon = match[1];
      let text = trimmed.substring(trimmed.indexOf(icon) + icon.length).trim();

      // Extract Title
      const titleMatch = text.match(/\*{0,2}([^*]+)\*{0,2}/);
      const title = titleMatch ? titleMatch[1].replace(/\*\*/g, '').trim() : text;

      // Extract Summary
      let summary = "";
      if (text.includes('–')) {
        summary = text.split('–')[1].trim();
      } else if (text.includes('-')) {
        const parts = text.split('-');
        if (parts.length > 1) {
          // Skip cleaning if the dash is inside a title
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
      // If we're before any mode, append back to intro
      intro += '\n' + line;
    }
  });

  if (currentMode) {
    currentMode.fullContent = buffer.trim();
    modes.push(currentMode as ParsedMode);
  }

  // If we have summary content, append it to the last mode or intro
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