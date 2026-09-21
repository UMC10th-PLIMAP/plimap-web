const DEMO_SESSION_STORAGE_KEY = 'plimap:demo-session';

export function isDemoSession() {
  return localStorage.getItem(DEMO_SESSION_STORAGE_KEY) === 'true';
}

export function markDemoSession() {
  localStorage.setItem(DEMO_SESSION_STORAGE_KEY, 'true');
}

export function clearDemoSession() {
  localStorage.removeItem(DEMO_SESSION_STORAGE_KEY);
}
