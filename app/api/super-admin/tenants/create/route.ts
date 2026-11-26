import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Generate tenant ID
    const tenantId = uuidv4()
    
    // For demo: mock tenant creation
    // In production: save to database with db.orm.public.Tenant.create()
    
    const tenant = {
      id: tenantId,
      ...body,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    }
    
    console.log('Tenant created:', tenant)
    
    // TODO: Create default admin user for the tenant
    // TODO: Send welcome email
    
    return NextResponse.json({ 
      success: true,
      tenantId,
      message: 'Tenant başarıyla oluşturuldu'
    })
  } catch (error) {
    console.error('Tenant creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create tenant' },
      { status: 500 }
    )
  }
}
