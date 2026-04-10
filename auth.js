// Auth system using localStorage
const AUTH = {
  getUsers() {
    return JSON.parse(localStorage.getItem("bsm_users") || "{}");
  },

  saveUsers(users) {
    localStorage.setItem("bsm_users", JSON.stringify(users));
  },

  getCurrentUser() {
    const username = localStorage.getItem("bsm_currentUser");
    if (!username) return null;
    const users = this.getUsers();
    return users[username] || null;
  },

  isLoggedIn() {
    return !!localStorage.getItem("bsm_currentUser");
  },

  signup(username, password, displayName, crew) {
    const users = this.getUsers();
    if (users[username.toLowerCase()]) {
      return { success: false, error: "Username already taken" };
    }
    if (username.length < 3) {
      return { success: false, error: "Username must be at least 3 characters" };
    }
    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }

    users[username.toLowerCase()] = {
      username: username.toLowerCase(),
      displayName: displayName || username,
      password: password,
      crew: crew || "",
      bio: "",
      avatar: "",
      joinedDate: new Date().toISOString(),
      following: [],
      followers: []
    };

    this.saveUsers(users);
    localStorage.setItem("bsm_currentUser", username.toLowerCase());
    return { success: true };
  },

  login(username, password) {
    const users = this.getUsers();
    const user = users[username.toLowerCase()];
    if (!user) {
      return { success: false, error: "User not found" };
    }
    if (user.password !== password) {
      return { success: false, error: "Incorrect password" };
    }
    localStorage.setItem("bsm_currentUser", username.toLowerCase());
    return { success: true };
  },

  logout() {
    localStorage.removeItem("bsm_currentUser");
    window.location.href = "login.html";
  },

  updateProfile(updates) {
    const username = localStorage.getItem("bsm_currentUser");
    if (!username) return false;
    const users = this.getUsers();
    if (!users[username]) return false;
    Object.assign(users[username], updates);
    this.saveUsers(users);
    return true;
  }
};

// Feed system
const FEED = {
  getPosts() {
    return JSON.parse(localStorage.getItem("bsm_posts") || "[]");
  },

  savePosts(posts) {
    localStorage.setItem("bsm_posts", JSON.stringify(posts));
  },

  addPost(content) {
    const user = AUTH.getCurrentUser();
    if (!user || !content.trim()) return false;
    const posts = this.getPosts();
    posts.unshift({
      id: Date.now().toString(),
      username: user.username,
      displayName: user.displayName,
      crew: user.crew,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      likes: [],
      comments: []
    });
    this.savePosts(posts);
    return true;
  },

  toggleLike(postId) {
    const user = AUTH.getCurrentUser();
    if (!user) return;
    const posts = this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const idx = post.likes.indexOf(user.username);
    if (idx === -1) {
      post.likes.push(user.username);
    } else {
      post.likes.splice(idx, 1);
    }
    this.savePosts(posts);
  },

  addComment(postId, content) {
    const user = AUTH.getCurrentUser();
    if (!user || !content.trim()) return false;
    const posts = this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return false;
    post.comments.push({
      id: Date.now().toString(),
      username: user.username,
      displayName: user.displayName,
      content: content.trim(),
      timestamp: new Date().toISOString()
    });
    this.savePosts(posts);
    return true;
  },

  deletePost(postId) {
    const user = AUTH.getCurrentUser();
    if (!user) return;
    let posts = this.getPosts();
    posts = posts.filter(p => !(p.id === postId && p.username === user.username));
    this.savePosts(posts);
  },

  timeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
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