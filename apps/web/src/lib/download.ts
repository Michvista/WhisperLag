"use client";

import { API_BASE, getToken } from "./api";

/** Downloads a report as a .csv file via the API export endpoint. */
export async function downloadCsv(reportId: string, title?: string): Promise<void> {
  const res = await fetch(`${API_BASE}/reports/${reportId}/export?format=csv`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Export failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safe = (title ?? "report").replace(/[^\w-]+/g, "_").toLowerCase();
  a.href = url;
  a.download = `${safe}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}