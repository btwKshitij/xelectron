export interface ContactDepartment {
  label: string;
  value: string;
  email: string;
  desc: string;
}

export const CONTACT_DEPARTMENTS: ContactDepartment[] = [
  {
    label: "Sales Department",
    value: "Sales Department",
    email: "sales@xelectron.com",
    desc: "For sales inquiries, corporate & bulk orders",
  },
  {
    label: "Customer Help Desk",
    value: "Customer Help Desk",
    email: "customercare@xelectron.com",
    desc: "For general customer support & warranty claims",
  },
  {
    label: "Service Center (Vaishali, Ghaziabad)",
    value: "Service Center (Vaishali, Ghaziabad)",
    email: "kapil@xelectron.com",
    desc: "For technical service, repairs & hardware replacements",
  },
  {
    label: "Spectrum Metro Store",
    value: "Spectrum Metro Store",
    email: "sales@xelectron.com",
    desc: "For showroom demos & retail store purchases",
  },
  {
    label: "Corporate Office",
    value: "Corporate Office",
    email: "info@xelectron.com",
    desc: "For administrative & corporate office correspondence",
  },
];

export const ALLOWED_DEPARTMENT_EMAILS = [
  "sales@xelectron.com",
  "customercare@xelectron.com",
  "kapil@xelectron.com",
  "info@xelectron.com",
];

export function getDepartmentEmail(departmentName?: string | null, preferredEmail?: string | null): string {
  // If a valid department email was explicitly passed, use it
  if (preferredEmail && ALLOWED_DEPARTMENT_EMAILS.includes(preferredEmail.trim().toLowerCase())) {
    return preferredEmail.trim().toLowerCase();
  }

  if (!departmentName) return "customercare@xelectron.com";

  const clean = departmentName.trim().toLowerCase();

  // Exact match by value or label
  const matched = CONTACT_DEPARTMENTS.find(
    (d) => d.value.toLowerCase() === clean || d.label.toLowerCase() === clean
  );
  if (matched) return matched.email;

  // Keyword-based routing
  if (clean.includes("warranty") || clean.includes("claim") || clean.includes("help") || clean.includes("support") || clean.includes("care")) {
    return "customercare@xelectron.com";
  }
  if (clean.includes("sale") || clean.includes("store") || clean.includes("bulk") || clean.includes("order") || clean.includes("purchase")) {
    return "sales@xelectron.com";
  }
  if (clean.includes("service") || clean.includes("repair") || clean.includes("vaishali") || clean.includes("ghaziabad") || clean.includes("hardware")) {
    return "kapil@xelectron.com";
  }
  if (clean.includes("corporate") || clean.includes("office") || clean.includes("admin")) {
    return "info@xelectron.com";
  }

  return "customercare@xelectron.com";
}
