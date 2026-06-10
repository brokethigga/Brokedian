/* ═══ BROKEDIAN SUPABASE INTEGRATION ═══ */
(function() {
  const SUPABASE_URL = 'https://ajokadijuihrdsnokmkg.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqb2thZGlqdWlocmRzbm9rbWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4ODIzMDEsImV4cCI6MjA5NTQ1ODMwMX0.7Dk3OghRMrankhNdub5ZLZw-fURgueTy2ZKo4aKC8j8';

  let sb = null;
  let currentUser = null;
  let authReady = false;
  let afterAuthUserId = null;
  const authReadyCallbacks = [];

  function setAuthClass(state) {
    document.body.classList.toggle('auth-authenticated', state === 'authenticated');
    document.body.classList.toggle('auth-guest', state !== 'authenticated');
    document.body.classList.remove('auth-unauthenticated');
    if (typeof updateAuthUI === 'function') updateAuthUI(state);
  }

  async function handleSession(session, runAfterAuth = false) {
    currentUser = session?.user || null;
    if (currentUser) {
      setAuthClass('authenticated');
      if (runAfterAuth && typeof afterAuth === 'function' && afterAuthUserId !== currentUser.id) {
        afterAuthUserId = currentUser.id;
        await afterAuth(currentUser);
      }
    } else {
      afterAuthUserId = null;
      setAuthClass('guest');
    }
  }

  async function init() {
    if (typeof supabase === 'undefined') {
      console.warn('Supabase client not loaded yet');
      return;
    }
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { detectSessionInUrl: true, flowType: 'pkce' }
    });

    // Listen for auth state changes (handles OAuth redirect & session refresh)
    sb.auth.onAuthStateChange(async (event, session) => {
      await handleSession(session, !!session);
    });

    // Check existing session
    const { data: { session } } = await sb.auth.getSession();
    await handleSession(session, !!session);
    authReady = true;
    authReadyCallbacks.splice(0).forEach(cb => cb(currentUser));
  }

  async function signUp(email, password) {
    const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    if (error) throw error;
    return data;
  }

  async function signIn(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    await sb.auth.signOut();
    currentUser = null;
    setAuthClass('guest');
  }

  async function sendNotification(type, title, body) {
    if (!currentUser) return;
    try {
      await sb.from('notifications').insert({
        user_id: currentUser.id,
        type, channel: 'in_app', title, body
      });
      const prefs = await getNotifPrefs();
      if (prefs[`email_${type}`]) {
        await sb.functions.invoke('send-notification', {
          body: { type, title, body }
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('Failed to send notification:', e);
    }
  }

  async function getNotifPrefs() {
    if (!currentUser) return {};
    const { data } = await sb.from('notification_prefs').select('*').single();
    return data || {};
  }

  async function updateNotifPrefs(prefs) {
    if (!currentUser) return;
    await sb.from('notification_prefs').upsert({ user_id: currentUser.id, ...prefs });
  }

  async function getProfile() {
    if (!currentUser) return null;
    const { data } = await sb.from('profiles').select('*').single();
    return data;
  }

  async function updateProfile(updates) {
    if (!currentUser) return;
    await sb.from('profiles').upsert({ id: currentUser.id, ...updates });
  }

  async function subscribePush() {
    if (!currentUser || !('serviceWorker' in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        const publicKey = await getVapidPublicKey();
        if (!publicKey) return;
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: publicKey
        });
      }
      await sb.from('push_subscriptions').upsert({
        user_id: currentUser.id,
        subscription: JSON.stringify(sub)
      });
    } catch (e) {
      console.warn('Push subscribe failed:', e);
    }
  }

  async function getVapidPublicKey() {
    try {
      const { data } = await sb.functions.invoke('vapid-public-key');
      return data?.publicKey;
    } catch {
      return null;
    }
  }

  /* ═══ DATA SYNC ═══ */
  const SYNC_TABLES = {
    clients: { table: 'clients', idField: 'id' },
    quotes: { table: 'quotes', idField: 'id' },
    pipeline: { table: 'forecast_deals', idField: 'id' }
  };

  function isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));
  }

  function getLocalId(item, prefix) {
    return String(item.local_id || item.id || `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  }

  function sumItems(items) {
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum, item) => sum + ((Number(item.qty) || 0) * (Number(item.cost) || 0)), 0);
  }

  function mapToDbRow(key, item) {
    const localId = getLocalId(item, key);
    const base = {
      user_id: currentUser.id,
      local_id: localId
    };
    if (isUuid(item.id)) base.id = item.id;

    if (key === 'clients') {
      return {
        ...base,
        name: item.name || 'Untitled Client',
        project: item.project || '',
        amount: Number(item.amount ?? sumItems(item.items)) || 0,
        status: item.status || 'pending',
        date: item.date || null,
        notes: item.address || item.notes || '',
        items: Array.isArray(item.items) ? item.items : []
      };
    }

    if (key === 'quotes') {
      return {
        ...base,
        name: item.name || 'Untitled Quote',
        amount: Number(item.amount ?? sumItems(item.items)) || 0,
        client_email: item.client_email || '',
        status: item.status || 'sent',
        expiry_date: item.expiry || item.expiry_date || null,
        items: Array.isArray(item.items) ? item.items : []
      };
    }

    if (key === 'pipeline') {
      return {
        ...base,
        name: item.name || 'Untitled Deal',
        amount: Number(item.amount) || 0,
        stage: item.month || item.stage || 'lead',
        probability: Number(item.prob ?? item.probability) || 0,
        client_name: item.client_name || item.name || ''
      };
    }

    return null;
  }

  function mapFromDbRow(key, row) {
    const id = row.local_id || row.id;
    if (key === 'clients') {
      return {
        id,
        local_id: row.local_id || id,
        name: row.name || '',
        address: row.notes || '',
        project: row.project || '',
        status: row.status || 'pending',
        date: row.date || '',
        items: Array.isArray(row.items) ? row.items : []
      };
    }
    if (key === 'quotes') {
      return {
        id,
        local_id: row.local_id || id,
        name: row.name || '',
        project: row.project || '',
        status: row.status || 'sent',
        expiry: row.expiry_date || '',
        createdAt: row.created_at ? String(row.created_at).slice(0, 10) : '',
        items: Array.isArray(row.items) ? row.items : []
      };
    }
    if (key === 'pipeline') {
      return {
        id,
        local_id: row.local_id || id,
        name: row.name || row.client_name || '',
        amount: Number(row.amount) || 0,
        prob: Number(row.probability) || 0,
        month: row.stage || 'current'
      };
    }
    return row;
  }

  async function syncData(key, data) {
    if (!currentUser) return;
    const cfg = SYNC_TABLES[key];
    if (!cfg || !Array.isArray(data)) return;
    try {
      const rows = data.map(item => mapToDbRow(key, item)).filter(Boolean);
      for (const row of rows) {
        await sb.from(cfg.table).upsert(row, { onConflict: 'user_id,local_id', ignoreDuplicates: false });
      }
    } catch (e) {
      console.warn(`Supabase sync failed for ${key}:`, e);
    }
  }

  async function loadData(key) {
    if (!currentUser) return null;
    const cfg = SYNC_TABLES[key];
    if (!cfg) return null;
    try {
      const { data } = await sb.from(cfg.table).select('*').eq('user_id', currentUser.id);
      return data ? data.map(row => mapFromDbRow(key, row)) : null;
    } catch (e) {
      console.warn(`Supabase load failed for ${key}:`, e);
      return null;
    }
  }

  async function migrateLocalData() {
    if (!currentUser) return;
    for (const key of Object.keys(SYNC_TABLES)) {
      const raw = localStorage.getItem('brokedian_' + key);
      if (raw) {
        try {
          const data = JSON.parse(raw);
          if (Array.isArray(data) && data.length > 0) {
            await syncData(key, data);
          }
        } catch {}
      }
    }
    // Also migrate profile
    const bizRaw = localStorage.getItem('brokedian_biz');
    if (bizRaw) {
      try {
        const biz = JSON.parse(bizRaw);
        await updateProfile({
          biz_name: biz.name,
          address: biz.address,
          tax_id: biz.taxid,
          email: biz.email,
          phone: biz.phone,
          bank_details: biz.bank,
          promptpay_id: biz.promptpay,
          signature: biz.signature,
          payment_terms: biz.footer
        });
      } catch {}
    }
    localStorage.setItem('brokedian_migrated_' + currentUser.id, '1');
  }

  window.supabaseClient = {
    init, signUp, signIn, signOut, getProfile, updateProfile,
    sendNotification, getNotifPrefs, updateNotifPrefs, subscribePush,
    syncData, loadData, migrateLocalData,
    isSignedIn() { return !!currentUser; },
    getCurrentUser() { return currentUser; },
    onAuthReady(cb) {
      if (authReady) cb(currentUser);
      else authReadyCallbacks.push(cb);
    },
    get currentUser() { return currentUser; },
    get client() { return sb; }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
