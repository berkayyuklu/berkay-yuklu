// ===== ANA JAVASCRIPT =====

// Featured Slider
let sliderInterval;
let currentSlide = 0;
let featuredPosts = [];

function initSlider(posts) {
  featuredPosts = posts;
  const slider = document.getElementById("featuredSlider");
  const dots = document.getElementById("featuredDots");
  const progress = document.getElementById("featuredProgress");
  if (!slider || posts.length === 0) return;

  slider.innerHTML = "";
  dots.innerHTML = "";

  posts.forEach((post, i) => {
    const slide = document.createElement("div");
    slide.className = `featured-slide ${i === 0 ? "active" : ""}`;
    slide.innerHTML = `
      ${post.imageUrl
        ? `<img src="${post.imageUrl}" alt="${post.title}" class="featured-slide-img">`
        : `<div class="featured-slide-img" style="display:flex;align-items:center;justify-content:center;background:var(--bg-secondary);color:var(--text-muted);font-size:3rem;">📝</div>`}
      <div class="featured-slide-content">
        <div class="featured-badge">⭐ Öne Çıkan</div>
        <h2>${post.title}</h2>
        <p>${post.excerpt || post.content?.substring(0, 200) || ""}</p>
        <div class="featured-meta">
          <span>👁 ${post.views || 0} görüntülenme</span>
          <span>❤️ ${post.likes || 0} beğeni</span>
          <span>📅 ${formatDate(post.createdAt)}</span>
        </div>
        <a href="post.html?id=${post.id}" class="btn btn-gold" style="width:fit-content;margin-top:8px;">Okumaya Devam Et →</a>
      </div>`;
    slider.appendChild(slide);

    const dot = document.createElement("div");
    dot.className = `featured-dot ${i === 0 ? "active" : ""}`;
    dot.onclick = () => goToSlide(i);
    dots.appendChild(dot);
  });

  if (posts.length > 1) {
    startSliderTimer();
  }
}

function goToSlide(index) {
  const slides = document.querySelectorAll(".featured-slide");
  const dots = document.querySelectorAll(".featured-dot");
  slides.forEach(s => s.classList.remove("active"));
  dots.forEach(d => d.classList.remove("active"));
  currentSlide = index;
  if (slides[index]) slides[index].classList.add("active");
  if (dots[index]) dots[index].classList.add("active");
  resetProgress();
}

function startSliderTimer() {
  clearInterval(sliderInterval);
  resetProgress();
  sliderInterval = setInterval(() => {
    const next = (currentSlide + 1) % featuredPosts.length;
    goToSlide(next);
  }, 5000);
}

function resetProgress() {
  const bar = document.getElementById("featuredProgress");
  if (!bar) return;
  bar.style.transition = "none";
  bar.style.width = "0%";
  setTimeout(() => {
    bar.style.transition = "width 5s linear";
    bar.style.width = "100%";
  }, 20);
}

// Blog Gönderileri Yükle
async function loadPosts(container, featured = false, limit = 12) {
  if (!container) return;
  container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted)">Yükleniyor...</div>`;

  try {
    let query = db.collection("posts").where("published", "==", true).orderBy("createdAt", "desc");
    if (featured) query = query.where("featured", "==", true);
    query = query.limit(limit);

    const snap = await query.get();
    const posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    if (posts.length === 0) {
      container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted)">Henüz gönderi yok.</div>`;
      return;
    }

    container.innerHTML = "";
    posts.forEach(post => {
      container.appendChild(createPostCard(post));
    });

    return posts;
  } catch (e) {
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted)">Gönderiler yüklenirken hata oluştu.</div>`;
    console.error(e);
  }
}

