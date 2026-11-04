"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const FestiveOfferPopup = dynamic(() => import("./festive-offer-popup"), { ssr: false });

export default function DeferredFestiveOffer() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => setReady(true), 5000);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      window.removeEventListener("load", schedule);
      clearTimeout(timer);
    };
  }, []);

  return ready ? <FestiveOfferPopup /> : null;
}
