// Registered XElectron settings supplied from Delhivery One.
type PickupLocation = {
  name: string; address: string; pincode: string; state: string;
  slotLabel: string; startTime: string; endTime: string;
  workingDays?: string; returnAddress?: string;
  contactName?: string; phone?: string; email?: string;
};

export const xelectronPickup: PickupLocation = {
  name: "XElectron",
  address: "Ground Floor, Plot No. 626, Sector 5, Vaishali, Ghaziabad",
  pincode: "201010",
  state: "Uttar Pradesh",
  slotLabel: "Evening · 2:00 PM–6:00 PM IST",
  startTime: "14:00",
  endTime: "18:00",
  workingDays: "Monday–Sunday",
  returnAddress: "Ground Floor, Plot No. 626, Sector 5, Vaishali, Ghaziabad, Uttar Pradesh 201010",
};

export const pickupLocations: PickupLocation[] = [xelectronPickup, {
  name: "MS 0042161",
  address: "Ground Floor, Plot No. 626, Sector-5, Vaishali, Ghaziabad",
  pincode: "201010",
  state: "Uttar Pradesh",
  slotLabel: "Evening · 2:00 PM–6:00 PM IST",
  startTime: "14:00",
  endTime: "18:00",
  contactName: "Gagan Sharma",
  phone: "+91 8527312304",
  email: "promotions@xelectron.com",
}];

export function suggestedPickup(now = new Date()) {
  const india = new Date(now.getTime() + 330 * 60 * 1000);
  // Choose the next future slot start, including weekends.
  if (india.getUTCHours() >= 14) india.setUTCDate(india.getUTCDate() + 1);
  return { date: india.toISOString().slice(0, 10), time: xelectronPickup.startTime };
}
