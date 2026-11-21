import type { UserStatus } from '../constants/userStatus';

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

// ========================
// Electronic invoice (fiscal document)
// ========================

/**
 * The lifecycle of an e-CF: the first three are ours, before the document
 * exists for the DGII; the rest are the verdicts the DGII gives.
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
 * closed verdict (accepted or annulled) is not one of them, because there is
 * nothing left to do about it.
 */
export type SaleFiscalState =
  | "PendingEmission"
  | "InProcess"
  | "Rejected"
  | "RequiresReview";

/** The colour that carries a fiscal state. */
export type FiscalStateColor =
  | "green"
  | "amber"
  | "red"
  | "grey"
  | "blue"
  | "slate";

export interface FiscalStateVocabulary {
  /** The i18n key of the label, under the `ventas` namespace. */
  labelKey: string;
  color: FiscalStateColor;
}

/**
 * The vocabulary of the DGII, in one place: the label the user reads and
 * the colour that carries it. The state of the payment is a different thing
 * and it never shares this table.
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

/** The paint of every colour of the vocabulary. */
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

// Sale types - centralizados
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
}

export interface SaleDto {
  id: string;
  code: string;
  companyId: string;
  clienteId: string | null;
  clienteName: string | null;
  status: "Pending" | "Completed";
  total: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
  items: SaleItemDto[];
  /** The fiscal document of the sale, when it has one. */
  electronicInvoiceId?: string | null;
  /** The coarse fiscal state of the sale (null when nothing is open). */
  fiscalState?: SaleFiscalState | null;
  /** The fine state of the document of the sale, as the DGII named it. */
  fiscalStatus?: ElectronicInvoiceStatus | null;
  /** The note of the verdict of the DGII. */
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

// ========================
// Client DTOs (from backend)
// ========================
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

// Cliente - mismo tipo para UI y API
export type Client = ClientDto;

export type ClientRequest = Partial<ClientDto>;

export interface ProductDto {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string | null;
  price: number;
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

// Cart types
export interface CartItem {
  productId: string;
  productName: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

// Supplier DTOs (from backend)
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

// Supplier request — Partial cubre create (viene completo del form) y update
export type SupplierRequest = Partial<SupplierDto>;

// Purchase DTOs (from backend)
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

// Employee DTOs (from backend)
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

// Accounting Transaction DTOs (from backend)
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

// Company DTOs (from backend)
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

// Category DTOs (from backend)
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

// User DTOs (from backend)
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

/**
 * What the caller may do. The API resolves the union of the permissions of
 * the roles the caller holds.
 */
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

// Account DTOs (from backend)
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
