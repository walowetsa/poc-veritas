import { ParsedData } from "./parser";
import { DashboardConfig } from "@/app/api/dashboard/route";

const KEYS = {
  datasets:  "veritas:datasets",
  activeId:  "veritas:activeId",
};

export const MAX_DATASETS = 5;

// ── Types ────────────────────────────────────────────────────

export type Dataset = {
  id:         string;
  name:       string;
  uploadedAt: string; // ISO date string
  data:       ParsedData;
  dashboard:  DashboardConfig | null;
};

// ── Helpers ──────────────────────────────────────────────────

function loadAll(): Dataset[] {
  try {
    const raw = localStorage.getItem(KEYS.datasets);
    return raw ? (JSON.parse(raw) as Dataset[]) : [];
  } catch {
    return [];
  }
}

function saveAll(datasets: Dataset[]): void {
  try {
    localStorage.setItem(KEYS.datasets, JSON.stringify(datasets));
  } catch (err) {
    console.warn("Veritas: could not persist datasets", err);
  }
}

// ── Dataset CRUD ─────────────────────────────────────────────

export function getDatasets(): Dataset[] {
  return loadAll();
}

export function getDataset(id: string): Dataset | null {
  return loadAll().find((d) => d.id === id) ?? null;
}

export function addDataset(data: ParsedData): Dataset {
  const datasets = loadAll();
  const newDataset: Dataset = {
    id:         crypto.randomUUID(),
    name:       data.fileName,
    uploadedAt: new Date().toISOString(),
    data,
    dashboard:  null,
  };
  const updated = [newDataset, ...datasets].slice(0, MAX_DATASETS);
  saveAll(updated);
  setActiveId(newDataset.id);
  return newDataset;
}

export function removeDataset(id: string): void {
  const datasets = loadAll().filter((d) => d.id !== id);
  saveAll(datasets);
  // If we removed the active dataset, switch to the first remaining one
  if (getActiveId() === id) {
    setActiveId(datasets[0]?.id ?? null);
  }
}

export function saveDashboardForDataset(id: string, config: DashboardConfig): void {
  const datasets = loadAll().map((d) =>
    d.id === id ? { ...d, dashboard: config } : d
  );
  saveAll(datasets);
}

// ── Active ID ────────────────────────────────────────────────

export function getActiveId(): string | null {
  try {
    return localStorage.getItem(KEYS.activeId);
  } catch {
    return null;
  }
}

export function setActiveId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(KEYS.activeId, id);
    } else {
      localStorage.removeItem(KEYS.activeId);
    }
  } catch {
    // ignore
  }
}

export function getActiveDataset(): Dataset | null {
  const id = getActiveId();
  return id ? getDataset(id) : null;
}

// ── Clear all ────────────────────────────────────────────────

export function clearAll(): void {
  try {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

// ── Storage size ─────────────────────────────────────────────

export function getStorageSize(): string {
  try {
    const raw = localStorage.getItem(KEYS.datasets) ?? "";
    const bytes = new Blob([raw]).size;
    if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
    return `${(bytes / 1_000).toFixed(0)} KB`;
  } catch {
    return "unknown";
  }
}