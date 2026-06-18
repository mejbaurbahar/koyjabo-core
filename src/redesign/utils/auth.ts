export function signOutUser() {
  try {
    localStorage.removeItem('koyjabo_auth_session');
    sessionStorage.removeItem('koyjabo_post_login_redirect');
  } catch {
    // Storage may be unavailable in private/browser-restricted contexts.
  }

  window.dispatchEvent(new Event('koyjabo-auth-changed'));
}
