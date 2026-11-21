import type { UserStatus } from '../constants/userStatus';
import type { TaxCode } from '../constants/taxCodes';
import type {
  EcfDocumentType,
  EcfFiscalState,
} from '../constants/electronicInvoicing';

export interface Direccion {
  calle: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  pais: string;
}

export interface Telefono {
  numero: string;
  tipo: "movil" | "laboral" | "personal" | "emergencia";
}

export interface Auditoria {
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PagedResult<T> {
  rowCount: number;
  pageNumber: number;
  pageSize: number;
  pageCount: number;
  items: T[];
}

/**
 * The lifecycle of an e-CF: the first three are ours (before the document
 * exists for the DGII), the rest are the verdicts the DGII gives.
 */
export type ElectronicInvoiceStatus =
  | "Draft"
  | "Signed"
  | "Sent"
  | "InProcess"
  | "Accepted"
  | "AcceptedConditionally"
  | "Rejected"
  | "Annulled";

export interface ElectronicInvoiceDto {
  id: string;
  companyId: string;
  saleId: string;
  encf: string;
  documentType: string;
  issuerTaxId: string;
  receiverTaxId: string | null;
  subtotal: number;
  itbis: number;
  total: number;
  status: ElectronicInvoiceStatus;
  trackId: string | null;
  securityCode: string | null;
  qrUrl: string | null;
  verdictNote: string | null;
  requiresReview: boolean;
  signedAt: string | null;
  sentAt: string | null;
}

/**
 * What the tenant sees of a document: the states that are still open. A
 * closed verdict (accepted or annulled) is not one of them: there is nothing
 * left to do about it.
 */
export type SaleFiscalState =
  | "PendingEmission"
  | "InProcess"
  | "Rejected"
  | "RequiresReview";

export type FiscalStateColor =
  | "green"
  | "amber"
  | "red"
  | "grey"
  | "blue"
  | "slate";

export interface FiscalStateVocabulary {
  labelKey: string;
  color: FiscalStateColor;
}

/**
 * The vocabulary of the DGII, in one place: the label the user reads and the
 * colour that carries it. The state of the payment never shares this table.
 */
export const FISCAL_STATE_VOCABULARY: Record<
  ElectronicInvoiceStatus,
  FiscalStateVocabulary
> = {
  Draft: { labelKey: "ventas.fiscalStatus.draft", color: "slate" },
  Signed: { labelKey: "ventas.fiscalStatus.signed", color: "blue" },
  Sent: { labelKey: "ventas.fiscalStatus.sent", color: "grey" },
  InProcess: { labelKey: "ventas.fiscalStatus.inProcess", color: "grey" },
  Accepted: { labelKey: "ventas.fiscalStatus.accepted", color: "green" },
  AcceptedConditionally: {
    labelKey: "ventas.fiscalStatus.acceptedConditionally",
    color: "amber",
  },
  Rejected: { labelKey: "ventas.fiscalStatus.rejected", color: "red" },
  Annulled: { labelKey: "ventas.fiscalStatus.annulled", color: "slate" },
};

/**
 * The coarse state of a sale, in the same vocabulary. The states the DGII
 * closed share the entry of the document they come from.
 */
export const SALE_FISCAL_STATE_VOCABULARY: Record<
  SaleFiscalState,
  FiscalStateVocabulary
> = {
  PendingEmission: {
    labelKey: "ventas.fiscalStatus.pendingEmission",
    color: "blue",
  },
  InProcess: FISCAL_STATE_VOCABULARY.InProcess,
  Rejected: FISCAL_STATE_VOCABULARY.Rejected,
  RequiresReview: {
    labelKey: "ventas.fiscalStatus.requiresReview",
    color: "amber",
  },
};

export const FISCAL_STATE_PALETTE: Record<
  FiscalStateColor,
  { background: string; color: string }
> = {
  green: { background: "#D1FAE5", color: "#065F46" },
  amber: { background: "#FEF3C7", color: "#92400E" },
  red: { background: "#FEE2E2", color: "#991B1B" },
  grey: { background: "#E5E7EB", color: "#374151" },
  blue: { background: "#DBEAFE", color: "#1E40AF" },
  slate: { background: "#E2E8F0", color: "#334155" },
};

export interface SaleItemDto {
  id: string;
  productId: string;
  productName: string;
  productCategory?: string;
  productCode?: string;
  productImageUrl?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  /**
   * The tax code the backend stored with the line: the one it used to
   * compute the ITBIS of the sale. It is optional only because the sale
   * store keeps a persisted copy of the sales: a sale cached before this
   * field existed has none.
   */
  taxCode?: TaxCode;
}

export interface SaleDto {
  id: string;
  code: string;
  companyId: string;
  clienteId: string | null;
  clienteName: string | null;
  status: "Pending" | "Completed" | "Cancelled";
  total: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
  items: SaleItemDto[];
  // Fiscal side of the sale: the backend owns the e-CF it emits for it.
  documentType?: EcfDocumentType | null;
  receptorTaxId?: string | null;
  issuerTaxId?: string | null;
  subtotal?: number | null;
  itbis?: number | null;
  electronicInvoiceId?: string | null;
  fiscalState?: EcfFiscalState | null;
  fiscalStatus?: ElectronicInvoiceStatus | null;
  fiscalNote?: string | null;
}

export interface CreateSaleItemRequest {
  productId: string;
  productName: string;
  productCategory?: string;
  productCode?: string;
  productImageUrl?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

/**
 * The document the sale leaves with. The backend issues a fiscal credit
 * (E31) when the client has a tax id and a consumer one (E32) otherwise.
 */
export type TipoDocumentoVenta = "Consumer" | "FiscalCredit";

export interface CreateSaleRequest {
  companyId: string;
  clienteId: string | null;
  clienteName: string | null;
  status: "Pending" | "Completed";
  total: number;
  notes: string | null;
  items: CreateSaleItemRequest[];
  documentType?: TipoDocumentoVenta;
}

export interface UpdateSaleRequest {
  clienteId: string | null;
  clienteName: string | null;
  status: "Pending" | "Completed";
  total: number;
  notes: string | null;
  items: CreateSaleItemRequest[];
  documentType?: TipoDocumentoVenta;
}

export interface ClientDto {
  id: string;
  code: string;
  name: string;
  email: string;
  /** The RNC of the client: a fiscal credit (E31) needs it. */
  taxId?: string | null;
  phone: string;
  address: string;
  isActive: boolean;
  imageUrl?: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  totalCompras?: number;
  avatar?: string;
  empresa?: string;
}

export type Client = ClientDto;

export type ClientRequest = Partial<ClientDto>;

export interface ProductDto {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string | null;
  price: number;
  /**
   * The tax code of the product: the ITBIS it pays. The API sends it (the
   * backend DTO declares it) and the backend computes the totals of the
   * sale with it. It is optional only because the product store keeps a
   * persisted copy of the catalogue: a product cached before this field
   * existed has none, and then the default of the backend applies
   * (`ItbisTasa1`).
   */
  taxCode?: TaxCode;
  stock: number;
  categoryId: string | null;
  categoryName: string | null;
  companyId: string;
  isActive: boolean;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export type Product = ProductDto;

export type ProductRequest = Partial<ProductDto>;

export interface Purchase {
  id: number;
  proveedor: string;
  producto: string;
  cantidad: number;
  total: number;
  fecha: string;
  estado: "recibida" | "pendiente" | "cancelada";
}

export interface Vendor {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  categoria: string;
  totalOrdenes: number;
  avatar: string;
}

export interface AccountingTransaction {
  id: number;
  descripcion: string;
  tipo: "ingreso" | "egreso";
  monto: number;
  fecha: string;
  categoria: string;
  estado: "conciliada" | "pendiente";
}

export interface Project {
  id: string;
  name: string;
  client: string;
  status: "InProgress" | "Completed" | "Pending";
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  progress: number;
}

export interface CartItem {
  productId: string;
  productName: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  /** The tax code of the line: it decides the ITBIS of the line, as the backend does. */
  taxCode: TaxCode;
}

export interface SupplierDto {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  contactPerson: string;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

// Partial cubre create (viene completo del form) y update.
export type SupplierRequest = Partial<SupplierDto>;

export interface PurchaseItemDto {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface PurchaseDto {
  id: string;
  code: string;
  supplierId: string | null;
  supplierName: string;
  status: "Pending" | "Completed" | "Cancelled";
  total: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
  items: PurchaseItemDto[];
}

export type PurchaseRequest = Partial<PurchaseDto>;

export interface EmployeeDto {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hireDate: string;
  salary: number;
  status: "Active" | "Inactive";
  workSchedule: string;
  afp: string | null;
  ars: string | null;
  nss: string | null;
  bank: string | null;
  accountNumber: string | null;
  imageUrl?: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  // Extended HR fields (optional — may not be available from API)
  governmentId?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  personalEmail?: string;
  personalPhone?: string;
  address?: string;
  city?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  contractType?: string;
  location?: string;
  payFrequency?: string;
  afpNumber?: string;
  accountType?: string;
}

export type EmployeeRequest = Partial<EmployeeDto>;

export interface AccountingTransactionDto {
  id: string;
  code: string;
  description: string;
  type: "Income" | "Expense";
  amount: number;
  date: string;
  category: string;
  status: "Reconciled" | "Pending";
  referenceNumber: string | null;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export type AccountingTransactionRequest = Partial<AccountingTransactionDto>;

export interface CompanyDto {
  id: string;
  name: string;
  taxId: string;
  logoUrl: string | null;
  isActive: boolean;
  address: string;
  legalName: string;
  phone: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CompanyRequest = Partial<CompanyDto>;

export interface CategoryDto {
  id: string;
  code: string;
  name: string;
  description: string | null;
  companyId: string;
  isActive: boolean;
  createdAt: string;
}

export type CategoryRequest = Partial<CategoryDto>;

export interface UserDto {
  id: string;
  code: string;
  username: string;
  email: string;
  fullName: string;
  /** The roles the user holds (the backend sends the names of its enum). */
  roles: string[];
  isActive: boolean;
  status?: UserStatus;
  companyId: string;
}

/** What the caller may do: the API resolves the union of the permissions of the roles it holds. */
export interface MePermissionsDto {
  roles: string[];
  permissions: string[];
}

export interface InviteUserRequest {
  email: string;
  fullName: string;
  /** The roles the user is created with (the vocabulary of the front). */
  roles: string[];
  username?: string;
  /** The password the user starts with: the backend needs one to create it. */
  password: string;
}

export type UpdateUserRequest = Partial<UserDto>;

export type AccountType =
  | "Asset"
  | "Liability"
  | "Equity"
  | "Income"
  | "Expense";

export interface AccountDto {
  id: string;
  code: string;
  name: string;
  accountType: AccountType;
  parentId: string | null;
  isPostable: boolean;
  isActive: boolean;
  notes: string | null;
}

export type Account = AccountDto;

// The backend takes the company from the JWT: the request never carries it.
export type AccountRequest = Omit<AccountDto, "id">;

/**
 * Why the taxpayer cannot bill right now. The code is what the front
 * translates: the message of the backend is in English and the screen of
 * the cashier is not.
 */
export interface FiscalBlockerDto {
  /** "certificate-missing" | "range-missing" | "range-expired" | "range-exhausted" | "range-annulled" | "range-without-expiry" */
  code: string;
  /** The message of the backend, in English: for the logs, not for the screen. */
  message: string;
  /**
   * The code of the type the blocker speaks of ("B02"), or null when it
   * speaks of no type (the certificate one). The front matches it with the
   * types of the answer: the message is never read to know the type.
   */
  documentTypeCode: string | null;
}

/** One type the taxpayer can issue on the path its sale takes today. */
export interface FiscalReadinessDocumentTypeDto {
  /** The code the taxpayer knows: "E32" in the electronic path, "B02" in the paper one. */
  code: string;
  documentType: number;
  name: string;
  isIssuable: boolean;
  remaining: number;
  rangeExpiresAt: string | null;
  /** The same codes as the blockers, or null when the type can be issued. */
  blockerCode: string | null;
  blocker: string | null;
}

/**
 * Whether the taxpayer can bill right now: the path the sale takes today
 * (electronic or paper), the certificate that signs it and the room the
 * ranges have left.
 */
export interface FiscalReadinessDto {
  /** "Electronic" | "Normal" */
  emissionMode: string;
  /** The path the sale takes right now: false in the normal mode and inside a contingency. */
  usesElectronicEmission: boolean;
  isInContingency: boolean;
  hasValidCertificate: boolean;
  certificateExpiresAt: string | null;
  isReady: boolean;
  blockers: FiscalBlockerDto[];
  documentTypes: FiscalReadinessDocumentTypeDto[];
}

// Electronic invoicing (e-CF) contract. It lives in its own module because it
// is the only contract with this many entities, and it is re-exported here so
// the import surface of `domain/types` stays the same for every module.
export * from "./electronicInvoicing";
