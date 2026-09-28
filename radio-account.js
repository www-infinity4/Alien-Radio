(function () {
  'use strict';
  const button = document.getElementById('connectAccountButton');
  const dialog = document.getElementById('connectAccountDialog');
  const form = document.getElementById('connectAccountForm');
  const status = document.getElementById('connectAccountStatus');
  if (!button || !dialog || !form) return;
  const update = () => {
    const user = window.StarQuestAuth?.currentUser?.();
    button.textContent = 'Recover wallet';
    button.hidden = !!user;
  };
  button.addEventListener('click', () => dialog.showModal());
  dialog.querySelector('[data-close-account]')?.addEventListener('click', () => dialog.close());
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const username = form.elements.username.value.trim();
    const password = form.elements.password.value;
    status.textContent = 'Connecting to StarQuest…';
    form.querySelector('button[type=submit]').disabled = true;
    try {
      const auth = window.StarQuestAuth;
      if (!auth) throw new Error('StarQuest sign-in is unavailable.');
      let result = await auth.signIn(username, password);
      if (result === 'No account found with that username.') {
        // Verify cloud ownership before creating a profile on this origin.
        const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
        const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode('starquest-v1-' + username.toLowerCase()), iterations: 100000 }, key, 256);
        const credentialProof = [...new Uint8Array(bits)].map(byte => byte.toString(16).padStart(2, '0')).join('');
        const response = await fetch('https://starquest-ledger.marvaseater.workers.dev/v1/verify-existing', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, credentialProof }), cache: 'no-store'
        });
        if (!response.ok) throw new Error('The existing Cloudflare account could not be verified. Check your StarQuest username and password.');
        result = await auth.register(username, password);
      }
      if (typeof result === 'string') throw new Error(result);
      const connected = await window.StarQuestCloudLedger?.connect?.();
      if (!connected) throw new Error('StarQuest Cloudflare account did not connect. Check the username and password.');
      let state = await window.MusicQuantCloud?.sync?.();
      if (state?.reason === 'sync_in_progress') {
        state = await Promise.race([
          new Promise(resolve => window.addEventListener('musicquant:cloud-synced', event => resolve(event.detail), { once: true })),
          new Promise(resolve => setTimeout(() => resolve({ ok: false, reason: 'sync_timeout' }), 12000))
        ]);
      }
      if (!state?.ok) throw new Error('Account connected, but Music Quants are pending: ' + (state?.reason || 'unknown error'));
      status.textContent = 'Cloudflare confirmed ' + Number(state.balance || 0) + ' Music Quants in your wallet.';
      form.elements.password.value = '';
      update();
      window.ControlPhi?.refreshWallet?.();
    } catch (error) {
      status.textContent = String(error?.message || error);
      form.elements.password.value = '';
    } finally {
      form.querySelector('button[type=submit]').disabled = false;
    }
  });
  document.addEventListener('starquest:auth-changed', update);
  document.addEventListener('starquest:ledger-connected', update);
  update();
})();
