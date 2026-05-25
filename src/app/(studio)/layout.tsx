import type { ReactNode } from "react";

const bridgeScript = "https://core.sanity-cdn.com/bridge.js";

/**
 * Lets sanity.io/welcome (org Dashboard) talk to this embedded Studio.
 * @see https://www.sanity.io/docs/dashboard/dashboard-configure#adding-the-bridge-component
 */
export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script src={bridgeScript} async type="module" />
      {children}
    </>
  );
}
