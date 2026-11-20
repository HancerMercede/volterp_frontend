import type {
  CompanyContingencyStatus,
  CompanyEmissionMode,
  EcfDocumentType,
  EcfFiscalState,
  EcfStatus,
  EntityStatus,
  NormalFiscalDocumentType,
  ReceivedElectronicInvoiceApprovalStatus,
} from "../constants/electronicInvoicing";

/**
 * Electronic invoicing (e-CF) contract.
 *
 * Every DTO below mirrors the backend DTO field by field: same names, same
 * types, same nullability (spec S4). The backend is the authority of the
 * contract (spec S1) — nothing here is an approximation, and nothing here
 * invents a rule the backend does not expose.
 *
 * `companyId` always comes from the JWT of the tenant, so no request in this
 * module carries it (spec S6).
 *
 * Dates travel as ISO 8601 strings, the JSON representation of the backend
 * `Date`, and the same representation the rest of the frontend already uses.
 */

// ========================
// Company issuers
// ========================

export interface CompanyIssuerDto {
  id: string;
  companyId: string;
  taxId: string;
  legalName: string;
  isActive: boolean;
}

export type CompanyIssuer = CompanyIssuerDto;

export interface CreateCompanyIssuerRequest {
  taxId: string;
  legalName: string;
}

export interface UpdateCompanyIssuerRequest {
  legalName: string;
  isActive: boolean;
}

// ========================
// Electronic invoice state surface
// ========================

export interface ElectronicInvoiceStateCounts {
  pendingEmission: number;
  inProcess: number;
  rejected: number;
  requiresReview: number;
  total: number;
}

export interface ElectronicInvoiceStateDto {
  id: string;
  saleId: string;
  encf: string;
  documentType: EcfDocumentType;
  fiscalState: EcfFiscalState | null;
  status: EcfStatus;
  verdictNote: string | null;
  rawResponse: string | null;
  lastError: string | null;
  requiresReview: boolean;
  sentAt: string | null;
  nextCheckAt: string | null;
  receivedAt: string | null;
  statusCheckCount: number;
  sequenceConsumed: boolean | null;
}

export interface ElectronicInvoiceStateSurfaceDto {
  counts: ElectronicInvoiceStateCounts;
  invoices: ElectronicInvoiceStateDto[];
}

// ========================
// Electronic invoices
// ========================

export interface ElectronicInvoiceDto {
  id: string;
  companyId: string;
  saleId: string;
  encf: string;
  documentType: EcfDocumentType;
  issuerTaxId: string;
  receiverTaxId: string | null;
  subtotal: number;
  itbis: number;
  total: number;
  status: EcfStatus;
  trackId: string | null;
  securityCode: string | null;
  qrUrl: string | null;
  verdictNote: string | null;
  requiresReview: boolean;
  signedAt: string | null;
  sentAt: string | null;
}

// ========================
// Electronic invoice sequences (e-NCF ranges)
// ========================

export interface ElectronicInvoiceSequenceDto {
  id: string;
  companyId: string;
  issuerTaxId: string;
  documentType: EcfDocumentType;
  from: number;
  to: number;
  currentSequence: number;
  expiresAt: string | null;
  hasRoom: boolean;
}

export type ElectronicInvoiceSequence = ElectronicInvoiceSequenceDto;

export interface SaveElectronicInvoiceSequenceRequest {
  issuerTaxId: string;
  documentType: EcfDocumentType;
  from: number;
  to: number;
  position: number;
  expiresAt: string | null;
}

/** The backend returns `requiresExpiry` already calculated; it is read-only. */
export interface SaveElectronicInvoiceSequenceDto extends SaveElectronicInvoiceSequenceRequest {
  requiresExpiry: boolean;
}

export interface RangeAnnulmentResult {
  code: string | null;
  name: string | null;
  messages: string[];
  annulledAt: string | null;
}

// ========================
// Company certificates
// ========================

export interface CompanyCertificateDto {
  id: string;
  companyId: string;
  name: string;
  taxId: string;
  expiresAt: string;
  status: EntityStatus;
  isExpired: boolean;
}

export type CompanyCertificate = CompanyCertificateDto;

export interface CreateCompanyCertificateRequest {
  name: string;
  taxId: string;
  expiresAt: string;
  /** The opaque credential the backend encrypts server-side. */
  credential: string;
}

// ========================
// Company emission mode
// ========================

export interface CompanyEmissionModeDto {
  emissionMode: CompanyEmissionMode;
  contingencyStatus: CompanyContingencyStatus;
  contingencyStartsAt: string | null;
  contingencyEndsAt: string | null;
}

export interface UpdateCompanyContingencyRequest {
  status: CompanyContingencyStatus;
  startsAt: string | null;
  endsAt: string | null;
}

export interface UpdateCompanyEmissionModeRequest {
  emissionMode: CompanyEmissionMode;
}

// ========================
// API credentials
// ========================

export interface ApiCredentialDto {
  id: string;
  name: string;
  keyId: string;
  status: EntityStatus;
  expiresAt: string | null;
  updatedAt: string | null;
  isExpired: boolean;
  createdAt: string;
}

export type ApiCredential = ApiCredentialDto;

/** The `secret` is returned exactly once, right after it is issued. */
export interface IssuedApiCredentialDto {
  id: string;
  name: string;
  keyId: string;
  secret: string;
  expiresAt: string | null;
}

// ========================
// Normal (paper) fiscal sequences
// ========================

export interface NormalFiscalSequenceDto {
  id: string;
  companyId: string;
  issuerTaxId: string;
  documentType: NormalFiscalDocumentType;
  from: number;
  to: number;
  currentSequence: number;
  expiresAt: string | null;
  hasRoom: boolean;
}

export type NormalFiscalSequence = NormalFiscalSequenceDto;

export interface SaveNormalFiscalSequenceRequest {
  issuerTaxId: string;
  documentType: NormalFiscalDocumentType;
  from: number;
  to: number;
  position: number;
  expiresAt: string | null;
}

// ========================
// Received electronic invoices (third party e-CF)
// ========================

export interface ReceivedElectronicInvoiceDto {
  id: string;
  issuerTaxId: string;
  receiverTaxId: string;
  encf: string;
  documentType: EcfDocumentType;
  signedAt: string;
  receivedAt: string;
  approvalStatus: ReceivedElectronicInvoiceApprovalStatus;
  approvalDecidedBy: string | null;
  approvalDecidedAt: string | null;
  approvalReason: string | null;
  alreadyReceived: boolean;
}

export type ReceivedElectronicInvoice = ReceivedElectronicInvoiceDto;

export interface CommercialApprovalDecisionRequest {
  approved: boolean;
  reason: string;
}
