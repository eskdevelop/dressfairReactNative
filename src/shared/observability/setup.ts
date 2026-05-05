import { crashReporter } from './crash';
import type { ObservabilityTransport } from './transport';
import { setObservabilityTransport } from './transport';

type GlobalErrorHandler = (error: Error, isFatal?: boolean) => void;

type ErrorUtilsApi = {
  setGlobalHandler: (handler: GlobalErrorHandler) => void;
  getGlobalHandler?: () => GlobalErrorHandler | undefined;
};

type GlobalWithErrorUtils = typeof globalThis & {
  ErrorUtils?: ErrorUtilsApi;
  HermesInternal?: {
    enablePromiseRejectionTracker?: (options: {
      allRejections: boolean;
      onUnhandled: (id: number, rejection: unknown) => void;
    }) => void;
  };
};

const installGlobalErrorHandler = (): void => {
  const g = globalThis as GlobalWithErrorUtils;
  const errorUtils = g.ErrorUtils;
  if (!errorUtils?.setGlobalHandler) return;

  const previous = errorUtils.getGlobalHandler?.();
  errorUtils.setGlobalHandler((error, isFatal) => {
    crashReporter.capture(error, { source: 'global', isFatal: Boolean(isFatal) });
    previous?.(error, isFatal);
  });
};

const installPromiseRejectionTracker = (): void => {
  const hermes = (globalThis as GlobalWithErrorUtils).HermesInternal;
  if (!hermes?.enablePromiseRejectionTracker) return;
  hermes.enablePromiseRejectionTracker({
    allRejections: true,
    onUnhandled: (id, rejection) => {
      crashReporter.capture(rejection, { source: 'unhandled_promise', id });
    },
  });
};

let installed = false;

export type InstallObservabilityOptions = {
  transport?: ObservabilityTransport | null;
};

// Call once at app startup (App.tsx). Safe to call multiple times in tests
// or hot-reload — only the first call wires native handlers.
export const installObservability = (
  options?: InstallObservabilityOptions,
): void => {
  if (options?.transport !== undefined) {
    setObservabilityTransport(options.transport);
  }
  if (installed) return;
  installed = true;
  installGlobalErrorHandler();
  installPromiseRejectionTracker();
};
