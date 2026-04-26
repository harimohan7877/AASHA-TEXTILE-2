/* ============================================
   AASHA TEXTILE - Admin Panel Logic
   Login, CRUD with Images, Media, Settings
   ============================================ */

// ---- Constants ----
const STORAGE_KEYS = {
  products: 'aasha_products',
  media: 'aasha_media',
  whatsapp: 'aasha_whatsapp',
  password: 'aasha_admin_password',
  loggedIn: 'aasha_admin_logged',
  productImages: 'aasha_product_images',
  loginAttempts: 'aasha_admin_login_attempts',
  lockUntil: 'aasha_admin_lock_until'
};

const DEFAULT_PASSWORD = 'dev787799';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_MINUTES = 10;

// Firebase Realtime Database URL
const FIREBASE_DB_URL = "https://aasha-textail-default-rtdb.firebaseio.com";

const CATEGORY_CONFIG = {
  Cotton: { icon: '🌿', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
  Silk: { icon: '✨', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' },
  Rayon: { icon: '🎨', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  Satin: { icon: '💎', gradient: 'linear-gradient(135deg, #e0c3fc, #8ec5fc)' },
  Readymade: { icon: '👗', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
  Curtain: { icon: '🪟', gradient: 'linear-gradient(135deg, #667eea, #43e97b)' },
  Other: { icon: '🧶', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' }
};

const HINDI_MONTHS = {
  0: 'जनवरी', 1: 'फ़रवरी', 2: 'मार्च', 3: 'अप्रैल',
  4: 'मई', 5: 'जून', 6: 'जुलाई', 7: 'अगस्त',
  8: 'सितंबर', 9: 'अक्टूबर', 10: 'नवंबर', 11: 'दिसंबर'
};

function inferCategory(name, variety) {
  const text = `${name || ''} ${variety || ''}`.toLowerCase();
  if (/cotton|कॉटन|cambric|कैमरिक|चिकन|lining|अस्तर/.test(text)) return 'Cotton';
  if (/silk|सिल्क|georgette|जोर्जेट|chiffon|शिफॉन/.test(text)) return 'Silk';
  if (/rayon|रेयॉन/.test(text)) return 'Rayon';
  if (/satin|साटन|जापान/.test(text)) return 'Satin';
  if (/kurti|कुर्ती|readymade|रेडीमेड|विस्कोस/.test(text)) return 'Readymade';
  if (/curtain|पर्दा|बेडशीट/.test(text)) return 'Curtain';
  return 'Other';
}

function formatDateHindi(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr || '';
  return `${d.getDate()} ${HINDI_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// ---- Data Helpers ----
function getProducts() {
  const stored = localStorage.getItem(STORAGE_KEYS.products);
  return stored ? JSON.parse(stored) : [];
}

function saveProducts(products) {
  const ok = safeSetLocalStorage(STORAGE_KEYS.products, JSON.stringify(products));
  if (!ok) return;
  if (FIREBASE_DB_URL && !FIREBASE_DB_URL.includes("your-firebase-rtdb")) {
    fetch(`${FIREBASE_DB_URL}/products.json`, {
      method: 'PUT',
      body: JSON.stringify(products)
    }).catch(e => console.warn("Firebase save error", e));
  }
}

async function syncProductsFromFirebase() {
  if (!FIREBASE_DB_URL || FIREBASE_DB_URL.includes("your-firebase-rtdb")) return;
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/products.json`);
    if (res.ok) {
      const data = await res.json();
      if (data) {
        // Data in Firebase might be object map if using push, but we are PUTting array
        const productArray = Array.isArray(data) ? data : Object.values(data);
        safeSetLocalStorage(STORAGE_KEYS.products, JSON.stringify(productArray));
        renderAdminProducts();
      }
    }
  } catch (e) { console.warn("Fetch error", e); }
}

function getProductImages() {
  const stored = localStorage.getItem(STORAGE_KEYS.productImages);
  return stored ? JSON.parse(stored) : {};
}

function saveProductImage(productId, imageData) {
  const images = getProductImages();
  images[productId] = imageData;
  safeSetLocalStorage(STORAGE_KEYS.productImages, JSON.stringify(images));
}

function removeProductImage(productId) {
  const images = getProductImages();
  delete images[productId];
  safeSetLocalStorage(STORAGE_KEYS.productImages, JSON.stringify(images));
}

function getMedia() {
  const stored = localStorage.getItem(STORAGE_KEYS.media);
  let media = stored ? JSON.parse(stored) : {};
  if (!media.youtube) media.youtube = [];
  if (!media.instagram) media.instagram = [];
  if (!media.facebook) media.facebook = '';
  return media;
}

function saveMedia(media) {
  const ok = safeSetLocalStorage(STORAGE_KEYS.media, JSON.stringify(media));
  if (!ok) return;
  if (FIREBASE_DB_URL && !FIREBASE_DB_URL.includes("your-firebase-rtdb")) {
    fetch(`${FIREBASE_DB_URL}/media.json`, {
      method: 'PUT',
      body: JSON.stringify(media)
    }).catch(e => console.warn("Firebase media save error", e));
  }
}

async function syncMediaFromFirebase() {
  if (!FIREBASE_DB_URL || FIREBASE_DB_URL.includes("your-firebase-rtdb")) return;
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/media.json`);
    if (res.ok) {
      const data = await res.json();
      if (data) {
        safeSetLocalStorage(STORAGE_KEYS.media, JSON.stringify(data));
        renderMediaLists();
      }
    }
  } catch (e) {
    console.warn("Media fetch error", e);
  }
}

function getWhatsApp() {
  return localStorage.getItem(STORAGE_KEYS.whatsapp) || '917043830602';
}

function getPassword() {
  return localStorage.getItem(STORAGE_KEYS.password) || DEFAULT_PASSWORD;
}

// ---- Toast Notification ----
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => { toast.className = 'toast'; }, 3000);
}

function safeSetLocalStorage(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (error && (error.name === 'QuotaExceededError' || error.code === 22)) {
      showToast('Storage full हो गया। बड़ी images कम करें या पुराना data हटाएं।', 'error');
      return false;
    }
    showToast('Data save नहीं हो पाया। Browser storage issue।', 'error');
    return false;
  }
}

// ============================================
// LOGIN SYSTEM
// ============================================
function checkLogin() {
  if (sessionStorage.getItem(STORAGE_KEYS.loggedIn) === 'true') {
    showAdminPanel();
  }
}

function handleLogin(e) {
  e.preventDefault();
  const lockUntil = parseInt(localStorage.getItem(STORAGE_KEYS.lockUntil) || '0', 10);
  if (Date.now() < lockUntil) {
    const mins = Math.ceil((lockUntil - Date.now()) / 60000);
    document.getElementById('loginError').textContent = `⚠️ बहुत गलत attempts. ${mins} min बाद फिर try करें।`;
    return;
  }

  const input = document.getElementById('loginPassword').value;
  if (input === getPassword()) {
    localStorage.removeItem(STORAGE_KEYS.loginAttempts);
    localStorage.removeItem(STORAGE_KEYS.lockUntil);
    sessionStorage.setItem(STORAGE_KEYS.loggedIn, 'true');
    showAdminPanel();
    syncProductsFromFirebase(); // Fetch latest on login
    syncMediaFromFirebase(); // Fetch latest media links on login
    showToast('Login successful! 🎉');
  } else {
    const attempts = parseInt(localStorage.getItem(STORAGE_KEYS.loginAttempts) || '0', 10) + 1;
    localStorage.setItem(STORAGE_KEYS.loginAttempts, String(attempts));
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      localStorage.setItem(STORAGE_KEYS.lockUntil, String(Date.now() + LOCK_MINUTES * 60 * 1000));
      localStorage.removeItem(STORAGE_KEYS.loginAttempts);
      document.getElementById('loginError').textContent = `⚠️ ${MAX_LOGIN_ATTEMPTS} गलत attempts. ${LOCK_MINUTES} min के लिए lock।`;
    } else {
      document.getElementById('loginError').textContent = `❌ गलत password! ${MAX_LOGIN_ATTEMPTS - attempts} attempts बचे हैं।`;
    }
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginPassword').focus();
  }
}

function showAdminPanel() {
  document.getElementById('loginOverlay').classList.add('hidden');
  document.getElementById('adminPanel').style.display = 'block';
}

function logout() {
  sessionStorage.removeItem(STORAGE_KEYS.loggedIn);
  location.reload();
}

function changePassword() {
  const newPass = document.getElementById('newPassword').value.trim();
  if (!newPass || newPass.length < 4) {
    showToast('Password कम से कम 4 characters का होना चाहिए।', 'error');
    return;
  }
  safeSetLocalStorage(STORAGE_KEYS.password, newPass);
  document.getElementById('newPassword').value = '';
  showToast('Password बदल दिया गया! 🔑');
}

// ---- Tab Navigation ----
function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    });
  });
}

// ============================================
// IMAGE UPLOAD SYSTEM
// ============================================
let currentImageData = '';

function initImageUpload() {
  const uploadArea = document.getElementById('imageUploadArea');
  const fileInput = document.getElementById('productImage');
  const preview = document.getElementById('imagePreview');
  const placeholder = document.getElementById('uploadPlaceholder');
  const removeBtn = document.getElementById('removeImageBtn');

  // Click to upload
  uploadArea.addEventListener('click', (e) => {
    if (e.target === removeBtn || removeBtn.contains(e.target)) return;
    fileInput.click();
  });

  // File selected
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) processImageFile(file);
  });

  // Drag & Drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processImageFile(file);
    }
  });
}

function processImageFile(file) {
  if (file.size > 3 * 1024 * 1024) {
    showToast('Image बहुत बड़ी है! 3MB से कम रखें।', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    // Resize for localStorage
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX = 500;
      let w = img.width, h = img.height;

      if (w > MAX || h > MAX) {
        if (w > h) { h = (h / w) * MAX; w = MAX; }
        else { w = (w / h) * MAX; h = MAX; }
      }

      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      currentImageData = canvas.toDataURL('image/webp', 0.70);

      showImagePreview(currentImageData);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

function showImagePreview(src) {
  const preview = document.getElementById('imagePreview');
  const placeholder = document.getElementById('uploadPlaceholder');
  const removeBtn = document.getElementById('removeImageBtn');

  preview.src = src;
  preview.classList.add('visible');
  placeholder.style.display = 'none';
  removeBtn.style.display = 'block';
}

function removeImage() {
  currentImageData = '';
  const preview = document.getElementById('imagePreview');
  const placeholder = document.getElementById('uploadPlaceholder');
  const removeBtn = document.getElementById('removeImageBtn');

  preview.src = '';
  preview.classList.remove('visible');
  placeholder.style.display = 'block';
  removeBtn.style.display = 'none';
  document.getElementById('productImage').value = '';
}

// Auto-fetch YouTube thumbnail
function fetchYtThumbnail(ytUrl) {
  const match = ytUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (match) {
    return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  }
  return null;
}

function extractYouTubeId(url) {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

async function fetchYouTubeTitle(url) {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oembedUrl);
    if (!res.ok) throw new Error('oEmbed failed');
    const data = await res.json();
    return (data && data.title) ? data.title : 'Aasha Textile — Video';
  } catch (e) {
    return 'Aasha Textile — Video';
  }
}

// ============================================
// PRODUCT MANAGEMENT
// ============================================

function handleProductSubmit(e) {
  e.preventDefault();

  const editId = document.getElementById('editProductId').value;
  const name = document.getElementById('productName').value.trim();
  const nameEnInput = document.getElementById('productNameEn').value.trim();
  const variety = document.getElementById('productVariety').value.trim();
  const rate = document.getElementById('productRate').value.trim();
  const cut = document.getElementById('productCut').value.trim() || '';
  const panna = document.getElementById('productPanna').value.trim() || '';
  const categoryInput = document.getElementById('productCategory').value;
  const dateInput = document.getElementById('productDate').value;
  const info = document.getElementById('productInfo').value.trim();
  const ytLink = document.getElementById('productYtLink').value.trim();
  const outOfStock = document.getElementById('productOutOfStock').checked;

  if (!name) {
    showToast('कम से कम कपड़े का नाम भरें।', 'error');
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  const category = categoryInput || inferCategory(name, variety);
  const date = dateInput || today;
  const nameEn = nameEnInput || name;
  const safeVariety = variety || 'N/A';
  const safeRate = rate || 'Call for price';

  const catConfig = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Other;
  const products = getProducts();

  // Determine image: manual > YT thumbnail
  let productImage = currentImageData || '';
  if (!productImage && ytLink) {
    productImage = fetchYtThumbnail(ytLink) || '';
  }

  if (editId) {
    const index = products.findIndex(p => p.id == editId);
    if (index !== -1) {
      products[index] = {
        ...products[index],
        name, nameEn, variety: safeVariety, rate: safeRate, cut, panna, category, date, info, ytLink, outOfStock,
        image: productImage,
        icon: catConfig.icon,
        gradient: catConfig.gradient
      };
      // Save image separately if it's base64 (manual upload)
      if (currentImageData) {
        saveProductImage(editId, currentImageData);
      }
      showToast('Product update हो गया! ✅');
    }
  } else {
    const newId = Date.now();
    const newProduct = {
      id: newId,
      name, nameEn, variety: safeVariety, rate: safeRate, cut, panna, category, date, info, ytLink, outOfStock,
      image: productImage,
      icon: catConfig.icon,
      gradient: catConfig.gradient,
      source: 'admin' // Mark as admin-added
    };
    products.unshift(newProduct);

    if (currentImageData) {
      saveProductImage(newId, currentImageData);
    }
    showToast('नया Product add हो गया! 🎉');
  }

  saveProducts(products);
  resetForm();
  renderAdminProducts();
}

function editProduct(id) {
  const products = getProducts();
  const product = products.find(p => p.id == id);
  if (!product) return;

  document.getElementById('editProductId').value = product.id;
  document.getElementById('productName').value = product.name || '';
  document.getElementById('productNameEn').value = product.nameEn || '';
  document.getElementById('productVariety').value = product.variety || '';
  document.getElementById('productRate').value = product.rate || '';
  document.getElementById('productCut').value = product.cut || '';
  document.getElementById('productPanna').value = product.panna || '';
  document.getElementById('productCategory').value = product.category || '';
  document.getElementById('productDate').value = product.date || '';
  document.getElementById('productInfo').value = product.info || '';
  document.getElementById('productYtLink').value = product.ytLink || '';
  document.getElementById('productOutOfStock').checked = product.outOfStock || false;

  // Load image
  const images = getProductImages();
  if (images[product.id]) {
    currentImageData = images[product.id];
    showImagePreview(currentImageData);
  } else if (product.image && product.image.startsWith('http')) {
    showImagePreview(product.image);
  }

  document.getElementById('productSubmitBtn').textContent = '✏️ Update करें';
  document.getElementById('productCancelBtn').style.display = 'inline-flex';
  document.getElementById('productForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function deleteProduct(id) {
  if (!confirm('क्या आप यह product delete करना चाहते हैं?')) return;

  let products = getProducts();
  products = products.filter(p => p.id != id);
  saveProducts(products);
  removeProductImage(id);
  renderAdminProducts();
  showToast('Product delete हो गया। 🗑️');
}

function cancelEdit() { resetForm(); }

function resetForm() {
  document.getElementById('productForm').reset();
  document.getElementById('editProductId').value = '';
  document.getElementById('productSubmitBtn').textContent = '➕ Product Add करें';
  document.getElementById('productCancelBtn').style.display = 'none';
  document.getElementById('productOutOfStock').checked = false;
  removeImage();

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('productDate').value = today;
}

function renderAdminProducts() {
  const grid = document.getElementById('adminProductGrid');
  const products = getProducts();
  const images = getProductImages();

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="admin-empty" style="grid-column: 1 / -1;">
        <div class="empty-icon">📦</div>
        <p>कोई product नहीं है। ऊपर form से add करें।<br>
        <small style="color:var(--text-muted)">या Google Sheet में data डालें — website auto-load करेगी।</small></p>
      </div>
    `;
    return;
  }

  const sorted = [...products].sort((a, b) => new Date(b.date) - new Date(a.date));

  grid.innerHTML = sorted.map(product => {
    const catConfig = CATEGORY_CONFIG[product.category] || CATEGORY_CONFIG.Other;

    // Image priority: Manual upload > YT thumbnail > Gradient
    let imageHtml = '';
    const manualImage = images[product.id];
    const ytThumb = product.ytLink ? fetchYtThumbnail(product.ytLink) : null;

    if (manualImage) {
      imageHtml = `<img src="${manualImage}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">`;
    } else if (product.image && product.image.startsWith('http')) {
      imageHtml = `<img src="${product.image}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">`;
    } else if (ytThumb) {
      imageHtml = `<img src="${ytThumb}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">`;
    } else {
      imageHtml = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${product.gradient || catConfig.gradient};font-size:2.5rem;">${product.icon || catConfig.icon}</div>`;
    }

    return `
      <div class="admin-product-card">
        <div class="admin-card-header">
          <div class="admin-card-icon" style="overflow:hidden; background:${product.gradient || catConfig.gradient}">
            ${imageHtml.includes('<img') ? imageHtml.replace('width:100%;height:100%', 'width:45px;height:45px') : (product.icon || catConfig.icon)}
          </div>
          <div>
            <div class="admin-card-title">${product.name} ${product.outOfStock ? '<span style="color:#ff4444;font-size:0.8rem;">(Out of Stock)</span>' : ''}</div>
            <div class="admin-card-subtitle">${product.nameEn || ''} — ${product.variety || ''}</div>
          </div>
        </div>
        <div class="admin-card-body">
          <div class="admin-card-meta">
            ${product.cut ? `<span class="admin-meta-tag">📏 ${product.cut}</span>` : ''}
            ${product.panna ? `<span class="admin-meta-tag">📐 ${product.panna}</span>` : ''}
            <span class="admin-meta-tag">${catConfig.icon} ${product.category}</span>
            ${product.source === 'admin' ? '<span class="admin-meta-tag" style="color:var(--gold)">📝 Admin</span>' : ''}
          </div>
          <div class="admin-card-price">${product.rate}</div>
          ${product.info ? `<div class="admin-card-info">${product.info}</div>` : ''}
          <div class="admin-card-date">📅 ${formatDateHindi(product.date)}</div>
          ${product.ytLink ? `<div class="admin-card-date">🔗 <a href="${product.ytLink}" target="_blank" style="color:var(--gold)">YouTube Video</a></div>` : ''}
          ${product.image && product.image.startsWith('http') ? '<div class="admin-card-date">🖼️ Image: YT Thumbnail</div>' : ''}
          ${images[product.id] ? '<div class="admin-card-date">🖼️ Image: Manual Upload ✅</div>' : ''}
          <div class="admin-card-actions">
            <button class="btn-admin btn-outline-admin btn-sm" onclick="editProduct(${product.id})">✏️ Edit</button>
            <button class="btn-admin btn-danger btn-sm" onclick="deleteProduct(${product.id})">🗑️ Delete</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================
// MEDIA MANAGEMENT
// ============================================

async function addYouTubeLink() {
  const input = document.getElementById('youtubeInput');
  const url = input.value.trim();
  if (!url) { showToast('YouTube link डालें।', 'error'); return; }

  const videoId = extractYouTubeId(url);
  if (!videoId) { showToast('Invalid YouTube link!', 'error'); return; }

  const media = getMedia();
  const exists = (media.youtube || []).some(item => {
    const existingUrl = typeof item === 'string' ? item : (item && item.url ? item.url : '');
    return extractYouTubeId(existingUrl) === videoId;
  });
  if (exists) {
    showToast('यह YouTube link पहले से add है।', 'error');
    return;
  }

  const title = await fetchYouTubeTitle(url);
  media.youtube.push({
    url,
    title,
    date: new Date().toLocaleDateString('en-GB')
  });
  saveMedia(media);
  input.value = '';
  renderMediaLists();
  showToast('YouTube video add हो गई! ▶️');
}

function removeYouTubeLink(index) {
  const media = getMedia();
  media.youtube.splice(index, 1);
  saveMedia(media);
  renderMediaLists();
  showToast('Video remove हो गई।');
}

function addInstagramLink() {
  const input = document.getElementById('instagramInput');
  const url = input.value.trim();
  if (!url) { showToast('Instagram link डालें।', 'error'); return; }

  const media = getMedia();
  if (media.instagram.includes(url)) {
    showToast('यह Instagram link पहले से add है।', 'error');
    return;
  }
  media.instagram.push(url);
  saveMedia(media);
  input.value = '';
  renderMediaLists();
  showToast('Instagram link add हो गई! 📷');
}

function removeInstagramLink(index) {
  const media = getMedia();
  media.instagram.splice(index, 1);
  saveMedia(media);
  renderMediaLists();
  showToast('Link remove हो गई।');
}

function saveFacebookLink() {
  const input = document.getElementById('facebookInput');
  const url = input.value.trim();
  const media = getMedia();
  media.facebook = url;
  saveMedia(media);
  renderMediaLists();
  showToast(url ? 'Facebook page save हो गया! 👍' : 'Facebook link remove हो गई।');
}

function renderMediaLists() {
  const media = getMedia();

  const ytList = document.getElementById('youtubeList');
  if (media.youtube.length > 0) {
    ytList.innerHTML = media.youtube.map((item, i) => {
      const url = typeof item === 'string' ? item : (item.url || '');
      const title = typeof item === 'string' ? 'YouTube Video' : (item.title || 'YouTube Video');
      const date = typeof item === 'string' ? '' : (item.date || '');
      const videoId = extractYouTubeId(url);
      const thumb = videoId ? `<img src="https://img.youtube.com/vi/${videoId}/default.jpg" style="width:60px;height:45px;border-radius:6px;object-fit:cover;margin-right:10px;">` : '';
      return `
        <div class="media-list-item">
          <div style="display:flex;align-items:center;overflow:hidden;">
            ${thumb}
            <span class="link-text">▶️ ${title}${date ? ` (${date})` : ''}</span>
          </div>
          <button class="btn-admin btn-danger btn-sm" onclick="removeYouTubeLink(${i})">Remove</button>
        </div>
      `;
    }).join('');
  } else {
    ytList.innerHTML = '<div class="admin-empty"><p style="font-size:0.85rem;">कोई YouTube video add नहीं हुई।</p></div>';
  }

  const igList = document.getElementById('instagramList');
  if (media.instagram.length > 0) {
    igList.innerHTML = media.instagram.map((url, i) => `
      <div class="media-list-item">
        <span class="link-text">📷 ${url.length > 45 ? url.substring(0, 45) + '...' : url}</span>
        <button class="btn-admin btn-danger btn-sm" onclick="removeInstagramLink(${i})">Remove</button>
      </div>
    `).join('');
  } else {
    igList.innerHTML = '<div class="admin-empty"><p style="font-size:0.85rem;">कोई Instagram link add नहीं हुई।</p></div>';
  }

  const fbDisplay = document.getElementById('facebookDisplay');
  if (media.facebook) {
    document.getElementById('facebookInput').value = media.facebook;
    fbDisplay.innerHTML = `<div class="media-list-item"><span class="link-text">👍 ${media.facebook}</span></div>`;
  } else {
    fbDisplay.innerHTML = '';
  }
}

// ============================================
// SETTINGS
// ============================================

function saveWhatsApp() {
  const number = document.getElementById('whatsappNumber').value.trim();
  if (!number) { showToast('WhatsApp number डालें।', 'error'); return; }
  if (!/^\d{10,15}$/.test(number)) { showToast('सही number डालें (10-15 digits, बिना +)।', 'error'); return; }
  safeSetLocalStorage(STORAGE_KEYS.whatsapp, number);
  showToast('WhatsApp number save हो गया! 📱');
}

function loadWhatsApp() {
  const number = getWhatsApp();
  if (number) document.getElementById('whatsappNumber').value = number;
}

function resetAllData() {
  if (!confirm('⚠️ यह सभी products, media, images, और settings delete कर देगा। Sure हैं?')) return;
  if (!confirm('यह undo नहीं हो सकता। फिर से confirm करें।')) return;

  saveProducts([]);
  saveMedia({ youtube: [], instagram: [], facebook: '' });
  localStorage.removeItem(STORAGE_KEYS.products);
  localStorage.removeItem(STORAGE_KEYS.media);
  localStorage.removeItem(STORAGE_KEYS.whatsapp);
  localStorage.removeItem(STORAGE_KEYS.productImages);

  renderAdminProducts();
  renderMediaLists();
  loadWhatsApp();
  resetForm();
  showToast('सब data reset हो गया! 🔄');
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  checkLogin();
  document.getElementById('loginForm').addEventListener('submit', handleLogin);

  initTabs();
  initImageUpload();

  renderAdminProducts();
  resetForm();
  renderMediaLists();
  loadWhatsApp();
  syncMediaFromFirebase();

  document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
});
