"use client";

import { useRouter } from "next/navigation";

export type DashboardCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  orderCount: number;
  amountSpent: number;
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function CustomerTableRows({ customers }: { customers: DashboardCustomer[] }) {
  const router = useRouter();

  return (
    <>
      {customers.map((customer) => (
        <tr
          key={customer.id}
          role="link"
          tabIndex={0}
          onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              router.push(`/dashboard/customers/${customer.id}`);
            }
          }}
          className="cursor-pointer outline-none transition hover:bg-black/[0.02] focus-visible:bg-black/[0.04]"
        >
          <td className="border-b border-black/10 px-3 py-2"><input type="checkbox" aria-label={`Select ${customer.name}`} onClick={(event) => event.stopPropagation()} /></td>
          <td className="border-b border-black/10 px-3 py-2"><span className="font-medium">{customer.name}</span></td>
          <td className="border-b border-black/10 px-3 py-2">{customer.email}</td>
          <td className="border-b border-black/10 px-3 py-2">{customer.phone || "—"}</td>
          <td className="border-b border-black/10 px-3 py-2 text-right">{customer.orderCount}</td>
          <td className="border-b border-black/10 px-3 py-2 text-right">{currencyFormatter.format(customer.amountSpent)}</td>
          <td className="border-b border-black/10 px-3 py-2">{dateFormatter.format(new Date(customer.createdAt))}</td>
        </tr>
      ))}
    </>
  );
}
