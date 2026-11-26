import { NextRequest, NextResponse } from 'next/server'
import { generateOrderNumber } from '@/lib/utils'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Generate order ID and number
    const orderId = uuidv4()
    const orderNumber = generateOrderNumber()
    
    // For demo: store order in memory or session
    // In production: save to database
    
    // Mock order data
    const order = {
      id: orderId,
      orderNumber,
      ...body,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      createdAt: new Date().toISOString(),
    }
    
    console.log('Order created:', order)
    
    return NextResponse.json({ 
      success: true,
      orderId,
      orderNumber,
    })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
