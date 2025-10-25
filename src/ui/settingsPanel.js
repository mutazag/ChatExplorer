import { setModelDefault, setModelSession, getState, getAudit } from '../state/appState.js';
import { channelsFor, effectiveModel } from '../policy/modelPolicy.js';

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

  // Channel capability (images)
  const cap = document.createElement('div');
  cap.style.marginTop = '.5rem';
  const imgLabel = document.createElement('label');
  const imgToggle = document.createElement('input');
  imgToggle.type = 'checkbox';
  imgToggle.id = 'images-toggle';
  imgLabel.htmlFor = 'images-toggle';
  imgLabel.textContent = ' Allow images (if supported)';
  cap.appendChild(imgToggle);
  cap.appendChild(imgLabel);
  wrap.appendChild(cap);

  function refreshChannelsPreview() {
    const eff = effectiveModel({ modelDefault: sel.value, modelSession: sel2.value || null });
    const ch = channelsFor(eff);
    imgToggle.disabled = !ch.images;
    imgToggle.checked = !!ch.images; // reflect support
  }
  refreshChannelsPreview();
  sel.addEventListener('change', refreshChannelsPreview);
  sel2.addEventListener('change', refreshChannelsPreview);

  const actions = document.createElement('div');
  actions.style.marginTop = '1rem';
  const btnSave = document.createElement('button');
  btnSave.type = 'submit'; btnSave.textContent = 'Save';
  const btnCancel = document.createElement('button');
  btnCancel.type = 'button'; btnCancel.textContent = 'Cancel';
  btnCancel.addEventListener('click', () => dialogEl.close());
  const btnExport = document.createElement('button');
  btnExport.type = 'button'; btnExport.textContent = 'Export Log';
  btnExport.addEventListener('click', () => {
    const data = JSON.stringify(getAudit(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'model-settings-audit.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  actions.append(btnSave, btnCancel, btnExport);
  wrap.appendChild(actions);

  wrap.addEventListener('submit', (e) => {
    e.preventDefault();
    setModelDefault(sel.value);
    setModelSession(sel2.value || null);
    dialogEl.close('ok');
  });

  dialogEl.appendChild(wrap);
}
