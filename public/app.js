(() => {
'use strict';
/** Accessible navigation and one contact flow; no tracking or third-party runtime. */
const nav = document.querySelector('#site-nav');
const toggle = document.querySelector('.menu-toggle');
const triggers = [...document.querySelectorAll('.nav-trigger')];
const mobile = window.matchMedia('(max-width: 820px)');
function closeGroups(except = null) {
  for (const button of triggers) {
    if (button === except) continue;
    button.setAttribute('aria-expanded', 'false');
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    if (panel) panel.hidden = true;
  }
}
function setMenu(open, returnFocus = false) {
  if (!toggle || !nav) return;
  nav.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  if (!open) { closeGroups(); if (returnFocus) toggle.focus(); }
}
triggers.forEach(button => button.addEventListener('click', () => {
  const panel = document.getElementById(button.getAttribute('aria-controls'));
  if (!panel) return;
  const open = button.getAttribute('aria-expanded') !== 'true';
  closeGroups(button);
  button.setAttribute('aria-expanded', String(open));
  panel.hidden = !open;
}));
toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
nav?.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
document.addEventListener('click', event => {
  if (!event.target.closest('.nav-group')) closeGroups();
  if (mobile.matches && !event.target.closest('.site-header')) setMenu(false);
});
document.addEventListener('focusin', event => {
  if (!event.target.closest('.nav-group')) closeGroups();
  if (mobile.matches && !event.target.closest('.site-header')) setMenu(false);
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const expanded = triggers.find(t => t.getAttribute('aria-expanded') === 'true');
  if (expanded) { event.preventDefault(); closeGroups(); expanded.focus(); }
  else if (toggle?.getAttribute('aria-expanded') === 'true') { event.preventDefault(); setMenu(false, true); }
});
mobile.addEventListener('change', () => setMenu(false));

const form = document.querySelector('#contact-form');
const service = form?.querySelector('[name="service"]');
const status = form?.querySelector('.form-status');
const submit = form?.querySelector('[type="submit"]');
let sending = false;
let draftPanel = null;
function message(text, error = false) {
  if (!status) return;
  status.textContent = text;
  status.dataset.error = String(error);
}
document.querySelectorAll('[data-service]').forEach(anchor => {
  anchor.addEventListener('click', () => {
    if (!service) return;
    const value = anchor.dataset.service;
    if ([...service.options].some(o => o.value === value)) service.value = value;
    // Native anchor navigation is kept; no forced focus or scroll hijacking.
  });
});
function draftText(data) {
  const selected = service?.selectedOptions[0]?.textContent || 'Пока не определился';
  return [
    'Здравствуйте! Хочу обсудить проект.', '',
    `Задача: ${selected}`,
    data.get('name')?.trim() ? `Имя: ${data.get('name').trim()}` : '',
    `Связь: ${String(data.get('contact') || '').trim()}`,
    '', String(data.get('message') || '').trim(),
  ].filter(line => line !== null).join('\n');
}
function prepareEmail(data) {
  draftPanel?.remove();
  draftPanel = document.createElement('div');
  draftPanel.className = 'email-draft';
  const text = draftText(data);
  const heading = document.createElement('strong');
  heading.textContent = 'Черновик готов. Осталось отправить письмо.';
  const explanation = document.createElement('p');
  explanation.textContent = 'Откройте почту или скопируйте текст и отправьте его любым удобным способом.';
  const open = document.createElement('a');
  open.className = 'button button--primary';
  open.textContent = 'Открыть письмо ↗';
  open.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent('Проект сайта — SAYTMSK')}&body=${encodeURIComponent(text)}`;
  const copy = document.createElement('button');
  copy.type = 'button'; copy.className = 'text-link'; copy.textContent = 'Скопировать текст';
  const preview = document.createElement('textarea');
  preview.readOnly = true; preview.value = text; preview.rows = 6;
  preview.setAttribute('aria-label', 'Текст подготовленного письма');
  copy.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      copy.textContent = 'Текст скопирован';
    } catch {
      preview.focus(); preview.select();
      message('Текст выделен. Скопируйте его и отправьте в почте или Telegram.');
    }
  });
  draftPanel.append(heading, explanation, preview, open, copy);
  form.append(draftPanel);
  message('Письмо подготовлено, но ещё не отправлено.');
}
form?.addEventListener('submit', async event => {
  event.preventDefault();
  if (sending || !form.reportValidity()) return;
  const data = new FormData(form);
  if (String(data.get('website') || '').trim()) { message('Не удалось подготовить обращение. Напишите напрямую.', true); return; }
  if (String(data.get('contact') || '').trim().length < 3) {
    message('Укажите телефон, email или Telegram для ответа.', true);
    form.querySelector('[name="contact"]').focus(); return;
  }
  if (form.dataset.mode !== 'server') { prepareEmail(data); return; }
  const endpoint = form.dataset.endpoint;
  if (!endpoint) { message('Отправка не подключена. Напишите напрямую на почту или в Telegram.', true); return; }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  sending = true;
  const original = submit.innerHTML;
  submit.disabled = true; submit.textContent = 'Отправляем…';
  form.setAttribute('aria-busy', 'true'); message('');
  try {
    const response = await fetch(endpoint, {method:'POST', body:data, signal:controller.signal, credentials:'same-origin', headers:{'Accept':'application/json'}});
    const result = await response.json();
    if (!response.ok || result.success !== true) throw new Error('Delivery not confirmed');
    message('Запрос отправлен. Ответим по указанному контакту.');
    form.reset();
  } catch (error) {
    message(error.name === 'AbortError' ? 'Подтверждение отправки не получено. Данные сохранены в форме. Свяжитесь напрямую, чтобы не отправлять запрос повторно.' : 'Не удалось подтвердить отправку. Данные сохранены в форме. Напишите напрямую на почту или в Telegram.', true);
  } finally {
    clearTimeout(timer); sending = false; submit.disabled = false; submit.innerHTML = original; form.removeAttribute('aria-busy');
  }
});

})();
