// Auth system using Firebase
const AUTH = {
  currentUser: null,
  userProfile: null,

  // Wait for Firebase auth state
  onReady(callback) {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        AUTH.currentUser = user;
        const doc = await db.collection("users").doc(user.uid).get();
        AUTH.userProfile = doc.exists ? doc.data() : null;
      } else {
        AUTH.currentUser = null;
        AUTH.userProfile = null;
      }
      callback(AUTH.currentUser, AUTH.userProfile);
    });
  },

  isLoggedIn() {
    return !!auth.currentUser;
  },

  getCurrentUser() {
    return AUTH.userProfile;
  },

  async signup(email, password, displayName, crew) {
    try {
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      const username = email.split("@")[0].toLowerCase();
      const profile = {
        uid: cred.user.uid,
        email: email,
        username: username,
        displayName: displayName || username,
        crew: crew || "",
        bio: "",
        joinedDate: new Date().toISOString()
      };
      await db.collection("users").doc(cred.user.uid).set(profile);
      AUTH.userProfile = profile;
      return { success: true };
    } catch (e) {
      let error = e.message;
      if (e.code === "auth/email-already-in-use") error = "Email already in use";
      if (e.code === "auth/weak-password") error = "Password must be at least 6 characters";
      if (e.code === "auth/invalid-email") error = "Invalid email address";
      return { success: false, error: error };
    }
  },

  async login(email, password) {
    try {
      await auth.signInWithEmailAndPassword(email, password);
      return { success: true };
    } catch (e) {
      let error = e.message;
      if (e.code === "auth/user-not-found") error = "No account found with this email";
      if (e.code === "auth/wrong-password") error = "Incorrect password";
      if (e.code === "auth/invalid-email") error = "Invalid email address";
      if (e.code === "auth/invalid-credential") error = "Incorrect email or password";
      return { success: false, error: error };
    }
  },

  async logout() {
    await auth.signOut();
    window.location.href = "login.html";
  },

  async updateProfile(updates) {
    if (!auth.currentUser) return false;
    await db.collection("users").doc(auth.currentUser.uid).update(updates);
    Object.assign(AUTH.userProfile, updates);
    return true;
  }
};

// Feed system using Firestore
const FEED = {
  async getPosts() {
    const snapshot = await db.collection("posts").orderBy("timestamp", "desc").limit(50).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async addPost(content) {
    const profile = AUTH.userProfile;
    if (!profile || !content.trim()) return false;
    await db.collection("posts").add({
      uid: auth.currentUser.uid,
      username: profile.username,
      displayName: profile.displayName,
      crew: profile.crew || "",
      content: content.trim(),
      timestamp: new Date(),
      likes: [],
      comments: []
    });
    return true;
  },

  async toggleLike(postId) {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const ref = db.collection("posts").doc(postId);
    const doc = await ref.get();
    if (!doc.exists) return;
    const likes = doc.data().likes || [];
    if (likes.includes(uid)) {
      await ref.update({ likes: firebase.firestore.FieldValue.arrayRemove(uid) });
    } else {
      await ref.update({ likes: firebase.firestore.FieldValue.arrayUnion(uid) });
    }
  },

  async addComment(postId, content) {
    const profile = AUTH.userProfile;
    if (!profile || !content.trim()) return false;
    const ref = db.collection("posts").doc(postId);
    await ref.update({
      comments: firebase.firestore.FieldValue.arrayUnion({
        uid: auth.currentUser.uid,
        username: profile.username,
        displayName: profile.displayName,
        content: content.trim(),
        timestamp: new Date().toISOString()
      })
    });
    return true;
  },

  async deletePost(postId) {
    if (!auth.currentUser) return;
    const ref = db.collection("posts").doc(postId);
    const doc = await ref.get();
    if (doc.exists && doc.data().uid === auth.currentUser.uid) {
      await ref.delete();
    }
  },

  timeAgo(timestamp) {
    if (!timestamp) return "just now";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + "m ago";
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + "h ago";
    const days = Math.floor(hours / 24);
    if (days < 30) return days + "d ago";
    return date.toLocaleDateString();
  }
};

// Helper to get all crew members
async function getCrewMembers(crewName) {
  const snapshot = await db.collection("users").where("crew", "==", crewName).get();
  return snapshot.docs.map(doc => doc.data());
}

// Helper to get all crew counts
async function getAllCrewCounts() {
  const snapshot = await db.collection("users").get();
  const counts = {};
  snapshot.docs.forEach(doc => {
    const crew = doc.data().crew;
    if (crew) counts[crew] = (counts[crew] || 0) + 1;
  });
  return counts;
}