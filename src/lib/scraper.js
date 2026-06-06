import * as cheerio from 'cheerio';

const BLOCKED_HOSTS = /^(localhost|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+|169\.254\.\d+\.\d+|0\.0\.0\.0|\[::1\]|::1|0:0:0:0:0:0:0:1)$/;

function isBlockedHost(hostname) {
  return BLOCKED_HOSTS.test(hostname) || hostname.endsWith('.internal') || hostname.endsWith('.local');
}

function processHtml(html, url) {
  const $ = cheerio.load(html);

  $('script, style, noscript, iframe, svg').remove();

  const title = $('title').text().trim();
  const metaDescription = $('meta[name="description"]').attr('content') || '';

  const imageAlts = [];
  $('img[alt]').each((_, el) => {
    const alt = $(el).attr('alt')?.trim();
    if (alt && alt.length > 5 && alt.length < 200) imageAlts.push(alt);
  });

  const $visitor = cheerio.load($.html());
  $visitor('nav, footer, [role="navigation"], [role="contentinfo"]').remove();
  $visitor('[class*="nav"], [class*="menu"], [class*="footer"], [class*="sidebar"], [id*="nav"], [id*="menu"], [id*="footer"], [id*="sidebar"]').remove();

  const headings = [];
  $visitor('h1, h2, h3').each((_, el) => {
    const text = $visitor(el).text().trim();
    if (text && text.length > 3) headings.push(text);
  });

  let aboveFoldText = '';
  $visitor('h1, h2, p, li, span, div, section, article').each((_, el) => {
    const text = $visitor(el).clone().children('h1, h2, h3, p, li, span, div, section, article, nav, footer, ul, ol').remove().end().text().trim();
    if (text && text.length > 10) {
      aboveFoldText += text + '\n';
      if (aboveFoldText.length > 1500) return false;
    }
  });

  let fullBodyText = '';
  $visitor('h1, h2, h3, p, li, span, div, section, article').each((_, el) => {
    const text = $visitor(el).clone().children('h1, h2, h3, p, li, span, div, section, article, nav, footer, ul, ol').remove().end().text().trim();
    if (text && text.length > 10) {
      fullBodyText += text + '\n';
      if (fullBodyText.length > 5000) return false;
    }
  });

  const ctaTexts = [];
  $visitor('button, a[href], input[type="submit"]').each((_, el) => {
    const text = $visitor(el).text().trim() || $visitor(el).attr('value') || '';
    if (text && text.length < 60 && text.length > 2) ctaTexts.push(text);
  });

  const hasEmailCapture = $('input[type="email"]').length > 0;

  const fullText = $('body').text();
  const phoneRegex = /(\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g;
  const phones = (fullText.match(phoneRegex) || []).slice(0, 3);

  return {
    success: true,
    method: 'cheerio',
    data: {
      url,
      title,
      headings: headings.slice(0, 15),
      aboveFoldText: deduplicateLines(aboveFoldText).slice(0, 1500),
      fullBodyText: fullBodyText.slice(0, 5000),
      ctaTexts: [...new Set(ctaTexts)].slice(0, 10),
      imageAlts: [...new Set(imageAlts)].slice(0, 10),
      hasEmailCapture,
      metaDescription,
      phones,
      scrapedAt: new Date().toISOString(),
    },
  };
}

export async function scrapePage(url) {
  try {
    const parsed = new URL(url);

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { success: false, method: 'manual', data: null, error: 'Only HTTP/HTTPS URLs are allowed' };
    }

    if (isBlockedHost(parsed.hostname)) {
      return { success: false, method: 'manual', data: null, error: 'Internal/private addresses are not allowed' };
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(15000),
      redirect: 'manual',
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location) {
        const redirectUrl = new URL(location, url);
        if (isBlockedHost(redirectUrl.hostname)) {
          return { success: false, method: 'manual', data: null, error: 'Redirect to internal address blocked' };
        }
        const redirectResponse = await fetch(redirectUrl.href, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
          signal: AbortSignal.timeout(10000),
          redirect: 'follow',
        });
        if (!redirectResponse.ok) {
          return { success: false, method: 'manual', data: null, error: `HTTP ${redirectResponse.status} after redirect` };
        }
        return processHtml(await redirectResponse.text(), url);
      }
    }

    if (!response.ok) {
      return { success: false, method: 'manual', data: null, error: `HTTP ${response.status}` };
    }

    return processHtml(await response.text(), url);
  } catch (error) {
    return { success: false, method: 'manual', data: null, error: error.message };
  }
}

function deduplicateLines(text) {
  const seen = new Set();
  return text
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed || seen.has(trimmed)) return false;
      seen.add(trimmed);
      return true;
    })
    .join('\n');
}
