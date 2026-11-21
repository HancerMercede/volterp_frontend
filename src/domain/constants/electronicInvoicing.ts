/**
 * Enums of the electronic invoicing (e-CF) contract.
 *
 * The backend serializes every enum as text through a global
 * `JsonStringEnumConverter`, so the wire values are the .NET member names.
 * The values below are copied verbatim from the backend DTOs: the frontend
 * never renames, translates or invents them (spec S10).
 *
 * Parsing is case-insensitive on purpose (spec S4): the contract allows an
 * out-of-range enum to reach the client as its ordinal (`"0"`), so every
 * parser returns `null` instead of pretending the value is valid.
 */

/** `EcfDocumentType` — the kind of e-CF the backend can issue. */
export const EcfDocumentType = {
  FiscalCredit: "FiscalCredit",
  Consumer: "Consumer",
  DebitNote: "DebitNote",
  CreditNote: "CreditNote",
  Purchase: "Purchase",
  MinorExpenses: "MinorExpenses",
  SpecialRegimes: "SpecialRegimes",
  Governmental: "Governmental",
  Exportation: "Exportation",
  ExternalPayments: "ExternalPayments",
} as const;

export type EcfDocumentType = (typeof EcfDocumentType)[keyof typeof EcfDocumentType];

export const ECF_DOCUMENT_TYPES: readonly EcfDocumentType[] =
  Object.values(EcfDocumentType);

/** `EcfStatus` — lifecycle of the document inside the backend queue. */
export const EcfStatus = {
  Draft: "Draft",
  Signed: "Signed",
  Sent: "Sent",
  InProcess: "InProcess",
  Accepted: "Accepted",
  AcceptedConditionally: "AcceptedConditionally",
  Rejected: "Rejected",
  Annulled: "Annulled",
} as const;

export type EcfStatus = (typeof EcfStatus)[keyof typeof EcfStatus];

export const ECF_STATUSES: readonly EcfStatus[] = Object.values(EcfStatus);

/** `EcfFiscalState` — the fiscal state a sale exposes to the tenant. */
export const EcfFiscalState = {
  PendingEmission: "PendingEmission",
  InProcess: "InProcess",
  Rejected: "Rejected",
  RequiresReview: "RequiresReview",
} as const;

export type EcfFiscalState = (typeof EcfFiscalState)[keyof typeof EcfFiscalState];

export const ECF_FISCAL_STATES: readonly EcfFiscalState[] =
  Object.values(EcfFiscalState);

/** `EntityStatus` — shared status of the e-CF owned entities. */
export const EntityStatus = {
  Active: "Active",
  Inactive: "Inactive",
  Pending: "Pending",
  Completed: "Completed",
  OnLeave: "OnLeave",
  Cancelled: "Cancelled",
} as const;

export type EntityStatus = (typeof EntityStatus)[keyof typeof EntityStatus];

export const ECF_ENTITY_STATUSES: readonly EntityStatus[] =
  Object.values(EntityStatus);

/** `CompanyEmissionMode` — electronic or normal (paper) issuance. */
export const CompanyEmissionMode = {
  Electronic: "Electronic",
  Normal: "Normal",
} as const;

export type CompanyEmissionMode =
  (typeof CompanyEmissionMode)[keyof typeof CompanyEmissionMode];

export const ECF_COMPANY_EMISSION_MODES: readonly CompanyEmissionMode[] =
  Object.values(CompanyEmissionMode);

/** `CompanyContingencyStatus` — the contingency the company declared. */
export const CompanyContingencyStatus = {
  None: "None",
  Total: "Total",
  Partial: "Partial",
} as const;

export type CompanyContingencyStatus =
  (typeof CompanyContingencyStatus)[keyof typeof CompanyContingencyStatus];

export const ECF_COMPANY_CONTINGENCY_STATUSES: readonly CompanyContingencyStatus[] =
  Object.values(CompanyContingencyStatus);

/** `NormalFiscalDocumentType` — the document types a normal range can cover. */
export const NormalFiscalDocumentType = {
  FiscalCredit: "FiscalCredit",
  Consumer: "Consumer",
  DebitNote: "DebitNote",
  CreditNote: "CreditNote",
} as const;

export type NormalFiscalDocumentType =
  (typeof NormalFiscalDocumentType)[keyof typeof NormalFiscalDocumentType];

export const ECF_NORMAL_FISCAL_DOCUMENT_TYPES: readonly NormalFiscalDocumentType[] =
  Object.values(NormalFiscalDocumentType);

/** `ReceivedElectronicInvoiceApprovalStatus` — commercial approval of a third party e-CF. */
export const ReceivedElectronicInvoiceApprovalStatus = {
  Received: "Received",
  Approved: "Approved",
  Rejected: "Rejected",
} as const;

export type ReceivedElectronicInvoiceApprovalStatus =
  (typeof ReceivedElectronicInvoiceApprovalStatus)[keyof typeof ReceivedElectronicInvoiceApprovalStatus];

export const ECF_RECEIVED_APPROVAL_STATUSES: readonly ReceivedElectronicInvoiceApprovalStatus[] =
  Object.values(ReceivedElectronicInvoiceApprovalStatus);

/**
 * Matches a raw wire value against the enum values, case-insensitively.
 * Returns `null` when the value is not part of the contract.
 */
function matchEnumValue<T extends string>(
  values: readonly T[],
  raw: unknown,
): T | null {
  if (typeof raw !== "string") return null;

  const needle = raw.trim().toLowerCase();
  if (!needle) return null;

  return values.find((value) => value.toLowerCase() === needle) ?? null;
}

export function parseEcfDocumentType(raw: unknown): EcfDocumentType | null {
  return matchEnumValue(ECF_DOCUMENT_TYPES, raw);
}

export function parseEcfStatus(raw: unknown): EcfStatus | null {
  return matchEnumValue(ECF_STATUSES, raw);
}

export function parseEcfFiscalState(raw: unknown): EcfFiscalState | null {
  return matchEnumValue(ECF_FISCAL_STATES, raw);
}

export function parseEntityStatus(raw: unknown): EntityStatus | null {
  return matchEnumValue(ECF_ENTITY_STATUSES, raw);
}

export function parseCompanyEmissionMode(
  raw: unknown,
): CompanyEmissionMode | null {
  return matchEnumValue(ECF_COMPANY_EMISSION_MODES, raw);
}

export function parseCompanyContingencyStatus(
  raw: unknown,
): CompanyContingencyStatus | null {
  return matchEnumValue(ECF_COMPANY_CONTINGENCY_STATUSES, raw);
}

export function parseNormalFiscalDocumentType(
  raw: unknown,
): NormalFiscalDocumentType | null {
  return matchEnumValue(ECF_NORMAL_FISCAL_DOCUMENT_TYPES, raw);
}

export function parseReceivedApprovalStatus(
  raw: unknown,
): ReceivedElectronicInvoiceApprovalStatus | null {
  return matchEnumValue(ECF_RECEIVED_APPROVAL_STATUSES, raw);
}
