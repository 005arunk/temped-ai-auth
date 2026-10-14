const $ = (id) => document.getElementById(id);
async function request(url, options={}) {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  const body = await response.json().catch(() => ({ error: 'Invalid server response' }));
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
  return body;
}
async function refreshStatus() {
  try { const data = await request('/api/health'); $('health').textContent = 'API online'; $('statusResult').textContent = JSON.stringify(data, null, 2); }
  catch (e) { $('health').textContent = 'API unavailable'; $('statusResult').textContent = e.message; }
}
$('refresh').addEventListener('click', refreshStatus);
$('verify').addEventListener('click', async () => {
  const token = $('token').value.trim();
  if (!token) { $('meResult').textContent = 'Enter a Cognito access token.'; return; }
  $('meResult').textContent = 'Verifying…';
  try { const data = await request('/api/me', { headers: { Authorization: `Bearer ${token}` } }); $('meResult').textContent = JSON.stringify(data, null, 2); }
  catch (e) { $('meResult').textContent = e.message; }
  finally { $('token').value = ''; }
});
$('explain').addEventListener('click', async () => {
  $('aiResult').textContent = 'Requesting explanation…';
  try { const data = await request('/api/ai/explain-event', { method: 'POST', body: JSON.stringify({ eventType: $('eventType').value, errorCode: $('errorCode').value.trim(), timestamp: new Date().toISOString(), environment: $('environment').value }) }); $('aiResult').textContent = `${data.explanation}

${data.disclaimer}`; }
  catch (e) { $('aiResult').textContent = e.message; }
});
refreshStatus();
