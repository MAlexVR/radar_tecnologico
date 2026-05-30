/**
 * TrajectoryModal — RTL integration tests
 *
 * The component uses useTranslations (next-intl), so we wrap renders with
 * NextIntlClientProvider + the real es.json messages.
 *
 * Covers:
 *  - open=true: renders the dialog with map and export button
 *  - open=false: dialog content is not visible
 *  - Export button is present and labelled
 *  - At least one map driver tab is visible when open
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../../messages/es.json";
import { TrajectoryModal } from "./TrajectoryModal";

// ── Mocks ────────────────────────────────────────────────────────────────────

// Mock downloadElementAsPDF — avoids html-to-image/jsPDF in jsdom
vi.mock("@/core", () => ({
  downloadElementAsPDF: vi.fn().mockResolvedValue(undefined),
}));

// Mock the telecom adapter — domain data is not under test here
vi.mock("@/lib/trajectory-data.telecom", () => ({
  telecomConfig: {
    drivers: [
      { key: "D1", label: "D1 — IA/ML/5G" },
      { key: "D3", label: "D3 — SDN/NFV/Open RAN" },
    ],
    layers: [
      { key: "L1", label: "L1 Tecnologías", order: 1 },
      { key: "L2", label: "L2 Infraestructura", order: 2 },
      { key: "L3", label: "L3 Formación", order: 3 },
      { key: "L4", label: "L4 Aliados", order: 4 },
    ],
    horizonBuckets: [
      { key: "ahora", label: "Ahora", order: 1 },
      { key: "corto", label: "Corto", order: 2 },
      { key: "medio1", label: "Medio 1", order: 3 },
      { key: "medio2", label: "Medio 2", order: 4 },
      { key: "largo", label: "Largo", order: 5 },
    ],
    colorFor: () => "bg-gray-100 text-gray-800",
    labelFor: (item: { title: string }) => item.title,
  },
  buildTelecomTrajectory: vi.fn().mockReturnValue({
    items: [
      {
        id: "d1-l2-lab-aiops",
        layer: "L2",
        driver: "D1",
        horizon: "corto",
        title: "Lab AIOps",
        detail: "Laboratorio de AIOps",
      },
    ],
  }),
}));

// ── Helpers ────────────────────────────────────────────────────────────────────

function renderModal(open: boolean) {
  const onOpenChange = vi.fn();
  render(
    <NextIntlClientProvider locale="es" messages={messages}>
      <TrajectoryModal open={open} onOpenChange={onOpenChange} />
    </NextIntlClientProvider>
  );
  return { onOpenChange };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("TrajectoryModal", () => {
  it("renders the dialog title when open=true", () => {
    renderModal(true);
    // The modal title should appear in the document.
    // Exact name match disambiguates the DialogTitle from the longer intro heading.
    expect(
      screen.getByRole("heading", { name: "Mapa de Trayectoria Tecnológica" })
    ).toBeInTheDocument();
  });

  it("renders driver tabs when open=true", () => {
    renderModal(true);
    expect(screen.getByRole("tab", { name: /D1/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /D3/i })).toBeInTheDocument();
  });

  it("renders the export PDF button when open=true", () => {
    renderModal(true);
    const exportBtn = screen.getByTestId("trajectory-export-btn");
    expect(exportBtn).toBeInTheDocument();
  });

  it("does not render dialog content when open=false", () => {
    renderModal(false);
    // Radix Dialog unmounts content when closed
    expect(
      screen.queryByRole("heading", { name: "Mapa de Trayectoria Tecnológica" })
    ).toBeNull();
  });

  it("renders at least one trajectory node button when open=true", () => {
    renderModal(true);
    // The mocked dataset has one item: "Lab AIOps" in D1
    const btns = screen.getAllByRole("button", { name: /Lab AIOps/i });
    expect(btns.length).toBeGreaterThan(0);
  });

  it("clicking a node opens the detail panel", () => {
    renderModal(true);
    // Click the node button (first match — desktop or mobile)
    const btn = screen.getAllByRole("button", { name: /Lab AIOps/i })[0];
    fireEvent.click(btn);
    expect(screen.getByTestId("trajectory-detail-panel")).toBeInTheDocument();
  });

  it("clicking the same node again deselects it (toggle)", () => {
    renderModal(true);
    const btn = screen.getAllByRole("button", { name: /Lab AIOps/i })[0];
    // First click — select
    fireEvent.click(btn);
    expect(screen.getByTestId("trajectory-detail-panel")).toBeInTheDocument();
    // Second click — deselect
    fireEvent.click(btn);
    expect(screen.queryByTestId("trajectory-detail-panel")).toBeNull();
  });

  it("close button inside detail panel hides the panel", async () => {
    renderModal(true);
    const btn = screen.getAllByRole("button", { name: /Lab AIOps/i })[0];
    fireEvent.click(btn);
    expect(screen.getByTestId("trajectory-detail-panel")).toBeInTheDocument();
    // The detail close button
    const closeBtn = screen.getByRole("button", { name: /Cerrar detalle/i });
    fireEvent.click(closeBtn);
    await waitFor(() =>
      expect(screen.queryByTestId("trajectory-detail-panel")).toBeNull()
    );
  });
});
