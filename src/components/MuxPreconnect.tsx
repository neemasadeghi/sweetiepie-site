/** Warm Mux CDN connections site-wide so landing video connects faster. */
export function MuxPreconnect() {
  return (
    <>
      <link rel="preconnect" href="https://stream.mux.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://image.mux.com" />
      <link rel="dns-prefetch" href="https://stream.mux.com" />
      <link rel="dns-prefetch" href="https://image.mux.com" />
    </>
  );
}
