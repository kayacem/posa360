import { jsPDF } from 'jspdf'

export async function generateInvoicePDF(order: any) {
  const doc = new jsPDF()
  
  // Turkish character support
  doc.addFont('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf', 'Roboto', 'normal')
  doc.setFont('Helvetica')
  
  doc.setFontSize(20)
  doc.text('FATURA', 105, 20, { align: 'center' })
  
  doc.setFontSize(12)
  doc.text(`Siparis No: ${order.orderNumber}`, 20, 40)
  doc.text(`Tarih: ${new Date(order.createdAt).toLocaleDateString('tr-TR')}`, 20, 50)
  
  doc.text('Musteri:', 20, 70)
  doc.setFontSize(10)
  doc.text(order.customer?.name || 'Misafir', 20, 78)
  doc.text(order.shippingAddress?.line1 || '', 20, 86)
  doc.text(`${order.shippingAddress?.district}, ${order.shippingAddress?.city}`, 20, 94)
  
  doc.setFontSize(12)
  doc.text('Urunler:', 20, 115)
  
  doc.setFontSize(10)
  let y = 125
  for (const item of order.items) {
    doc.text(`${item.product.name} x${item.quantity}`, 20, y)
    doc.text(`${parseFloat(item.subtotal).toFixed(2)} TL`, 150, y, { align: 'right' })
    y += 10
  }
  
  y += 10
  doc.line(20, y, 190, y)
  y += 10
  
  doc.setFontSize(12)
  doc.text('Ara Toplam:', 120, y)
  doc.text(`${parseFloat(order.subtotal).toFixed(2)} TL`, 180, y, { align: 'right' })
  y += 10
  
  doc.text('Kargo:', 120, y)
  doc.text(`${parseFloat(order.shippingCost).toFixed(2)} TL`, 180, y, { align: 'right' })
  y += 10
  
  doc.text('KDV (%20):', 120, y)
  doc.text(`${parseFloat(order.tax).toFixed(2)} TL`, 180, y, { align: 'right' })
  y += 10
  
  doc.setFontSize(14)
  doc.text('TOPLAM:', 120, y)
  doc.text(`${parseFloat(order.total).toFixed(2)} TL`, 180, y, { align: 'right' })
  
  return doc
}

export async function generateShippingLabelPDF(order: any, shipment: any) {
  const doc = new jsPDF()
  
  doc.setFontSize(16)
  doc.text('KARGO ETIKETI', 105, 20, { align: 'center' })
  
  doc.setFontSize(12)
  doc.text(`Takip No: ${shipment.trackingNumber}`, 20, 40)
  doc.text(`Kargo Firmasi: ${shipment.carrier}`, 20, 50)
  
  doc.setFontSize(14)
  doc.text('Alici:', 20, 70)
  doc.setFontSize(12)
  doc.text(order.customer?.name || 'Misafir', 20, 80)
  doc.text(order.shippingAddress?.line1 || '', 20, 90)
  if (order.shippingAddress?.line2) {
    doc.text(order.shippingAddress.line2, 20, 100)
  }
  doc.text(`${order.shippingAddress?.district}, ${order.shippingAddress?.city}`, 20, 110)
  doc.text(`${order.shippingAddress?.postalCode}`, 20, 120)
  doc.text(order.shippingAddress?.phone || '', 20, 130)
  
  doc.rect(15, 145, 180, 60)
  doc.setFontSize(10)
  doc.text('Barkod/QR alan', 105, 175, { align: 'center' })
  
  return doc
}
