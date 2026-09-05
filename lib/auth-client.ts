import { useEffect, useState } from "react";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
};

export const authClient = {
  useSession: () => {
    const [data, setData] = useState<{ user: SessionUser | null } | null>(null);
    const [isPending, setIsPending] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
      fetch("/api/auth/me")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch session");
          return res.json();
        })
        .then((json) => {
          setData({ user: json.user || null });
          setIsPending(false);
        })
        .catch((err) => {
          setError(err);
          setIsPending(false);
        });
    }, []);

    return { data, isPending, error };
  },
  
  signOut: async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("Logout failed");
      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error };
    }
  },
};
