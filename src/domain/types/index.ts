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

// Sale types - centralizados
export interface SaleItemDto {
  id: number;
  productId: number;
  productName: string;
  productCategory?: string;
  productCode?: string;
  productImageUrl?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SaleDto {
  id: number;
  companyId: number;
  clienteId: number | null;
  clienteName: string | null;
  status: "Pending" | "Completed";
  total: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string | null;
  items: SaleItemDto[];
}

export interface CreateSaleItemRequest {
  productId: number;
  productName: string;
  productCategory?: string;
  productCode?: string;
  productImageUrl?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CreateSaleRequest {
  companyId: number;
  clienteId: number | null;
  clienteName: string | null;
  status: "Pending" | "Completed";
  total: number;
  notes: string | null;
  items: CreateSaleItemRequest[];
}

export interface UpdateSaleRequest {
  clienteId: number | null;
  clienteName: string | null;
  status: "Pending" | "Completed";
  total: number;
  notes: string | null;
  items: CreateSaleItemRequest[];
}

// ========================
// Client DTOs (from backend)
// ========================
export interface ClientDto {
  id: number;
  name: string;
  email: string;
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

export interface Product {
  id: number;
  name: string;
  category: string;
  categoryId?: number | null;
  stock: number;
  price: number;
  proveedor?: string;
  imageUrl: string | null;
  description?: string | null;
  isActive?: boolean;
}

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
  id: number;
  nombre: string;
  cliente: string;
  estado: "en_progreso" | "completado" | "pendiente";
  presupuesto: number;
}

// Cart types
export interface CartItem {
  productId: number;
  productName: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

// Supplier DTOs (from backend)
export interface SupplierDto {
  id: number;
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

// Create = DTO sin id ni auditoría
export type CreateSupplierRequest = Omit<
  SupplierDto,
  "id" | "createdAt" | "updatedAt"
>;
// Update = parcial del DTO
export type UpdateSupplierRequest = Partial<SupplierDto>;

// Purchase DTOs (from backend)
export interface PurchaseItemDto {
  id: number;
  productId: number | null;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface PurchaseDto {
  id: number;
  supplierId: number | null;
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
  id: number;
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
}

export type EmployeeRequest = Partial<EmployeeDto>;

// Accounting Transaction DTOs (from backend)
export interface AccountingTransactionDto {
  id: number;
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
  id: number;
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

export type CreateCompanyRequest = Omit<
  CompanyDto,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateCompanyRequest = Partial<CompanyDto>;

// Category DTOs (from backend)
export interface CategoryDto {
  id: number;
  name: string;
  description: string | null;
  companyId: number;
  isActive: boolean;
  createdAt: string;
}

export type CreateCategoryRequest = Omit<
  CategoryDto,
  "id" | "companyId" | "isActive" | "createdAt"
>;
export type UpdateCategoryRequest = Partial<CategoryDto>;

// User DTOs (from backend)
export interface UserDto {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string | number;
  isActive: boolean;
  companyId: number;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
  role: string;
  companyId?: number;
}

export type UpdateUserRequest = Partial<UserDto>;
