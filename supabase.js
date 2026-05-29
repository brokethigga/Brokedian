/* ═══ BROKEDIAN SUPABASE INTEGRATION ═══ */
(function() {
  const SUPABASE_URL = 'https://ajokadijuihrdsnokmkg.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqb2thZGlqdWlocmRzbm9rbWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4ODIzMDEsImV4cCI6MjA5NTQ1ODMwMX0.7Dk3OghRMrankhNdub5ZLZw-fURgueTy2ZKo4aKC8j8';

  let sb = null;
  let currentUser = null;

  async function init() {
    if (typeof supabase === 'undefined') {
      console.warn('Supabase client not loaded yet');
      return;
    }
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { detectSessionInUrl: true, flowType: 'pkce' }
    });

    // Listen for auth state changes (handles OAuth redirect & session refresh)
    sb.auth.onAuthStateChange((event, session) => {
      if (session) {
        currentUser = session.user;
        document.body.classList.add('auth-authenticated');
        document.body.classList.remove('auth-unauthenticated');
        if (typeof afterAuth === 'function') afterAuth(currentUser);
      } else {
        currentUser = null;
        document.body.classList.add('auth-unauthenticated');
        document.body.classList.remove('auth-authenticated');
      }
    });

    // Check existing session
    const { data: { session } } = await sb.auth.getSession();
    if (!session) {
      document.body.classList.add('auth-unauthenticated');
      document.body.classList.remove('auth-authenticated');
    }
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
    document.body.classList.remove('auth-authenticated');
    document.body.classList.add('auth-unauthenticated');
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
          body: { type, title, body, email: currentUser.email, userId: currentUser.id }
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

  window.supabaseClient = {
    init, signUp, signIn, signOut, getProfile, updateProfile,
    sendNotification, getNotifPrefs, updateNotifPrefs, subscribePush,
    get currentUser() { return currentUser; },
    get client() { return sb; }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
