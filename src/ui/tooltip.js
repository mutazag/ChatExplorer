import { truncateMiddle } from '../utils/text.js';

// Build a deterministic, compact summary object for tooltips
export function buildTooltipSummary(msg) {
  try {
    const role = msg?.role || 'unknown';
    const meta = msg?.meta || {};
    const base = {
      role,
      id: String(msg?.id || meta?.nodeId || ''),
      parentId: meta?.parentId ? String(meta.parentId) : undefined,
      contentType: meta?.contentType || '',
      createdTime: Number.isFinite(meta?.createdTime) ? meta.createdTime : (msg?.create_time ?? null)
    };
    if (role === 'assistant' && meta?.modelSlug) {
      base.modelSlug = String(meta.modelSlug);
    }
    // Optionally include extra fields if present
    if (meta?.status) base.status = String(meta.status);
    if (Array.isArray(meta?.selected_sources)) base.selected_sources = [...meta.selected_sources];
    if (Array.isArray(meta?.prompt_expansion_predictions)) base.prompt_expansion_predictions = [...meta.prompt_expansion_predictions];
    if (Array.isArray(meta?.safe_urls)) base.safe_urls = [...meta.safe_urls];
    if (typeof meta?.is_user_system_message === 'boolean') base.is_user_system_message = meta.is_user_system_message;
    if (meta?.user_context_message_data && typeof meta.user_context_message_data === 'object') base.user_context_message_data = { ...meta.user_context_message_data };
    // Drop undefined to keep output tidy
    return Object.fromEntries(Object.entries(base).filter(([, v]) => v !== undefined));
  } catch {
    return { role: 'unknown', id: '' };
  }
}

// Render a tooltip element near target with JSONified summary content
function createTooltipEl(target, summary, container) {
  const el = document.createElement('div');
  el.setAttribute('data-tooltip', '');
  el.setAttribute('role', 'tooltip');
  el.setAttribute('data-for', String(summary.id || ''));
  // Stable id for aria-describedby
  try {
    const base = String(summary.id || 'x');
    el.id = `tooltip-for-${base}`;
  } catch { /* noop */ }
  el.style.position = 'absolute';
  el.style.zIndex = '9999';
  el.style.maxWidth = '360px';
  el.style.padding = '6px 8px';
  el.style.borderRadius = '8px';
  el.style.fontSize = '12px';
  el.style.pointerEvents = 'none';
  // Minimal content: JSON-like string; tests only check inclusion
  try {
    const pretty = JSON.stringify(makeDisplaySummary(summary));
    el.textContent = pretty;
  } catch {
    el.textContent = String(summary?.role || '');
  }
  // Insert first in the container so we can measure for smart placement
  (container || document.body).appendChild(el);
  try {
    const rect = target.getBoundingClientRect();
    const crect = (container || document.body).getBoundingClientRect();
    const cw = (container || document.body).clientWidth || (Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0));
    const ch = (container || document.body).clientHeight || (Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0));
    const gap = 8;
    let left = 0;
    let top = 0;
    let placement = 'right';
    // Try right of target relative to container, vertically centered
    left = (rect.right - crect.left) + gap;
    top = Math.round((rect.top - crect.top) + rect.height / 2 - el.offsetHeight / 2);
    // Clamp within container vertically
    top = Math.max(6, Math.min(top, ch - el.offsetHeight - 6));
    // If it overflows right edge of container, fallback to bottom placement
    if (left + el.offsetWidth > cw - 6) {
      placement = 'bottom';
      left = Math.max(6, (rect.left - crect.left));
      top = Math.max(6, (rect.bottom - crect.top) + gap);
      // If still overflowing the right edge, shift left within container
      left = Math.min(left, cw - el.offsetWidth - 6);
    }
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    el.setAttribute('data-placement', placement);
    // Align bottom arrow to icon center horizontally
    if (placement === 'bottom') {
      const iconCenter = (rect.left - crect.left) + (rect.width / 2);
      let arrowLeft = Math.round(iconCenter - left);
      const margin = 8;
      arrowLeft = Math.max(margin, Math.min(el.offsetWidth - margin, arrowLeft));
      el.style.setProperty('--arrow-left', `${arrowLeft}px`);
    }
  } catch {
    // Fallback: keep default doc flow position (already appended)
  }
  return el;
}

function removeExistingTooltips() {
  document.querySelectorAll('[data-tooltip]')?.forEach((n) => n.remove());
}

export function showTooltip(target, msg) {
  try {
    removeExistingTooltips();
    const summary = buildTooltipSummary(msg);
    const container = target.closest('[data-detail]') || document.body;
    const tip = createTooltipEl(target, summary, container);
    return tip;
  } catch {
    return null;
  }
}

export function hideTooltip() {
  try { removeExistingTooltips(); } catch {}
}

export function attachTooltipHandlers(target, msg) {
  if (!target) return;
  let currentTip = null;
  const show = () => {
    currentTip = showTooltip(target, msg);
    try { if (currentTip && currentTip.id) target.setAttribute('aria-describedby', currentTip.id); } catch {}
  };
  const hide = () => {
    hideTooltip();
    try { target.removeAttribute('aria-describedby'); } catch {}
    currentTip = null;
  };
  const onFocus = () => show();
  const onBlur = () => hide();
  const onEnter = () => show();
  const onLeave = () => hide();
  const onKey = (e) => {
    if (e.key === 'Escape') { hide(); target.blur?.(); }
  };
  target.addEventListener('focus', onFocus);
  target.addEventListener('blur', onBlur);
  target.addEventListener('mouseenter', onEnter);
  target.addEventListener('mouseleave', onLeave);
  target.addEventListener('keydown', onKey);
  // Clean-up if element is removed
  const obs = new MutationObserver(() => {
    if (!document.body.contains(target)) {
      hide();
      try {
        target.removeEventListener('focus', onFocus);
        target.removeEventListener('blur', onBlur);
        target.removeEventListener('mouseenter', onEnter);
        target.removeEventListener('mouseleave', onLeave);
        target.removeEventListener('keydown', onKey);
      } catch {}
      obs.disconnect();
    }
  });
  obs.observe(document.body, { childList: true, subtree: true });
}

// Create a display-safe summary where long strings are truncated
function makeDisplaySummary(summary, maxLen = 40) {
  const clone = {};
  for (const [k, v] of Object.entries(summary || {})) {
    if (typeof v === 'string') {
      clone[k] = v.length > maxLen ? truncateMiddle(v, maxLen) : v;
    } else if (Array.isArray(v) && v.every((x) => typeof x === 'string')) {
      clone[k] = v.map((s) => (s.length > maxLen ? truncateMiddle(s, maxLen) : s));
    } else {
      // Keep numbers, booleans, objects as-is (object may be large but is useful for debugging)
      clone[k] = v;
    }
  }
  return clone;
}
