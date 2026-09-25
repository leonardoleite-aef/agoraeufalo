/**
 * AgoraEuFalo - Portal Auth & Membership Service
 * Professor Leonardo Leite
 * 
 * Manages Firebase Authentication, Student Profiles, Product Access Tiers, and Real-time Sessions.
 * Strictly enforces authenticated sessions across app. and admin. domains.
 */

(function(window) {
  'use strict';

  // Purge legacy password gate overlay if present in browser cache
  try {
    const el = document.getElementById('aef-auth-gate-overlay');
    if (el) el.remove();
    const st = document.getElementById('aef-gate-style');
    if (st) st.remove();
  } catch(e) {}

  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCdcFzySfxGK6Uo0DM1-y_HpACvt5E71Sk",
    authDomain: "agoraeufalo-3463a.firebaseapp.com",
    projectId: "agoraeufalo-3463a",
    storageBucket: "agoraeufalo-3463a.firebasestorage.app",
    messagingSenderId: "973862553705",
    appId: "1:973862553705:web:959ea81c80c28cc1dc7af8"
  };

  const MASTER_ADMIN_EMAILS = [
    'selexenglish@gmail.com'
  ];

  class AEFPortalAuth {
    constructor() {
      this.app = null;
      this.auth = null;
      this.db = null;
      this.currentUser = null;
      this.currentProfile = null;

      this._initPromise = this._loadFirebaseSDKs().catch(err => {
        console.warn('⚠️ [AEFPortalAuth] Firebase SDK offline:', err);
      });
    }

    async _loadFirebaseSDKs() {
      if (window.firebase && window.firebase.auth && window.firebase.firestore) {
        this._initFirebase();
        return;
      }

      await this._injectScript('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
      await this._injectScript('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js');
      await this._injectScript('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js');

      this._initFirebase();
    }

    _injectScript(src) {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    _initFirebase() {
      if (!window.firebase.apps.length) {
        this.app = window.firebase.initializeApp(FIREBASE_CONFIG);
      } else {
        this.app = window.firebase.app();
      }
      this.auth = window.firebase.auth();
      this.db = window.firebase.firestore();

      // Listen for auth state changes
      this.auth.onAuthStateChanged(async (user) => {
        this.currentUser = user;
        if (user) {
          const isMasterAdmin = this.isMasterAdminEmail(user.email);
          this.currentProfile = await this.getProfile(user.uid);
          if (isMasterAdmin) {
            if (!this.currentProfile) {
              this.currentProfile = {
                uid: user.uid,
                name: user.displayName || 'Prof. Leonardo Leite',
                email: user.email,
                avatarUrl: user.photoURL || '',
                tier: 'admin_master',
                role: 'admin',
                enrolledProducts: ['all_access_master', 'mentoria_vip', 'magic_stories_club', 'ms-legacy', 'english-quickstart', 'frases-prontas'],
                stats: { streakDays: 1, totalListeningMinutes: 0, lastTrainedAt: new Date().toISOString() },
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString()
              };
            } else {
              this.currentProfile.role = 'admin';
              this.currentProfile.tier = 'admin_master';
              this.currentProfile.enrolledProducts = ['all_access_master', 'mentoria_vip', 'magic_stories_club', 'ms-legacy', 'english-quickstart', 'frases-prontas'];
            }
          }
          if (this.currentProfile) {
            if (!isMasterAdmin) {
              this.currentProfile = await this._mergePreRegistration(user, this.currentProfile);
            }
            this.currentProfile = this.normalizeUserProfile(this.currentProfile);
            this._syncLocalStorage(this.currentProfile);
          }
          window.dispatchEvent(new CustomEvent('aef:auth-changed', { detail: { user, profile: this.currentProfile } }));
        } else {
          this.currentProfile = null;
          window.dispatchEvent(new CustomEvent('aef:auth-changed', { detail: { user: null, profile: null } }));
        }
      });
    }

    _syncLocalStorage(profile) {
      if (!profile) return;
      try {
        localStorage.removeItem('aef_logged_out');
        localStorage.setItem('aef_user_name', profile.name || 'Aluno AgoraEuFalo');
        localStorage.setItem('aef_user_email', profile.email || '');
        localStorage.setItem('aef_user_tier', profile.tier || 'free');
        localStorage.setItem('aef_user_role', profile.role || 'student');
        localStorage.setItem('aef_enrolled_products', JSON.stringify(profile.enrolledProducts || []));
        if (profile.role === 'admin' || profile.tier === 'admin_master' || this.isMasterAdminEmail(profile.email)) {
          localStorage.setItem('aef_is_admin', 'true');
        } else {
          localStorage.removeItem('aef_is_admin');
        }
      } catch (e) {}
    }

    async ready() {
      await this._initPromise;
    }

    isMasterAdminEmail(email) {
      if (!email) return false;
      const clean = email.trim().toLowerCase();
      return MASTER_ADMIN_EMAILS.some(adm => clean === adm || clean.includes('selexenglish@gmail.com'));
    }

    isVipMenteeEmail(email) {
      if (!email) return false;
      const clean = email.trim().toLowerCase();
      // Checa se o email confere com André ou se existe no registry
      if (clean === 'andrebarrote1992@gmail.com') return true;
      if (window.AEF_COURSES_REGISTRY) {
        return Object.values(window.AEF_COURSES_REGISTRY).some(c => (c.studentEmail || '').toLowerCase() === clean);
      }
      return false;
    }

    isHotmartReviewerEmail(email) {
      if (!email) return false;
      const clean = email.trim().toLowerCase();
      return clean === 'hotmart.teste@agoraeufalo.com.br' || clean === 'avaliador.hotmart@agoraeufalo.com.br';
    }

    // =========================================================================
    // AUTHENTICATION METHODS & PRE-REGISTRATION MERGING
    // =========================================================================

    async _mergePreRegistration(user, profile) {
      if (!user || !user.email) return profile;
      const cleanEmail = user.email.toLowerCase().trim();

      // 1. Obtenção do ID Token para autorização server-side
      let idToken = null;
      try {
        if (typeof user.getIdToken === "function") {
          idToken = await user.getIdToken();
        }
      } catch (tokErr) {
        console.warn("[AEF Auth] Falha ao obter idToken para claim:", tokErr);
      }

      // 2. Resolução Server-Side no Worker (Zero Trust - sem queries ou writes client-side em users/*)
      const workerBase = (typeof window !== "undefined" && window.AEF_WORKER_URL)
        || "https://agoraeufalo-webhook-hotmart.selexenglish.workers.dev";

      try {
        const res = await fetch(`${workerBase}/api/claim-preregistration`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(idToken ? { "Authorization": `Bearer ${idToken}` } : {})
          },
          body: JSON.stringify({
            uid: user.uid,
            email: cleanEmail,
            name: user.displayName || (profile && profile.name) || "",
            idToken: idToken
          })
        });

        if (res.ok) {
          const result = await res.json();
          if (result && result.user) {
            console.log("[AEF Auth] Pré-registro verificado e vinculado via worker server-side:", cleanEmail);
            return {
              ...(profile || {}),
              ...result.user,
              uid: user.uid,
              id: user.uid
            };
          }
        } else {
          console.warn("[AEF Auth] Worker /api/claim-preregistration retornou HTTP", res.status);
        }
      } catch (claimErr) {
        console.warn("[AEF Auth] Falha de rede ao resolver pré-registro via worker:", claimErr);
      }

      return profile;
    }

    async signUpWithEmail(name, email, password) {
      await this.ready();
      const cred = await this.auth.createUserWithEmailAndPassword(email, password);
      const user = cred.user;

      const isMasterAdmin = this.isMasterAdminEmail(email);
      const isVipMentee = this.isVipMenteeEmail(email);
      const finalName = isMasterAdmin ? (name || 'Prof. Leonardo Leite') : (isVipMentee ? (name || 'André Barrote') : name);

      await user.updateProfile({ displayName: finalName });

      let newProfile = {
        uid: user.uid,
        name: finalName,
        email: email,
        tier: isMasterAdmin ? 'admin_master' : (isVipMentee ? 'vip' : 'free'),
        role: isMasterAdmin ? 'admin' : (isVipMentee ? 'vip_mentee' : 'student'),
        enrolledProducts: isMasterAdmin 
          ? ['all_access_master', 'mentoria_vip', 'magic_stories_club', 'ms-legacy', 'english-quickstart', 'frases-prontas'] 
          : (isVipMentee ? ['mentoria-andre', 'ms-legacy', 'english-quickstart'] : []),
        stats: {
          streakDays: 1,
          totalListeningMinutes: 0,
          lastTrainedAt: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };

      try {
        await this.db.collection('users').doc(user.uid).set(newProfile);
      } catch (dbErr) {
        console.warn("[AEF Auth] Falha ao persistir perfil no Firestore:", dbErr);
      }

      if (!isMasterAdmin) {
        newProfile = await this._mergePreRegistration(user, newProfile);
      }
      this.currentProfile = newProfile;
      this._syncLocalStorage(newProfile);
      return { user, profile: newProfile };
    }

    async signInWithEmail(email, password) {
      await this.ready();
      const cred = await this.auth.signInWithEmailAndPassword(email, password);
      let profile = await this.getProfile(cred.user.uid);
      
      const isMasterAdmin = this.isMasterAdminEmail(email);
      const isVipMentee = this.isVipMenteeEmail(email);
      const isHotmartReviewer = this.isHotmartReviewerEmail(email);

      if (isMasterAdmin) {
        if (!profile) {
          profile = {
            uid: cred.user.uid,
            name: cred.user.displayName || 'Prof. Leonardo Leite',
            email: email,
            avatarUrl: cred.user.photoURL || '',
            tier: 'admin_master',
            role: 'admin',
            enrolledProducts: ['all_access_master', 'mentoria_vip', 'magic_stories_club', 'ms-legacy', 'english-quickstart', 'frases-prontas'],
            stats: { streakDays: 1, totalListeningMinutes: 0, lastTrainedAt: new Date().toISOString() },
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          };
          try {
            await this.db.collection('users').doc(cred.user.uid).set(profile);
          } catch (dbErr) {
            console.warn("[AEF Auth] Falha ao persistir perfil no Firestore:", dbErr);
          }
        } else if (profile.role !== 'admin' || profile.tier !== 'admin_master') {
          profile.role = 'admin';
          profile.tier = 'admin_master';
          profile.enrolledProducts = ['all_access_master', 'mentoria_vip', 'magic_stories_club', 'ms-legacy', 'english-quickstart', 'frases-prontas'];
          try {
            await this.db.collection('users').doc(cred.user.uid).update({
              role: 'admin',
              tier: 'admin_master',
              enrolledProducts: profile.enrolledProducts,
              lastLoginAt: new Date().toISOString()
            });
          } catch (dbErr) {
            console.warn("[AEF Auth] Falha ao atualizar perfil no Firestore:", dbErr);
          }
        }
      } else if (profile && isVipMentee && (profile.tier !== 'vip' || !profile.enrolledProducts?.includes('mentoria-andre'))) {
        profile.tier = 'vip';
        if (!profile.enrolledProducts) profile.enrolledProducts = [];
        if (!profile.enrolledProducts.includes('mentoria-andre')) profile.enrolledProducts.push('mentoria-andre');
        if (!profile.enrolledProducts.includes('ms-legacy')) profile.enrolledProducts.push('ms-legacy');
        try {
          await this.db.collection('users').doc(cred.user.uid).update({
            tier: 'vip',
            enrolledProducts: profile.enrolledProducts,
            lastLoginAt: new Date().toISOString()
          });
        } catch (dbErr) {
          console.warn("[AEF Auth] Falha ao atualizar perfil no Firestore:", dbErr);
        }
      } else if (profile && isHotmartReviewer) {
        profile.role = 'student';
        profile.tier = 'club_annual';
        profile.enrolledProducts = ['magic_stories_club', 'ms-legacy', 'english-quickstart', 'frases-prontas'];
        try {
          await this.db.collection('users').doc(cred.user.uid).update({
            role: 'student',
            tier: 'club_annual',
            enrolledProducts: profile.enrolledProducts,
            lastLoginAt: new Date().toISOString()
          });
        } catch (dbErr) {
          console.warn("[AEF Auth] Falha ao atualizar perfil no Firestore:", dbErr);
        }
      } else if (profile) {
        try {
          await this.db.collection('users').doc(cred.user.uid).update({
            lastLoginAt: new Date().toISOString()
          });
        } catch (dbErr) {
          console.warn("[AEF Auth] Falha ao atualizar perfil no Firestore:", dbErr);
        }
      }

      if (profile && !isMasterAdmin) {
        profile = await this._mergePreRegistration(cred.user, profile);
      }

      this.currentProfile = profile;
      this._syncLocalStorage(profile);
      return { user: cred.user, profile };
    }

    async signInWithGoogle() {
      await this.ready();
      const provider = new window.firebase.auth.GoogleAuthProvider();
      const cred = await this.auth.signInWithPopup(provider);
      const user = cred.user;

      const isMasterAdmin = this.isMasterAdminEmail(user.email);
      const isVipMentee = this.isVipMenteeEmail(user.email);

      let profile = await this.getProfile(user.uid);
      if (!profile) {
        profile = {
          uid: user.uid,
          name: isMasterAdmin ? 'Prof. Leonardo Leite' : (user.displayName || (isVipMentee ? 'André Barrote' : 'Aluno AgoraEuFalo')),
          email: user.email,
          avatarUrl: user.photoURL || '',
          tier: isMasterAdmin ? 'admin_master' : (isVipMentee ? 'vip' : 'free'),
          role: isMasterAdmin ? 'admin' : (isVipMentee ? 'vip_mentee' : 'student'),
          enrolledProducts: isMasterAdmin 
            ? ['all_access_master', 'mentoria_vip', 'magic_stories_club', 'ms-legacy', 'english-quickstart', 'frases-prontas'] 
            : (isVipMentee ? ['mentoria-andre', 'ms-legacy', 'english-quickstart'] : []),
          stats: {
            streakDays: 1,
            totalListeningMinutes: 0,
            lastTrainedAt: new Date().toISOString()
          },
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };
        try {
          await this.db.collection('users').doc(user.uid).set(profile);
        } catch (dbErr) {
          console.warn("[AEF Auth] Falha ao persistir perfil no Firestore:", dbErr);
        }
      } else {
        if (isMasterAdmin && (profile.role !== 'admin' || profile.tier !== 'admin_master')) {
          profile.role = 'admin';
          profile.tier = 'admin_master';
          profile.enrolledProducts = ['all_access_master', 'mentoria_vip', 'magic_stories_club', 'ms-legacy', 'english-quickstart', 'frases-prontas'];
        } else if (isVipMentee && (profile.tier !== 'vip' || !profile.enrolledProducts?.includes('mentoria-andre'))) {
          profile.tier = 'vip';
          if (!profile.enrolledProducts) profile.enrolledProducts = [];
          if (!profile.enrolledProducts.includes('mentoria-andre')) profile.enrolledProducts.push('mentoria-andre');
          if (!profile.enrolledProducts.includes('ms-legacy')) profile.enrolledProducts.push('ms-legacy');
        }
        const updates = {
          role: profile.role,
          tier: profile.tier,
          enrolledProducts: profile.enrolledProducts || [],
          lastLoginAt: new Date().toISOString()
        };
        if (user.photoURL && !profile.avatarUrl) {
          updates.avatarUrl = user.photoURL;
          profile.avatarUrl = user.photoURL;
        }
        try {
          await this.db.collection('users').doc(user.uid).update(updates);
        } catch (dbErr) {
          console.warn("[AEF Auth] Falha ao atualizar perfil no Firestore:", dbErr);
        }
      }

      if (profile && !isMasterAdmin) {
        profile = await this._mergePreRegistration(user, profile);
      }

      this.currentProfile = profile;
      this._syncLocalStorage(profile);
      return { user, profile };
    }

    async sendPasswordReset(email) {
      await this.ready();
      await this.auth.sendPasswordResetEmail(email);
    }

    async sendMagicLink(email, customRedirectUrl = null) {
      await this.ready();
      const targetUrl = customRedirectUrl || (window.location.origin + '/portal.html?magicLink=true');
      const actionCodeSettings = {
        url: targetUrl,
        handleCodeInApp: true
      };
      await this.auth.sendSignInLinkToEmail(email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      window.localStorage.setItem('aef_email_for_magic_link', email);
      window.localStorage.setItem('aef_pending_email', email);
    }

    async checkAndCompleteMagicLink() {
      await this.ready();
      if (this.auth && this.auth.isSignInWithEmailLink(window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn') || 
                    window.localStorage.getItem('aef_email_for_magic_link') || 
                    window.localStorage.getItem('aef_pending_email') ||
                    window.localStorage.getItem('aef_user_email');
        if (!email) {
          email = window.prompt('Por favor, confirme seu email para entrar com o Link Mágico:');
        }
        if (email) {
          const cred = await this.auth.signInWithEmailLink(email, window.location.href);
          window.localStorage.removeItem('emailForSignIn');
          window.localStorage.removeItem('aef_email_for_magic_link');
          const user = cred.user;
          const isMasterAdmin = this.isMasterAdminEmail(user.email);
          const isVipMentee = this.isVipMenteeEmail(user.email);

          let profile = await this.getProfile(user.uid);
          if (!profile) {
            profile = {
              uid: user.uid,
              name: isMasterAdmin ? 'Prof. Leonardo Leite' : (user.displayName || (isVipMentee ? 'André Barrote' : user.email.split('@')[0])),
              email: user.email,
              avatarUrl: user.photoURL || '',
              tier: isMasterAdmin ? 'admin_master' : (isVipMentee ? 'vip' : 'free'),
              role: isMasterAdmin ? 'admin' : (isVipMentee ? 'vip_mentee' : 'student'),
              enrolledProducts: isMasterAdmin 
                ? ['all_access_master', 'mentoria_vip', 'magic_stories_club', 'ms-legacy', 'english-quickstart', 'frases-prontas'] 
                : (isVipMentee ? ['mentoria-andre', 'ms-legacy', 'english-quickstart'] : []),
              stats: {
                streakDays: 1,
                totalListeningMinutes: 0,
                lastTrainedAt: new Date().toISOString()
              },
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString()
            };
            try {
              await this.db.collection('users').doc(user.uid).set(profile);
            } catch (dbErr) {
              console.warn("[AEF Auth] Falha ao persistir perfil no Firestore:", dbErr);
            }
          } else {
            if (isMasterAdmin && (profile.role !== 'admin' || profile.tier !== 'admin_master')) {
              profile.role = 'admin';
              profile.tier = 'admin_master';
              profile.enrolledProducts = ['all_access_master', 'mentoria_vip', 'magic_stories_club', 'ms-legacy', 'english-quickstart', 'frases-prontas'];
            } else if (isVipMentee && (profile.tier !== 'vip' || !profile.enrolledProducts?.includes('mentoria-andre'))) {
              profile.tier = 'vip';
              if (!profile.enrolledProducts) profile.enrolledProducts = [];
              if (!profile.enrolledProducts.includes('mentoria-andre')) profile.enrolledProducts.push('mentoria-andre');
              if (!profile.enrolledProducts.includes('ms-legacy')) profile.enrolledProducts.push('ms-legacy');
            }
            try {
              await this.db.collection('users').doc(user.uid).update({
                role: profile.role,
                tier: profile.tier,
                enrolledProducts: profile.enrolledProducts || [],
                lastLoginAt: new Date().toISOString()
              });
            } catch (dbErr) {
              console.warn("[AEF Auth] Falha ao atualizar perfil no Firestore:", dbErr);
            }
          }
          if (profile && !isMasterAdmin) {
            profile = await this._mergePreRegistration(user, profile);
          }
          this.currentProfile = profile;
          this._syncLocalStorage(profile);
          return { user, profile };
        }
      }
      return null;
    }

    async signOut() {
      await this.ready();
      if (this.auth) {
        try { await this.auth.signOut(); } catch(e) {}
      }
      this.currentUser = null;
      this.currentProfile = null;
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('aef_user_role');
        localStorage.removeItem('aef_user_tier');
        localStorage.removeItem('aef_user_email');
        localStorage.removeItem('aef_user_name');
        localStorage.removeItem('aef_user_profile');
        localStorage.removeItem('aef_active_tier');
        localStorage.removeItem('aef_enrolled_products');
        localStorage.removeItem('aef_is_admin');
        localStorage.setItem('aef_logged_out', 'true');
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('aef_admin_redirect');
        sessionStorage.removeItem('aef_redirect_after_login');
      }
    }

    // =========================================================================
    // USER PROFILE & PRODUCT ACCESS (TIERS)
    // =========================================================================

    normalizeUserProfile(raw) {
      if (!raw) return null;
      if (typeof window !== 'undefined' && window.AEFAccessEngine && typeof window.AEFAccessEngine.normalizeUser === 'function') {
        return window.AEFAccessEngine.normalizeUser(raw);
      }
      const email = (raw.email || '').toLowerCase().trim();
      const uid = String(raw.uid || raw.id || '');
      const legacyEntitlements = Array.from(new Set(['member_free', ...(raw.categories || [])]));
      return {
        ...raw,
        schemaVersion: 2,
        uid: uid,
        email: email,
        subscriptions: raw.subscriptions || [],
        purchasedProducts: raw.purchasedProducts || [],
        legacyEntitlements: raw.legacyEntitlements || legacyEntitlements,
        legacy: {
          tier: raw.tier,
          enrolledProducts: raw.enrolledProducts,
          categories: raw.categories,
          subscription: raw.subscription,
          role: raw.role
        }
      };
    }

    getCurrentProfile() {
      const cachedRole = typeof localStorage !== 'undefined' ? localStorage.getItem('aef_user_role') : null;
      const cachedEmail = typeof localStorage !== 'undefined' ? localStorage.getItem('aef_user_email') : null;
      const cachedTier = typeof localStorage !== 'undefined' ? localStorage.getItem('aef_user_tier') : null;
      const cachedName = typeof localStorage !== 'undefined' ? localStorage.getItem('aef_user_name') : null;
      const cachedUid = typeof localStorage !== 'undefined' ? localStorage.getItem('aef_user_uid') : null;
      let enrolled = [];
      try {
        enrolled = JSON.parse(localStorage.getItem('aef_enrolled_products') || '[]');
      } catch (e) {}

      const base = this.currentProfile || {};
      const isAdmin = this.isAdmin();
      const raw = {
        ...base,
        uid: base.uid || this.currentUser?.uid || cachedUid || '',
        name: base.name || this.currentUser?.displayName || cachedName || 'Aluno AgoraEuFalo',
        email: base.email || this.currentUser?.email || cachedEmail || '',
        tier: this.getActiveTier(),
        role: isAdmin ? 'admin' : (base.role || cachedRole || 'student'),
        categories: base.categories || (isAdmin ? ['admin'] : []),
        enrolledProducts: this.getEnrolledProducts() || enrolled,
        purchasedProducts: this.getEnrolledProducts() || enrolled
      };
      return this.normalizeUserProfile(raw);
    }

    async getProfile(uid) {
      if (!uid) {
        return this.getCurrentProfile();
      }
      if (window.aefUserRepository || window.aefCloudSync?.userRepository) {
        try {
          const repo = window.aefUserRepository || window.aefCloudSync.userRepository;
          const u = await repo.getUser(uid);
          if (u) return this.normalizeUserProfile(u);
        } catch (e) {
          console.warn("[AEFPortalAuth] UserRepository.getUser error, tentando direto:", e);
        }
      }
      await this.ready();
      try {
        const doc = await this.db.collection('users').doc(uid).get();
        if (doc.exists) {
          const raw = doc.data();
          return this.normalizeUserProfile(raw);
        }
      } catch (err) {
        console.warn("Could not fetch user profile:", err);
      }
      return null;
    }

    async updateProfile(data) {
      await this.ready();
      if (!this.currentUser) return;
      try {
        await this.db.collection('users').doc(this.currentUser.uid).update(data);
      } catch (dbErr) {
        console.warn("[AEF Auth] Falha ao atualizar perfil no Firestore:", dbErr);
      }
      this.currentProfile = { ...this.currentProfile, ...data };
      this._syncLocalStorage(this.currentProfile);
      return this.currentProfile;
    }

    // =========================================================================
    // USER ACCESS & TIER ENFORCEMENT (STANDARD TIERS)
    // =========================================================================

    isAdmin() {
      const directEmail = (this.currentUser?.email || this.auth?.currentUser?.email || '').toLowerCase().trim();
      if (this.isMasterAdminEmail(directEmail)) return true;

      if (!this.currentProfile) {
        const cachedRole = typeof localStorage !== 'undefined' ? localStorage.getItem('aef_user_role') : null;
        const cachedEmail = typeof localStorage !== 'undefined' ? localStorage.getItem('aef_user_email') : null;
        const cachedTier = typeof localStorage !== 'undefined' ? localStorage.getItem('aef_user_tier') : null;
        const cachedIsAdmin = typeof localStorage !== 'undefined' ? localStorage.getItem('aef_is_admin') === 'true' : false;
        return (cachedRole === 'admin' || cachedTier === 'admin_master' || cachedIsAdmin || this.isMasterAdminEmail(cachedEmail));
      }
      return this.currentProfile.role === 'admin' || 
             this.currentProfile.tier === 'admin_master' || 
             this.isMasterAdminEmail(this.currentProfile.email);
    }

    isRealAdmin() {
      return this.isAdmin();
    }

    async getIdToken() {
      const user = this.currentUser || this.auth?.currentUser;
      if (user && typeof user.getIdToken === "function") {
        try {
          return await user.getIdToken();
        } catch (e) {
          console.warn("[AEF Auth] Falha ao obter idToken:", e);
        }
      }
      return null;
    }

    getEnrolledProducts() {
      if (this.isAdmin()) {
        return ['all_access_master', 'mentoria_vip', 'magic_stories_club', 'ms-legacy', 'english-quickstart', 'frases-prontas', 'first-steps', 'dtc_curso'];
      }
      return this.currentProfile?.enrolledProducts || JSON.parse(localStorage.getItem("aef_enrolled_products") || '[]');
    }

    getActiveTier() {
      if (this.isAdmin()) return 'admin_master';
      if (!this.currentProfile) return localStorage.getItem('aef_user_tier') || 'free';
      return this.currentProfile.tier || 'free';
    }

    getUserTier() {
      return this.getActiveTier();
    }

    getTier() {
      return this.getActiveTier();
    }

    // Check if user has access to a specific tier/product
    hasAccess(requiredTier) {
      if (this.isAdmin()) return true;
      const effectiveTier = this.getActiveTier();
      return this._compareTiers(effectiveTier, requiredTier);
    }

    /**
     * Route Guard: Blocks unauthenticated access and redirects to login
     */
    async requireAuth({ redirectUrl = null, requiredTier = null, requireAdmin = false } = {}) {
      if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:") return true;
      // 1. Checa se o usuário está explicitamente deslogado ou se o cache/localStorage foi limpo
      const isLoggedOut = typeof localStorage !== 'undefined' && localStorage.getItem('aef_logged_out') === 'true';
      const cachedEmail = typeof localStorage !== 'undefined' ? localStorage.getItem('aef_user_email') : null;

      // Se há cache válido persistido e NÃO está deslogado, monta o perfil imediato (0ms)
      if (!this.currentUser && cachedEmail && !isLoggedOut) {
        if (!this.currentProfile) {
          this.currentProfile = {
            uid: localStorage.getItem('aef_user_uid') || 'cached-user',
            name: localStorage.getItem('aef_user_name') || 'Aluno AgoraEuFalo',
            email: cachedEmail,
            tier: localStorage.getItem('aef_user_tier') || 'free',
            role: localStorage.getItem('aef_user_role') || 'student',
            enrolledProducts: JSON.parse(localStorage.getItem('aef_enrolled_products') || '[]')
          };
        }
        this.currentUser = {
          uid: this.currentProfile.uid,
          email: this.currentProfile.email,
          displayName: this.currentProfile.name
        };
      }

      // 2. Se NÃO tem sessão em cache e NÃO tem currentUser na instância, espera brevemente pelo Firebase Auth
      if (!this.currentUser) {
        try {
          await this.ready();
        } catch (e) {}

        if (this.auth && !this.auth.currentUser) {
          await new Promise((resolve) => {
            const unsubscribe = this.auth.onAuthStateChanged((user) => {
              if (typeof unsubscribe === 'function') unsubscribe();
              resolve(user);
            });
            setTimeout(() => resolve(null), 1200);
          });
        }
      }

      let user = this.currentUser || this.auth?.currentUser;

      // SE NÃO TEM USUÁRIO (apagou o cache, não logou, etc.) -> EXIGE LOGIN NOVAMENTE!
      if (!user) {
        const defaultRedirect = requireAdmin 
          ? (window.AEFDomainRouter ? window.AEFDomainRouter.getAdminUrl('login') : 'https://admin.agoraeufalo.com.br/login')
          : (window.AEFDomainRouter ? window.AEFDomainRouter.getAppUrl('login') : 'https://app.agoraeufalo.com.br/login');
        const targetUrl = (redirectUrl && redirectUrl !== 'login.html' && redirectUrl !== '/login') ? redirectUrl : defaultRedirect;
        console.warn(`🔒 [AEFPortalAuth] Acesso bloqueado: Usuário não autenticado. Redirecionando para ${targetUrl}`);
        try {
          if (requireAdmin) {
            sessionStorage.setItem('aef_admin_redirect', window.location.href);
          } else {
            sessionStorage.setItem('aef_redirect_after_login', window.location.href);
          }
        } catch(e) {}
        window.location.replace(targetUrl);
        return false;
      }

      // SE REQUER ADMIN: apenas administradores reais
      if (requireAdmin && !this.isAdmin()) {
        console.warn("🔒 [AEFPortalAuth] Acesso negado: Requer privilégios de Administrador.");
        alert("Acesso restrito ao Professor Leonardo Leite e Administradores.");
        const adminLoginTarget = window.AEFDomainRouter ? window.AEFDomainRouter.getAdminUrl('login') : 'https://admin.agoraeufalo.com.br/login';
        window.location.replace(adminLoginTarget);
        return false;
      }

      // SE REQUER TIER ESPECÍFICO: tratamento padrão do tier do usuário logado
      if (requiredTier && !this.hasAccess(requiredTier)) {
        console.warn(`🔒 [AEFPortalAuth] Acesso negado: Requer plano ${requiredTier}`);
        const upgradeTarget = window.AEFDomainRouter ? window.AEFDomainRouter.getAppUrl('?upgrade=true') : 'https://app.agoraeufalo.com.br/?upgrade=true';
        window.location.replace(upgradeTarget);
        return false;
      }

      return true;
    }

    _compareTiers(userTier, requiredTier) {
      if (userTier === 'admin_master') return true;

      const tierLevels = {
        'free': 1,
        'club_monthly': 2,
        'club_annual': 3,
        'course_member': 3,
        'pro': 3,
        'lifetime': 4,
        'vip_mentorship': 5,
        'vip': 5,
        'admin_master': 99
      };

      const userLevel = tierLevels[userTier] || 1;
      const reqLevel = tierLevels[requiredTier] || 1;

      return userLevel >= reqLevel;
    }

    // =========================================================================
    // CRM & ADMIN MANAGEMENT METHODS
    // =========================================================================

    async getAllUsers() {
      if (window.aefUserRepository || window.aefCloudSync?.userRepository) {
        try {
          const repo = window.aefUserRepository || window.aefCloudSync.userRepository;
          return await repo.getAllUsers();
        } catch (e) {
          console.warn("[AEFPortalAuth] UserRepository.getAllUsers error, tentando direto:", e);
        }
      }
      await this.ready();
      try {
        const snapshot = await this.db.collection('users').get();
        const users = [];
        snapshot.forEach(doc => {
          users.push({ id: doc.id, ...doc.data() });
        });
        return users;
      } catch (e) {
        console.warn("Could not fetch all users:", e);
        return [];
      }
    }

    async getAllStudentsAndMentees() {
      if (window.aefUserRepository || window.aefCloudSync?.userRepository) {
        try {
          const repo = window.aefUserRepository || window.aefCloudSync.userRepository;
          return await repo.getAllStudentsAndMentees();
        } catch (e) {
          console.warn("[AEFPortalAuth] UserRepository.getAllStudentsAndMentees error, tentando direto:", e);
        }
      }
      await this.ready();
      const results = {
        users: [],
        vipMentees: []
      };

      if (!this.db || !this.auth?.currentUser) {
        return results;
      }

      try {
        // 1. Fetch from 'users' collection
        const usersSnap = await this.db.collection('users').get();
        if (usersSnap && usersSnap.forEach) {
          usersSnap.forEach(doc => {
            results.users.push({ id: doc.id, ...doc.data() });
          });
        }

        // 2. Fetch from 'students' collection (VIP Mentee Profiles)
        const menteesSnap = await this.db.collection('students').get();
        if (menteesSnap && menteesSnap.forEach) {
          menteesSnap.forEach(doc => {
            results.vipMentees.push({ id: doc.id, ...doc.data() });
          });
        }
      } catch (e) {
        console.warn("Error fetching students and mentees:", e);
      }

      return results;
    }

    async updateUserTierAndRole(userId, newTier, newRole, enrolledProducts = null, extraData = {}) {
      await this.ready();
      const updates = {
        ...extraData,
        tier: newTier,
        role: newRole,
        updatedAt: new Date().toISOString()
      };
      if (enrolledProducts) {
        updates.enrolledProducts = enrolledProducts;
      }

      // 1. Delega ao UserRepository se disponível
      if (window.aefCloudSync && window.aefCloudSync.userRepository) {
        try {
          return await window.aefCloudSync.userRepository.saveUser({ uid: userId, ...updates });
        } catch (repoErr) {
          console.warn("[AEF Auth] UserRepository.saveUser falhou, tentando worker:", repoErr);
        }
      }

      // 2. Roteamento Server-Side via Worker (/api/admin/users)
      const workerBase = (typeof window !== "undefined" && window.AEF_WORKER_URL)
        || "https://agoraeufalo-webhook-hotmart.selexenglish.workers.dev";
      let idToken = null;
      try {
        if (this.currentUser && typeof this.currentUser.getIdToken === "function") {
          idToken = await this.currentUser.getIdToken();
        }
      } catch (e) {}

      try {
        const res = await fetch(`${workerBase}/api/admin/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(idToken ? { "Authorization": `Bearer ${idToken}` } : {})
          },
          body: JSON.stringify({
            userId,
            userData: updates,
            requesterEmail: this.currentUser ? this.currentUser.email : null
          })
        });
        if (res.ok) {
          const json = await res.json();
          return json.user || updates;
        }
      } catch (e) {
        console.warn("[AEF Auth] Falha ao atualizar via worker /api/admin/users:", e);
      }

      return updates;
    }

    async saveMenteeDoc(menteeId, data) {
      await this.ready();
      const payload = {
        ...data,
        id: menteeId,
        tier: 'vip_mentorship',
        updatedAt: new Date().toISOString()
      };

      // Tentativa 1: SDK Firestore (requer custom claim admin no token JWT)
      if (this.db) {
        try {
          await this.db.collection('students').doc(menteeId).set(payload, { merge: true });
          console.log('[AEF Auth] saveMenteeDoc: OK via SDK');
          return payload;
        } catch (e) {
          console.warn('[AEF Auth] saveMenteeDoc SDK falhou (sem custom claim admin no JWT?), tentando Worker REST:', e.message || e);
        }
      }

      // Tentativa 2: Worker REST com Bearer Token admin
      let idToken = null;
      try {
        if (this.currentUser && typeof this.currentUser.getIdToken === 'function') {
          idToken = await this.currentUser.getIdToken();
        }
      } catch (e) {}

      if (idToken) {
        const workerBase = window.AEF_WORKER_URL || '';
        try {
          const res = await fetch(`${workerBase}/api/admin/users`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({
              action: 'save_mentee',
              userId: menteeId,
              userData: payload,
              collection: 'students'
            })
          });
          if (res.ok) {
            console.log('[AEF Auth] saveMenteeDoc: OK via Worker REST');
            return payload;
          }
          console.warn('[AEF Auth] saveMenteeDoc Worker respondeu HTTP', res.status);
        } catch (e) {
          console.warn('[AEF Auth] saveMenteeDoc Worker REST falhou:', e.message || e);
        }
      }

      // Tentativa 3: REST Firestore direto com API Key (último recurso)
      try {
        const FIREBASE_CONFIG = window.aefCloudSync?._firebaseConfig || {};
        const projectId = FIREBASE_CONFIG.projectId || 'agoraeufalo-3463a';
        const apiKey = FIREBASE_CONFIG.apiKey || '';
        const keyParam = apiKey ? `?key=${apiKey}` : '';
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/students/${menteeId}${keyParam}`;
        // Converte payload para formato REST Firestore
        const fields = {};
        for (const [k, v] of Object.entries(payload)) {
          if (typeof v === 'string') fields[k] = { stringValue: v };
          else if (typeof v === 'boolean') fields[k] = { booleanValue: v };
          else if (typeof v === 'number') fields[k] = { doubleValue: v };
          else if (Array.isArray(v)) fields[k] = { arrayValue: { values: v.map(s => ({ stringValue: String(s) })) } };
        }
        const res = await fetch(url, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields })
        });
        if (res.ok) {
          console.log('[AEF Auth] saveMenteeDoc: OK via REST direto');
          return payload;
        }
        console.warn('[AEF Auth] saveMenteeDoc REST direto falhou HTTP', res.status);
      } catch (e) {
        console.warn('[AEF Auth] saveMenteeDoc REST direto falhou:', e.message || e);
      }

      console.error('[AEF Auth] saveMenteeDoc: todas as tentativas falharam para', menteeId);
      return payload; // Retorna payload mesmo em falha para não quebrar o fluxo
    }

    async deleteUserDoc(userId) {
      await this.ready();
      const workerBase = (typeof window !== "undefined" && window.AEF_WORKER_URL)
        || "https://agoraeufalo-webhook-hotmart.selexenglish.workers.dev";
      let idToken = null;
      try {
        if (this.currentUser && typeof this.currentUser.getIdToken === "function") {
          idToken = await this.currentUser.getIdToken();
        }
      } catch (e) {}

      try {
        const res = await fetch(`${workerBase}/api/admin/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(idToken ? { "Authorization": `Bearer ${idToken}` } : {})
          },
          body: JSON.stringify({
            action: "delete_user",
            userId,
            requesterEmail: this.currentUser ? this.currentUser.email : null
          })
        });
        if (res.ok) {
          return true;
        }
      } catch (e) {
        console.warn("[AEF Auth] Falha ao deletar via worker /api/admin/users:", e);
      }
      return false;
    }

    async deleteMenteeDoc(menteeId) {
      await this.ready();
      let success = false;
      if (this.db) {
        try {
          await this.db.collection('students').doc(menteeId).delete();
          success = true;
        } catch (e) {
          console.warn('SDK deleteMenteeDoc failed, trying REST:', e);
        }
      }
      
      if (!success) {
        try {
          const restUrl = `https://firestore.googleapis.com/v1/projects/agoraeufalo-3463a/databases/(default)/documents/students/${menteeId}`;
          const res = await fetch(restUrl, { method: "DELETE" });
          if (res.ok) success = true;
        } catch(e) {
          console.error("REST deleteMenteeDoc failed:", e);
        }
      }
      return success;
    }
  }

  window.aefPortalAuth = new AEFPortalAuth();
})(window);
