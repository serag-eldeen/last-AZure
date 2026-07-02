export async function apiFetch(url: string | URL, options: RequestInit = {}): Promise<Response> {
  const urlString = typeof url === 'string' ? url : (url instanceof URL ? url.toString() : '');

  // 1. Inject Authorization header if calling backend APIs
  if (urlString.startsWith('/api/')) {
    const token = sessionStorage.getItem('azure_access_token') || localStorage.getItem('azure_access_token');
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    }
  }

  // 2. Perform actual fetch request using window.fetch
  const response = await window.fetch(url, options);

  // 3. Intercept and extract tokens on login or refresh success
  if (urlString.includes('/api/auth/login') || urlString.includes('/api/auth/refresh')) {
    try {
      const clone = response.clone();
      const data = await clone.json();
      if (data && data.success) {
        if (data.token) {
          sessionStorage.setItem('azure_access_token', data.token);
          localStorage.setItem('azure_access_token', data.token);
        }
        if (data.refreshToken) {
          sessionStorage.setItem('azure_refresh_token', data.refreshToken);
          localStorage.setItem('azure_refresh_token', data.refreshToken);
        }
      }
    } catch (e) {
      // Silently handle any non-JSON or stream reading failures
    }
  }

  // 4. Clear local tokens on logout success
  if (urlString.includes('/api/auth/logout')) {
    sessionStorage.removeItem('azure_access_token');
    localStorage.removeItem('azure_access_token');
    sessionStorage.removeItem('azure_refresh_token');
    localStorage.removeItem('azure_refresh_token');
  }

  return response;
}
