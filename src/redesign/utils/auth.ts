export function signOutUser() {
  try {
    localStorage.removeItem('koyjabo_auth_session');
    sessionStorage.removeItem('koyjabo_post_login_redirect');
  } catch {
    // Storage may be unavailable in private/browser-restricted contexts.
  }

  window.dispatchEvent(new Event('koyjabo-auth-changed'));
}

export function signInUser(user: { id: string; email: string; username: string; displayName: string; provider?: 'manual' | 'google'; hasPassword?: boolean }) {
  const session = {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      provider: user.provider ?? 'manual',
      hasPassword: user.hasPassword ?? true,
      createdAt: Date.now(),
    },
    deviceId: localStorage.getItem('koyjabo_device_id') || crypto.randomUUID(),
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  };

  localStorage.setItem('koyjabo_device_id', session.deviceId);
  localStorage.setItem('koyjabo_auth_session', JSON.stringify(session));
  window.dispatchEvent(new Event('koyjabo-auth-changed'));
}
