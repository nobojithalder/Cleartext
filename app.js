const source = document.querySelector('#source-text');
const cleaned = document.querySelector('#cleaned-text');
const inputCount = document.querySelector('#input-count');
const changeCount = document.querySelector('#change-count');
const copyButton = document.querySelector('#copy-button');
const undoButton = document.querySelector('#undo-button');
const changeReview = document.querySelector('#change-review');
const reviewCount = document.querySelector('#review-count');
const beforeDiff = document.querySelector('#before-diff');
const afterDiff = document.querySelector('#after-diff');
const markedText = document.querySelector('#marked-text');
const signalCount = document.querySelector('#signal-count');
const tabCount = document.querySelector('#tab-count');
const signalList = document.querySelector('#signal-list');
const toast = document.querySelector('#toast');
let toastTimer;
let undoCurrent = false;

const options = Object.fromEntries([...document.querySelectorAll('[data-rule]')].map(input => [input.dataset.rule, input]));
const rules = [
  ['hidden', /[\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180E\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, ''],
  ['nbsp', /[\u00A0\u202F]/g, ' '],
  ['dashes', /[\u2012-\u2015]/g, '-'],
  ['quotes', /[\u2018\u2019\u201A\u201B]/g, "'"],
  ['quotes', /[\u201C\u201D\u201E\u201F]/g, '"'],
  ['ellipsis', /\u2026/g, '...'],
];
const suspiciousMap = { 'а':'a','А':'A','е':'e','Е':'E','о':'o','О':'O','р':'p','Р':'P','с':'c','С':'C','х':'x','Х':'X','у':'y','У':'Y','і':'i','І':'I','ј':'j','Ј':'J','ӏ':'l','Β':'B','Ε':'E','Ι':'I','Κ':'K','Μ':'M','Ν':'N','Ο':'O','Ρ':'P','Τ':'T','Χ':'X','Ζ':'Z','ο':'o','ρ':'p','ν':'v','τ':'t','υ':'u','χ':'x' };
const phrasePatterns = [
  { label: 'Delve into', group: 'Stock wording', regex: /\bdelv(?:e|es|ed|ing)(?:\s+into)?\b/gi },
  { label: 'Worth noting', group: 'Stock wording', regex: /\b(?:it is|it['’]s) worth noting\b/gi },
  { label: 'Important to note', group: 'Stock wording', regex: /\b(?:it is|it['’]s) (?:also )?(?:important|essential|worthwhile) to note\b/gi },
  { label: 'It should be noted', group: 'Stock wording', regex: /\bit should be noted\b/gi },
  { label: 'Important to remember', group: 'Stock wording', regex: /\b(?:it is|it['’]s) (?:crucial|important|essential) to (?:remember|understand|recognize|consider)\b/gi },
  { label: 'It goes without saying', group: 'Stock wording', regex: /\bit goes without saying\b/gi },
  { label: 'Needless to say', group: 'Stock wording', regex: /\bneedless to say\b/gi },
  { label: 'At its core', group: 'Stock wording', regex: /\bat (?:the|its) core\b/gi },
  { label: 'A testament to', group: 'Stock wording', regex: /\b(?:a|is a) testament to\b/gi },
  { label: 'Sheds light on', group: 'Stock wording', regex: /\bsheds? light on\b/gi },
  { label: 'Cannot be overstated', group: 'Stock wording', regex: /\b(?:cannot|can not|can't) be overstated\b/gi },
  { label: 'Increasingly important', group: 'Stock wording', regex: /\bhas become increasingly important\b/gi },
  { label: 'Plays a key role', group: 'Stock wording', regex: /\bplays? (?:a |an )?(?:crucial|vital|pivotal|key|important) role\b/gi },
  { label: 'Landscape framing', group: 'Stock wording', regex: /\b(?:(?:ever[- ]evolving|ever[- ]changing|rapidly changing|digital|modern) )landscape\b/gi },
  { label: 'Tapestry metaphor', group: 'Stock wording', regex: /\b(?:rich |complex |vibrant )?tapestry\b/gi },
  { label: 'In the realm of', group: 'Stock wording', regex: /\bin the realm of\b/gi },
  { label: 'In today’s world', group: 'Stock wording', regex: /\bin today['’]s (?:(?:fast[- ]paced|digital|modern) )?(?:world|society|landscape|age)\b/gi },
  { label: 'In an era of', group: 'Stock wording', regex: /\bin an era of\b/gi },
  { label: 'In a world where', group: 'Stock wording', regex: /\bin a world where\b/gi },
  { label: 'As we navigate', group: 'Stock wording', regex: /\bas we navigate\b/gi },
  { label: 'As technology evolves', group: 'Stock wording', regex: /\bas (?:technology|the world|society) continues to (?:evolve|advance|change)\b/gi },
  { label: 'In a nutshell', group: 'Stock wording', regex: /\bin a nutshell\b/gi },
  { label: 'To put it simply', group: 'Stock wording', regex: /\bto put it simply\b/gi },
  { label: 'Let’s explore', group: 'Stock wording', regex: /\blet['’]s (?:explore|take a look|delve)\b/gi },
  { label: 'This article explores', group: 'Stock wording', regex: /\bthis (?:article|guide|post) (?:explores|examines|delves into|covers)\b/gi },
  { label: 'Not only, but also', group: 'Stock wording', regex: /\bnot only\b[\s\S]{0,220}?\bbut also\b/gi },
  { label: 'Whether you are … or', group: 'Stock wording', regex: /\bwhether you(?:['’]re| are)\b[\s\S]{0,180}?\bor\b/gi },
  { label: 'Imagine a world', group: 'Stock wording', regex: /\bimagine (?:a|the) world where\b/gi },
  { label: 'By leveraging', group: 'Stock wording', regex: /\bby (?:leveraging|harnessing|embracing|utilizing)\b/gi },
  { label: 'Unlock potential', group: 'Stock wording', regex: /\bunlock(?:ing)? (?:the )?(?:full )?potential\b/gi },
  { label: 'Comprehensive overview', group: 'Stock wording', regex: /\b(?:comprehensive|in-depth|detailed) overview\b/gi },
  { label: 'As an AI assistant', group: 'Assistant language', regex: /\bas an ai language model\b|\bas an ai assistant\b/gi },
  { label: 'I hope this helps', group: 'Assistant language', regex: /\bi hope this helps\b/gi },
  { label: 'Let me know if', group: 'Assistant language', regex: /\blet me know if (?:you(?:'d| would) like|you need|i can)\b/gi },
  { label: 'Certainly, here is', group: 'Assistant language', regex: /\b(?:certainly|absolutely|of course)[,!]?\s+(?:here(?:'s| is)|below is)\b/gi },
  { label: 'More importantly', group: 'Transitions', regex: /\bmore importantly\b/gi },
  { label: 'Furthermore', group: 'Transitions', regex: /\bfurthermore\b/gi },
  { label: 'Moreover', group: 'Transitions', regex: /\bmoreover\b/gi },
  { label: 'Additionally', group: 'Transitions', regex: /\badditionally\b/gi },
  { label: 'In addition', group: 'Transitions', regex: /\bin addition\b/gi },
  { label: 'Consequently', group: 'Transitions', regex: /\bconsequently\b/gi },
  { label: 'As such', group: 'Transitions', regex: /\bas such\b/gi },
  { label: 'In essence', group: 'Transitions', regex: /\bin essence\b/gi },
  { label: 'Ultimately', group: 'Transitions', regex: /\bultimately\b/gi },
  { label: 'That being said', group: 'Transitions', regex: /\bthat being said\b/gi },
  { label: 'On the other hand', group: 'Transitions', regex: /\bon the other hand\b/gi },
  { label: 'In conclusion', group: 'Conclusion framing', regex: /\bin conclusion\b/gi },
  { label: 'In summary', group: 'Conclusion framing', regex: /\bin summary\b/gi },
  { label: 'To summarize', group: 'Conclusion framing', regex: /\bto summar(?:ize|ise)\b/gi },
  { label: 'To conclude', group: 'Conclusion framing', regex: /\bto conclude\b/gi },
  { label: 'Key takeaways', group: 'Conclusion framing', regex: /\bkey takeaways\b/gi },
  { label: 'Focal vocabulary', group: 'AI-associated vocabulary', regex: /\b(?:intricate|pivotal|meticulous|myriad|multifaceted|nuanced|foster|underscore|underscores|underscored|showcase|showcases|showcased|seamless|seamlessly|robust|leverage|leveraging|holistic|transformative|cutting[- ]edge|groundbreaking|ever[- ]evolving|paramount|vibrant)\b/gi },
];
const groupDescriptions = {
  'Formatting': 'Character and markup artifacts that may come from copying or formatting.',
  'Stock wording': 'Reusable framing phrases. One occurrence is common and weak evidence by itself.',
  'Assistant language': 'Chat-style wording that can remain when an answer is pasted elsewhere.',
  'Transitions': 'Formal signposts. Several clustered together can make prose feel formulaic.',
  'Conclusion framing': 'Common wrap-up language or section labels.',
  'AI-associated vocabulary': 'Words reported as frequent in some generated writing, but also normal in many human texts.',
  'Repeated openings': 'The same opening phrase appears at the start of multiple sentences.',
};

function cleanText(text) {
  let result = text;
  let changes = 0;
  const apply = (regex, replacement) => {
    regex.lastIndex = 0;
    result = result.replace(regex, (...args) => {
      const match = args[0];
      const next = typeof replacement === 'function' ? replacement(...args) : replacement;
      if (next !== match) changes++;
      return next;
    });
  };
  for (const [key, regex, replacement] of rules) if (options[key].checked) apply(regex, replacement);
  if (options.trailing.checked) apply(/[ \t]+(?=\r?$)/gm, '');
  if (options.markdown.checked) {
    apply(/^\s{0,3}#{1,6}\s+/gm, '');
    apply(/\*/g, '');
  }
  if (options.unicode.checked && typeof result.normalize === 'function') {
    const normalized = result.normalize('NFKC');
    if (normalized !== result) {
      const before = [...result];
      const after = [...normalized];
      changes += Math.max(1, Math.max(before.length, after.length) - before.filter((char, index) => char === after[index]).length);
      result = normalized;
    }
  }
  if (options.lookalikes.checked) apply(/[аАеЕоОрРсСхХуУіІјЈӏΒΕΙΚΜΝΟΡΤΧΖορντυχ]/g, char => suspiciousMap[char] || char);
  return { result, changes };
}

function lcsDiff(left, right) {
  const columns = right.length + 1;
  const table = new Uint32Array((left.length + 1) * columns);
  for (let i = left.length - 1; i >= 0; i--) {
    const row = i * columns;
    const nextRow = (i + 1) * columns;
    for (let j = right.length - 1; j >= 0; j--) {
      table[row + j] = left[i] === right[j]
        ? table[nextRow + j + 1] + 1
        : Math.max(table[nextRow + j], table[row + j + 1]);
    }
  }

  const parts = [];
  const append = (type, char) => {
    const last = parts[parts.length - 1];
    if (last?.type === type) last.text += char;
    else parts.push({ type, text: char });
  };
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] === right[j]) { append('same', right[j]); i++; j++; }
    else if (table[(i + 1) * columns + j] >= table[i * columns + j + 1]) { append('removed', left[i]); i++; }
    else { append('added', right[j]); j++; }
  }
  while (i < left.length) append('removed', left[i++]);
  while (j < right.length) append('added', right[j++]);
  return parts;
}

function diffText(before, after) {
  const beforeChars = [...before];
  const afterChars = [...after];
  const charCells = (beforeChars.length + 1) * (afterChars.length + 1);
  if (charCells <= 2_000_000) return lcsDiff(beforeChars, afterChars);

  const beforeWords = before.match(/\s+|[^\s]+/g) || [];
  const afterWords = after.match(/\s+|[^\s]+/g) || [];
  const wordCells = (beforeWords.length + 1) * (afterWords.length + 1);
  if (wordCells <= 5_000_000) return lcsDiff(beforeWords, afterWords);

  let prefix = 0;
  while (prefix < beforeChars.length && prefix < afterChars.length && beforeChars[prefix] === afterChars[prefix]) prefix++;
  let suffix = 0;
  while (suffix < beforeChars.length - prefix && suffix < afterChars.length - prefix && beforeChars[beforeChars.length - suffix - 1] === afterChars[afterChars.length - suffix - 1]) suffix++;
  return [
    { type: 'same', text: beforeChars.slice(0, prefix).join('') },
    { type: 'removed', text: beforeChars.slice(prefix, beforeChars.length - suffix).join('') },
    { type: 'added', text: afterChars.slice(prefix, afterChars.length - suffix).join('') },
    { type: 'same', text: beforeChars.slice(beforeChars.length - suffix).join('') },
  ].filter(part => part.text);
}

function renderDiff(before, after) {
  const parts = diffText(before, after);
  beforeDiff.innerHTML = parts.filter(part => part.type !== 'added').map(part => part.type === 'removed'
    ? `<mark class="diff-removed">${escapeHTML(part.text)}</mark>`
    : escapeHTML(part.text)).join('');
  afterDiff.innerHTML = parts.filter(part => part.type !== 'removed').map(part => part.type === 'added'
    ? `<mark class="diff-added">${escapeHTML(part.text)}</mark>`
    : escapeHTML(part.text)).join('');
}

function findSignals(text) {
  const found = [];
  const pushMatches = (regex, label, kind, group = 'Formatting', reason = '') => {
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      found.push({ start: match.index, end: match.index + match[0].length, text: match[0], label, kind, group, reason });
      if (!match[0].length) regex.lastIndex++;
    }
  };
  pushMatches(/[\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180E\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, 'Hidden character', 'format', 'Formatting');
  pushMatches(/[\u00A0\u202F]/g, 'Non-breaking space', 'format', 'Formatting');
  pushMatches(/[\u2012-\u2015]/g, 'Long dash', 'format', 'Formatting');
  pushMatches(/[\u2018-\u201F]/g, 'Smart quote', 'format', 'Formatting');
  pushMatches(/\u2026/g, 'Ellipsis character', 'format', 'Formatting');
  pushMatches(/[\uFF01-\uFFEF\u{1D400}-\u{1D7FF}]/gu, 'Styled Unicode', 'format', 'Formatting');
  pushMatches(/[аАеЕоОрРсСхХуУіІјЈӏΒΕΙΚΜΝΟΡΤΧΖορντυχ]/g, 'Lookalike letter', 'format', 'Formatting');
  pushMatches(/^\s{0,3}#{1,6}\s+.*$/gm, 'Markdown heading', 'format', 'Formatting');
  pushMatches(/\*[^\n*]+\*/g, 'Asterisk formatting', 'format', 'Formatting');
  pushMatches(/[ \t]+(?=\r?$)/gm, 'Trailing whitespace', 'format', 'Formatting');
  pushMatches(/^\s*(?:introduction|conclusion|key takeaways|final thoughts|in summary)\s*:?[ \t]*$/gim, 'Template-like section heading', 'format', 'Formatting');
  for (const pattern of phrasePatterns) {
    pushMatches(pattern.regex, pattern.label, 'phrase', pattern.group, groupDescriptions[pattern.group]);
  }

  const openings = new Map();
  const sentences = [...text.matchAll(/[^.!?\n]+(?:[.!?]+|$)/g)];
  for (const sentence of sentences) {
    const match = sentence[0].match(/^\s*["'“‘([{]*([A-Za-z][A-Za-z’'-]*(?:\s+[A-Za-z][A-Za-z’'-]*){1})/);
    if (!match) continue;
    const opening = match[1].replace(/\s+/g, ' ').toLowerCase();
    const wordStart = sentence[0].indexOf(match[1]);
    const entry = { start: sentence.index + wordStart, end: sentence.index + wordStart + match[1].length, text: match[1] };
    if (!openings.has(opening)) openings.set(opening, []);
    openings.get(opening).push(entry);
  }
  if (sentences.length >= 3) {
    for (const [opening, matches] of openings) {
      if (matches.length < 2) continue;
      for (const match of matches) {
        found.push({ ...match, label: 'Repeated sentence opening', kind: 'structure', group: 'Repeated openings', reason: `Several sentences begin with “${opening}”. Repeated structure can be a useful editing cue, though it is also common in organized writing.` });
      }
    }
  }

  found.sort((a,b) => a.start - b.start || (b.end - b.start) - (a.end - a.start) || (a.kind === 'format' ? -1 : 1));
  // Keep longer, earlier spans when detectors overlap so the marked text stays valid.
  const filtered = [];
  for (const item of found) {
    const overlap = filtered.find(existing => item.start < existing.end && item.end > existing.start);
    if (!overlap) filtered.push(item);
    else if (item.kind === 'format' && overlap.kind !== 'format') filtered[filtered.indexOf(overlap)] = item;
  }
  return filtered.sort((a,b) => a.start - b.start);
}

function escapeHTML(text) {
  return text.replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
}
function renderSignals() {
  const text = source.value;
  const signals = findSignals(text);
  const signalContext = document.querySelector('#signal-context');
  signalCount.textContent = signals.length;
  tabCount.textContent = signals.length;
  if (!text) {
    markedText.innerHTML = '<span class="empty-marked">Paste text in the Clean view to inspect it.</span>';
    signalList.innerHTML = '';
    signalContext.textContent = '';
    return;
  }
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  signalContext.textContent = words < 100 ? `Short sample (${words} words). Treat individual matches as prompts to review, not strong evidence.` : 'Review the matches in context. Repeated patterns matter more than any single word.';
  if (!signals.length) {
    markedText.textContent = text;
    signalList.innerHTML = '<div class="signal-empty">No listed patterns found. That does not establish how the text was written.</div>';
    return;
  }
  let cursor = 0;
  let html = '';
  for (const item of signals) {
    html += escapeHTML(text.slice(cursor, item.start));
    const visible = item.text.replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF\u00AD\u034F\u061C]/g, '·').replace(/[ \t]+$/g, spaces => '·'.repeat(spaces.length));
    html += `<mark class="${item.kind}" title="${escapeHTML(item.label)}">${escapeHTML(visible)}</mark>`;
    cursor = item.end;
  }
  html += escapeHTML(text.slice(cursor));
  markedText.innerHTML = html;
  const groups = new Map();
  signals.forEach(item => {
    if (!groups.has(item.group)) groups.set(item.group, new Map());
    const counts = groups.get(item.group);
    counts.set(item.label, (counts.get(item.label) || 0) + 1);
  });
  signalList.innerHTML = [...groups].map(([group, counts]) => {
    const chips = [...counts].map(([label, count]) => `<span class="signal-chip" title="${escapeHTML(groupDescriptions[group] || '')}"><b>${count}</b>${escapeHTML(label)}</span>`).join('');
    return `<section class="signal-group"><div class="signal-group-head"><b>${escapeHTML(group)}</b><span>${[...counts.values()].reduce((sum, count) => sum + count, 0)}</span></div><p>${escapeHTML(groupDescriptions[group] || '')}</p><div class="signal-chips">${chips}</div></section>`;
  }).join('');
}
function update() {
  const text = source.value;
  const { result, changes } = undoCurrent ? { result: text, changes: 0 } : cleanText(text);
  cleaned.value = result;
  inputCount.textContent = `${text.length.toLocaleString()} ${text.length === 1 ? 'character' : 'characters'}`;
  changeCount.textContent = undoCurrent && text ? 'Original restored' : changes ? `${changes.toLocaleString()} ${changes === 1 ? 'change' : 'changes'}` : 'No changes';
  copyButton.disabled = !result;
  undoButton.disabled = !text || !changes;
  changeReview.hidden = !changes;
  reviewCount.textContent = changes ? `${changes.toLocaleString()} ${changes === 1 ? 'change' : 'changes'}` : '';
  if (changes) renderDiff(text, result);
  renderSignals();
}
function notify(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}
function syncEditorHeight(active, other) {
  const height = Math.round(active.getBoundingClientRect().height);
  if (Math.abs(Math.round(other.getBoundingClientRect().height) - height) <= 1) return;
  other.style.height = `${height}px`;
}
if (typeof ResizeObserver !== 'undefined') {
  let syncingEditorSizes = false;
  const editorResizeObserver = new ResizeObserver(entries => {
    if (syncingEditorSizes) return;
    const entry = entries.find(item => item.target === source || item.target === cleaned);
    if (!entry) return;
    syncingEditorSizes = true;
    syncEditorHeight(entry.target, entry.target === source ? cleaned : source);
    syncingEditorSizes = false;
  });
  editorResizeObserver.observe(source);
  editorResizeObserver.observe(cleaned);
} else {
  source.addEventListener('pointerup', () => syncEditorHeight(source, cleaned));
  cleaned.addEventListener('pointerup', () => syncEditorHeight(cleaned, source));
}
source.addEventListener('input', () => { undoCurrent = false; update(); });
document.querySelectorAll('[data-rule]').forEach(input => input.addEventListener('change', () => { undoCurrent = false; update(); }));
document.querySelector('#clean-button').addEventListener('click', () => { undoCurrent = false; update(); notify(source.value ? 'Text cleaned' : 'Paste text to get started'); });
undoButton.addEventListener('click', () => { undoCurrent = true; update(); notify('Original text restored in the output'); });
copyButton.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(cleaned.value); notify('Cleaned text copied'); }
  catch { cleaned.focus(); cleaned.select(); document.execCommand('copy'); notify('Cleaned text copied'); }
});
document.querySelector('#clear-button').addEventListener('click', () => { undoCurrent = false; source.value = ''; update(); source.focus(); });
document.querySelector('#sample-button').addEventListener('click', () => {
  undoCurrent = false;
  source.value = 'Ｉｎ ｔｏｄａｙ’s fast-paced world, it’s worth noting that AI tools can help us delve into a robust tapestry of ideas, while hidden characters quietly disrupt search.\u00A0\n\n## A clearer draft\nThis is *just a sample*…';
  update(); source.focus();
});
document.querySelectorAll('.mode-tab').forEach(tab => tab.addEventListener('click', () => {
  document.querySelectorAll('.mode-tab').forEach(item => { const active = item === tab; item.classList.toggle('is-active', active); item.setAttribute('aria-selected', String(active)); });
  document.querySelector('#clean-panel').hidden = tab.dataset.mode !== 'clean';
  document.querySelector('#signals-panel').hidden = tab.dataset.mode !== 'signals';
}));
update();
