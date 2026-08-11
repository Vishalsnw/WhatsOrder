import { getCurrencySymbol } from './currencies';
import { formatWhatsAppNumber } from './countryCodes';

export type OrderStatusType = 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled';

export interface StatusNotificationParams {
  orderId: string;
  customerName: string;
  customerPhone: string;
  businessName: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  currencySymbol: string;
  status: OrderStatusType;
  fulfillmentType?: 'delivery' | 'pickup';
  address?: string;
  lang?: 'en' | 'hi' | 'hinglish' | 'es';
  customNote?: string;
}

export const STATUS_CONFIG: Record<OrderStatusType, { label: string; badgeColor: string; emoji: string }> = {
  pending: { label: 'Pending', badgeColor: 'bg-amber-100 text-amber-800 border-amber-200', emoji: '⏳' },
  confirmed: { label: 'Confirmed', badgeColor: 'bg-purple-100 text-purple-800 border-purple-200', emoji: '🎉' },
  shipped: { label: 'Shipped / Out for Delivery', badgeColor: 'bg-blue-100 text-blue-800 border-blue-200', emoji: '🚚' },
  completed: { label: 'Delivered / Completed', badgeColor: 'bg-green-100 text-green-800 border-green-200', emoji: '✅' },
  cancelled: { label: 'Cancelled', badgeColor: 'bg-red-100 text-red-800 border-red-200', emoji: '❌' },
};

