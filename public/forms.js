'use strict';
// Native Vanilla JS AJAX; no framework, build step, API key, or CDN needed.
const pendingForms = new WeakSet();
const formMessages = {
  quote: 'Thank you! Your quote request has been submitted. We’ll review your brief and reply to the email you provided.',
  contact: 'Thank you! Your enquiry has been submitted. We’ll reply to the email you provided.',
  newsletter: 'Thank you! Your subscription request has been submitted.'
};
async function submitToFormspree(form) {
  if (pendingForms.has(form) || !form.reportValidity()) return;
  const status = form.querySelector('[role="status"], [role="alert"]');
  const buttons = [...form.querySelectorAll('button:not([type]), button[type="submit"], input[type="submit"]')];
  const priorButtons = buttons.map(button => ({ button, disabled: button.disabled, html: button.innerHTML }));
  form.querySelectorAll('[aria-invalid]').forEach(field => field.removeAttribute('aria-invalid'));
  status.setAttribute('role', 'status');
  status.dataset.state = 'sending';
  status.textContent = 'Sending…';
  const data = new FormData(form);
  data.set('page', window.location.href);
  if (form.id === 'quote-form') {
    data.set('message', [
      `Service: ${data.get('service')}`,
      `Languages: ${data.get('source')} → ${data.get('target')}`,
      `Approximate words: ${data.get('words')}`,
      `Timeline: ${data.get('timeline')}`,
      `Project notes: ${data.get('notes') || 'None provided'}`
    ].join('\n'));
    data.set('indicative_budget_gbp', document.querySelector('#estimate').textContent);
    data.set('pricing_note', 'Illustrative planning estimate only; final scope, rates and availability must be confirmed.');
  }
  pendingForms.add(form);
  form.setAttribute('aria-busy', 'true');
  buttons.forEach(button => { button.disabled = true; button.textContent = 'Sending…'; });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(form.action, {
      method: 'POST', body: data, headers: { Accept: 'application/json' }, signal: controller.signal
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      const errors = Array.isArray(result.errors) ? result.errors : [];
      errors.forEach(error => {
        const field = typeof error.field === 'string' ? form.elements.namedItem(error.field) : null;
        if (field && typeof field.setAttribute === 'function') field.setAttribute('aria-invalid', 'true');
      });
      const message = errors.map(error => typeof error.message === 'string' ? error.message : '').filter(Boolean).join(' ');
      throw new Error(message || (response.status === 429 ? 'Too many requests. Please wait before trying again.' : 'Your request could not be submitted. Please try again or contact support@qualifylocalize.com.'));
    }
    status.dataset.state = 'success';
    status.textContent = formMessages[data.get('request_type')] || 'Thank you! Your request has been submitted.';
  } catch (error) {
    status.setAttribute('role', 'alert');
    status.dataset.state = 'error';
    // Preserve entered values, and never retry a POST automatically.
    status.textContent = error.name === 'AbortError' || error instanceof TypeError
      ? 'We couldn’t confirm receipt because the connection was interrupted. Your entries are still here. Check before resending, or contact support@qualifylocalize.com / WhatsApp.'
      : error.message || 'Something went wrong. Please contact support@qualifylocalize.com.';
  } finally {
    clearTimeout(timer);
    pendingForms.delete(form);
    form.removeAttribute('aria-busy');
    priorButtons.forEach(({button, disabled, html}) => { button.disabled = disabled; button.innerHTML = html; });
  }
}
document.querySelectorAll('form[data-formspree]').forEach(form => {
  form.addEventListener('submit', event => { event.preventDefault(); submitToFormspree(form); });
  form.addEventListener('input', event => {
    event.target.removeAttribute('aria-invalid');
    if (!pendingForms.has(form)) {
      const status = form.querySelector('[role="status"], [role="alert"]');
      status.textContent = '';
      delete status.dataset.state;
    }
  });
});
