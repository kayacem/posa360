// Payment provider abstractions for iyzico, PayTR, and mocks

export interface PaymentProvider {
  initialize(credentials: any): void
  createPayment(params: PaymentParams): Promise<PaymentResponse>
  verifyPayment(token: string): Promise<PaymentVerificationResponse>
  refund(transactionId: string, amount: number): Promise<RefundResponse>
}

export interface PaymentParams {
  orderId: string
  amount: number
  currency: string
  customerName: string
  customerEmail: string
  customerPhone: string
  billingAddress: any
  callbackUrl: string
}

export interface PaymentResponse {
  success: boolean
  paymentUrl?: string
  token?: string
  errorMessage?: string
}

export interface PaymentVerificationResponse {
  success: boolean
  transactionId?: string
  amount?: number
  errorMessage?: string
}

export interface RefundResponse {
  success: boolean
  refundId?: string
  errorMessage?: string
}

// Mock Payment Provider (Sandbox)
export class MockPaymentProvider implements PaymentProvider {
  initialize(credentials: any): void {
    // Mock initialization
  }

  async createPayment(params: PaymentParams): Promise<PaymentResponse> {
    // Simulate async payment processing
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const token = `MOCK_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    return {
      success: true,
      paymentUrl: `/checkout/payment-callback?token=${token}&status=success`,
      token,
    }
  }

  async verifyPayment(token: string): Promise<PaymentVerificationResponse> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Mock: Her zaman başarılı
    return {
      success: true,
      transactionId: `TRX_${token}`,
      amount: 0, // Will be filled from order
    }
  }

  async refund(transactionId: string, amount: number): Promise<RefundResponse> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      success: true,
      refundId: `REF_${Date.now()}`,
    }
  }
}

// iyzico Provider (Gerçek entegrasyon için hazır)
export class IyzicoProvider implements PaymentProvider {
  private apiKey: string = ''
  private secretKey: string = ''
  private baseUrl: string = ''

  initialize(credentials: { apiKey: string; secretKey: string; sandbox?: boolean }): void {
    this.apiKey = credentials.apiKey
    this.secretKey = credentials.secretKey
    this.baseUrl = credentials.sandbox 
      ? 'https://sandbox-api.iyzipay.com' 
      : 'https://api.iyzipay.com'
  }

  async createPayment(params: PaymentParams): Promise<PaymentResponse> {
    // TODO: iyzico API entegrasyonu
    // Şimdilik mock döndür
    return new MockPaymentProvider().createPayment(params)
  }

  async verifyPayment(token: string): Promise<PaymentVerificationResponse> {
    // TODO: iyzico verification
    return new MockPaymentProvider().verifyPayment(token)
  }

  async refund(transactionId: string, amount: number): Promise<RefundResponse> {
    // TODO: iyzico refund API
    return new MockPaymentProvider().refund(transactionId, amount)
  }
}

// PayTR Provider (Gerçek entegrasyon için hazır)
export class PayTRProvider implements PaymentProvider {
  private merchantId: string = ''
  private merchantKey: string = ''
  private merchantSalt: string = ''

  initialize(credentials: { merchantId: string; merchantKey: string; merchantSalt: string }): void {
    this.merchantId = credentials.merchantId
    this.merchantKey = credentials.merchantKey
    this.merchantSalt = credentials.merchantSalt
  }

  async createPayment(params: PaymentParams): Promise<PaymentResponse> {
    // TODO: PayTR API entegrasyonu
    return new MockPaymentProvider().createPayment(params)
  }

  async verifyPayment(token: string): Promise<PaymentVerificationResponse> {
    // TODO: PayTR verification
    return new MockPaymentProvider().verifyPayment(token)
  }

  async refund(transactionId: string, amount: number): Promise<RefundResponse> {
    // TODO: PayTR refund
    return new MockPaymentProvider().refund(transactionId, amount)
  }
}

// Factory function
export function getPaymentProvider(
  providerName: string,
  credentials: any
): PaymentProvider {
  let provider: PaymentProvider

  switch (providerName) {
    case 'iyzico':
      provider = new IyzicoProvider()
      break
    case 'paytr':
      provider = new PayTRProvider()
      break
    case 'mock':
    default:
      provider = new MockPaymentProvider()
      break
  }

  provider.initialize(credentials)
  return provider
}
