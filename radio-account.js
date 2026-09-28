(function () {
  'use strict';
  const button = document.getElementById('connectAccountButton');
  const dialog = document.getElementById('connectAccountDialog');
  const form = document.getElementById('connectAccountForm');
  const status = document.getElementById('connectAccountStatus');
  if (!button || !dialog || !form) return;
  const update = () => {
    const user = window.StarQuestAuth?.currentUser?.();
    button.textContent = user ? 'Wallet: ' + user.username : 'Connect wallet';
    button.hidden = false;
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
        // Each site has its own browser storage. A local profile on this origin
        // is needed before the Cloudflare bootstrap can verify the account.
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
