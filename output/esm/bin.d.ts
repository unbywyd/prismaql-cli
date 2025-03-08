declare const loadQueryRenderManager: (options?: Record<string, boolean | string | number>) => Promise<(sourceCommand: string) => Promise<void>>;

export { loadQueryRenderManager as default };
