(function () {
  'use strict';
  const button = document.getElementById('connectAccountButton');
  const dialog = document.getElementById('connectAccountDialog');
  const form = document.getElementById('connectAccountForm');
  const status = document.getElementById('connectAccountStatus');
  if (!button || !dialog || !form) return;
  const update = () => {
    button.textContent = 'Reconnect wallet';
    button.hidden = window.InfinityRadioMusicWallet?.confirmed === true;
  };
  button.addEventListener('click', async () => {
    if(button.disabled)return;
    button.disabled=true;
    button.textContent='Checking saved wallet…';
    try {
      const bridge=window.QuantaCloudConnection;
      if(bridge?.ready)await bridge.ready;
      await bridge?.recoverAccountProfileFromDevice?.();
      if(window.StarQuestAuth?.currentUser?.()){
        const connected=await window.StarQuestCloudLedger?.connect?.();
        if(connected){
          await window.MusicQuantCloud?.sync?.();
          await window.InfinityRadioMusicWallet?.reconnect?.();
          if(window.InfinityRadioMusicWallet?.confirmed){update();return}
        }
      }
      // Reuse the trusted QuantaPhi/GitHub first-party handoff on user click.
      if(bridge?.recoverWallet?.(true))return;
      status.textContent='No verified saved device credential found. Your historical balance is preserved. Existing StarQuest credentials can be entered below if you have them.';
      dialog.showModal();
    } catch(error) {
      status.textContent='Wallet reconnect pending: '+String(error?.message||error);
      dialog.showModal();
    } finally {
      button.disabled=false;
      update();
    }
  });
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
      const nameKey=username.toLowerCase();
      let users={};try{users=JSON.parse(localStorage.getItem('starquest_users')||'{}')}catch{}
      const stub=users?.[nameKey]&&String(users[nameKey].passwordHash||'')==='';
      if (result === 'No account found with that username.' || (result==='Incorrect password.'&&stub)) {
        // A restored device profile may have no local password hash. Never
        // update it without proving ownership to the existing cloud account.
        const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
        const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode('starquest-v1-' + nameKey), iterations: 100000 }, key, 256);
        const credentialProof = [...new Uint8Array(bits)].map(byte => byte.toString(16).padStart(2, '0')).join('');
        const response = await fetch('https://starquest-ledger.marvaseater.workers.dev/v1/verify-existing', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, credentialProof }), cache: 'no-store'
        });
        if (!response.ok) throw new Error('The existing Cloudflare account could not be verified. No wallet was changed.');
        if(stub){
          users[nameKey].passwordHash=credentialProof;
          localStorage.setItem('starquest_users',JSON.stringify(users));
          result=await auth.signIn(username,password);
        }else result = await auth.register(username, password);
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
  window.addEventListener('musicquant:wallet-confirmed', update);
  window.addEventListener('musicquant:wallet-link-error', update);
  update();
})();
