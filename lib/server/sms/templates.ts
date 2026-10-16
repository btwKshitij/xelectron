export const smsTemplates = {
  mobileOtp: { id: "1077514700018247727", text: "XElectron: Your mobile number verification code is {#var#}. Please use this code to verify your mobile number with XElectron." },
  accountOtp: { id: "1077281680015675394", text: "XElectron: Your account verification code is {#var#}. Please use this code to complete your account registration." },
  loginOtp: { id: "1077310480017698912", text: "XElectron: Your login verification code is {#var#}. Please use this code to access your XElectron account." },
  passwordOtp: { id: "1077404670015919380", text: "XElectron: Your password reset verification code is {#var#}. Please use this code to reset your XElectron account password." },
  received: { id: "1077202500018442852", text: "XElectron: We have received your order {#var#}. Your order is being processed. Thank you for shopping with XElectron." },
  confirmed: { id: "1077589130016836596", text: "XElectron: Your order {#var#} has been confirmed successfully. We will notify you when your order is shipped. Thank you for shopping with XElectron." },
  paid: { id: "1077458710016854828", text: "XElectron: Payment for order {#var#} has been received successfully. Your order has been confirmed. Thank you for shopping with XElectron." },
  paymentFailed: { id: "1077473480016876465", text: "XElectron: Payment for order {#var#} could not be completed. Please try again to complete your order." },
  cod: { id: "1077265790018673572", text: "XElectron: Your Cash on Delivery order {#var#} has been confirmed. Please keep the required amount ready at the time of delivery. Thank you for shopping with XElectron." },
  processing: { id: "1077445750039982014", text: "XElectron: Your order {#var#} is now being processed. We will notify you once your order is shipped. Thank you for shopping with XElectron." },
  shipped: { id: "1077461000040005804", text: "XElectron: Your order {#var#} has been shipped. Your tracking number is {#var#}. Thank you for shopping with XElectron." },
  outForDelivery: { id: "1077479590040022648", text: "XElectron: Your order {#var#} is out for delivery today. Please keep your phone available to receive the shipment." },
  delivered: { id: "1077395630037413980", text: "XElectron: Your order {#var#} has been delivered successfully. Thank you for shopping with XElectron." },
  deliveryFailed: { id: "1077420900037477757", text: "XElectron: Delivery of your order {#var#} could not be completed. Please check your shipment tracking details for further information." },
  rescheduled: { id: "1077496810037519603", text: "XElectron: Delivery of your order {#var#} has been rescheduled. Please check your shipment tracking details for further information." },
  cancelled: { id: "1077412780037456148", text: "XElectron: Your order {#var#} has been cancelled successfully. If applicable, the refund will be processed according to the applicable policy." },
  refund: { id: "1077405100037431972", text: "XElectron: Refund for your order {#var#} has been initiated successfully. The amount will be credited according to your payment provider's processing time." },
  service: { id: "1077436520037493860", text: "XElectron: Your service request {#var#} has been registered successfully. Our support team will contact you regarding the next steps." },
  serviceUpdate: { id: "1077537530040708862", text: "XElectron: There is an update regarding your service request {#var#}. Please contact XElectron support for further assistance." },
  warrantyService: { id: "1077516140038319524", text: "XElectron: Your warranty service request {#var#} for order {#var#} has been registered. Our support team will contact you for further assistance." },
  warranty: { id: "1077556450040728414", text: "XElectron: Your warranty registration for product {#var#} has been completed successfully. Thank you for registering your XElectron product." },
} as const;
export type SmsEvent = keyof typeof smsTemplates;
export function renderSms(event: SmsEvent, values: string[]) {
  const template = smsTemplates[event];
  if (values.length !== (template.text.match(/\{#var#\}/g) || []).length || values.some(value => !value.trim() || value.length > 100 || /[\r\n]/.test(value))) throw new Error("Invalid SMS template variables");
  let index = 0;
  return { templateId: template.id, message: template.text.replace(/\{#var#\}/g, () => values[index++]) };
}

