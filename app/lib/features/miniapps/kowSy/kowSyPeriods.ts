import { useState } from "react";
// Hook React pour la gestion des périodes (lecture/ajout/suppression)
export function useKowSyPeriods() {
  const [periods, setPeriods] = useState<KowSyPeriod[]>(getPeriods());
  const add = (period: KowSyPeriod) => {
    const updated = [period, ...periods];
    setPeriods(updated);
    savePeriods(updated);
  };
  const update = (id: string, data: Partial<KowSyPeriod>) => {
    const updated = periods.map(p => p.id === id ? { ...p, ...data } : p);
    setPeriods(updated);
    savePeriods(updated);
  };
  const remove = (id: string) => {
    const updated = periods.filter(p => p.id !== id);
    setPeriods(updated);
    savePeriods(updated);
  };
  return { periods, add, update, remove };
}
// Gestion centralisée des périodes KowSy
// Une période = { id, start, end, salary }

export type KowSyPeriod = {
  id: string;
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
  salary: number;
};

const PERIODS_KEY = "kowSy.periods";

export function getPeriods(): KowSyPeriod[] {
  const raw = localStorage.getItem(PERIODS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function savePeriods(periods: KowSyPeriod[]) {
  localStorage.setItem(PERIODS_KEY, JSON.stringify(periods));
}

export function addPeriod(period: KowSyPeriod) {
  const periods = getPeriods();
  savePeriods([period, ...periods]);
}

export function updatePeriod(id: string, data: Partial<KowSyPeriod>) {
  const periods = getPeriods().map(p => p.id === id ? { ...p, ...data } : p);
  savePeriods(periods);
}

export function deletePeriod(id: string) {
  const periods = getPeriods().filter(p => p.id !== id);
  savePeriods(periods);
}

export function getPeriodById(id: string): KowSyPeriod | undefined {
  return getPeriods().find(p => p.id === id);
}
