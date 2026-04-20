const ALERT_HISTORY_KEY = 'safecheckin_alert_history_v1';

export const loadAlertHistory = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(ALERT_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const pushAlertHistory = (entry) => {
  if (typeof window === 'undefined') return [];
  const history = loadAlertHistory();
  const next = [entry, ...history];
  window.localStorage.setItem(ALERT_HISTORY_KEY, JSON.stringify(next));
  return next;
};