function createPostCard(post) {
  const div = document.createElement("div");
  div.className = "post-card";
  const isLocked = post.premiumOnly && !(currentUser?.subscriptionActive);

  div.innerHTML = `
    ${post.imageUrl
      ? `<img src="${post.imageUrl}" alt="${post.title}" class="post-card-img" loading="lazy">`
      : `<div class="post-card-img-placeholder">📝</div>`}
    <div class="post-card-body">
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        ${post.category ? `<span class="post-tag">${post.category}</span>` : ""}
        ${isLocked ? `<span class="post-tag premium">🔒 Premium</span>` : ""}
        ${post.featured ? `<span class="post-tag" style="background:rgba(200,150,62,0.15);color:var(--gold)">⭐</span>` : ""}
      </div>
      <div class="post-card-title">${post.title}</div>
      <div class="post-card-excerpt">${post.excerpt || post.content?.substring(0, 140) || ""}</div>
      <div class="post-card-footer">
        <div class="view-count">👁 ${post.views || 0}</div>
        <div class="post-card-actions">
          <button class="like-btn" onclick="toggleLike(event,'${post.id}',this)" data-post="${post.id}">
            <svg class="heart-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            <span>${post.likes || 0}</span>
          </button>
          <span style="font-size:0.78rem;color:var(--text-muted)">${formatDate(post.createdAt)}</span>
        </div>
      </div>
    </div>`;

  div.addEventListener("click", (e) => {
    if (e.target.closest(".like-btn")) return;
    if (isLocked) {
      openModal("subscribeModal");
    } else {
      window.location.href = `post.html?id=${post.id}`;
    }
  });

  // Beğenildi mi kontrol et
  if (currentUser) {
    const liked = (post.likedBy || []).includes(currentUser.uid);
    if (liked) div.querySelector(".like-btn")?.classList.add("liked");
  }

  return div;
}

async function toggleLike(e, postId, btn) {
  e.stopPropagation();
  if (!currentUser) { openModal("authModal"); return; }

  const postRef = db.collection("posts").doc(postId);
  const snap = await postRef.get();
  if (!snap.exists) return;

  const data = snap.data();
  const likedBy = data.likedBy || [];
  const liked = likedBy.includes(currentUser.uid);

  const countEl = btn.querySelector("span");

  if (liked) {
    await postRef.update({
      likes: firebase.firestore.FieldValue.increment(-1),
      likedBy: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
    });
    btn.classList.remove("liked");
    if (countEl) countEl.textContent = Math.max(0, parseInt(countEl.textContent) - 1);
  } else {
    await postRef.update({
      likes: firebase.firestore.FieldValue.increment(1),
      likedBy: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
    });
    btn.classList.add("liked");
    if (countEl) countEl.textContent = parseInt(countEl.textContent) + 1;
  }
}

// ===== YORUMLAR =====
async function loadComments(postId) {
  const container = document.getElementById("commentsList");
  if (!container) return;

  const snap = await db.collection("posts").doc(postId)
    .collection("comments").orderBy("createdAt", "asc").get();

  const comments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  const topLevel = comments.filter(c => !c.parentId);
  const replies = comments.filter(c => c.parentId);

  container.innerHTML = "";

  for (const comment of topLevel) {
    const commentEl = await renderComment(comment, postId);
    container.appendChild(commentEl);

    const commentReplies = replies.filter(r => r.parentId === comment.id);
    if (commentReplies.length > 0) {
      const repliesDiv = document.createElement("div");
      repliesDiv.className = "replies";
      for (const reply of commentReplies) {
        repliesDiv.appendChild(await renderComment(reply, postId));
      }
      commentEl.appendChild(repliesDiv);
    }
  }
}

