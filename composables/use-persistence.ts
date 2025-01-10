type Serializer<T> = (v: T) => string;
type Deserializer<T> = (v: string) => T;

const usePersistence = <T>(key: string, s: Serializer<T>, d: Deserializer<T>, defaultValue: T) => ({
  set(value: T) {
    if (!import.meta.client) {
      return;
    }
    window.localStorage.setItem(key, s(value));
  },
  get(): T {
    if (!import.meta.client) {
      return defaultValue;
    }
    const value = window.localStorage.getItem(key);
    if (value === null) {
      return defaultValue;
    }
    return d(value);
  }
});

export default usePersistence;
