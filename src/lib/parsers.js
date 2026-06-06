export function parseAuditResponse(text) {
  const result = {
    scores: null,
    leak: '',
    niche: '',
    businessName: '',
    city: '',
    currentCta: '',
    currentHeadline: '',
    coreOffer: '',
    loomHook: '',
    avatarPain: '',
    leadMagnetTitle: '',
    parseConfidence: 'high',
  };

  try {
    const scoresMatch = text.match(/SCORES:\s*\n?\s*(\{[\s\S]*?\})\s*(?:\n|$)/);
    if (scoresMatch) {
      try {
        const cleaned = scoresMatch[1].replace(/[\n\r]/g, '').replace(/,\s*}/g, '}');
        result.scores = JSON.parse(cleaned);
      } catch {
        result.parseConfidence = 'low';
      }
    } else {
      result.parseConfidence = 'failed';
    }

    const knownLabels = 'BUSINESS_NAME|NICHE|CITY|SCORES|QUALIFICATION_SCORE|VERDICT|CURRENT_HEADLINE|CURRENT_CTA|CORE_OFFER|THE_MONEY_LEAK|AVATAR_PAIN|LEAD_MAGNET_PITCH|LOOM_HOOK';
    const extract = (label) => {
      const regex = new RegExp(`^${label}:\\s*\\n?(.+?)(?=^(?:${knownLabels}):\\s|(?![\\s\\S]))`, 'ms');
      const match = text.match(regex);
      return match ? match[1].trim() : '';
    };

    result.leak = extract('THE_MONEY_LEAK');
    result.niche = extract('NICHE');
    result.businessName = extract('BUSINESS_NAME');
    result.city = extract('CITY');
    result.currentCta = extract('CURRENT_CTA');
    result.currentHeadline = extract('CURRENT_HEADLINE');
    result.coreOffer = extract('CORE_OFFER');
    result.loomHook = extract('LOOM_HOOK');
    result.avatarPain = extract('AVATAR_PAIN');
    result.leadMagnetTitle = extract('LEAD_MAGNET_PITCH');

    if (!result.leak && !result.niche && !result.businessName && result.parseConfidence !== 'failed') {
      result.parseConfidence = 'low';
    }
  } catch {
    result.rawResponse = text;
    result.parseConfidence = 'failed';
  }

  return result;
}

export function parseLeadMagnetResponse(text) {
  const result = { title: '', whatItGenerates: '', runnablePrompt: '' };

  const titleMatch = text.match(/---LEAD MAGNET TITLE---\s*\n([\s\S]*?)(?=---WHAT THIS PROMPT WILL GENERATE---|---RUNNABLE PROMPT---|$)/);
  if (titleMatch) result.title = titleMatch[1].trim();

  const whatMatch = text.match(/---WHAT THIS PROMPT WILL GENERATE---\s*\n([\s\S]*?)(?=---RUNNABLE PROMPT---|$)/);
  if (whatMatch) result.whatItGenerates = whatMatch[1].trim();

  const promptMatch = text.match(/---RUNNABLE PROMPT---\s*\n([\s\S]*?)$/);
  if (promptMatch) result.runnablePrompt = promptMatch[1].trim();

  if (!result.title && !result.runnablePrompt) {
    result.runnablePrompt = text;
  }

  return result;
}

export function parseOutreachResponse(text) {
  if (!text) return [{ label: 'Full Response', stage: 'cold', text: '', empty: true }];

  const scriptLabels = [
    { label: 'Cold DM', stage: 'cold', pattern: /SCRIPT 1[^\n]*\n([\s\S]+?)(?=SCRIPT 2|$)/i },
    { label: 'Follow-up (12hr)', stage: 'followup', pattern: /SCRIPT 2[^\n]*\n([\s\S]+?)(?=SCRIPT 3|$)/i },
    { label: 'Scarcity Close', stage: 'scarcity', pattern: /SCRIPT 3[^\n]*\n([\s\S]+?)(?=SCRIPT 4|$)/i },
    { label: 'Objection: Price', stage: 'obj-price', pattern: /SCRIPT 4[^\n]*\n([\s\S]+?)(?=SCRIPT 5|$)/i },
    { label: 'Objection: No Portfolio', stage: 'obj-trust', pattern: /SCRIPT 5[^\n]*\n([\s\S]+?)(?=SCRIPT 6|$)/i },
    { label: 'Objection: Has Agency', stage: 'obj-agency', pattern: /SCRIPT 6[^\n]*\n([\s\S]+?)(?=SCRIPT 7|$)/i },
    { label: 'Objection: Wants Call', stage: 'obj-call', pattern: /SCRIPT 7[^\n]*\n([\s\S]+?)(?=SCRIPT 8|$)/i },
    { label: 'Closing Script', stage: 'close', pattern: /SCRIPT 8[^\n]*\n([\s\S]+?)(?=SCRIPT 9|$)/i },
    { label: 'Loom Script (full)', stage: 'loom', pattern: /SCRIPT 9[^\n]*\n([\s\S]+?)$/i },
  ];

  const scripts = scriptLabels.map(({ label, stage, pattern }) => {
    const match = text.match(pattern);
    return { label, stage, text: match ? match[1].trim() : '', empty: !match || !match[1].trim() };
  });

  if (scripts.every((s) => !s.text)) {
    return [{ label: 'Full Response', stage: 'cold', text, empty: false }];
  }

  return scripts;
}
