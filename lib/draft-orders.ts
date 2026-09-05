export type DraftOrderItem = {
  id: string;
  productId?: string;
  name: string;
  image?: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  isCustom?: boolean;
};

export type DraftOrder = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  note: string;
  tags: string;
  items: DraftOrderItem[];
  createdAt: string;
  updatedAt: string;
};

export type DraftOrderInput = Omit<DraftOrder, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
};

export const DRAFT_ORDERS_STORAGE_KEY = "xelectron-draft-orders";

function canUseStorage() {
  return typeof window !== "undefined";
}

function createId() {
  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function readDraftOrders(): DraftOrder[] {
  if (!canUseStorage()) return [];

  try {
    const saved = window.localStorage.getItem(DRAFT_ORDERS_STORAGE_KEY);
    const drafts = saved ? JSON.parse(saved) : [];
    return Array.isArray(drafts) ? drafts : [];
  } catch {
    return [];
  }
}

export function getDraftOrder(id: string) {
  return readDraftOrders().find((draft) => draft.id === id) ?? null;
}

export function saveDraftOrder(input: DraftOrderInput) {
  if (!canUseStorage()) return null;

  const drafts = readDraftOrders();
  const now = new Date().toISOString();
  const existing = input.id ? drafts.find((draft) => draft.id === input.id) : undefined;
  const draft: DraftOrder = {
    ...input,
    id: input.id || createId(),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  const nextDrafts = existing
    ? drafts.map((current) => (current.id === draft.id ? draft : current))
    : [draft, ...drafts];

  window.localStorage.setItem(DRAFT_ORDERS_STORAGE_KEY, JSON.stringify(nextDrafts));
  return draft;
}

export function deleteDraftOrder(id: string) {
  if (!canUseStorage()) return;
  const drafts = readDraftOrders().filter((draft) => draft.id !== id);
  window.localStorage.setItem(DRAFT_ORDERS_STORAGE_KEY, JSON.stringify(drafts));
}
