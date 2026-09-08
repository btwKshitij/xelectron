import { z } from "zod";

const text = z.string().trim().min(1).max(10000);
export const troubleshootingSchema = z.object({
  badge: text, title: text, description: text, searchPlaceholder: text,
  helpTitle: text, helpDescription: text, helpButton: text,
  helpHref: z.string().trim().regex(/^\/(?![\/\\])[^\\\s]*$/, "Use a local path such as /repair-replacement"),
  categories: z.array(z.object({ id: z.string().regex(/^[a-z0-9-]+$/).refine(id => id !== "all"), name: text, icon: z.enum(["tv", "audio", "wifi"]) })).min(1).max(50),
  guides: z.array(z.object({ id: text, category: text, title: text, steps: z.array(text).min(1).max(100) })).max(500),
}).superRefine((data, ctx) => {
  const ids = data.categories.map(c => c.id);
  if (new Set(ids).size !== ids.length) ctx.addIssue({ code: "custom", message: "Topic IDs must be unique", path: ["categories"] });
  if (new Set(data.guides.map(g => g.id)).size !== data.guides.length) ctx.addIssue({ code: "custom", message: "Guide IDs must be unique", path: ["guides"] });
  data.guides.forEach((guide, i) => {
    if (!ids.includes(guide.category)) ctx.addIssue({ code: "custom", message: "Choose an existing topic for every guide", path: ["guides", i, "category"] });
  });
});
export type TroubleshootingContent = z.infer<typeof troubleshootingSchema>;

const guides = [
  {
    category: "projectors",
    title: "Projector Displaying 'No Signal' via HDMI",
    steps: [
      "Ensure the HDMI cable is firmly connected to both the Projector and your Laptop/Console.",
      "Press the 'Source / Input' button on your XElectron remote and select HDMI 1 or HDMI 2.",
      "Check that your Laptop display settings are set to 'Duplicate' or 'Extend' (Windows Key + P).",
      "Restart the projector if the source signal is not detected automatically.",
    ],
  },
  {
    category: "projectors",
    title: "How to Adjust Auto-Focus & Keystone Correction",
    steps: [
      "Press the dedicated 'Focus' keys (+ / -) on the XElectron Bluetooth remote for razor-sharp clarity.",
      "Navigate to Settings > Projection Settings > Auto Keystone and enable 4D Automatic Keystone.",
      "Ensure the projector lens is free from dust or fingerprint smudges.",
    ],
  },
  {
    category: "wifi",
    title: "Projector or TV Cannot Connect to Home WiFi Network",
    steps: [
      "Go to Settings > Network & Internet and turn Wi-Fi OFF and back ON.",
      "Ensure your router is broadcasting on 2.4GHz or 5GHz band with standard WPA2 encryption.",
      "Forget the network and re-enter your Wi-Fi password carefully.",
      "If the issue persists, reboot your Wi-Fi router and XElectron device.",
    ],
  },
  {
    category: "audio",
    title: "No Sound Coming From Audio Speaker / Soundbar",
    steps: [
      "Verify the volume is turned up on both your Projector/TV and the external soundbar.",
      "If connected via AUX (3.5mm), ensure the cable is pushed in completely until it clicks.",
      "If connected via Optical or ARC, go to TV Sound Settings and switch output to 'PCM' or 'Optical Output'.",
      "Unpair and re-pair Bluetooth devices if audio lag or distortion occurs.",
    ],
  },
  {
    category: "tvs",
    title: "XElectron Remote Control Not Responding",
    steps: [
      "Check and replace the AAA batteries in your remote control.",
      "To pair Bluetooth Remote: Hold down the 'Home' and 'Back' buttons together for 5 seconds near the TV/Projector.",
      "Ensure there are no large physical obstructions in front of the IR sensor.",
    ],
  },
];

export const defaultTroubleshootingContent: TroubleshootingContent = {
  badge: "Self-Service Support",
  title: "Troubleshooting & Technical Guide",
  description: "Find instant step-by-step solutions for HDMI signals, Wi-Fi connectivity, audio settings, and remote pairing.",
  searchPlaceholder: "Search by topic (e.g. HDMI, WiFi, Sound, Focus, Remote)...",
  helpTitle: "Still having trouble with your device?",
  helpDescription: "Contact our Technical Service Center at Vaishali Ghaziabad or raise a repair request.",
  helpButton: "Request Repair / Replacement",
  helpHref: "/repair-replacement",
  categories: [
    { id: "projectors", name: "Smart Projectors", icon: "tv" },
    { id: "tvs", name: "Smart TVs", icon: "tv" },
    { id: "audio", name: "Soundbars & Speakers", icon: "audio" },
    { id: "wifi", name: "WiFi & Bluetooth", icon: "wifi" },
  ],
  guides: guides.map((guide, i) => ({ ...guide, id: `guide-${i + 1}` })),
};
