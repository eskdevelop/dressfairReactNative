const marks = new Map<string, number>();

export const perf = {
  start(name: string) {
    marks.set(name, Date.now());
  },
  end(name: string): number | null {
    const startAt = marks.get(name);
    if (!startAt) return null;
    const elapsed = Date.now() - startAt;
    marks.delete(name);
    return elapsed;
  },
};