export function generateStatusNotificationMessage(params: StatusNotificationParams): string {
  const {
    orderId,
    customerName,
    businessName,
    items,
    total,
    currencySymbol,
    status,
    fulfillmentType = 'delivery',
    address,
    lang = 'en',
    customNote,
  } = params;

  const itemsList = items
    .filter(i => i.quantity > 0)
    .map(i => `• ${i.quantity}x ${i.name}`)
    .join('\n');

  const shortOrderId = orderId ? `#${orderId.slice(-6).toUpperCase()}` : '';

  // 1. HINDI (हिंदी)
  if (lang === 'hi') {
    if (status === 'confirmed') {
      return `नमस्ते ${customerName}! 👋

*${businessName}* से आपका आर्डर ${shortOrderId} *स्वीकार (CONFIRMED)* कर लिया गया है! 🎉

📦 *आर्डर विवरण:*
${itemsList}

💰 *कुल राशि:* ${currencySymbol}${total}
${fulfillmentType === 'pickup' ? '🏪 *पिकअप:* स्टोर से पिकअप करें' : `🚚 *डिलिवरी पता:* ${address || 'होम डिलिवरी'}`}

${customNote ? `💬 *नोट:* ${customNote}\n\n` : ''}हम आपका आर्डर तैयार कर रहे हैं। धन्यवाद! 🙏`;
    }

    if (status === 'shipped') {
      return `नमस्ते ${customerName}! 👋

खुशखबरी! *${businessName}* से आपका आर्डर ${shortOrderId} *रास्ते में है / OUT FOR DELIVERY*! 🚚

${fulfillmentType === 'pickup' ? '🏪 *पिकअप अपडेट:* आपका आर्डर पिकअप के लिए तैयार है!' : `📍 *डिलिवरी पता:* ${address || 'आपके पते पर आ रहा है'}`}

💰 *देय राशि:* ${currencySymbol}${total}

${customNote ? `💬 *नोट:* ${customNote}\n\n` : ''}जल्द ही आपका आर्डर आप तक पहुँच जाएगा। धन्यवाद! 😊`;
    }

    if (status === 'completed') {
      return `नमस्ते ${customerName}! 👋

आपका आर्डर ${shortOrderId} *सफलतापूर्वक पूरा (COMPLETED)* हो गया है! ✅

आशा है कि आपको *${businessName}* के प्रॉडक्ट्स पसंद आये होंगे।

💰 *कुल भुगतान:* ${currencySymbol}${total}

${customNote ? `💬 *नोट:* ${customNote}\n\n` : ''}दोबारा सेवा का मौका ज़रूर दें! आपका दिन शुभ हो! 🌟`;
    }

    if (status === 'cancelled') {
      return `नमस्ते ${customerName}! 🙏

हमें खेद है, *${businessName}* से आपका आर्डर ${shortOrderId} रद्द (CANCELLED) कर दिया गया है। ❌

${customNote ? `💬 *कारण / नोट:* ${customNote}\n\n` : ''}किसी भी सहायता के लिए कृपया संपर्क करें।`;
    }

    // Pending
    return `नमस्ते ${customerName}! 👋

*${businessName}* में आपका आर्डर ${shortOrderId} प्राप्त हो गया है (PENDING)। ⏳

📦 *आर्डर:*
${itemsList}
💰 *कुल:* ${currencySymbol}${total}

${customNote ? `💬 *नोट:* ${customNote}\n\n` : ''}हम जल्द ही आपके आर्डर की पुष्टि करेंगे। धन्यवाद!`;
  }

  // 2. HINGLISH (हिंदी + इंग्लिश)
  if (lang === 'hinglish') {
    if (status === 'confirmed') {
      return `Hello ${customerName}! 👋

Aapka order ${shortOrderId} *${businessName}* par *CONFIRMED* ho gaya hai! 🎉

📦 *Order Details:*
${itemsList}

💰 *Total Amount:* ${currencySymbol}${total}
${fulfillmentType === 'pickup' ? '🏪 *Pickup:* Store se receive kar sakte hain' : `🚚 *Delivery Address:* ${address || 'Home Delivery'}`}

${customNote ? `💬 *Note:* ${customNote}\n\n` : ''}Hum aapka order prepare kar rahe hain. Thank you so much! 🙏`;
    }

    if (status === 'shipped') {
      return `Hello ${customerName}! 👋

Good news! Aapka order ${shortOrderId} *${businessName}* se *OUT FOR DELIVERY / SHIPPED* ho gaya hai! 🚚

${fulfillmentType === 'pickup' ? '🏪 *Pickup:* Order pickup ke liye ready hai!' : `📍 *Delivery Address:* ${address || 'Aapke address par pahunch raha hai'}`}

💰 *Amount:* ${currencySymbol}${total}

${customNote ? `💬 *Note:* ${customNote}\n\n` : ''}Aapka order jaldi hi aap tak pahunch jayega. Thank you! 😊`;
    }

    if (status === 'completed') {
      return `Hello ${customerName}! 👋

Aapka order ${shortOrderId} *DELIVERED & COMPLETED* ho gaya hai! ✅

Umeed hai aapko *${businessName}* ke products pasand aaye honge.

💰 *Total Paid:* ${currencySymbol}${total}

${customNote ? `💬 *Note:* ${customNote}\n\n` : ''}Fir se order karne ke liye visit karein. Have a great day ahead! 🌟`;
    }

    if (status === 'cancelled') {
      return `Hello ${customerName}! 🙏

We are sorry, aapka order ${shortOrderId} *${businessName}* se cancel kar diya gaya hai. ❌

${customNote ? `💬 *Reason / Note:* ${customNote}\n\n` : ''}Agar koi doubt ho toh hume reply karein.`;
    }

    // Pending
    return `Hello ${customerName}! 👋

Aapka order ${shortOrderId} *${businessName}* ko receive ho gaya hai (PENDING). ⏳

📦 *Items:*
${itemsList}
💰 *Total:* ${currencySymbol}${total}

${customNote ? `💬 *Note:* ${customNote}\n\n` : ''}Hum jaldi hi order confirm karke update bhejenge!`;
  }

  // 3. SPANISH
  if (lang === 'es') {
    if (status === 'confirmed') {
      return `¡Hola ${customerName}! 👋

¡Tu pedido ${shortOrderId} en *${businessName}* ha sido *CONFIRMADO*! 🎉

📦 *Detalles:*
${itemsList}

💰 *Total:* ${currencySymbol}${total}
${fulfillmentType === 'pickup' ? '🏪 *Recogida:* Disponible en tienda' : `🚚 *Dirección:* ${address || 'Envío a domicilio'}`}

${customNote ? `💬 *Nota:* ${customNote}\n\n` : ''}¡Estamos preparando tu pedido! Gracias por tu compra. 🙏`;
    }

    if (status === 'shipped') {
      return `¡Hola ${customerName}! 👋

¡Buenas noticias! Tu pedido ${shortOrderId} de *${businessName}* está *EN CAMINO / ENVIADO*! 🚚

${fulfillmentType === 'pickup' ? '🏪 *Recogida:* ¡Tu pedido está listo para ser recogido!' : `📍 *Dirección:* ${address || 'Llegando a tu domicilio'}`}

💰 *Total:* ${currencySymbol}${total}

${customNote ? `💬 *Nota:* ${customNote}\n\n` : ''}¡Llegará muy pronto! 😊`;
    }

    if (status === 'completed') {
      return `¡Hola ${customerName}! 👋

¡Tu pedido ${shortOrderId} ha sido *ENTREGADO / COMPLETADO* con éxito! ✅

Esperamos que disfrutes de tus productos de *${businessName}*.

💰 *Total Pagado:* ${currencySymbol}${total}

${customNote ? `💬 *Nota:* ${customNote}\n\n` : ''}¡Gracias por elegirnos! ¡Que tengas un gran día! 🌟`;
    }

    if (status === 'cancelled') {
      return `Hola ${customerName}! 🙏

Lo sentimos, tu pedido ${shortOrderId} en *${businessName}* ha sido *CANCELADO*. ❌

${customNote ? `💬 *Nota:* ${customNote}\n\n` : ''}Por favor contáctanos si tienes alguna duda.`;
    }

    // Pending
    return `¡Hola ${customerName}! 👋

Hemos recibido tu pedido ${shortOrderId} en *${businessName}* (PENDIENTE). ⏳

📦 *Detalles:*
${itemsList}
💰 *Total:* ${currencySymbol}${total}

${customNote ? `💬 *Nota:* ${customNote}\n\n` : ''}Te confirmaremos muy pronto. ¡Gracias!`;
  }

  // 4. ENGLISH (DEFAULT)
  if (status === 'confirmed') {
    return `Hello ${customerName}! 👋

Your order ${shortOrderId} from *${businessName}* has been *CONFIRMED*! 🎉

📦 *Order Items:*
${itemsList}

💰 *Total Amount:* ${currencySymbol}${total}
${fulfillmentType === 'pickup' ? '🏪 *Fulfillment:* Store Pickup' : `🚚 *Delivery Address:* ${address || 'Home Delivery'}`}

${customNote ? `💬 *Note:* ${customNote}\n\n` : ''}We are currently preparing your items. Thank you for shopping with us! 🙏`;
  }

  if (status === 'shipped') {
    return `Hello ${customerName}! 👋

Great news! Your order ${shortOrderId} from *${businessName}* is *OUT FOR DELIVERY / SHIPPED*! 🚚

${fulfillmentType === 'pickup' ? '🏪 *Pickup:* Your order is ready for pickup at store!' : `📍 *Delivery Address:* ${address || 'En route to your location'}`}

💰 *Total Due:* ${currencySymbol}${total}

${customNote ? `💬 *Note:* ${customNote}\n\n` : ''}It will reach you shortly. Thank you for your patience! 😊`;
  }

  if (status === 'completed') {
    return `Hello ${customerName}! 👋

Your order ${shortOrderId} from *${businessName}* has been successfully *DELIVERED & COMPLETED*! ✅

We hope you love your purchase! 

💰 *Total Paid:* ${currencySymbol}${total}

${customNote ? `💬 *Note:* ${customNote}\n\n` : ''}Thank you for choosing *${businessName}*! Have a wonderful day! 🌟`;
  }

  if (status === 'cancelled') {
    return `Hello ${customerName}! 🙏

We regret to inform you that your order ${shortOrderId} from *${businessName}* has been *CANCELLED*. ❌

${customNote ? `💬 *Note:* ${customNote}\n\n` : ''}If you have any questions, please feel free to reply to this message.`;
  }

  // Pending
  return `Hello ${customerName}! 👋

Your order ${shortOrderId} from *${businessName}* has been received (PENDING). ⏳

📦 *Items:*
${itemsList}
💰 *Total:* ${currencySymbol}${total}

${customNote ? `💬 *Note:* ${customNote}\n\n` : ''}We will update you as soon as your order is confirmed!`;
}

export function openWhatsAppNotification(phone: string, message: string) {
  const formattedPhone = formatWhatsAppNumber(phone);
  const encodedMsg = encodeURIComponent(message);
  const waUrl = `https://wa.me/${formattedPhone}?text=${encodedMsg}`;
  window.open(waUrl, '_blank');
}
