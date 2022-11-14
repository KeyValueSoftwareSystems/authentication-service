const { localStorage } = window;

const LocalStorage = {
  setItem(key: string, value: string): void {
    localStorage.setItem(key, JSON.stringify(value));
  },
  getItem(key: string): string | null {
    const value = localStorage.getItem(key) as string;
    try {
      return JSON.parse(value);
    } catch (e) {
      return null;
    }
  },
  remove(key: string): void {
    localStorage.removeItem(key);
  },

  clear(): void {
    localStorage.clear();
  },
};

export default LocalStorage;
