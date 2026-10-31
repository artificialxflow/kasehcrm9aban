import type { BranchConcept } from "@/lib/types";

export type ApiBranch = {
  id: string;
  legacyId: string | null;
  name: string;
  city: string;
  concept: BranchConcept;
  isOpen: boolean;
  isPilot: boolean;
  dailySaleRial: string;
};

export type DashboardSummary = {
  totalSaleRialToday: string;
  saleCountToday: number;
  purchaseCountToday: number;
  openBranches: number;
  branchCount: number;
  branchShare: { name: string; value: number; concept: string }[];
  salesChart: { name: string; sales: number }[];
  recentSales: {
    id: string;
    soldAt: string;
    totalRial: string;
    source: string;
    branch: { name: string; concept: BranchConcept };
    lines: { weightGrams: number; catalogItem: { name: string } }[];
  }[];
  branches: {
    id: string;
    legacyId: string | null;
    name: string;
    city: string;
    concept: BranchConcept;
    isOpen: boolean;
    isPilot: boolean;
    dailySaleRial: string;
  }[];
};
