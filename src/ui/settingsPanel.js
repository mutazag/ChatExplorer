import { setModelDefault, setModelSession, getState } from '../state/appState.js';

const MODELS = ['Claude Sonnet 4.5', 'Claude Haiku', 'GPT-4o'];

export function mountSettings(dialogEl) {
  dialogEl.innerHTML = '';
  const wrap = document.createElement('form');
  wrap.method = 'dialog';

  const h = document.createElement('h2');
  h.textContent = 'Settings';
  wrap.appendChild(h);

  // Default model selector
  const label = document.createElement('label');
  label.textContent = 'Default Model: ';
  const sel = document.createElement('select');
  for (const m of MODELS) {
    const opt = document.createElement('option');
    opt.value = m; opt.textContent = m; sel.appendChild(opt);
  }
  sel.value = getState().modelDefault;
  label.appendChild(sel);
  wrap.appendChild(label);

  // Session override
  const label2 = document.createElement('label');
  label2.style.display = 'block';
  label2.textContent = 'Session Override: ';
  const sel2 = document.createElement('select');
  const none = document.createElement('option');
  none.value = ''; none.textContent = '(none)';
  sel2.appendChild(none);
  for (const m of MODELS) {
    const opt = document.createElement('option');
    opt.value = m; opt.textContent = m; sel2.appendChild(opt);
  }
  label2.appendChild(sel2);
  wrap.appendChild(label2);

  const actions = document.createElement('div');
  actions.style.marginTop = '1rem';
  const btnSave = document.createElement('button');
  btnSave.type = 'submit'; btnSave.textContent = 'Save';
  const btnCancel = document.createElement('button');
  btnCancel.type = 'button'; btnCancel.textContent = 'Cancel';
  btnCancel.addEventListener('click', () => dialogEl.close());
  actions.append(btnSave, btnCancel);
  wrap.appendChild(actions);

  wrap.addEventListener('submit', (e) => {
    e.preventDefault();
    setModelDefault(sel.value);
    setModelSession(sel2.value || null);
    dialogEl.close('ok');
  });

  dialogEl.appendChild(wrap);
}
