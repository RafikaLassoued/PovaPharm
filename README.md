# 🌿 Pova Pharm — Next.js + Prisma

متجر إلكتروني كامل لـ POVA Pharm مبني بـ Next.js 14 + Prisma + PostgreSQL.

---

## 🚀 إعداد المشروع

### 1. تثبيت الحزم
```bash
npm install
```

### 2. إعداد متغيرات البيئة
```bash
cp .env.example .env
# ثم عدّل .env وضع بيانات قاعدة البيانات وJWT_SECRET
```

### 3. إعداد قاعدة البيانات
```bash
npm run db:push      # رفع الـ schema
npm run db:seed      # بيانات أولية (منتجات + admin + promo codes)
```

### 4. تشغيل المشروع
```bash
npm run dev
```

---

## 🔐 Admin Dashboard

### رابط الدخول السري
```
http://localhost:3000/dashboard-secure-x7k2
```
> ⚠️ هذا الرابط غير مرتبط بأي قائمة ولا يظهر للزوار العاديين.

### بيانات الدخول الافتراضية (بعد الـ seed)
```
Email:    admin@lavapharm.dz
Password: Admin@2026!
```
> ✅ غيّر كلمة المرور فور النشر!

### كيف تغيّر كلمة مرور الـ Admin؟
```bash
# من Prisma Studio
npm run db:studio

# أو عبر Node.js
node -e "
const bcrypt = require('bcryptjs');
bcrypt.hash('NewPassword123!', 12).then(h => console.log(h));
"
# ثم ضع الـ hash في حقل passwordHash في جدول Admin
```

---

## 🛡️ نظام الحماية

| الطبقة | التقنية | التفاصيل |
|--------|---------|----------|
| Middleware | Next.js Middleware | يحمي كل مسارات `/admin/*` |
| Server Component | `getSession()` | فحص ثانٍ من الخادم مباشرة |
| JWT | `jose` (HS256) | مخزن في HttpOnly Cookie |
| Brute-force | Rate limiting | حظر IP بعد 5 محاولات فاشلة |
| Timing Attack | bcrypt compare | وقت ثابت حتى للإيميل غير الموجود |
| User Enumeration | رسالة موحدة | نفس رسالة الخطأ للإيميل والكلمة |
| SEO | `robots: noindex` | لا تُفهرس صفحات الإدارة |

---

## 📁 هيكل المشروع

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/        ← POST تسجيل الدخول / DELETE تسجيل الخروج
│   │   │   └── session/      ← GET التحقق من الجلسة
│   │   ├── products/         ← CRUD
│   │   ├── orders/           ← إنشاء + تحديث حالة
│   │   ├── contact/          ← رسائل التواصل
│   │   └── cart/promo/       ← التحقق من كود الخصم
│   ├── dashboard-secure-x7k2/  ← صفحة تسجيل الدخول المخفية
│   ├── admin/                ← لوحة الإدارة (محمية)
│   ├── products/             ← صفحة المنتجات
│   ├── cart/                 ← السلة والدفع
│   └── contact/              ← التواصل
├── lib/
│   ├── auth.ts               ← JWT utilities
│   └── prisma.ts             ← Prisma client
├── middleware.ts             ← حماية مسارات /admin
└── store/
    └── cart.ts               ← Zustand cart
```

---

## 🗄️ Prisma Commands
```bash
npm run db:push      # رفع schema بدون migration
npm run db:migrate   # إنشاء migration
npm run db:seed      # seed البيانات
npm run db:studio    # Prisma Studio (GUI)
npm run db:generate  # إعادة توليد client
```

---

## 🔑 Promo Codes
| Code | Discount |
|------|----------|
| WELCOME10 | 10% |
| SUMMER40  | 40% |
| LOYAL20   | 20% |

---

## 📞 Contact
- El Oued, Algeria
- © 2026 Pova Pharm — by Rafika Lssoued

