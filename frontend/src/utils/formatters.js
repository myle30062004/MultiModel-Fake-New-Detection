export const clamp = (value, min = 0, max = 1) => Math.min(Math.max(Number(value) || 0, min), max);

export const toPercent = (value, digits = 0) => `${(clamp(value) * 100).toFixed(digits)}%`;

export const compactNumber = (value) =>
  new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value) || 0);

export const formatDate = (timestamp) => {
  if (!timestamp) return 'Unknown date';

  const raw = Number(timestamp);
  const date = Number.isFinite(raw)
    ? new Date(String(timestamp).length <= 10 ? raw * 1000 : raw)
    : new Date(timestamp);

  if (Number.isNaN(date.getTime())) return 'Unknown date';

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export const formatDateTime = (timestamp) => {
  if (!timestamp) return 'Unknown time';

  const raw = Number(timestamp);
  const date = Number.isFinite(raw)
    ? new Date(String(timestamp).length <= 10 ? raw * 1000 : raw)
    : new Date(timestamp);

  if (Number.isNaN(date.getTime())) return 'Unknown time';

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const getPredictionTone = (label) => {
  const normalized = String(label || '').toLowerCase();
  if (normalized.includes('fake') || normalized === '1') return 'danger';
  if (normalized.includes('real') || normalized === '0') return 'success';
  return 'warning';
};

export const normalizeLabel = (label) => {
  if (label === 1 || label === '1') return 'Fake News';
  if (label === 0 || label === '0') return 'Real News';
  const normalized = String(label || '').toUpperCase();
  if (normalized === 'FAKE') return 'Fake News';
  if (normalized === 'REAL') return 'Real News';
  return normalized || 'Unreviewed';
};

export const extractSuspiciousPhrases = (content = '') => {
  const patterns = [
    'breaking',
    'shocking',
    'secret',
    'they do not want you to know',
    'share before deleted',
    'unverified',
    'viral',
    'no source',
    'screenshots',
  ];

  const lower = content.toLowerCase();
  return patterns.filter((pattern) => lower.includes(pattern)).slice(0, 5);
};

export const truncate = (text = '', length = 220) =>
  text.length > length ? `${text.slice(0, length).trim()}...` : text;
