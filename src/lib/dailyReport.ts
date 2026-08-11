import { Order, Form } from './firestore';
import { getLocalDateKey, formatLocalDate, formatOrderTimestamp } from './timezones';
import { getCurrencySymbol } from './currencies';

export interface DailyReportSummary {
  dateKey: string; // YYYY-MM-DD
  formattedDate: string;
  sellerTimezone: string;
  currencySymbol: string;
  businessName: string;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  subtotalSum: number;
  totalDeliveryFees: number;
  freeDeliveryCount: number;
  deliveryCount: number;
  pickupCount: number;
  paymentBreakdown: { [method: string]: { count: number; total: number } };
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  hourlyDistribution: { [hour: number]: { count: number; revenue: number } };
  peakHourLabel: string;
  executiveInsights: string[];
  ordersList: Order[];
}

export function generateDailyBusinessSummary(
  orders: Order[],
  forms: Form[],
  userProfile: any,
  targetDateKey?: string
): DailyReportSummary {
  const sellerTimezone = userProfile?.timezone || 'Asia/Kolkata';
  const businessName = userProfile?.displayName || userProfile?.businessName || forms[0]?.title || 'Our Business';

  const todayKey = targetDateKey || getLocalDateKey(new Date(), sellerTimezone);

  // Filter orders for the selected date key in seller local timezone
  const dayOrders = orders.filter(order => {
    if (!order.createdAt) return false;
    const orderDateKey = getLocalDateKey(order.createdAt, sellerTimezone);
    return orderDateKey === todayKey;
  });

  const currencySymbol = forms[0]?.currencySymbol || (forms[0]?.currency ? getCurrencySymbol(forms[0].currency) : '$');

  let totalRevenue = 0;
  let subtotalSum = 0;
  let totalDeliveryFees = 0;
  let freeDeliveryCount = 0;
  let deliveryCount = 0;
  let pickupCount = 0;
  let completedOrders = 0;
  let pendingOrders = 0;
  let cancelledOrders = 0;

  const paymentBreakdown: { [method: string]: { count: number; total: number } } = {};
  const productMap: { [name: string]: { name: string; quantity: number; revenue: number } } = {};
  const hourlyDistribution: { [hour: number]: { count: number; revenue: number } } = {};

  // Initialize 24 hours
  for (let i = 0; i < 24; i++) {
    hourlyDistribution[i] = { count: 0, revenue: 0 };
  }

  dayOrders.forEach(order => {
    const total = Number(order.total) || 0;
    const subtotal = typeof order.subtotal === 'number' ? order.subtotal : total;
    const fee = typeof order.deliveryFee === 'number' ? order.deliveryFee : 0;

    totalRevenue += total;
    subtotalSum += subtotal;
    totalDeliveryFees += fee;

    if (order.fulfillmentType === 'pickup') {
      pickupCount += 1;
    } else {
      deliveryCount += 1;
      if (fee === 0) freeDeliveryCount += 1;
    }

    const status = (order.status || 'pending').toLowerCase();
    if (status === 'completed' || status === 'delivered') {
      completedOrders += 1;
    } else if (status === 'cancelled' || status === 'rejected') {
      cancelledOrders += 1;
    } else {
      pendingOrders += 1;
    }

    // Payment method grouping
    const method = order.paymentMethod || 'standard';
    if (!paymentBreakdown[method]) {
      paymentBreakdown[method] = { count: 0, total: 0 };
    }
    paymentBreakdown[method].count += 1;
    paymentBreakdown[method].total += total;

    // Hourly distribution
    if (order.createdAt) {
      try {
        const dateObj = new Date(order.createdAt);
        const hourStr = new Intl.DateTimeFormat('en-US', {
          timeZone: sellerTimezone,
          hour: 'numeric',
          hour12: false,
        }).format(dateObj);
        const hourNum = parseInt(hourStr, 10) % 24;
        if (!isNaN(hourNum) && hourlyDistribution[hourNum]) {
          hourlyDistribution[hourNum].count += 1;
          hourlyDistribution[hourNum].revenue += total;
        }
      } catch (e) {
        // Fallback
      }
    }

    // Products
    if (Array.isArray(order.items)) {
      order.items.forEach(item => {
        const name = item.name || 'Item';
        const qty = Number(item.quantity) || 1;
        const price = Number(item.price) || 0;
        if (!productMap[name]) {
          productMap[name] = { name, quantity: 0, revenue: 0 };
        }
        productMap[name].quantity += qty;
        productMap[name].revenue += qty * price;
      });
    }
  });

  const topProducts = Object.values(productMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const totalOrders = dayOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Find Peak Hour
  let peakHour = -1;
  let maxOrdersInHour = 0;
  Object.entries(hourlyDistribution).forEach(([hr, data]) => {
    if (data.count > maxOrdersInHour) {
      maxOrdersInHour = data.count;
      peakHour = parseInt(hr, 10);
    }
  });

  let peakHourLabel = 'No orders logged today';
  if (peakHour >= 0 && maxOrdersInHour > 0) {
    const startPeriod = peakHour >= 12 ? (peakHour === 12 ? '12 PM' : `${peakHour - 12} PM`) : (peakHour === 0 ? '12 AM' : `${peakHour} AM`);
    const endHour = (peakHour + 1) % 24;
    const endPeriod = endHour >= 12 ? (endHour === 12 ? '12 PM' : `${endHour - 12} PM`) : (endHour === 0 ? '12 AM' : `${endHour} AM`);
    peakHourLabel = `${startPeriod} - ${endPeriod} (${maxOrdersInHour} orders)`;
  }

  // Format date display
  const dateObj = new Date(`${todayKey}T12:00:00Z`);
  const formattedDate = formatLocalDate(dateObj, sellerTimezone);

  // Generate Executive Insights
  const executiveInsights: string[] = [];
  if (totalOrders === 0) {
    executiveInsights.push('No orders received on this date yet. Share form links to boost traffic!');
  } else {
    executiveInsights.push(`Received ${totalOrders} order(s) generating ${currencySymbol}${totalRevenue.toFixed(2)} total revenue.`);
    if (topProducts.length > 0) {
      executiveInsights.push(`Top item: "${topProducts[0].name}" with ${topProducts[0].quantity} units sold.`);
    }
    if (maxOrdersInHour > 0) {
      executiveInsights.push(`Peak rush hour occurred during ${peakHourLabel}.`);
    }
    if (freeDeliveryCount > 0) {
      executiveInsights.push(`${freeDeliveryCount} customer(s) unlocked Free Shipping today!`);
    }
  }

  return {
    dateKey: todayKey,
    formattedDate,
    sellerTimezone,
    currencySymbol,
    businessName,
    totalOrders,
    completedOrders,
    pendingOrders,
    cancelledOrders,
    totalRevenue,
    avgOrderValue,
    subtotalSum,
    totalDeliveryFees,
    freeDeliveryCount,
    deliveryCount,
    pickupCount,
    paymentBreakdown,
    topProducts,
    hourlyDistribution,
    peakHourLabel,
    executiveInsights,
    ordersList: dayOrders,
  };
}

export function formatWhatsAppDailySummaryMessage(report: DailyReportSummary): string {
  const topItemsFormatted = report.topProducts.length > 0
    ? report.topProducts.map((p, i) => `   ${i + 1}. ${p.name}: ${p.quantity} sold (${report.currencySymbol}${p.revenue.toFixed(2)})`).join('\n')
    : '   None';

  return `📊 *DAILY BUSINESS SUMMARY REPORT*
📅 *Date:* ${report.formattedDate}
🏪 *Business:* ${report.businessName}
🌐 *Timezone:* ${report.sellerTimezone}
----------------------------------
💰 *Total Revenue:* ${report.currencySymbol}${report.totalRevenue.toFixed(2)}
🛒 *Total Orders:* ${report.totalOrders}
🏷️ *Avg Order Value:* ${report.currencySymbol}${report.avgOrderValue.toFixed(2)}

📦 *FULFILLMENT SPLIT:*
• Delivery Orders: ${report.deliveryCount} (${report.freeDeliveryCount} Free Delivery)
• Store Pickups: ${report.pickupCount}
• Total Delivery Fees: ${report.currencySymbol}${report.totalDeliveryFees.toFixed(2)}

🔥 *TOP SELLING PRODUCTS:*
${topItemsFormatted}

⏰ *PEAK RUSH HOUR:*
• ${report.peakHourLabel}

💡 *EXECUTIVE INSIGHTS:*
${report.executiveInsights.map(i => `• ${i}`).join('\n')}

----------------------------------
*Generated via WhatsOrder Business Suite*
https://whatsorder.app
`;
}
