/* Ateliê Moema — Tweaks panel (vanilla) */
(function () {
  'use strict';

  const PALETTES = [
    { id: 'ameixa', label: 'Ameixa' },
    { id: 'sage',   label: 'Sage'   },
    { id: 'rose',   label: 'Rosé'   }
  ];
  const HEROS = [
    { id: 'split',     label: 'Split' },
    { id: 'fullbleed', label: 'Center' }
  ];

  // panel DOM
  const panel = document.createElement('div');
  panel.className = 'tweaks-panel';
  panel.innerHTML = `
    <div class="tweaks-panel-head">
      <strong>Tweaks</strong>
      <button class="tweaks-panel-close" aria-label="Fechar tweaks">×</button>
    </div>
    <div class="tweaks-section">
      <label>Paleta</label>
      <div class="tweaks-swatches" data-key="palette">
        ${PALETTES.map(p => `<button class="tweaks-swatch" data-val="${p.id}" title="${p.label}">${p.label}</button>`).join('')}
      </div>
    </div>
    <div class="tweaks-section">
      <label>Hero</label>
      <div class="tweaks-radio" data-key="hero">
        ${HEROS.map(h => `<button data-val="${h.id}">${h.label}</button>`).join('')}
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  const state = Object.assign({ palette: 'ameixa', hero: 'split' }, window.__TWEAKS__ || {});

  function apply() {
    document.documentElement.dataset.palette = state.palette;
    document.documentElement.dataset.hero = state.hero;
    panel.querySelectorAll('[data-key]').forEach(group => {
      const key = group.dataset.key;
      group.querySelectorAll('button').forEach(b => {
        b.classList.toggle('is-active', b.dataset.val === state[key]);
      });
    });
  }
  function set(key, val) {
    state[key] = val;
    apply();
    try {
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [key]: val } }, '*');
    } catch (e) {}
  }
  panel.querySelectorAll('[data-key]').forEach(group => {
    const key = group.dataset.key;
    group.addEventListener('click', e => {
      const b = e.target.closest('button[data-val]');
      if (b) set(key, b.dataset.val);
    });
  });
  panel.querySelector('.tweaks-panel-close').addEventListener('click', () => {
    panel.classList.remove('is-open');
    try { window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); } catch (e) {}
  });

  // host protocol
  window.addEventListener('message', e => {
    const d = e.data || {};
    if (d.type === '__activate_edit_mode')   panel.classList.add('is-open');
    if (d.type === '__deactivate_edit_mode') panel.classList.remove('is-open');
  });
  try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (e) {}

  apply();
})();
