export const dispatchSOSAlert = (detail = {}) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('safeRouteSOS', { detail }));
};
