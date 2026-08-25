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

      await user.updateProfile({ displayName: name });

      const newProfile = {
        uid: user.uid,
        name: name,
        email: email,
        tier: 'free', // 'free' | 'club_monthly' | 'club_annual' | 'lifetime' | 'vip_mentorship'
        role: 'student',
        enrolledProducts: ['free_starter_pack', 'magic_stories_demo'],
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
      const profile = await this.getProfile(cred.user.uid);
      
      // Update last login
      if (profile) {
        await this.db.collection('users').doc(cred.user.uid).update({
          lastLoginAt: new Date().toISOString()
        });
      }
      return { user: cred.user, profile };
    }

    async signInWithGoogle() {
      await this.ready();
      const provider = new window.firebase.auth.GoogleAuthProvider();
      const cred = await this.auth.signInWithPopup(provider);
      const user = cred.user;

      let profile = await this.getProfile(user.uid);
      if (!profile) {
        profile = {
          uid: user.uid,
          name: user.displayName || 'Aluno AEF',
          email: user.email,
          avatarUrl: user.photoURL || '',
          tier: 'free',
          role: 'student',
          enrolledProducts: ['free_starter_pack', 'magic_stories_demo'],
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
        await this.db.collection('users').doc(user.uid).update({
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
