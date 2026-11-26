// Shipping provider abstractions for Turkish carriers

export interface ShippingProvider {
  initialize(credentials: any): void
  createShipment(params: ShipmentParams): Promise<ShipmentResponse>
  getTracking(trackingNumber: string): Promise<TrackingResponse>
  cancelShipment(trackingNumber: string): Promise<CancelResponse>
}

export interface ShipmentParams {
  orderId: string
  recipientName: string
  recipientPhone: string
  address: {
    addressLine1: string
    addressLine2?: string
    il: string
    ilce: string
    postalCode: string
  }
  weight?: number // kg
  desi?: number
  items: Array<{
    name: string
    quantity: number
  }>
}

export interface ShipmentResponse {
  success: boolean
  trackingNumber?: string
  labelUrl?: string
  errorMessage?: string
}

export interface TrackingResponse {
  success: boolean
  status?: 'preparing' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed'
  statusText?: string
  history?: Array<{
    date: string
    status: string
    location?: string
  }>
  errorMessage?: string
}

export interface CancelResponse {
  success: boolean
  errorMessage?: string
}

// Mock Shipping Provider
export class MockShippingProvider implements ShippingProvider {
  private providerName: string

  constructor(providerName: string = 'Mock Kargo') {
    this.providerName = providerName
  }

  initialize(credentials: any): void {
    // Mock initialization
  }

  async createShipment(params: ShipmentParams): Promise<ShipmentResponse> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const trackingNumber = `${this.providerName.substring(0, 3).toUpperCase()}${Date.now()}${Math.floor(Math.random() * 1000)}`
    
    return {
      success: true,
      trackingNumber,
      labelUrl: `/api/mock/shipping-label/${trackingNumber}`,
    }
  }

  async getTracking(trackingNumber: string): Promise<TrackingResponse> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Mock tracking data
    const mockHistory = [
      { date: new Date(Date.now() - 3600000 * 24).toISOString(), status: 'Kargo alındı', location: 'İstanbul Şube' },
      { date: new Date(Date.now() - 3600000 * 12).toISOString(), status: 'Transfer merkezinde', location: 'Ankara Transfer' },
      { date: new Date().toISOString(), status: 'Dağıtımda', location: 'Bursa Şube' },
    ]
    
    return {
      success: true,
      status: 'in_transit',
      statusText: 'Kargo dağıtım merkezinde',
      history: mockHistory,
    }
  }

  async cancelShipment(trackingNumber: string): Promise<CancelResponse> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return {
      success: true,
    }
  }
}

// Yurtiçi Kargo Provider
export class YurticiProvider implements ShippingProvider {
  private username: string = ''
  private password: string = ''

  initialize(credentials: { username: string; password: string }): void {
    this.username = credentials.username
    this.password = credentials.password
  }

  async createShipment(params: ShipmentParams): Promise<ShipmentResponse> {
    // TODO: Yurtiçi API entegrasyonu
    return new MockShippingProvider('Yurtiçi').createShipment(params)
  }

  async getTracking(trackingNumber: string): Promise<TrackingResponse> {
    // TODO: Yurtiçi tracking API
    return new MockShippingProvider('Yurtiçi').getTracking(trackingNumber)
  }

  async cancelShipment(trackingNumber: string): Promise<CancelResponse> {
    return new MockShippingProvider('Yurtiçi').cancelShipment(trackingNumber)
  }
}

// Aras Kargo Provider
export class ArasProvider implements ShippingProvider {
  private customerId: string = ''
  private apiKey: string = ''

  initialize(credentials: { customerId: string; apiKey: string }): void {
    this.customerId = credentials.customerId
    this.apiKey = credentials.apiKey
  }

  async createShipment(params: ShipmentParams): Promise<ShipmentResponse> {
    // TODO: Aras API
    return new MockShippingProvider('Aras').createShipment(params)
  }

  async getTracking(trackingNumber: string): Promise<TrackingResponse> {
    return new MockShippingProvider('Aras').getTracking(trackingNumber)
  }

  async cancelShipment(trackingNumber: string): Promise<CancelResponse> {
    return new MockShippingProvider('Aras').cancelShipment(trackingNumber)
  }
}

// MNG Kargo Provider
export class MNGProvider implements ShippingProvider {
  private username: string = ''
  private password: string = ''

  initialize(credentials: { username: string; password: string }): void {
    this.username = credentials.username
    this.password = credentials.password
  }

  async createShipment(params: ShipmentParams): Promise<ShipmentResponse> {
    // TODO: MNG API
    return new MockShippingProvider('MNG').createShipment(params)
  }

  async getTracking(trackingNumber: string): Promise<TrackingResponse> {
    return new MockShippingProvider('MNG').getTracking(trackingNumber)
  }

  async cancelShipment(trackingNumber: string): Promise<CancelResponse> {
    return new MockShippingProvider('MNG').cancelShipment(trackingNumber)
  }
}

// Factory function
export function getShippingProvider(
  providerName: string,
  credentials: any = {}
): ShippingProvider {
  let provider: ShippingProvider

  switch (providerName) {
    case 'yurtici':
      provider = new YurticiProvider()
      break
    case 'aras':
      provider = new ArasProvider()
      break
    case 'mng':
      provider = new MNGProvider()
      break
    case 'mock':
    default:
      provider = new MockShippingProvider(providerName === 'mock' ? 'Mock Kargo' : providerName)
      break
  }

  provider.initialize(credentials)
  return provider
}
