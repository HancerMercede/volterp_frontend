import { describe, expect, it } from "vitest";
import {
  ECF_COMPANY_CONTINGENCY_STATUSES,
  ECF_COMPANY_EMISSION_MODES,
  ECF_DOCUMENT_TYPES,
  ECF_ENTITY_STATUSES,
  ECF_FISCAL_STATES,
  ECF_NORMAL_FISCAL_DOCUMENT_TYPES,
  ECF_RECEIVED_APPROVAL_STATUSES,
  ECF_STATUSES,
  parseCompanyContingencyStatus,
  parseCompanyEmissionMode,
  parseEcfDocumentType,
  parseEcfFiscalState,
  parseEcfStatus,
  parseEntityStatus,
  parseNormalFiscalDocumentType,
  parseReceivedApprovalStatus,
} from "../../domain/constants/electronicInvoicing";

describe("e-CF contract enums", () => {
  it("keeps the exact wire values the backend sends", () => {
    expect(ECF_DOCUMENT_TYPES).toEqual([
      "FiscalCredit",
      "Consumer",
      "DebitNote",
      "CreditNote",
      "Purchase",
      "MinorExpenses",
      "SpecialRegimes",
      "Governmental",
      "Exportation",
      "ExternalPayments",
    ]);
    expect(ECF_STATUSES).toEqual([
      "Draft",
      "Signed",
      "Sent",
      "InProcess",
      "Accepted",
      "AcceptedConditionally",
      "Rejected",
      "Annulled",
    ]);
    expect(ECF_FISCAL_STATES).toEqual([
      "PendingEmission",
      "InProcess",
      "Rejected",
      "RequiresReview",
    ]);
    expect(ECF_ENTITY_STATUSES).toEqual([
      "Active",
      "Inactive",
      "Pending",
      "Completed",
      "OnLeave",
      "Cancelled",
    ]);
    expect(ECF_COMPANY_EMISSION_MODES).toEqual(["Electronic", "Normal"]);
    expect(ECF_COMPANY_CONTINGENCY_STATUSES).toEqual([
      "None",
      "Total",
      "Partial",
    ]);
    expect(ECF_NORMAL_FISCAL_DOCUMENT_TYPES).toEqual([
      "FiscalCredit",
      "Consumer",
      "DebitNote",
      "CreditNote",
    ]);
    expect(ECF_RECEIVED_APPROVAL_STATUSES).toEqual([
      "Received",
      "Approved",
      "Rejected",
    ]);
  });
});

describe("e-CF enum parsing", () => {
  it("returns the canonical value for an exact wire value", () => {
    expect(parseEcfDocumentType("FiscalCredit")).toBe("FiscalCredit");
    expect(parseEcfStatus("AcceptedConditionally")).toBe(
      "AcceptedConditionally",
    );
    expect(parseEcfFiscalState("RequiresReview")).toBe("RequiresReview");
    expect(parseEntityStatus("OnLeave")).toBe("OnLeave");
    expect(parseCompanyEmissionMode("Electronic")).toBe("Electronic");
    expect(parseCompanyContingencyStatus("Partial")).toBe("Partial");
    expect(parseNormalFiscalDocumentType("CreditNote")).toBe("CreditNote");
    expect(parseReceivedApprovalStatus("Approved")).toBe("Approved");
  });

  it("matches case-insensitively and returns the canonical value", () => {
    expect(parseEcfDocumentType("fiscalcredit")).toBe("FiscalCredit");
    expect(parseEcfDocumentType("MINOREXPENSES")).toBe("MinorExpenses");
    expect(parseEcfStatus("accepted")).toBe("Accepted");
    expect(parseEcfFiscalState("requiresreview")).toBe("RequiresReview");
    expect(parseEntityStatus("onleave")).toBe("OnLeave");
    expect(parseCompanyEmissionMode("normal")).toBe("Normal");
    expect(parseCompanyContingencyStatus("total")).toBe("Total");
    expect(parseNormalFiscalDocumentType("debitnote")).toBe("DebitNote");
    expect(parseReceivedApprovalStatus("rejected")).toBe("Rejected");
  });

  it("ignores surrounding whitespace", () => {
    expect(parseEcfStatus("  Accepted  ")).toBe("Accepted");
  });

  it("returns null for a value the backend contract does not define", () => {
    // An out-of-range enum is serialized by the backend as its ordinal.
    expect(parseEcfDocumentType("0")).toBeNull();
    expect(parseEcfStatus("9")).toBeNull();
    expect(parseEcfFiscalState("Unknown")).toBeNull();
    expect(parseEntityStatus("Deleted")).toBeNull();
    expect(parseCompanyEmissionMode("Hybrid")).toBeNull();
    expect(parseCompanyContingencyStatus("Partialish")).toBeNull();
    expect(parseNormalFiscalDocumentType("Purchase")).toBeNull();
    expect(parseReceivedApprovalStatus("Pending")).toBeNull();
  });

  it("returns null for a non-string value", () => {
    expect(parseEcfDocumentType(null)).toBeNull();
    expect(parseEcfDocumentType(undefined)).toBeNull();
    expect(parseEcfStatus(1)).toBeNull();
    expect(parseEcfStatus({})).toBeNull();
  });
});
