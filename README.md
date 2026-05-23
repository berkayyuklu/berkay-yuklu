# 🌟 Berkay Yüklü — Kişisel Site

Modern, Firebase destekli kişisel blog ve portal sitesi.

---

## 📁 Dosya Yapısı

```
berkay-yuklu/
├── index.html          → Ana sayfa
├── blog.html           → Blog listesi
├── post.html           → Tekil yazı sayfası
├── shortcuts.html      → Projeler / Kısayollar
├── subscribe.html      → Abonelik planları
├── premium.html        → Premium içerikler
├── payment.html        → Ödeme sayfası
├── profile.html        → Profil düzenleme
├── about.html          → Hakkında
├── contact.html        → İletişim
├── firestore.rules     → Firebase güvenlik kuralları
├── css/
│   └── style.css       → Tüm stiller
├── js/
│   ├── firebase-config.js  → Firebase + Auth
│   └── app.js              → Ana JS
└── admin/
    └── index.html      → Admin paneli
```

---

## 🚀 KURULUM ADIMLARI

### 1. Firebase Projesi Oluştur

1. [console.firebase.google.com](https://console.firebase.google.com) adresine git
2. **"Add project"** → Proje adı gir (örn: `berkay-yuklu`)
3. Google Analytics: isteğe bağlı → **Continue**

### 2. Firebase Servisleri Etkinleştir

**Authentication:**
- Sol menü → **Authentication** → **Get started**
- **Sign-in method** sekmesi:
  - ✅ Email/Password → Enable
  - ✅ Google → Enable (Project support email ekle)
  - ✅ Facebook → Enable (Meta Developer hesabı gerekir)

**Firestore:**
- Sol menü → **Firestore Database** → **Create database**
- **Start in test mode** → İstediğin bölge → **Enable**

**Storage:**
- Sol menü → **Storage** → **Get started** → **Start in test mode**

### 3. Firebase Config Bilgilerini Al

1. **Project Settings** (dişli ikon) → **General**
2. Aşağı kaydır → **Your apps** → **</>** (Web) → Uygulama kaydet
3. `firebaseConfig` objesini kopyala

### 4. Config'i Siteye Ekle

`js/firebase-config.js` dosyasını aç ve en üstteki `firebaseConfig` objesini kendi bilgilerinle değiştir:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",           // ← senin key'in
  authDomain: "berkay-yuklu.firebaseapp.com",
  projectId: "berkay-yuklu",
  storageBucket: "berkay-yuklu.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 5. Firestore Güvenlik Kuralları

1. Firebase Console → **Firestore** → **Rules** sekmesi
2. `firestore.rules` dosyasının içeriğini kopyalayıp yapıştır
3. **Publish** butonuna bas

### 6. Admin Hesabı

`yukluberkay@gmail.com` e-postasıyla sitede kayıt ol. Sistem otomatik olarak seni admin tanıyacak. Admin paneline `/admin/index.html` adresinden erişirsin.

---

## 🌐 GitHub Pages ile Yayınlama

1. GitHub'da yeni repo oluştur: `berkay-yuklu`
2. Tüm dosyaları repoya yükle (drag & drop veya git push)
3. Repo **Settings** → **Pages** → **Source:** `main` branch, `/ (root)` → **Save**
4. Birkaç dakika sonra `https://KULLANICIADIN.github.io/berkay-yuklu` adresinde yayında!

---

## 💳 Iyzico Ödeme Entegrasyonu

1. [iyzico.com](https://iyzico.com) → Ücretsiz hesap aç
2. Dashboard → **Ayarlar** → API anahtarlarını al
3. Sitende **Admin Panel** → **Ödemeler** bölümüne gidip API key ve Secret key'i gir
4. Gerçek ödeme için **production** moduna al

> ⚠️ **Not:** Tam Iyzico entegrasyonu için backend (Firebase Functions) gerekir. Şu an demo mod aktif — ödeme formu doldurulunca kullanıcı otomatik abone yapılır. Gerçek ödeme almak için Firebase Functions kurulumu gerekir.

---

## ✨ Özellikler

| Özellik | Açıklama |
|---------|----------|
| 📝 Blog | Gönderi yayınlama, HTML içerik, resim |
| ⭐ Öne Çıkanlar | 5 sn'de bir geçen slider |
| 🔒 Premium | Yalnızca abonelere özel içerik |
| 💳 Abonelik | Plan yönetimi, ödeme sayfası |
| 👤 Profil | Fotoğraf yükleme, bio düzenleme |
| 💬 Yorumlar | Yanıt, beğeni, admin kalp rozeti |
| 🔗 Kısayollar | GitHub projeleri ve diğer siteler |
| ⚙️ Admin Panel | Gönderi, kullanıcı, plan, ödeme yönetimi |
| 🔑 Auth | E-posta, Google, Facebook girişi |
| 📱 Responsive | Mobil uyumlu tasarım |

---

## 🎨 Renk Teması

- **Arka plan:** Koyu (#0a0a0b)
- **Vurgu:** Metalik altın (#c8963e)
- **Yazı:** Kırık beyaz (#f0ede8)
- **Font:** Playfair Display (başlıklar) + DM Sans (metin)

---

## 📞 Destek

E-posta: yukluberkay@gmail.com
