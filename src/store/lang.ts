import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Lang = 'en' | 'ar'

const translations = {
  en: {
    // Nav
    home: 'Home', products: 'Products', about: 'About', contact: 'Contact',
    search: 'Search products...', cart: 'Cart', wishlist: 'Wishlist',
    // Home
    shopNow: 'Shop Now →', viewOffers: 'View Offers',
    bestSellers: 'Best Sellers', featured: 'FEATURED',
    viewAll: 'View All →', flashSale: '⚡ Flash Sale',
    shopByCategory: 'SHOP BY CATEGORY', findYourMatch: 'Find Your Perfect Match',
    trustedBrands: 'TRUSTED BRANDS',
    // Product
    addToCart: 'Add to Cart', outOfStock: 'Out of Stock',
    inStock: 'In Stock', reviews: 'reviews',
    description: 'Description', shipping: 'Shipping & Returns',
    youMayLike: 'You May Also Like', wishlisted: '❤️ Wishlisted', wishlistBtn: '♡ Wishlist',
    // Cart
    shoppingCart: 'Shopping Cart', orderSummary: 'Order Summary',
    subtotal: 'Subtotal', delivery: 'Delivery', discount: 'Discount', total: 'Total',
    promoCode: 'Promo code', apply: 'Apply', placeOrder: '🔒 Place Order Securely',
    deliveryInfo: 'Delivery Information', fullName: 'Full Name',
    phoneNumber: 'Phone Number', address: 'Address (Street)',
    wilaya: 'Wilaya', selectWilaya: '— Select Wilaya —',
    deliveryType: 'Delivery Type', homeDelivery: 'Home', officeDelivery: 'Office', communeDelivery: 'Commune',
    deliveryCompany: 'Delivery Company', paymentMethod: 'Payment Method',
    cashOnDelivery: 'Cash on Delivery', emptyCart: 'Your cart is empty',
    continueShopping: 'Continue Shopping', printReceipt: '🖨️ Print Receipt',
    downloadReceipt: '📥 Download Receipt', orderPlaced: 'Order Placed!',
    freeDelivery: 'FREE 🎉',
    // Wishlist
    myWishlist: 'My Wishlist', emptyWishlist: 'Your wishlist is empty',
    addToWishlistMsg: '❤️ Added to wishlist!', removeFromWishlist: 'Removed from wishlist.',
    // Contact
    contactUs: 'Contact Us', sendMessage: 'Send Message →',
    firstName: 'First Name', lastName: 'Last Name', email: 'Email Address',
    phone: 'Phone Number', subject: 'Subject', message: 'Message',
    // Footer
    shop: 'Shop', information: 'Information', allRights: 'All rights reserved.',
    // Trust
    freeDeliveryBadge: 'Free Delivery', securePayment: 'Secure Payment',
    easyReturns: 'Easy Returns', naturalIngredients: '100% Natural',
  },
  ar: {
    // Nav
    home: 'الرئيسية', products: 'المنتجات', about: 'من نحن', contact: 'اتصل بنا',
    search: 'ابحث عن منتج...', cart: 'السلة', wishlist: 'المفضلة',
    // Home
    shopNow: 'تسوق الآن ←', viewOffers: 'عرض العروض',
    bestSellers: 'الأكثر مبيعاً', featured: 'مميز',
    viewAll: 'عرض الكل ←', flashSale: '⚡ تخفيضات',
    shopByCategory: 'تسوق حسب الفئة', findYourMatch: 'اختر ما يناسبك',
    trustedBrands: 'علامات موثوقة',
    // Product
    addToCart: 'أضف للسلة', outOfStock: 'نفذ من المخزون',
    inStock: 'متوفر', reviews: 'تقييم',
    description: 'الوصف', shipping: 'الشحن والإرجاع',
    youMayLike: 'قد يعجبك أيضاً', wishlisted: '❤️ في المفضلة', wishlistBtn: '♡ المفضلة',
    // Cart
    shoppingCart: 'سلة التسوق', orderSummary: 'ملخص الطلب',
    subtotal: 'المجموع الفرعي', delivery: 'التوصيل', discount: 'الخصم', total: 'الإجمالي',
    promoCode: 'كود الخصم', apply: 'تطبيق', placeOrder: '🔒 تأكيد الطلب',
    deliveryInfo: 'معلومات التوصيل', fullName: 'الاسم الكامل',
    phoneNumber: 'رقم الهاتف', address: 'العنوان (الشارع)',
    wilaya: 'الولاية', selectWilaya: '— اختر الولاية —',
    deliveryType: 'نوع التوصيل', homeDelivery: 'منزل', officeDelivery: 'مكتب', communeDelivery: 'بلدية',
    deliveryCompany: 'شركة التوصيل', paymentMethod: 'طريقة الدفع',
    cashOnDelivery: 'الدفع عند الاستلام', emptyCart: 'سلتك فارغة',
    continueShopping: 'متابعة التسوق', printReceipt: '🖨️ طباعة الوصل',
    downloadReceipt: '📥 تحميل الوصل', orderPlaced: 'تم تقديم الطلب!',
    freeDelivery: 'مجاني 🎉',
    // Wishlist
    myWishlist: 'قائمة المفضلة', emptyWishlist: 'قائمة المفضلة فارغة',
    addToWishlistMsg: '❤️ أضيف للمفضلة!', removeFromWishlist: 'حذف من المفضلة.',
    // Contact
    contactUs: 'اتصل بنا', sendMessage: 'إرسال الرسالة ←',
    firstName: 'الاسم الأول', lastName: 'اسم العائلة', email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف', subject: 'الموضوع', message: 'الرسالة',
    // Footer
    shop: 'تسوق', information: 'معلومات', allRights: 'جميع الحقوق محفوظة.',
    // Trust
    freeDeliveryBadge: 'توصيل مجاني', securePayment: 'دفع آمن',
    easyReturns: 'إرجاع سهل', naturalIngredients: '100% طبيعي',
  }
} as const

type TranslationKey = keyof typeof translations.en

interface LangStore {
  lang: Lang
  dir: 'ltr' | 'rtl'
  t: (key: TranslationKey) => string
  setLang: (lang: Lang) => void
}

export const useLang = create<LangStore>()(
  persist(
    (set, get) => ({
      lang: 'en',
      dir: 'ltr',
      t: (key: TranslationKey) => translations[get().lang][key] || translations.en[key],
      setLang: (lang: Lang) => set({ lang, dir: lang === 'ar' ? 'rtl' : 'ltr' }),
    }),
    { name: 'Pova-lang' }
  )
)

