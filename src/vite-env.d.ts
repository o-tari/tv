/// <reference types="vite/client" />

// Global WebTorrent declaration from CDN
declare global {
  interface Window {
    WebTorrent: {
      new (): any;
    };
  }
}
