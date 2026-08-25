/**
 * AgoraEuFalo - Portal Auth & Membership Service
 * Professor Leonardo Leite
 * 
 * Manages Firebase Authentication, Student Profiles, Product Access Tiers, and Real-time Sessions.
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
          window.dispatchEvent(new CustomEvent('aef:auth-changed', { detail: { user, profile: this.currentProfile } }));
        } else {
          this.currentProfile = null;
          window.dispatchEvent(new CustomEvent('aef:auth-changed', { detail: { user: null, profile: null } }));
        }
      });
    }

    async ready() {
      await this._initPromise;
    }

    // =========================================================================
    // AUTHENTICATION METHODS
    // =========================================================================

    async signUpWithEmail(name, email, password) {
      await this.ready();
      const cred = await this.auth.createUserWithEmailAndPassword(email, password);
      const user = cred.user;

      const isAdminEmail = email.toLowerCase().includes('selexenglish@gmail.com') || email.toLowerCase().includes('leonardo');
      const finalName = isAdminEmail ? (name || 'Prof. Leonardo Leite') : name;

      await user.updateProfile({ displayName: finalName });

      const newProfile = {
        uid: user.uid,
        name: finalName,
        email: email,
        tier: isAdminEmail ? 'vip_mentorship' : 'free',
        role: isAdminEmail ? 'admin' : 'student',
        enrolledProducts: isAdminEmail ? ['all_access_master', 'mentoria_vip', 'magic_stories_club'] : ['free_starter_pack', 'magic_stories_demo'],
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
      return { user, profile: newProfile };
    }

    async signInWithEmail(email, password) {
      await this.ready();
      const cred = await this.auth.signInWithEmailAndPassword(email, password);
      let profile = await this.getProfile(cred.user.uid);
      
      const isAdminEmail = email.toLowerCase().includes('selexenglish@gmail.com') || email.toLowerCase().includes('leonardo');

      if (profile && isAdminEmail && profile.role !== 'admin') {
        profile.role = 'admin';
        profile.tier = 'vip_mentorship';
        await this.db.collection('users').doc(cred.user.uid).update({
          role: 'admin',
          tier: 'vip_mentorship',
          lastLoginAt: new Date().toISOString()
        });
      } else if (profile) {
        await this.db.collection('users').doc(cred.user.uid).update({
          lastLoginAt: new Date().toISOString()
        });
      }
      this.currentProfile = profile;
      return { user: cred.user, profile };
    }

    async signInWithGoogle() {
      await this.ready();
      const provider = new window.firebase.auth.GoogleAuthProvider();
      const cred = await this.auth.signInWithPopup(provider);
      const user = cred.user;

      const isAdminEmail = (user.email || '').toLowerCase().includes('selexenglish@gmail.com') || (user.email || '').toLowerCase().includes('leonardo');

      let profile = await this.getProfile(user.uid);
      if (!profile) {
        profile = {
          uid: user.uid,
          name: isAdminEmail ? 'Prof. Leonardo Leite' : (user.displayName || 'Aluno AEF'),
          email: user.email,
          avatarUrl: user.photoURL || '',
          tier: isAdminEmail ? 'vip_mentorship' : 'free',
          role: isAdminEmail ? 'admin' : 'student',
          enrolledProducts: isAdminEmail ? ['all_access_master', 'mentoria_vip', 'magic_stories_club'] : ['free_starter_pack', 'magic_stories_demo'],
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
        if (isAdminEmail && profile.role !== 'admin') {
          profile.role = 'admin';
          profile.tier = 'vip_mentorship';
        }
        await this.db.collection('users').doc(user.uid).update({
          role: profile.role,
          tier: profile.tier,
          lastLoginAt: new Date().toISOString()
        });
      }

      this.currentProfile = profile;
      return { user, profile };
    }

    async sendPasswordReset(email) {
      await this.ready();
      await this.auth.sendPasswordResetEmail(email);
    }

    async sendMagicLink(email) {
      await this.ready();
      const actionCodeSettings = {
        url: window.location.origin + '/login.html?magicLink=true',
        handleCodeInApp: true
      };
      await this.auth.sendSignInLinkToEmail(email, actionCodeSettings);
      window.localStorage.setItem('aef_email_for_magic_link', email);
    }

    async checkAndCompleteMagicLink() {
      await this.ready();
      if (this.auth.isSignInWithEmailLink(window.location.href)) {
        let email = window.localStorage.getItem('aef_email_for_magic_link');
        if (!email) {
          email = window.prompt('Por favor, confirme seu email para entrar com o Link Mágico:');
        }
        if (email) {
          const cred = await this.auth.signInWithEmailLink(email, window.location.href);
          window.localStorage.removeItem('aef_email_for_magic_link');
          const user = cred.user;
          const isAdminEmail = (user.email || '').toLowerCase().includes('selexenglish@gmail.com') || (user.email || '').toLowerCase().includes('leonardo');

          let profile = await this.getProfile(user.uid);
          if (!profile) {
            profile = {
              uid: user.uid,
              name: isAdminEmail ? 'Prof. Leonardo Leite' : (user.displayName || user.email.split('@')[0]),
              email: user.email,
              avatarUrl: user.photoURL || '',
              tier: isAdminEmail ? 'vip_mentorship' : 'free',
              role: isAdminEmail ? 'admin' : 'student',
              enrolledProducts: isAdminEmail ? ['all_access_master', 'mentoria_vip', 'magic_stories_club'] : ['free_starter_pack', 'magic_stories_demo'],
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
            if (isAdminEmail && profile.role !== 'admin') {
              profile.role = 'admin';
              profile.tier = 'vip_mentorship';
            }
            await this.db.collection('users').doc(user.uid).update({
              role: profile.role,
              tier: profile.tier,
              lastLoginAt: new Date().toISOString()
            });
          }
          this.currentProfile = profile;
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
    // USER PROFILE & PRODUCT ACCESS
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
      return this.currentProfile;
    }

    // Check if user has access to a specific tier/product
    hasAccess(requiredTier) {
      if (!this.currentProfile) return false;
      if (this.currentProfile.role === 'admin') return true;

      const tierLevels = {
        'free': 1,
        'club_monthly': 2,
        'club_annual': 3,
        'lifetime': 4,
        'vip_mentorship': 5
      };

      const userLevel = tierLevels[this.currentProfile.tier] || 1;
      const reqLevel = tierLevels[requiredTier] || 1;

      return userLevel >= reqLevel;
    }
  }

  window.aefPortalAuth = new AEFPortalAuth();
})(window);
