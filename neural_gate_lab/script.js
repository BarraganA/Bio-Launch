(() => {
  const state = {
    x1: 0,
    x2: 0,
    useX2: true,
    w1: 1,
    w2: 1,
    b: -0.5
  };

  const els = {
    x1Button: document.getElementById('x1Button'),
    x2Button: document.getElementById('x2Button'),
    useX2: document.getElementById('useX2'),
    w1Range: document.getElementById('w1Range'),
    w1Number: document.getElementById('w1Number'),
    w2Range: document.getElementById('w2Range'),
    w2Number: document.getElementById('w2Number'),
    bRange: document.getElementById('bRange'),
    bNumber: document.getElementById('bNumber'),
    w2Group: document.getElementById('w2Group'),

    x1Node: document.getElementById('x1Node'),
    x2Node: document.getElementById('x2Node'),
    x1ValueText: document.getElementById('x1ValueText'),
    x2ValueText: document.getElementById('x2ValueText'),
    w1Label: document.getElementById('w1Label'),
    w2Label: document.getElementById('w2Label'),
    bLabel: document.getElementById('bLabel'),
    line1: document.getElementById('line1'),
    line2: document.getElementById('line2'),
    zInside: document.getElementById('zInside'),
    outputNode: document.getElementById('outputNode'),
    outputValueText: document.getElementById('outputValueText'),
    symbolicEquation: document.getElementById('symbolicEquation'),
    numericEquation: document.getElementById('numericEquation'),
    activationReadout: document.getElementById('activationReadout'),
    status: document.getElementById('status'),
    pulse: document.getElementById('pulse')
  };

  function clamp(value, min = -5, max = 5) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.min(max, Math.max(min, n));
  }

  function fmt(value) {
    const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
    if (Object.is(rounded, -0)) return '0';
    return Number.isInteger(rounded)
      ? String(rounded)
      : rounded.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  }

  function signed(value) {
    if (value < 0) return '− ' + fmt(Math.abs(value));
    return '+ ' + fmt(value);
  }

  function weightWidth(value) {
    return 2.2 + Math.min(5.5, Math.abs(value) * 0.85);
  }

  function runPulse() {
    const pulse = els.pulse;
    pulse.classList.remove('animate');
    void pulse.getBoundingClientRect();
    pulse.classList.add('animate');
  }

  function update() {
    const x2 = state.useX2 ? state.x2 : 0;
    const contribution1 = state.w1 * state.x1;
    const contribution2 = state.useX2 ? state.w2 * x2 : 0;
    const z = contribution1 + contribution2 + state.b;
    const y = z >= 0 ? 1 : 0;

    els.x1Button.textContent = `x₁ = ${state.x1}`;
    els.x1Button.setAttribute('aria-pressed', String(state.x1 === 1));
    els.x1Button.classList.toggle('active', state.x1 === 1);

    els.x2Button.textContent = `x₂ = ${state.x2}`;
    els.x2Button.setAttribute('aria-pressed', String(state.x2 === 1));
    els.x2Button.classList.toggle('active', state.x2 === 1);
    els.x2Button.disabled = !state.useX2;

    els.x1Node.classList.toggle('on', state.x1 === 1);
    els.x1Node.classList.toggle('off', state.x1 === 0);
    els.x1Node.setAttribute('aria-label', `Entrada x1, valor ${state.x1}`);

    els.x2Node.classList.toggle('disabled', !state.useX2);
    els.x2Node.classList.toggle('on', state.useX2 && state.x2 === 1);
    els.x2Node.classList.toggle('off', state.useX2 && state.x2 === 0);
    els.x2Node.setAttribute(
      'aria-label',
      state.useX2
        ? `Entrada x2, valor ${state.x2}`
        : 'Entrada x2 desactivada'
    );

    els.x1ValueText.textContent = state.x1;
    els.x2ValueText.textContent = state.useX2 ? state.x2 : '—';

    els.w1Label.textContent = `w₁ = ${fmt(state.w1)}`;
    els.w2Label.textContent = state.useX2
      ? `w₂ = ${fmt(state.w2)}`
      : 'w₂ desactivado';
    els.bLabel.textContent = fmt(state.b);

    els.line1.style.strokeWidth = weightWidth(state.w1);
    els.line2.style.strokeWidth = weightWidth(state.w2);
    els.line2.classList.toggle('disabled', !state.useX2);

    els.w2Range.disabled = !state.useX2;
    els.w2Number.disabled = !state.useX2;
    els.w2Group.style.opacity = state.useX2 ? '1' : '.42';

    els.zInside.textContent = fmt(z);

    els.outputNode.classList.toggle('on', y === 1);
    els.outputNode.classList.toggle('off', y === 0);
    els.outputValueText.textContent = y;

    els.symbolicEquation.textContent = state.useX2
      ? 'z = w₁x₁ + w₂x₂ + b'
      : 'z = w₁x₁ + b';

    if (state.useX2) {
      els.numericEquation.innerHTML =
        `z = (${fmt(state.w1)})(${state.x1}) + (${fmt(state.w2)})(${x2}) ${signed(state.b)} = <strong>${fmt(z)}</strong>`;
    } else {
      els.numericEquation.innerHTML =
        `z = (${fmt(state.w1)})(${state.x1}) ${signed(state.b)} = <strong>${fmt(z)}</strong>`;
    }

    els.activationReadout.textContent = z >= 0
      ? 'Como z ≥ 0, la salida es y = 1.'
      : 'Como z < 0, la salida es y = 0.';

    els.status.innerHTML = `<strong>Salida actual:</strong> y = ${y}`;

    runPulse();
  }

  function bindPair(rangeEl, numberEl, key) {
    const apply = (raw) => {
      const value = clamp(raw);
      state[key] = value;
      rangeEl.value = value;
      numberEl.value = value;
      update();
    };

    rangeEl.addEventListener('input', () => apply(rangeEl.value));

    numberEl.addEventListener('input', () => {
      if (
        numberEl.value === '' ||
        numberEl.value === '-' ||
        numberEl.value === '.'
      ) {
        return;
      }

      apply(numberEl.value);
    });

    numberEl.addEventListener('change', () => apply(numberEl.value));
  }

  function toggleX1() {
    state.x1 = state.x1 ? 0 : 1;
    update();
  }

  function toggleX2() {
    if (!state.useX2) return;
    state.x2 = state.x2 ? 0 : 1;
    update();
  }

  els.x1Button.addEventListener('click', toggleX1);
  els.x2Button.addEventListener('click', toggleX2);

  els.x1Node.addEventListener('click', toggleX1);
  els.x2Node.addEventListener('click', toggleX2);

  els.x1Node.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleX1();
    }
  });

  els.x2Node.addEventListener('keydown', (event) => {
    if (!state.useX2) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleX2();
    }
  });

  els.useX2.addEventListener('change', () => {
    state.useX2 = els.useX2.checked;
    update();
  });

  bindPair(els.w1Range, els.w1Number, 'w1');
  bindPair(els.w2Range, els.w2Number, 'w2');
  bindPair(els.bRange, els.bNumber, 'b');

  update();
})();
