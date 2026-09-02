/**
 * AgoraEuFalo - Portal Auth & Membership Service
 * Professor Leonardo Leite
 * 
 * Manages Firebase Authentication, Student Profiles, Product Access Tiers, and Real-time Sessions.
 * Includes Tier 0 (Admin Master / God Mode) with full ecosystem traversal and VIP mentee selector.
 */

(function(window) {
  'use strict';

  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCdcFzySfxGK6Uo0DM1-y_HpACvt5E71Sk",
    authDomain: "agoraeufalo-3463a.firebaseapp.com",
    projectId: "agoraeufalo-3463a",
    storageBucket: "agoraeufalo-3463a.firebasestorage.app",
    messagingSenderId: "973862553705",
    appId: "1:973862553705:web:959ea81c80c28cc1dc7af8"
  };

  const MASTER_ADMIN_EMAILS = [
    'selexenglish@gmail.com',
    'leonardo@agoraeufalo.com.br',
    'leo@agoraeufalo.com.br'
  ];

  class AEFPortalAuth {
    constructor() {
      this.app = null;
      this.auth = null;
      this.db = null;
      this.currentUser = null;
      this.currentProfile = null;
      this._initPromise = this._loadFirebaseSDKs();
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
          this.currentProfile = await this.getProfile(user.uid);
          if (this.currentProfile) {
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
        localStorage.setItem('aef_user_name', profile.name || 'Aluno AgoraEuFalo');
        localStorage.setItem('aef_user_email', profile.email || '');
        localStorage.setItem('aef_user_tier', profile.tier || 'free');
        localStorage.setItem('aef_user_role', profile.role || 'student');
        localStorage.setItem('aef_enrolled_products', JSON.stringify(profile.enrolledProducts || []));
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

    // =========================================================================
    // AUTHENTICATION METHODS
    // =========================================================================

    async signUpWithEmail(name, email, password) {
      await this.ready();
      const cred = await this.auth.createUserWithEmailAndPassword(email, password);
      const user = cred.user;

      const isMasterAdmin = this.isMasterAdminEmail(email);
      const isVipMentee = this.isVipMenteeEmail(email);
      const finalName = isMasterAdmin ? (name || 'Prof. Leonardo Leite') : (isVipMentee ? (name || 'André Barrote') : name);

      await user.updateProfile({ displayName: finalName });

      const newProfile = {
        uid: user.uid,
        name: finalName,
        email: email,
        tier: isMasterAdmin ? 'admin_master' : (isVipMentee ? 'vip' : 'free'),
        role: isMasterAdmin ? 'admin' : (isVipMentee ? 'vip_mentee' : 'student'),
        enrolledProducts: isMasterAdmin 
          ? ['all_access_master', 'mentoria_vip', 'magic_stories_club', 'ms-legacy', 'english-quickstart', 'frases-prontas'] 
          : (isVipMentee ? ['mentoria-andre', 'ms-legacy', 'english-quickstart', 'free_starter_pack'] : ['free_starter_pack', 'magic_stories_demo']),
        stats: {
          streakDays: 1,
          totalListeningMinutes: 0,
          lastTrainedAt: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };

      await this.db.collection('users').doc(user.uid).set(newProfile);
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

      if (profile && isMasterAdmin && (profile.role !== 'admin' || profile.tier !== 'admin_master')) {
        profile.role = 'admin';
        profile.tier = 'admin_master';
        profile.enrolledProducts = ['all_access_master', 'mentoria_vip', 'magic_stories_club', 'ms-legacy', 'english-quickstart', 'frases-prontas'];
        await this.db.collection('users').doc(cred.user.uid).update({
          role: 'admin',
          tier: 'admin_master',
          enrolledProducts: profile.enrolledProducts,
          lastLoginAt: new Date().toISOString()
        });
      } else if (profile && isVipMentee && (profile.tier !== 'vip' || !profile.enrolledProducts?.includes('mentoria-andre'))) {
        profile.tier = 'vip';
        if (!profile.enrolledProducts) profile.enrolledProducts = [];
        if (!profile.enrolledProducts.includes('mentoria-andre')) profile.enrolledProducts.push('mentoria-andre');
        if (!profile.enrolledProducts.includes('ms-legacy')) profile.enrolledProducts.push('ms-legacy');
        await this.db.collection('users').doc(cred.user.uid).update({
          tier: 'vip',
          enrolledProducts: profile.enrolledProducts,
          lastLoginAt: new Date().toISOString()
        });
      } else if (profile) {
        await this.db.collection('users').doc(cred.user.uid).update({
          lastLoginAt: new Date().toISOString()
        });
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
            : (isVipMentee ? ['mentoria-andre', 'ms-legacy', 'english-quickstart', 'free_starter_pack'] : ['free_starter_pack', 'magic_stories_demo']),
          stats: {
            streakDays: 1,
            totalListeningMinutes: 0,
            lastTrainedAt: new Date().toISOString()
          },
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };
        await this.db.collection('users').doc(user.uid).set(profile);
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
        await this.db.collection('users').doc(user.uid).update(updates);
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
                : (isVipMentee ? ['mentoria-andre', 'ms-legacy', 'english-quickstart', 'free_starter_pack'] : ['free_starter_pack', 'magic_stories_demo']),
              stats: {
                streakDays: 1,
                totalListeningMinutes: 0,
                lastTrainedAt: new Date().toISOString()
              },
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString()
            };
            await this.db.collection('users').doc(user.uid).set(profile);
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
            await this.db.collection('users').doc(user.uid).update({
              role: profile.role,
              tier: profile.tier,
              enrolledProducts: profile.enrolledProducts || [],
              lastLoginAt: new Date().toISOString()
            });
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
      await this.auth.signOut();
      this.currentUser = null;
      this.currentProfile = null;
    }

    // =========================================================================
    // USER PROFILE & PRODUCT ACCESS (TIERS)
    // =========================================================================

    async getProfile(uid) {
      await this.ready();
      try {
        const doc = await this.db.collection('users').doc(uid).get();
        if (doc.exists) {
          return doc.data();
        }
      } catch (err) {
        console.warn("Could not fetch user profile:", err);
      }
      return null;
    }

    async updateProfile(data) {
      await this.ready();
      if (!this.currentUser) return;
      await this.db.collection('users').doc(this.currentUser.uid).update(data);
      this.currentProfile = { ...this.currentProfile, ...data };
      this._syncLocalStorage(this.currentProfile);
      return this.currentProfile;
    }

    isAdmin() {
      if (!this.currentProfile) {
        const cachedRole = localStorage.getItem('aef_user_role');
        const cachedEmail = localStorage.getItem('aef_user_email');
        return cachedRole === 'admin' || this.isMasterAdminEmail(cachedEmail);
      }
      return this.currentProfile.role === 'admin' || 
             this.currentProfile.tier === 'admin_master' || 
             this.isMasterAdminEmail(this.currentProfile.email);
    }

    getActiveTier() {
      if (this.isAdmin()) return 'admin_master';
      if (!this.currentProfile) return localStorage.getItem('aef_user_tier') || 'free';
      return this.currentProfile.tier || 'free';
    }

    // Check if user has access to a specific tier/product
    hasAccess(requiredTier) {
      if (this.isAdmin()) return true; // God Mode: Admin passes all gates
      if (!this.currentProfile) {
        const cachedTier = localStorage.getItem('aef_user_tier') || 'free';
        return this._compareTiers(cachedTier, requiredTier);
      }
      return this._compareTiers(this.currentProfile.tier, requiredTier);
    }

    /**
     * Route Guard: Blocks unauthenticated anonymous access and redirects to login.html
     */
    async requireAuth({ redirectUrl = 'login.html', requiredTier = null, requireAdmin = false } = {}) {
      await this.ready();
      
      const hostname = window.location.hostname;
      const isLocalOrDev = (
        hostname === 'localhost' || 
        hostname === '127.0.0.1' || 
        hostname.startsWith('192.168.') || 
        hostname.startsWith('10.') || 
        window.location.protocol === 'file:'
      );

      // Wait briefly for auth state to resolve if not yet initialized
      if (this.auth && !this.auth.currentUser) {
        await new Promise((resolve) => {
          const unsubscribe = this.auth.onAuthStateChanged((user) => {
            unsubscribe();
            resolve(user);
          });
          setTimeout(() => resolve(null), isLocalOrDev ? 300 : 1200);
        });
      }

      let user = this.auth?.currentUser;
      
      // Em ambiente de teste local, se não houver login no dispositivo, concede acesso de Professor Leo
      if (!user && isLocalOrDev) {
        console.log("⚡ [AEFPortalAuth] Ambiente local detectado: liberando acesso irrestrito para Professor Leo.");
        this.currentUser = {
          uid: 'dev-master-leo',
          email: 'selexenglish@gmail.com',
          displayName: 'Professor Leonardo Leite'
        };
        this.currentProfile = {
          uid: 'dev-master-leo',
          name: 'Professor Leonardo Leite',
          email: 'selexenglish@gmail.com',
          role: 'admin',
          tier: 'admin_master',
          enrolledProducts: ['all_access_master', 'mentoria_vip', 'ms-legacy', 'english-quickstart', 'frases-prontas']
        };
        this._syncLocalStorage(this.currentProfile);
        return true;
      }

      if (!user) {
        console.warn("🔒 [AEFPortalAuth] Acesso bloqueado: Usuário não autenticado. Redirecionando para login.html");
        try {
          sessionStorage.setItem('aef_redirect_after_login', window.location.href);
        } catch(e) {}
        window.location.replace(redirectUrl);
        return false;
      }

      if (requireAdmin && !this.isAdmin()) {
        console.warn("🔒 [AEFPortalAuth] Acesso negado: Requer privilégios de Administrador.");
        alert("Acesso restrito ao Professor Leonardo Leite e Administradores.");
        window.location.replace('portal.html');
        return false;
      }

      if (requiredTier && !this.hasAccess(requiredTier)) {
        console.warn(`🔒 [AEFPortalAuth] Acesso negado: Requer plano ${requiredTier}`);
        window.location.replace('portal.html?upgrade=true');
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
      await this.ready();
      const results = {
        users: [],
        vipMentees: []
      };

      try {
        // 1. Fetch from 'users' collection
        const usersSnap = await this.db.collection('users').get();
        usersSnap.forEach(doc => {
          results.users.push({ id: doc.id, ...doc.data() });
        });

        // 2. Fetch from 'students' collection (VIP Mentee Profiles)
        const menteesSnap = await this.db.collection('students').get();
        menteesSnap.forEach(doc => {
          results.vipMentees.push({ id: doc.id, ...doc.data() });
        });
      } catch (e) {
        console.warn("Error fetching students and mentees:", e);
      }

      return results;
    }

    async updateUserTierAndRole(userId, newTier, newRole, enrolledProducts = null) {
      await this.ready();
      const updates = {
        tier: newTier,
        role: newRole,
        updatedAt: new Date().toISOString()
      };
      if (enrolledProducts) {
        updates.enrolledProducts = enrolledProducts;
      }
      await this.db.collection('users').doc(userId).set(updates, { merge: true });
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
      await this.db.collection('students').doc(menteeId).set(payload, { merge: true });
      return payload;
    }
  }

  window.aefPortalAuth = new AEFPortalAuth();
})(window);
