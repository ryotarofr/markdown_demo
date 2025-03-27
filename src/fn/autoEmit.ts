import { createEmitter } from "@/fn/state/emitter";

export function autoEmit<T extends Record<string, any>>(
  data: T
): { [K in keyof T]: ReturnType<typeof createEmitter> };
export function autoEmit<T>(data: T): ReturnType<typeof createEmitter>;
export function autoEmit(data: any) {
  const isPlainObject = (data: unknown): data is Record<string, any> => {
    return data !== null && typeof data === "object" && !Array.isArray(data);
  };
  const emitter = () => createEmitter(data)
  const emitters =  () => Object.keys(data).reduce((acc, key) => {
    (acc as any)[key] = createEmitter(data[key]);
    return acc;
  }, {} as { [K in keyof typeof data]: ReturnType<typeof createEmitter> })

  return isPlainObject(data) ? emitters() : emitter();
}
