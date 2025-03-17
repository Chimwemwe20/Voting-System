interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request: (request: { method: string; params?: unknown[] }) => Promise<unknown>;
    on: (event: string, callback: (...args: unknown[]) => void) => void;
    removeAllListeners: (event: string) => void;
  };
}
