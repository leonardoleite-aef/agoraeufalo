const fs = require('fs');
let content = fs.readFileSync('assets/js/aef-portal-auth.js', 'utf8');

const oldDeleteUserDoc = `    async deleteUserDoc(userId) {
      await this.ready();
      if (!this.db) return false;
      try {
        await this.db.collection('users').doc(userId).delete();
        return true;
      } catch (e) {
        console.warn('Error deleting user doc from Firestore:', e);
        return false;
      }
    }`;

const newDeleteUserDoc = `    async deleteUserDoc(userId) {
      await this.ready();
      let success = false;
      if (this.db) {
        try {
          await this.db.collection('users').doc(userId).delete();
          success = true;
        } catch (e) {
          console.warn('SDK deleteUserDoc failed, trying REST:', e);
        }
      }
      
      if (!success) {
        try {
          const restUrl = \`https://firestore.googleapis.com/v1/projects/agoraeufalo-3463a/databases/(default)/documents/users/\${userId}\`;
          const res = await fetch(restUrl, { method: "DELETE" });
          if (res.ok) success = true;
        } catch(e) {
          console.error("REST deleteUserDoc failed:", e);
        }
      }
      return success;
    }`;

content = content.replace(oldDeleteUserDoc, newDeleteUserDoc);

const oldDeleteMenteeDoc = `    async deleteMenteeDoc(menteeId) {
      await this.ready();
      if (!this.db) return false;
      try {
        await this.db.collection('students').doc(menteeId).delete();
        return true;
      } catch (e) {
        console.warn('Error deleting mentee doc from Firestore:', e);
        return false;
      }
    }`;

const newDeleteMenteeDoc = `    async deleteMenteeDoc(menteeId) {
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
          const restUrl = \`https://firestore.googleapis.com/v1/projects/agoraeufalo-3463a/databases/(default)/documents/students/\${menteeId}\`;
          const res = await fetch(restUrl, { method: "DELETE" });
          if (res.ok) success = true;
        } catch(e) {
          console.error("REST deleteMenteeDoc failed:", e);
        }
      }
      return success;
    }`;

content = content.replace(oldDeleteMenteeDoc, newDeleteMenteeDoc);
fs.writeFileSync('assets/js/aef-portal-auth.js', content);
console.log("Patched delete methods in aef-portal-auth.js");
