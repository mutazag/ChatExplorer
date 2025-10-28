// Accessibility utilities
(function(){
  function setAriaLabel(el, label){
    if (!el) return;
    const v = (label && String(label).trim()) || '';
    if (v) el.setAttribute('aria-label', v);
  }

  function getFocusable(container){
    if (!container) return [];
    const selectors = [
      'a[href]','area[href]','button:not([disabled])','input:not([disabled])',
      'select:not([disabled])','textarea:not([disabled])','iframe','object','embed',
      '[contenteditable]','[tabindex]:not([tabindex="-1"])'
    ];
    return Array.from(container.querySelectorAll(selectors.join(',')))
      .filter(el => el.offsetParent !== null || el.getClientRects().length > 0);
  }

  function trapFocus(container){
    const focusables = () => getFocusable(container);
    function onKeydown(e){
      if (e.key !== 'Tab') return;
      const els = focusables();
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      const active = document.activeElement;
      if (e.shiftKey){
        if (active === first || !container.contains(active)){
          e.preventDefault(); last.focus();
        }
      } else {
        if (active === last || !container.contains(active)){
          e.preventDefault(); first.focus();
        }
      }
    }
    document.addEventListener('keydown', onKeydown);
    return function cleanup(){ document.removeEventListener('keydown', onKeydown); };
  }

  function restoreFocus(target, opts){
    const options = Object.assign({ tempTabIndex: false }, opts);
    if (!target) return;
    try {
      let added = false;
      if (options.tempTabIndex) {
        const isFocusable = target.tabIndex >= 0 || typeof target.focus === 'function';
        if (!isFocusable) { target.setAttribute('tabindex','0'); added = true; }
      }
      requestAnimationFrame(() => requestAnimationFrame(() => {
        try { target.focus && target.focus(); } catch (e) {}
        if (added) { try { target.removeAttribute('tabindex'); } catch (e) {} }
      }));
    } catch (e) {}
  }

  window.a11y = { setAriaLabel, trapFocus, restoreFocus };
})();
