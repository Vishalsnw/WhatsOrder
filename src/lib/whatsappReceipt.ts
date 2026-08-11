import { FormTranslations, getTranslations, LANGUAGES } from './languages';
import { PaymentMethodsConfig } from '@/components/forms/PaymentOptionsInputs';

export type ReceiptTemplateStyle = 'detailed' | 'receipt' | 'minimal';

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

export interface WhatsAppReceiptParams {
  businessName: string;
  customerName: string;
  customerPhone?: string;
  fulfillmentType: 'delivery' | 'pickup';
  fullAddress: string;
  items: ReceiptItem[];
  totalAmount: number;
  currencySymbol: string;
  langCode: string;
  templateStyle?: ReceiptTemplateStyle;
  paymentMethods?: PaymentMethodsConfig;
  orderNumber?: string;
}

export const RECEIPT_STYLES = [
  { id: 'receipt' as const, label: 'Formatted Receipt 🧾', desc: 'Itemized receipt with headers, line totals & payment links' },
  { id: 'detailed' as const, label: 'Detailed Summary 📋', desc: 'Full order overview with customer details & address' },
  { id: 'minimal' as const, label: 'Quick Message ⚡', desc: 'Compact list for quick messaging' },
];

export function generateWhatsAppReceiptMessage(params: WhatsAppReceiptParams): string {
  const {
    businessName,
    customerName,
    customerPhone,
    fulfillmentType,
    fullAddress,
    items,
    totalAmount,
    currencySymbol,
    langCode,
    templateStyle = 'receipt',
    paymentMethods,
    orderNumber,
  } = params;

  const t = getTranslations(langCode);

  const activeItems = items.filter(i => i.quantity > 0);
  const cleanPhone = customerPhone?.trim() ? (customerPhone.startsWith('+') ? customerPhone : `+${customerPhone}`) : '';
  const fulfillmentStr = fulfillmentType === 'delivery' ? (t.deliveryOption || 'Home Delivery 🚚') : (t.pickupOption || 'Local Pickup 🏪');
  const orderId = orderNumber || `#ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = new Date().toLocaleDateString(langCode || 'en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // MINIMAL TEMPLATE
  if (templateStyle === 'minimal') {
    const itemLines = activeItems
      .map(i => `• ${i.quantity}x ${i.name}`)
      .join('\n');

    return `${t.waGreeting || 'Hello'} ${businessName}! 👋
${t.waOrderDetails || "I'd like to order:"}
${itemLines}

💰 ${t.waTotal || 'Total'}: ${currencySymbol}${totalAmount}
👤 ${t.waName || 'Name'}: ${customerName}
🚚 ${t.waFulfillment || 'Method'}: ${fulfillmentStr}
📍 ${t.waAddress || 'Address'}: ${fullAddress}`;
  }

  // DETAILED SUMMARY
  if (templateStyle === 'detailed') {
    const itemLines = activeItems
      .map((i, idx) => `- ${i.quantity}x ${i.name} (${currencySymbol}${i.price} ea = ${currencySymbol}${i.quantity * i.price})`)
      .join('\n');

    return `${t.waGreeting || 'Hello'} ${businessName}! 👋
${t.waOrderDetails || "I would like to place an order:"}

${itemLines}

${t.waTotal || 'Total'}: ${currencySymbol}${totalAmount}
${t.waFulfillment || 'Method'}: ${fulfillmentStr}
${t.waName || 'Name'}: ${customerName}${cleanPhone ? `\n${t.waPhone || 'Phone'}: ${cleanPhone}` : ''}
${t.waAddress || 'Address'}: ${fullAddress}`;
  }

  // FORMATTED RECEIPT (Default & Standard)
  const itemLines = activeItems
    .map((i, idx) => {
      const lineTotal = i.quantity * i.price;
      return `${idx + 1}. *${i.name}*\n   └ ${i.quantity} x ${currencySymbol}${i.price} = *${currencySymbol}${lineTotal}*`;
    })
    .join('\n\n');

  // Build payment snippet if seller configured payment links
  let paymentSnippet = '';
  if (paymentMethods) {
    const pLinks: string[] = [];
    if (paymentMethods.upiId?.trim()) pLinks.push(`📲 UPI / GPay: ${paymentMethods.upiId.trim()}`);
    if (paymentMethods.stripeUrl?.trim()) pLinks.push(`💳 Stripe Pay: ${paymentMethods.stripeUrl.trim()}`);
    if (paymentMethods.paypalUrl?.trim()) pLinks.push(`🅿️ PayPal: ${paymentMethods.paypalUrl.trim()}`);
    if (paymentMethods.wiseUrl?.trim()) pLinks.push(`🌐 Wise: ${paymentMethods.wiseUrl.trim()}`);
    if (paymentMethods.squareUrl?.trim()) pLinks.push(`⬛ Square: ${paymentMethods.squareUrl.trim()}`);

    if (pLinks.length > 0) {
      paymentSnippet = `\n\n💳 *${t.paymentMethodsLabel || 'Payment Options'}*\n${pLinks.join('\n')}`;
    }
  }

  return `🧾 *${t.orderSummary || 'ORDER RECEIPT'}*
--------------------------------
🏪 *${businessName}*
🆔 *Order Ref:* ${orderId}
📅 *Date:* ${dateStr}

👤 *${t.yourDetails || 'Customer Info'}*
• *${t.waName || 'Name'}:* ${customerName}${cleanPhone ? `\n• *${t.waPhone || 'Phone'}:* ${cleanPhone}` : ''}
• *${t.waFulfillment || 'Method'}:* ${fulfillmentStr}
• *${t.waAddress || 'Address'}:* ${fullAddress}

📦 *${t.selectProducts || 'Items Ordered'}*
${itemLines}

--------------------------------
💵 *${t.orderTotal || 'TOTAL AMOUNT'}: ${currencySymbol}${totalAmount}*
--------------------------------${paymentSnippet}

🙏 *Thank you for your order!*`;
}
