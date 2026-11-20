import { create } from "zustand";
import { receivedElectronicInvoiceService } from "../infrastructure/api/receivedElectronicInvoiceService";
import type {
  CommercialApprovalDecisionRequest,
  ReceivedElectronicInvoice,
} from "../domain/types";

interface ReceivedElectronicInvoiceStore {
  decision: ReceivedElectronicInvoice | null;
  loading: boolean;
  error: string | null;
  decideCommercialApproval: (
    id: string,
    data: CommercialApprovalDecisionRequest,
  ) => Promise<ReceivedElectronicInvoice>;
  setError: (error: string | null) => void;
}

export const useReceivedElectronicInvoiceStore =
  create<ReceivedElectronicInvoiceStore>((set) => ({
    decision: null,
    loading: false,
    error: null,

    decideCommercialApproval: async (
      id: string,
      data: CommercialApprovalDecisionRequest,
    ) => {
      set({ loading: true, error: null });
      try {
        const decision =
          await receivedElectronicInvoiceService.decideCommercialApproval(
            id,
            data,
          );
        set({ decision, loading: false });
        return decision;
      } catch (error) {
        set({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to record commercial approval",
        });
        throw error;
      }
    },

    setError: (error: string | null) => set({ error }),
  }));
