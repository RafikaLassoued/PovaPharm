//import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('⏳ Starting seed...')

  // Seed Admin Account
  const passwordHash = await bcrypt.hash('Admin@2026!', 12)
  await prisma.admin.upsert({
    where: { email: 'admin@povapharm.dz' },
    update: {},
    create: {
      email: 'admin@povapharm.dz',
      passwordHash,
      name: 'Super Admin',
      role: 'admin',
    },
  })
  console.log('✅ Admin created: admin@povapharm.dz / Admin@2026!')

  // Seed Promo Codes
  await prisma.promoCode.createMany({
    data: [
      { code: 'WELCOME10', discount: 0.10, type: 'percentage', active: true },
      { code: 'SUMMER40', discount: 0.40, type: 'percentage', active: true },
      { code: 'LOYAL20', discount: 0.20, type: 'percentage', active: true },
    ],
    skipDuplicates: true,
  })
  console.log('✅ Promo codes created')

  // Seed Static Pages
  const pages = [
    {
      slug: 'about',
      title: 'About Us',
      content: `<p>Welcome to Pova Pharm, your trusted destination for premium beauty and skincare products in Algeria. Founded with a passion for natural beauty and wellness, we bring you the finest selection of cosmetics, skincare, and haircare products from leading brands.</p>

<h2>Our Story</h2>
<p>Established in El Oued, Algeria, Pova Pharm has been serving beauty enthusiasts across the country for years. We believe that everyone deserves access to high-quality beauty products that enhance natural beauty and boost confidence.</p>

<h2>Our Mission</h2>
<p>To provide authentic, effective beauty solutions that are safe for all skin types and deliver real results. We carefully curate our product range to ensure only the best makes it to our shelves.</p>

<h2>Why Choose Pova Pharm?</h2>
<ul>
<li><strong>Premium Quality:</strong> Only authentic products from trusted brands</li>
<li><strong>Expert Advice:</strong> Our team provides personalized beauty recommendations</li>
<li><strong>Fast Delivery:</strong> Quick and reliable shipping across Algeria</li>
<li><strong>Customer Satisfaction:</strong> Your happiness is our priority</li>
</ul>`
    },
    {
      slug: 'privacy',
      title: 'Privacy Policy',
      content: `<p>Last updated: January 1, 2025</p>

<h2>1. Information We Collect</h2>
<p>We collect information you provide directly to us, including name, email address, phone number, delivery address, and payment information when you make a purchase or create an account.</p>

<h2>2. How We Use Your Information</h2>
<p>We use your information to process orders, send order confirmations and shipping updates, provide customer support, send promotional offers (with your consent), and improve our website and services.</p>

<h2>3. Data Security</h2>
<p>All data is transmitted using SSL/TLS encryption. We use industry-standard security measures to protect your personal information and payment data from unauthorized access.</p>

<h2>4. Payment Security</h2>
<p>We do not store credit card information on our servers. All payment transactions are processed through secure payment gateways that comply with PCI-DSS standards.</p>

<h2>5. Cookies</h2>
<p>We use cookies to enhance your browsing experience, remember your preferences, and analyze website traffic. You can control cookie settings through your browser.</p>

<h2>6. Third-Party Sharing</h2>
<p>We do not sell your personal data to third parties. We may share data with trusted delivery partners and payment processors solely for order fulfillment purposes.</p>

<h2>7. Your Rights</h2>
<p>You have the right to access, correct, or delete your personal data at any time. Contact us at contact@povapharm.dz to exercise these rights.</p>

<h2>8. Contact Us</h2>
<p>For any privacy-related questions, please contact our Data Protection Officer at: contact@povapharm.dz</p>`
    },
    {
      slug: 'terms',
      title: 'Terms of Use',
      content: `<p>Last updated: January 1, 2025</p>

<h2>1. Acceptance of Terms</h2>
<p>By accessing and using Pova Pharm website and services, you accept and agree to be bound by the terms and provision of this agreement.</p>

<h2>2. Use License</h2>
<p>Permission is granted to temporarily download one copy of the materials on Pova Pharm's website for personal, non-commercial transitory viewing only.</p>

<h2>3. Disclaimer</h2>
<p>The materials on Pova Pharm's website are provided on an 'as is' basis. Pova Pharm makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>

<h2>4. Limitations</h2>
<p>In no event shall Pova Pharm or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Pova Pharm's website.</p>

<h2>5. Accuracy of Materials</h2>
<p>The materials appearing on Pova Pharm's website could include technical, typographical, or photographic errors. Pova Pharm does not warrant that any of the materials on its website are accurate, complete, or current.</p>

<h2>6. Links</h2>
<p>Pova Pharm has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site.</p>

<h2>7. Modifications</h2>
<p>Pova Pharm may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.</p>

<h2>8. Governing Law</h2>
<p>These terms and conditions are governed by and construed in accordance with the laws of Algeria and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.</p>`
    },
    {
      slug: 'delivery-info',
      title: 'Delivery Information',
      content: `<p>At Pova Pharm, we strive to deliver your beauty products quickly and safely across Algeria. Here's everything you need to know about our delivery options.</p>

<h2>Delivery Options</h2>
<p>We offer multiple delivery options to suit your needs:</p>
<ul>
<li><strong>Home Delivery:</strong> Direct delivery to your doorstep</li>
<li><strong>Office Delivery:</strong> Delivery to your workplace</li>
<li><strong>Commune Delivery:</strong> Delivery to your local commune office</li>
</ul>

<h2>Delivery Times</h2>
<p>Orders are typically processed within 1-2 business days. Delivery times vary by location:</p>
<ul>
<li><strong>El Oued:</strong> 1-2 days</li>
<li><strong>Major Cities:</strong> 2-4 days</li>
<li><strong>Other Locations:</strong> 3-7 days</li>
</ul>

<h2>Free Delivery</h2>
<p>Enjoy free delivery on all orders over 10,000 DZD! For orders under this amount, standard delivery fees apply based on your location and chosen delivery method.</p>

<h2>Tracking Your Order</h2>
<p>Once your order ships, you'll receive a tracking number via SMS and email. You can track your package status through our website or by contacting our customer service.</p>`
    },
    {
      slug: 'returns-policy',
      title: 'Returns Policy',
      content: `<p>At Pova Pharm, we want you to be completely satisfied with your purchase. If you're not happy with your products, we're here to help.</p>

<h2>Return Window</h2>
<p>You have 14 days from the date of delivery to return unused, unopened products in their original packaging.</p>

<h2>Return Conditions</h2>
<p>To be eligible for a return:</p>
<ul>
<li>Products must be unused and in original packaging</li>
<li>Products must be in resalable condition</li>
<li>Return request must be made within 14 days of delivery</li>
<li>Original receipt or order confirmation required</li>
</ul>

<h2>How to Return</h2>
<p>Contact our customer service team to initiate a return. We'll provide you with a return authorization and shipping instructions.</p>

<h2>Refunds</h2>
<p>Refunds are processed within 5-7 business days after we receive your returned items. Refunds will be issued to the original payment method.</p>

<h2>Exchanges</h2>
<p>We offer exchanges for different sizes, colors, or products of equal or lesser value. Additional payment may be required for exchanges of higher value.</p>

<h2>Non-Returnable Items</h2>
<p>The following items cannot be returned:</p>
<ul>
<li>Opened or used products</li>
<li>Personal care items for hygiene reasons</li>
<li>Custom or personalized products</li>
</ul>`
    }
  ]

  for (const page of pages) {
    await prisma.staticPage.upsert({
      where: { slug: page.slug },
      update: { title: page.title, content: page.content },
      create: page,
    })
  }

  console.log('✅ Static pages created/updated')
  console.log('✅ Seed complete!')
}

main().catch(console.error).finally(() => prisma.$disconnect())