async function renderComment(comment, postId) {
  const div = document.createElement("div");
  div.className = "comment";
  div.id = `comment-${comment.id}`;

  const isAdmin = comment.userEmail === ADMIN_EMAIL;
  const isLikedByMe = currentUser && (comment.likedBy || []).includes(currentUser.uid);

  div.innerHTML = `
    <img class="comment-avatar" src="${comment.userPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userName || "User")}&background=c8963e&color=fff`}" alt="">
    <div class="comment-body">
      <div class="comment-header">
        <span class="comment-author">${comment.userName || "Anonim"}</span>
        ${isAdmin ? `<span class="admin-heart" title="Site Yöneticisi">💛</span>` : ""}
        <span class="comment-time">${formatDate(comment.createdAt)}</span>
      </div>
      <div class="comment-text">${escapeHtml(comment.text)}</div>
      <div class="comment-actions">
        <button class="comment-like-btn ${isLikedByMe ? "liked" : ""}"
          onclick="toggleCommentLike('${postId}','${comment.id}',this)">
          ❤ <span>${comment.likes || 0}</span>
        </button>
        <button class="reply-btn" onclick="showReplyForm('${postId}','${comment.id}')">Yanıtla</button>
      </div>
      <div id="reply-form-${comment.id}"></div>
    </div>`;

  return div;
}

async function submitComment(postId, text, parentId = null) {
  if (!currentUser) { openModal("authModal"); return; }
  if (!text.trim()) return;

  const userDoc = await db.collection("users").doc(currentUser.uid).get();
  const userData = userDoc.data();

  await db.collection("posts").doc(postId).collection("comments").add({
    text: text.trim(),
    userId: currentUser.uid,
    userName: currentUser.displayName || currentUser.email.split("@")[0],
    userEmail: currentUser.email,
    userPhoto: currentUser.photoURL || null,
    parentId: parentId || null,
    likes: 0,
    likedBy: [],
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  await loadComments(postId);
}

async function toggleCommentLike(postId, commentId, btn) {
  if (!currentUser) { openModal("authModal"); return; }

  const ref = db.collection("posts").doc(postId).collection("comments").doc(commentId);
  const snap = await ref.get();
  if (!snap.exists) return;

  const liked = (snap.data().likedBy || []).includes(currentUser.uid);
  const countEl = btn.querySelector("span");

  if (liked) {
    await ref.update({
      likes: firebase.firestore.FieldValue.increment(-1),
      likedBy: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
    });
    btn.classList.remove("liked");
    if (countEl) countEl.textContent = Math.max(0, parseInt(countEl.textContent) - 1);
  } else {
    await ref.update({
      likes: firebase.firestore.FieldValue.increment(1),
      likedBy: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
    });
    btn.classList.add("liked");
    if (countEl) countEl.textContent = parseInt(countEl.textContent) + 1;
  }
}

function showReplyForm(postId, commentId) {
  const container = document.getElementById(`reply-form-${commentId}`);
  if (!container) return;

  if (container.innerHTML) { container.innerHTML = ""; return; }

  container.innerHTML = `
    <div style="margin-top:10px;">
      <textarea id="reply-text-${commentId}" placeholder="Yanıtınızı yazın..."
        style="width:100%;background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--text-primary);font-family:'DM Sans',sans-serif;font-size:0.85rem;resize:none;min-height:60px;"></textarea>
      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:6px;">
        <button class="btn btn-sm btn-outline" onclick="document.getElementById('reply-form-${commentId}').innerHTML=''">İptal</button>
        <button class="btn btn-sm btn-gold" onclick="submitComment('${postId}',document.getElementById('reply-text-${commentId}').value,'${commentId}')">Gönder</button>
      </div>
    </div>`;
}

// ===== GÖRÜNTÜLENME SAYACI =====
async function incrementView(postId) {
  const ref = db.collection("posts").doc(postId);
  const sessionKey = `viewed_${postId}`;
  if (sessionStorage.getItem(sessionKey)) return;
  sessionStorage.setItem(sessionKey, "1");
  await ref.update({ views: firebase.firestore.FieldValue.increment(1) });
}

// ===== NAVBAR =====
function initNavbar() {
  const navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", () => {
    navbar?.classList.toggle("scrolled", window.scrollY > 20);
  });

  // Hamburger
  const ham = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  ham?.addEventListener("click", () => {
    ham.classList.toggle("active");
    mobileMenu?.classList.toggle("open");
  });

  // User dropdown
  const userMenuBtn = document.getElementById("userMenuBtn");
  const userMenuEl = document.getElementById("userMenu");
  userMenuBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    userMenuEl?.classList.toggle("open");
  });

  document.addEventListener("click", () => {
    userMenuEl?.classList.remove("open");
    document.querySelectorAll(".nav-dropdown").forEach(d => d.classList.remove("open"));
  });

  document.querySelectorAll(".nav-dropdown > .nav-link").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      btn.parentElement?.classList.toggle("open");
    });
  });
}

// ===== MODAL AUTH =====
function initAuthModal() {
  let mode = "login";

  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");

  loginBtn?.addEventListener("click", () => { mode = "login"; renderAuthForm(mode); openModal("authModal"); });
  registerBtn?.addEventListener("click", () => { mode = "register"; renderAuthForm(mode); openModal("authModal"); });

  document.getElementById("authModal")?.addEventListener("click", (e) => {
    if (e.target.id === "authModal") closeModal("authModal");
  });
}

function renderAuthForm(mode) {
  const container = document.getElementById("authFormContent");
  const title = document.getElementById("authModalTitle");
  if (!container) return;

  if (mode === "login") {
    if (title) title.textContent = "Giriş Yap";
    container.innerHTML = `
      <div class="form-group">
        <label class="form-label">E-posta</label>
        <input type="email" id="authEmail" class="form-input" placeholder="ornek@email.com">
      </div>
      <div class="form-group">
        <label class="form-label">Şifre</label>
        <input type="password" id="authPassword" class="form-input" placeholder="••••••••">
      </div>
      <button class="btn btn-gold" style="width:100%" onclick="loginWithEmail(document.getElementById('authEmail').value,document.getElementById('authPassword').value)">Giriş Yap</button>
      <div class="auth-divider">veya</div>
      <button class="social-btn" onclick="signInWithGoogle()">
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        Google ile Giriş Yap
      </button>
      <button class="social-btn" onclick="signInWithFacebook()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        Facebook ile Giriş Yap
      </button>
      <div class="auth-switch">Hesabın yok mu? <button onclick="renderAuthForm('register')">Kayıt Ol</button></div>`;
  } else {
    if (title) title.textContent = "Kayıt Ol";
    container.innerHTML = `
      <div class="form-group">
        <label class="form-label">Ad Soyad</label>
        <input type="text" id="authName" class="form-input" placeholder="Adınız Soyadınız">
      </div>
      <div class="form-group">
        <label class="form-label">E-posta</label>
        <input type="email" id="authEmail" class="form-input" placeholder="ornek@email.com">
      </div>
      <div class="form-group">
        <label class="form-label">Şifre</label>
        <input type="password" id="authPassword" class="form-input" placeholder="En az 6 karakter">
      </div>
      <button class="btn btn-gold" style="width:100%" onclick="registerWithEmail(document.getElementById('authEmail').value,document.getElementById('authPassword').value,document.getElementById('authName').value)">Kayıt Ol</button>
      <div class="auth-divider">veya</div>
      <button class="social-btn" onclick="signInWithGoogle()">
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        Google ile Kayıt Ol
      </button>
      <button class="social-btn" onclick="signInWithFacebook()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        Facebook ile Kayıt Ol
      </button>
      <div class="auth-switch">Zaten hesabın var mı? <button onclick="renderAuthForm('login')">Giriş Yap</button></div>`;
  }
}

// ===== KISA YOLLAR =====
async function loadShortcuts(container) {
  if (!container) return;

  const snap = await db.collection("shortcuts").orderBy("order", "asc").get();
  const shortcuts = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  if (shortcuts.length === 0) {
    container.innerHTML = `<div style="color:var(--text-muted);text-align:center;padding:20px">Henüz kısayol eklenmemiş.</div>`;
    return;
  }

  container.innerHTML = "";
  shortcuts.forEach(s => {
    const card = document.createElement("a");
    card.href = s.url;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.className = "shortcut-card";
    card.innerHTML = `
      <div class="shortcut-icon">${s.icon || "🔗"}</div>
      <div>
        <div class="shortcut-name">${s.name}</div>
        <div class="shortcut-desc">${s.description || ""}</div>
      </div>
      <div class="shortcut-url">↗ ${s.url.replace("https://","").replace("http://","").split("/")[0]}</div>`;
    container.appendChild(card);
  });
}

// ===== ABONELİK PLANLARI =====
async function loadPlans(container) {
  if (!container) return;

  const snap = await db.collection("plans").orderBy("order", "asc").get();
  const plans = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  container.innerHTML = "";
  plans.forEach(plan => {
    const card = document.createElement("div");
    card.className = `plan-card ${plan.featured ? "featured" : ""}`;
    card.innerHTML = `
      ${plan.featured ? `<div class="plan-badge">Popüler</div>` : ""}
      <div class="plan-name">${plan.name}</div>
      <div class="plan-price">${plan.price} ₺<span>/${plan.period || "ay"}</span></div>
      <p style="color:var(--text-muted);font-size:0.85rem">${plan.description || ""}</p>
      <ul class="plan-features">
        ${(plan.features || []).map(f => `<li>${f}</li>`).join("")}
      </ul>
      <button class="btn btn-gold" style="margin-top:auto" onclick="initSubscribe('${plan.id}','${plan.name}','${plan.price}')">
        ${currentUser ? "Abone Ol" : "Giriş Yapıp Abone Ol"}
      </button>`;
    container.appendChild(card);
  });
}

async function initSubscribe(planId, planName, price) {
  if (!currentUser) { openModal("authModal"); return; }
  // Iyzico ödeme başlatılacak (admin panel'den token alınır)
  showToast(`${planName} planı seçildi. Ödeme sayfasına yönlendiriliyorsunuz...`, "info");
  // Admin panel'den Iyzico API anahtarı ayarlandıktan sonra burada ödeme akışı başlatılır
  setTimeout(() => {
    window.location.href = `payment.html?plan=${planId}&price=${price}&name=${encodeURIComponent(planName)}`;
  }, 1500);
}

// ===== YARDIMCI =====
function formatDate(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str || ""));
  return div.innerHTML;
}

// ===== SAYFA INIT =====
document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initAuthModal();
});
