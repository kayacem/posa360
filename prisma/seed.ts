import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

async function main() {
  console.log('🌱 Seeding database...')

  // Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@posa360.com',
      name: 'Cem Kaya',
      password: await hashPassword('admin123'),
      role: 'SUPER_ADMIN',
    },
  })
  console.log('✅ Super admin created')

  // Tenant 1: Shop Mağaza
  const tenant1 = await prisma.tenant.create({
    data: {
      name: 'Shop Mağaza',
      slug: 'shopmagaza',
      status: 'ACTIVE',
    },
  })

  const merchant1 = await prisma.user.create({
    data: {
      email: 'ahmet@shopmagaza.com',
      name: 'Ahmet Yılmaz',
      password: await hashPassword('merchant123'),
      role: 'TENANT_OWNER',
      tenantUsers: {
        create: {
          tenantId: tenant1.id,
          role: 'TENANT_OWNER',
        },
      },
    },
  })

  // Tenant 2: Elektronik Dünya
  const tenant2 = await prisma.tenant.create({
    data: {
      name: 'Elektronik Dünya',
      slug: 'elektronikdunya',
      status: 'ACTIVE',
    },
  })

  const merchant2 = await prisma.user.create({
    data: {
      email: 'mehmet@elektronikdunya.com',
      name: 'Mehmet Demir',
      password: await hashPassword('merchant123'),
      role: 'TENANT_OWNER',
      tenantUsers: {
        create: {
          tenantId: tenant2.id,
          role: 'TENANT_OWNER',
        },
      },
    },
  })
  console.log('✅ 2 tenants and merchants created')

  // Customers (separate Customer model, not User)
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
  console.log('✅ 2 customers created')

  // Products for Tenant 1
  const product1 = await prisma.product.create({
    data: {
      tenantId: tenant1.id,
      name: 'Premium T-Shirt',
      slug: 'premium-tshirt',
      description: 'Yüksek kaliteli pamuklu t-shirt',
      price: 199.99,
      stock: 100,
      isActive: true,
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

  // Products for Tenant 2
  const product3 = await prisma.product.create({
    data: {
      tenantId: tenant2.id,
      name: 'Wireless Mouse',
      slug: 'wireless-mouse',
      description: 'Ergonomik kablosuz fare',
      price: 149.99,
      stock: 75,
      isActive: true,
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

  // 6 Orders for Tenant 1
  for (let i = 1; i <= 6; i++) {
    const customer = i % 2 === 0 ? customer1 : customer2
    const order = await prisma.order.create({
      data: {
        tenantId: tenant1.id,
        customerId: customer.id,
        customerEmail: customer.email,
        customerName: `${customer.firstName} ${customer.lastName}`,
        orderNumber: `ORD-T1-${String(i).padStart(3, '0')}`,
        status: i === 1 ? 'DELIVERED' : i === 2 ? 'SHIPPED' : i === 3 ? 'PREPARING' : 'CONFIRMED',
        total: 199.99 + (i * 10),
        subtotal: 199.99 + (i * 10),
        taxAmount: 0,
        shippingCost: 0,
        shippingAddress: JSON.stringify({
          firstName: i % 2 === 0 ? 'Ayşe' : 'Ali',
          lastName: i % 2 === 0 ? 'Yıldız' : 'Kaya',
          addressLine1: `Test Sokak No:${i}`,
          addressLine2: `Daire ${i}`,
          ilce: 'Kadıköy',
          il: 'İstanbul',
          postalCode: '34000',
          country: 'Türkiye',
          phone: '5551234567',
        }),
        billingAddress: JSON.stringify({
          firstName: i % 2 === 0 ? 'Ayşe' : 'Ali',
          lastName: i % 2 === 0 ? 'Yıldız' : 'Kaya',
          addressLine1: `Test Sokak No:${i}`,
          addressLine2: `Daire ${i}`,
          ilce: 'Kadıköy',
          il: 'İstanbul',
          postalCode: '34000',
          country: 'Türkiye',
          phone: '5551234567',
        }),
      },
    })

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: i % 2 === 0 ? product1.id : product2.id,
        productName: i % 2 === 0 ? 'Premium T-Shirt' : 'Klasik Jean',
        variantName: i % 2 === 0 ? 'Medium - Beyaz' : '32 - Mavi',
        price: i % 2 === 0 ? 199.99 : 349.99,
        quantity: 1,
        total: i % 2 === 0 ? 199.99 : 349.99,
      },
    })
  }

  // Create customers for Tenant 2
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

  // 6 Orders for Tenant 2
  for (let i = 1; i <= 6; i++) {
    const customer = i % 2 === 0 ? customer3 : customer4
    const order = await prisma.order.create({
      data: {
        tenantId: tenant2.id,
        customerId: customer.id,
        customerEmail: customer.email,
        customerName: `${customer.firstName} ${customer.lastName}`,
        orderNumber: `ORD-T2-${String(i).padStart(3, '0')}`,
        status: i === 1 ? 'DELIVERED' : i === 2 ? 'SHIPPED' : 'CONFIRMED',
        total: 149.99 + (i * 10),
        subtotal: 149.99 + (i * 10),
        taxAmount: 0,
        shippingCost: 0,
        shippingAddress: JSON.stringify({
          firstName: i % 2 === 0 ? 'Ayşe' : 'Ali',
          lastName: i % 2 === 0 ? 'Yıldız' : 'Kaya',
          addressLine1: `Test Sokak No:${i}`,
          addressLine2: `Daire ${i}`,
          ilce: 'Beşiktaş',
          il: 'İstanbul',
          postalCode: '34100',
          country: 'Türkiye',
          phone: '5559876543',
        }),
        billingAddress: JSON.stringify({
          firstName: i % 2 === 0 ? 'Ayşe' : 'Ali',
          lastName: i % 2 === 0 ? 'Yıldız' : 'Kaya',
          addressLine1: `Test Sokak No:${i}`,
          addressLine2: `Daire ${i}`,
          ilce: 'Beşiktaş',
          il: 'İstanbul',
          postalCode: '34100',
          country: 'Türkiye',
          phone: '5559876543',
        }),
      },
    })

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: i % 2 === 0 ? product3.id : product4.id,
        productName: i % 2 === 0 ? 'Wireless Mouse' : 'Mechanical Keyboard',
        variantName: i % 2 === 0 ? 'Standard - Siyah' : 'Red Switch - RGB',
        price: i % 2 === 0 ? 149.99 : 899.99,
        quantity: 1,
        total: i % 2 === 0 ? 149.99 : 899.99,
      },
    })
  }
  console.log('✅ 12 orders (6 per tenant) created')

  // Return with ReturnItems for Tenant 1
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

  // Final counts
  const counts = {
    users: await prisma.user.count(),
    tenants: await prisma.tenant.count(),
    products: await prisma.product.count(),
    productVariants: await prisma.productVariant.count(),
    orders: await prisma.order.count(),
    orderItems: await prisma.orderItem.count(),
    returns: await prisma.return.count(),
    returnItems: await prisma.returnItem.count(),
  }

  console.log('\n✅ Database seeding completed!')
  console.log('\n📊 Final Counts:')
  console.log(`Users: ${counts.users}`)
  console.log(`Tenants: ${counts.tenants}`)
  console.log(`Products: ${counts.products}`)
  console.log(`Product Variants: ${counts.productVariants}`)
  console.log(`Orders: ${counts.orders}`)
  console.log(`Order Items: ${counts.orderItems}`)
  console.log(`Returns: ${counts.returns}`)
  console.log(`Return Items: ${counts.returnItems}`)
  
  console.log('\n📋 Demo Credentials:')
  console.log('Super Admin: admin@posa360.com / admin123')
  console.log('Merchant 1: ahmet@shopmagaza.com / merchant123')
  console.log('Merchant 2: mehmet@elektronikdunya.com / merchant123')
  console.log('Customer 1: musteri@example.com / customer123')
  console.log('Customer 2: ali@example.com / customer123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
