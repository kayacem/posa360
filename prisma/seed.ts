import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { buildOrderAddressSnapshot } from '../src/lib/order-address'
import { computeOrderTotals } from '../src/lib/order-totals'

const prisma = new PrismaClient()

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

function monthsAgo(n: number): Date {
  const d = new Date()
  d.setMonth(d.getMonth() - n)
  return d
}

function periodLabel(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

async function main() {
  console.log('🌱 Seeding database...')

  await prisma.user.create({
    data: {
      email: 'admin@posa360.com',
      name: 'Cem Kaya',
      password: await hashPassword('admin123'),
      role: 'SUPER_ADMIN',
    },
  })
  console.log('✅ Super admin created')

  const tenant1CreatedAt = monthsAgo(8)
  const tenant1 = await prisma.tenant.create({
    data: {
      name: 'Shop Mağaza',
      slug: 'shopmagaza',
      status: 'ACTIVE',
      plan: 'professional',
      companyName: 'Shop Mağaza Ticaret A.Ş.',
      contactPerson: 'Ahmet Yılmaz',
      contactEmail: 'ahmet@shopmagaza.com',
      contactPhone: '0212 555 0101',
      taxNumber: '1234567890',
      address: 'Caferağa Mah. Moda Cad. No:12 Kadıköy/İstanbul',
      monthlyFee: 299,
      lastPaymentDate: monthsAgo(0),
      lastPaymentStatus: 'PAID',
      nextPaymentDue: (() => {
        const d = new Date()
        d.setMonth(d.getMonth() + 1)
        d.setDate(1)
        return d
      })(),
      primaryColor: '#0f766e',
      secondaryColor: '#ffffff',
      bannerUrl: null,
      createdAt: tenant1CreatedAt,
    },
  })

  await prisma.user.create({
    data: {
      email: 'ahmet@shopmagaza.com',
      name: 'Ahmet Yılmaz',
      password: await hashPassword('merchant123'),
      role: 'TENANT_OWNER',
      tenantUsers: {
        create: {
          tenantId: tenant1.id,
          role: 'TENANT_OWNER',
          permissions: ['orders', 'products', 'settings', 'staff'],
        },
      },
    },
  })

  // Staff user for tenant 1
  await prisma.user.create({
    data: {
      email: 'staff@shopmagaza.com',
      name: 'Zeynep Staff',
      password: await hashPassword('staff123'),
      role: 'TENANT_STAFF',
      tenantUsers: {
        create: {
          tenantId: tenant1.id,
          role: 'TENANT_STAFF',
          permissions: ['orders', 'products'],
        },
      },
    },
  })

  const tenant2CreatedAt = monthsAgo(5)
  const tenant2 = await prisma.tenant.create({
    data: {
      name: 'Elektronik Dünyası',
      slug: 'elektronikdunya',
      customDomain: 'shopcem.local',
      status: 'ACTIVE',
      plan: 'basic',
      companyName: 'Elektronik Dünyası Ltd. Şti.',
      contactPerson: 'Mehmet Demir',
      contactEmail: 'mehmet@elektronikdunya.com',
      contactPhone: '0216 444 0202',
      taxNumber: '9876543210',
      address: 'Levent Mah. Büyükdere Cad. No:45 Beşiktaş/İstanbul',
      monthlyFee: 149,
      lastPaymentDate: monthsAgo(1),
      lastPaymentStatus: 'OVERDUE',
      nextPaymentDue: monthsAgo(0),
      primaryColor: '#1d4ed8',
      secondaryColor: '#ffffff',
      createdAt: tenant2CreatedAt,
    },
  })

  await prisma.user.create({
    data: {
      email: 'mehmet@elektronikdunya.com',
      name: 'Mehmet Demir',
      password: await hashPassword('merchant123'),
      role: 'TENANT_OWNER',
      tenantUsers: {
        create: {
          tenantId: tenant2.id,
          role: 'TENANT_OWNER',
          permissions: ['orders', 'products', 'settings', 'staff'],
        },
      },
    },
  })

  await prisma.domainVerification.create({
    data: {
      tenantId: tenant2.id,
      domain: 'shopcem.local',
      verificationToken: 'posa360-verify-seed-shopcem-local',
      isVerified: true,
      verifiedAt: new Date(),
      sslStatus: 'active',
      requiredRecords: JSON.stringify([
        { type: 'TXT', host: '_posa360-verification.shopcem.local', value: 'posa360-verify-seed-shopcem-local' },
      ]),
    },
  })
  console.log('✅ 2 tenants, owners, staff, and verified custom domain created')

  // Tenant payments (last 6 months each)
  for (const tenant of [
    { t: tenant1, fee: 299, created: tenant1CreatedAt },
    { t: tenant2, fee: 149, created: tenant2CreatedAt },
  ]) {
    for (let m = 5; m >= 0; m--) {
      const periodDate = monthsAgo(m)
      const period = periodLabel(periodDate)
      const dueDate = new Date(periodDate.getFullYear(), periodDate.getMonth() + 1, 5)
      const isCurrent = m === 0
      const isOverdueTenant2 = tenant.t.id === tenant2.id && m === 0
      const status = isOverdueTenant2
        ? 'OVERDUE'
        : m === 0 && tenant.t.id === tenant1.id
          ? 'PAID'
          : m > 0
            ? 'PAID'
            : 'PENDING'
      await prisma.tenantPayment.create({
        data: {
          tenantId: tenant.t.id,
          period,
          amount: tenant.fee,
          status: status as 'PAID' | 'PENDING' | 'OVERDUE',
          dueDate,
          paidAt: status === 'PAID' ? new Date(dueDate.getTime() - 2 * 86400000) : null,
        },
      })
    }
  }
  console.log('✅ TenantPayment history created')

  const customer1 = await prisma.customer.create({
    data: {
      tenantId: tenant1.id,
      email: 'musteri@example.com',
      firstName: 'Ayşe',
      lastName: 'Yıldız',
      phone: '5551234567',
    },
  })

  const customer2 = await prisma.customer.create({
    data: {
      tenantId: tenant1.id,
      email: 'ali@example.com',
      firstName: 'Ali',
      lastName: 'Kaya',
      phone: '5559876543',
    },
  })

  const product1 = await prisma.product.create({
    data: {
      tenantId: tenant1.id,
      name: 'Premium T-Shirt',
      slug: 'premium-tshirt',
      description: 'Yüksek kaliteli pamuklu t-shirt',
      price: 199.99,
      stock: 100,
      isActive: true,
      isFeatured: true,
    },
  })

  await prisma.productVariant.create({
    data: {
      productId: product1.id,
      name: 'Small - Siyah',
      sku: 'PTS-S-BLK',
      price: 199.99,
      stock: 25,
      isActive: true,
      options: JSON.stringify({ size: 'S', color: 'Siyah' }),
    },
  })

  await prisma.productVariant.create({
    data: {
      productId: product1.id,
      name: 'Medium - Beyaz',
      sku: 'PTS-M-WHT',
      price: 199.99,
      stock: 30,
      isActive: true,
      options: JSON.stringify({ size: 'M', color: 'Beyaz' }),
    },
  })

  const product2 = await prisma.product.create({
    data: {
      tenantId: tenant1.id,
      name: 'Klasik Jean',
      slug: 'klasik-jean',
      description: 'Rahat kesim kot pantolon',
      price: 349.99,
      stock: 50,
      isActive: true,
      isFeatured: true,
    },
  })

  await prisma.productVariant.create({
    data: {
      productId: product2.id,
      name: '32 - Mavi',
      sku: 'JEN-32-BLU',
      price: 349.99,
      stock: 20,
      isActive: true,
      options: JSON.stringify({ size: '32', color: 'Mavi' }),
    },
  })

  const product3 = await prisma.product.create({
    data: {
      tenantId: tenant2.id,
      name: 'Wireless Mouse',
      slug: 'wireless-mouse',
      description: 'Ergonomik kablosuz fare',
      price: 149.99,
      stock: 75,
      isActive: true,
      isFeatured: true,
    },
  })

  await prisma.productVariant.create({
    data: {
      productId: product3.id,
      name: 'Standard - Siyah',
      sku: 'WM-STD-BLK',
      price: 149.99,
      stock: 75,
      isActive: true,
      options: JSON.stringify({ color: 'Siyah' }),
    },
  })

  const product4 = await prisma.product.create({
    data: {
      tenantId: tenant2.id,
      name: 'Mechanical Keyboard',
      slug: 'mechanical-keyboard',
      description: 'RGB mekanik klavye',
      price: 899.99,
      stock: 30,
      isActive: true,
      isFeatured: true,
    },
  })

  await prisma.productVariant.create({
    data: {
      productId: product4.id,
      name: 'Red Switch - RGB',
      sku: 'MKB-RED-RGB',
      price: 899.99,
      stock: 30,
      isActive: true,
      options: JSON.stringify({ switch: 'Red', backlight: 'RGB' }),
    },
  })
  console.log('✅ 4 products with variants created')

  async function createOrder(opts: {
    tenantId: string
    customer: { id: string; email: string; firstName: string; lastName: string; phone: string | null }
    orderNumber: string
    status: 'DELIVERED' | 'SHIPPED' | 'PREPARING' | 'CONFIRMED'
    productId: string
    productName: string
    variantName: string
    price: number
    daysAgo: number
    address: { line1: string; line2: string; district: string; city: string; postalCode: string }
  }) {
    const quantity = 1
    const totals = computeOrderTotals([{ price: opts.price, quantity }])
    const createdAt = new Date(Date.now() - opts.daysAgo * 86400000)
    const addressJson = buildOrderAddressSnapshot({
      firstName: opts.customer.firstName,
      lastName: opts.customer.lastName,
      phone: opts.customer.phone || undefined,
      line1: opts.address.line1,
      line2: opts.address.line2,
      district: opts.address.district,
      city: opts.address.city,
      postalCode: opts.address.postalCode,
      country: 'Türkiye',
    })

    const order = await prisma.order.create({
      data: {
        tenantId: opts.tenantId,
        customerId: opts.customer.id,
        customerEmail: opts.customer.email,
        customerName: `${opts.customer.firstName} ${opts.customer.lastName}`,
        customerPhone: opts.customer.phone,
        orderNumber: opts.orderNumber,
        status: opts.status,
        subtotal: totals.subtotal,
        shippingCost: totals.shippingCost,
        taxAmount: totals.taxAmount,
        discountAmount: totals.discountAmount,
        total: totals.total,
        shippingAddress: addressJson,
        billingAddress: addressJson,
        createdAt,
      },
    })

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: opts.productId,
        productName: opts.productName,
        variantName: opts.variantName,
        price: opts.price,
        quantity,
        total: opts.price * quantity,
      },
    })
    return order
  }

  for (let i = 1; i <= 6; i++) {
    const customer = i % 2 === 0 ? customer1 : customer2
    const useShirt = i % 2 === 0
    await createOrder({
      tenantId: tenant1.id,
      customer,
      orderNumber: `ORD-T1-${String(i).padStart(3, '0')}`,
      status: i === 1 ? 'DELIVERED' : i === 2 ? 'SHIPPED' : i === 3 ? 'PREPARING' : 'CONFIRMED',
      productId: useShirt ? product1.id : product2.id,
      productName: useShirt ? 'Premium T-Shirt' : 'Klasik Jean',
      variantName: useShirt ? 'Medium - Beyaz' : '32 - Mavi',
      price: useShirt ? 199.99 : 349.99,
      daysAgo: 6 - i,
      address: {
        line1: `Moda Cad. No:${i}`,
        line2: `Daire ${i}`,
        district: 'Kadıköy',
        city: 'İstanbul',
        postalCode: '34710',
      },
    })
  }

  const customer3 = await prisma.customer.create({
    data: {
      tenantId: tenant2.id,
      email: 'customer3@example.com',
      firstName: 'Mehmet',
      lastName: 'Öztürk',
      phone: '5551112233',
    },
  })

  const customer4 = await prisma.customer.create({
    data: {
      tenantId: tenant2.id,
      email: 'customer4@example.com',
      firstName: 'Fatma',
      lastName: 'Çelik',
      phone: '5554445566',
    },
  })

  for (let i = 1; i <= 6; i++) {
    const customer = i % 2 === 0 ? customer3 : customer4
    const useMouse = i % 2 === 0
    await createOrder({
      tenantId: tenant2.id,
      customer,
      orderNumber: `ORD-T2-${String(i).padStart(3, '0')}`,
      status: i === 1 ? 'DELIVERED' : i === 2 ? 'SHIPPED' : 'CONFIRMED',
      productId: useMouse ? product3.id : product4.id,
      productName: useMouse ? 'Wireless Mouse' : 'Mechanical Keyboard',
      variantName: useMouse ? 'Standard - Siyah' : 'Red Switch - RGB',
      price: useMouse ? 149.99 : 899.99,
      daysAgo: 6 - i,
      address: {
        line1: `Büyükdere Cad. No:${i}`,
        line2: `Kat ${i}`,
        district: 'Beşiktaş',
        city: 'İstanbul',
        postalCode: '34330',
      },
    })
  }
  console.log('✅ 12 orders (6 per tenant) with correct totals created')

  const firstOrder = await prisma.order.findFirst({
    where: { tenantId: tenant1.id, status: 'DELIVERED' },
    include: { items: true },
  })

  if (firstOrder && firstOrder.items.length > 0) {
    const returnRecord = await prisma.return.create({
      data: {
        tenantId: tenant1.id,
        orderId: firstOrder.id,
        returnNumber: 'RET-001',
        status: 'REQUESTED',
        reason: 'Beden uygun değil',
        description: 'Ürün beklediğimden daha küçük geldi.',
        refundAmount: firstOrder.total,
      },
    })

    await prisma.returnItem.create({
      data: {
        returnId: returnRecord.id,
        orderItemId: firstOrder.items[0].id,
        quantity: 1,
        reason: 'WRONG_SIZE',
      },
    })
    console.log('✅ 1 return with ReturnItems created')
  }

  const counts = {
    users: await prisma.user.count(),
    tenants: await prisma.tenant.count(),
    products: await prisma.product.count(),
    productVariants: await prisma.productVariant.count(),
    orders: await prisma.order.count(),
    orderItems: await prisma.orderItem.count(),
    returns: await prisma.return.count(),
    returnItems: await prisma.returnItem.count(),
    tenantPayments: await prisma.tenantPayment.count(),
  }

  console.log('\n✅ Database seeding completed!')
  console.log('\n📊 Final Counts:')
  for (const [k, v] of Object.entries(counts)) console.log(`${k}: ${v}`)
  console.log('\n📋 Demo Credentials:')
  console.log('Super Admin: admin@posa360.com / admin123')
  console.log('Merchant 1: ahmet@shopmagaza.com / merchant123')
  console.log('Staff 1: staff@shopmagaza.com / staff123')
  console.log('Merchant 2: mehmet@elektronikdunya.com / merchant123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
