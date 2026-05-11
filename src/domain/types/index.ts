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
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CreateSaleRequest {
  companyId: number;
  clienteId: number | null;
  clienteName: string | null;
  total: number;
  notes: string | null;
  items: CreateSaleItemRequest[];
}

export interface UpdateSaleRequest {
  clienteId: number | null;
  clienteName: string | null;
  total: number;
  notes: string | null;
  items: CreateSaleItemRequest[];
}

// Domain types - centralizados en ingles
export interface Client {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  totalCompras?: number;
  avatar: string;
  empresa?: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  categoryId?: number | null;
  stock: number;
  price: number;
  proveedor?: string;
  imageUrl: string | null;
  description: string;
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