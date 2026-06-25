/** Clears persisted storefront state before a hard WebView reload. */
export const CLEAR_STOREFRONT_WEB_STORAGE_INJECTION = `
try {
  localStorage.clear();
  sessionStorage.clear();
} catch (e) {}
true;
`;
