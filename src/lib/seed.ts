// @ts-nocheck
import { db } from '@/prisma/db'
import { hashPassword } from './auth'

export async function seedDatabase() {
  console.log('🌱 Seeding database...')

  // Super Admin User
  const superAdminPassword = await hashPassword('admin123')
  const superAdmin = await db.orm.public.User.create({
    data: {
      id: 'super-admin-1',
      email: 'admin@posa360.com',
      password: superAdminPassword,
      name: 'Cem Kaya',
      role: 'SUPER_ADMIN',
    },
  })
  console.log('✅ Super admin created')

  // Tenant 1: Shop Mağaza
  const tenant1 = await db.orm.public.Tenant.create({
    data: {
      id: 'tenant-shopmagaza',
      name: 'Shop Mağaza',
      slug: 'shopmagaza',
      customDomain: null,
      status: 'ACTIVE',
      plan: 'professional',
      companyName: 'Shop Mağaza Ltd. Şti.',
      contactPerson: 'Ahmet Yılmaz',
      contactPhone: '+905551234567',
      contactEmail: 'ahmet@shopmagaza.com',
      taxNumber: '1234567890',
      monthlyFee: 299,
      lastPaymentStatus: 'PAID',
      logoUrl: null,
      primaryColor: '#2563eb',
      secondaryColor: '#ffffff',
      currency: 'TRY',
      locale: 'tr-TR',
      timezone: 'Europe/Istanbul',
      taxRate: 0.20,
      maxProducts: 500,
      maxOrders: 5000,
      maxStaff: 10,
      notes: 'Premium müşteri, tekstil sektörü',
    },
  })

  // Tenant 2: Elektronik Dünyası (with simulated custom domain)
  const tenant2 = await db.orm.public.Tenant.create({
    data: {
      id: 'tenant-elektronik',
      name: 'Elektronik Dünyası',
      slug: 'elektronikdunya',
      customDomain: 'shopcem.local', // hosts dosyasında test edilecek
      status: 'ACTIVE',
      plan: 'enterprise',
      companyName: 'Elektronik Dünyası A.Ş.',
      contactPerson: 'Mehmet Demir',
      contactPhone: '+905559876543',
      contactEmail: 'mehmet@elektronikdunya.com',
      taxNumber: '9876543210',
      monthlyFee: 599,
      lastPaymentStatus: 'PAID',
      logoUrl: null,
      primaryColor: '#059669',
      secondaryColor: '#ffffff',
      currency: 'TRY',
      locale: 'tr-TR',
      timezone: 'Europe/Istanbul',
      taxRate: 0.20,
      maxProducts: 1000,
      maxOrders: 10000,
      maxStaff: 20,
      notes: 'Özel domain kullanıyor, elektronik ürün satışı',
    },
  })
  console.log('✅ Tenants created')

  // Tenant Users (Merchant Admins)
  const merchantPassword = await hashPassword('merchant123')
  
  const merchant1 = await db.orm.public.User.create({
    data: {
      id: 'merchant-1',
      email: 'ahmet@shopmagaza.com',
      password: merchantPassword,
      name: 'Ahmet Yılmaz',
      role: 'TENANT_OWNER',
    },
  })

  await db.orm.public.TenantUser.create({
    data: {
      id: 'tenant-user-1',
      tenantId: tenant1.id,
      userId: merchant1.id,
      role: 'TENANT_OWNER',
      permissions: ['*'],
    },
  })

  const merchant2 = await db.orm.public.User.create({
    data: {
      id: 'merchant-2',
      email: 'mehmet@elektronikdunya.com',
      password: merchantPassword,
      name: 'Mehmet Demir',
      role: 'TENANT_OWNER',
    },
  })

  await db.orm.public.TenantUser.create({
    data: {
      id: 'tenant-user-2',
      tenantId: tenant2.id,
      userId: merchant2.id,
      role: 'TENANT_OWNER',
      permissions: ['*'],
    },
  })
  console.log('✅ Merchant users created')

  // Categories for Tenant 1
  const cat1 = await db.orm.public.Category.create({
    data: {
      id: 'cat-1-t-shirt',
      tenantId: tenant1.id,
      name: 'T-Shirt',
      slug: 't-shirt',
      description: 'Erkek ve kadın tişörtleri',
      isActive: true,
      sortOrder: 1,
    },
  })

  const cat2 = await db.orm.public.Category.create({
    data: {
      id: 'cat-1-pants',
      tenantId: tenant1.id,
      name: 'Pantolon',
      slug: 'pantolon',
      description: 'Kot ve kumaş pantolonlar',
      isActive: true,
      sortOrder: 2,
    },
  })

  // Categories for Tenant 2
  const cat3 = await db.orm.public.Category.create({
    data: {
      id: 'cat-2-phone',
      tenantId: tenant2.id,
      name: 'Cep Telefonu',
      slug: 'cep-telefonu',
      description: 'Akıllı telefonlar',
      isActive: true,
      sortOrder: 1,
    },
  })

  const cat4 = await db.orm.public.Category.create({
    data: {
      id: 'cat-2-laptop',
      tenantId: tenant2.id,
      name: 'Laptop',
      slug: 'laptop',
      description: 'Dizüstü bilgisayarlar',
      isActive: true,
      sortOrder: 2,
    },
  })
  console.log('✅ Categories created')

  // Brand for Tenant 1
  const brand1 = await db.orm.public.Brand.create({
    data: {
      id: 'brand-fashion',
      tenantId: tenant1.id,
      name: 'Fashion Line',
      slug: 'fashion-line',
      description: 'Premium moda markası',
      isActive: true,
    },
  })

  // Products for Tenant 1
  const product1 = await db.orm.public.Product.create({
    data: {
      id: 'prod-1-tshirt-blue',
      tenantId: tenant1.id,
      brandId: brand1.id,
      name: 'Mavi Basic T-Shirt',
      slug: 'mavi-basic-tshirt',
      description: '%100 pamuklu, rahat kesim erkek tişörtü',
      shortDesc: 'Günlük kullanım için ideal',
      sku: 'TSH-BLUE-001',
      barcode: '8690123456789',
      price: 149.90,
      compareAtPrice: 199.90,
      costPrice: 75.00,
      trackInventory: true,
      stock: 50,
      lowStockThreshold: 10,
      hasVariants: false,
      isActive: true,
      isFeatured: true,
      taxable: true,
    },
  })

  await db.orm.public.ProductCategory.create({
    data: {
      productId: product1.id,
      categoryId: cat1.id,
    },
  })

  await db.orm.public.ProductImage.create({
    data: {
      id: 'img-prod-1-1',
      productId: product1.id,
      url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
      altText: 'Mavi T-Shirt',
      sortOrder: 0,
    },
  })

  const product2 = await db.orm.public.Product.create({
    data: {
      id: 'prod-1-jeans',
      tenantId: tenant1.id,
      brandId: brand1.id,
      name: 'Slim Fit Kot Pantolon',
      slug: 'slim-fit-kot-pantolon',
      description: 'Modern kesim, yüksek kaliteli denim kumaş',
      shortDesc: 'Şık ve rahat',
      sku: 'PNT-JEANS-001',
      price: 349.90,
      compareAtPrice: 449.90,
      costPrice: 175.00,
      trackInventory: true,
      stock: 30,
      hasVariants: true,
      isActive: true,
      isFeatured: true,
      taxable: true,
    },
  })

  await db.orm.public.ProductCategory.create({
    data: {
      productId: product2.id,
      categoryId: cat2.id,
    },
  })

  await db.orm.public.ProductImage.create({
    data: {
      id: 'img-prod-2-1',
      productId: product2.id,
      url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
      altText: 'Kot Pantolon',
      sortOrder: 0,
    },
  })

  // Product variants for jeans
  await db.orm.public.ProductVariant.create({
    data: {
      id: 'var-jeans-32',
      productId: product2.id,
      name: 'Beden: 32',
      sku: 'PNT-JEANS-001-32',
      price: 349.90,
      stock: 10,
      isActive: true,
      options: JSON.stringify({ Beden: '32' }),
    },
  })

  await db.orm.public.ProductVariant.create({
    data: {
      id: 'var-jeans-34',
      productId: product2.id,
      name: 'Beden: 34',
      sku: 'PNT-JEANS-001-34',
      price: 349.90,
      stock: 15,
      isActive: true,
      options: JSON.stringify({ Beden: '34' }),
    },
  })

  // Products for Tenant 2
  const product3 = await db.orm.public.Product.create({
    data: {
      id: 'prod-2-iphone',
      tenantId: tenant2.id,
      name: 'iPhone 15 Pro',
      slug: 'iphone-15-pro',
      description: 'Apple iPhone 15 Pro, 256GB, Titanyum',
      shortDesc: 'En yeni iPhone',
      sku: 'IPH-15PRO-256',
      price: 54999.00,
      compareAtPrice: 59999.00,
      costPrice: 45000.00,
      trackInventory: true,
      stock: 15,
      lowStockThreshold: 5,
      hasVariants: false,
      isActive: true,
      isFeatured: true,
      taxable: true,
    },
  })

  await db.orm.public.ProductCategory.create({
    data: {
      productId: product3.id,
      categoryId: cat3.id,
    },
  })

  await db.orm.public.ProductImage.create({
    data: {
      id: 'img-prod-3-1',
      productId: product3.id,
      url: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=500',
      altText: 'iPhone 15 Pro',
      sortOrder: 0,
    },
  })

  const product4 = await db.orm.public.Product.create({
    data: {
      id: 'prod-2-macbook',
      tenantId: tenant2.id,
      name: 'MacBook Pro 14"',
      slug: 'macbook-pro-14',
      description: 'Apple MacBook Pro 14", M3 Pro chip, 18GB RAM, 512GB SSD',
      shortDesc: 'Profesyoneller için',
      sku: 'MBP-14-M3-512',
      price: 89999.00,
      compareAtPrice: 94999.00,
      costPrice: 75000.00,
      trackInventory: true,
      stock: 8,
      hasVariants: false,
      isActive: true,
      isFeatured: true,
      taxable: true,
    },
  })

  await db.orm.public.ProductCategory.create({
    data: {
      productId: product4.id,
      categoryId: cat4.id,
    },
  })

  await db.orm.public.ProductImage.create({
    data: {
      id: 'img-prod-4-1',
      productId: product4.id,
      url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
      altText: 'MacBook Pro',
      sortOrder: 0,
    },
  })
  console.log('✅ Products created')

  // Demo customers
  const customerPassword = await hashPassword('customer123')
  
  const customer1 = await db.orm.public.Customer.create({
    data: {
      id: 'cust-1',
      tenantId: tenant1.id,
      email: 'musteri@example.com',
      password: customerPassword,
      firstName: 'Ayşe',
      lastName: 'Kara',
      phone: '+905551112233',
      tckn: '12345678901',
    },
  })

  await db.orm.public.Address.create({
    data: {
      id: 'addr-1',
      customerId: customer1.id,
      title: 'Ev',
      firstName: 'Ayşe',
      lastName: 'Kara',
      phone: '+905551112233',
      addressLine1: 'Atatürk Caddesi No: 123 Daire: 4',
      il: 'Bursa',
      ilce: 'Nilüfer',
      postalCode: '16000',
      isDefault: true,
    },
  })

  const customer2 = await db.orm.public.Customer.create({
    data: {
      id: 'cust-2',
      tenantId: tenant2.id,
      email: 'ali@example.com',
      password: customerPassword,
      firstName: 'Ali',
      lastName: 'Yıldız',
      phone: '+905554445566',
      tckn: '98765432109',
    },
  })

  await db.orm.public.Address.create({
    data: {
      id: 'addr-2',
      customerId: customer2.id,
      title: 'İş',
      firstName: 'Ali',
      lastName: 'Yıldız',
      phone: '+905554445566',
      addressLine1: 'İstiklal Caddesi No: 456',
      il: 'İstanbul',
      ilce: 'Beyoğlu',
      postalCode: '34000',
      isDefault: true,
    },
  })
  console.log('✅ Customers created')

  // Shipping rules
  await db.orm.public.ShippingRule.create({
    data: {
      id: 'ship-rule-1-flat',
      tenantId: tenant1.id,
      name: 'Standart Kargo',
      type: 'flat',
      cost: 29.90,
      isActive: true,
      priority: 1,
    },
  })

  await db.orm.public.ShippingRule.create({
    data: {
      id: 'ship-rule-1-free',
      tenantId: tenant1.id,
      name: 'Ücretsiz Kargo',
      type: 'free_shipping',
      minOrderAmount: 500.00,
      cost: 0,
      isActive: true,
      priority: 0,
    },
  })

  await db.orm.public.ShippingRule.create({
    data: {
      id: 'ship-rule-2-flat',
      tenantId: tenant2.id,
      name: 'Hızlı Kargo',
      type: 'flat',
      cost: 49.90,
      isActive: true,
      priority: 1,
    },
  })
  console.log('✅ Shipping rules created')

  // Coupons
  await db.orm.public.Coupon.create({
    data: {
      id: 'coupon-1',
      tenantId: tenant1.id,
      code: 'HOSGELDIN',
      description: 'Yeni müşterilere hoşgeldin indirimi',
      type: 'percentage',
      value: 10,
      minOrderAmount: 200,
      isActive: true,
    },
  })

  await db.orm.public.Coupon.create({
    data: {
      id: 'coupon-2',
      tenantId: tenant2.id,
      code: 'TEKNO50',
      description: '50 TL indirim kuponu',
      type: 'fixed_amount',
      value: 50,
      minOrderAmount: 500,
      isActive: true,
    },
  })
  console.log('✅ Coupons created')

  // CMS Pages
  await db.orm.public.Page.create({
    data: {
      id: 'page-1-about',
      tenantId: tenant1.id,
      title: 'Hakkımızda',
      slug: 'hakkimizda',
      content: '<h1>Hakkımızda</h1><p>Shop Mağaza olarak sizlere en kaliteli ürünleri sunuyoruz.</p>',
      isActive: true,
      metaTitle: 'Hakkımızda - Shop Mağaza',
      metaDescription: 'Shop Mağaza hakkında bilgi',
    },
  })

  await db.orm.public.Page.create({
    data: {
      id: 'page-2-about',
      tenantId: tenant2.id,
      title: 'Hakkımızda',
      slug: 'hakkimizda',
      content: '<h1>Elektronik Dünyası</h1><p>Teknoloji ürünlerinde güvenilir adresiniz.</p>',
      isActive: true,
      metaTitle: 'Hakkımızda - Elektronik Dünyası',
      metaDescription: 'Elektronik Dünyası hakkında',
    },
  })
  console.log('✅ CMS pages created')

  console.log('✅ Database seeding completed!')
  console.log('\n📋 Demo Credentials:')
  console.log('Super Admin: admin@posa360.com / admin123')
  console.log('Merchant 1 (Shop Mağaza): ahmet@shopmagaza.com / merchant123')
  console.log('Merchant 2 (Elektronik Dünyası): mehmet@elektronikdunya.com / merchant123')
  console.log('Customer 1: musteri@example.com / customer123')
  console.log('Customer 2: ali@example.com / customer123')
  console.log('\n🌐 Test URLs:')
  console.log('Super Admin: http://localhost:43210/super-admin')
  console.log('Tenant 1 Storefront (subdomain): http://shopmagaza.localhost:43210')
  console.log('Tenant 1 Admin: http://shopmagaza.localhost:43210/admin')
  console.log('Tenant 2 Storefront (custom domain): http://shopcem.local:43210 (add to /etc/hosts)')
  console.log('Tenant 2 Admin: http://admin.shopcem.local:43210 (add to /etc/hosts)')
}
