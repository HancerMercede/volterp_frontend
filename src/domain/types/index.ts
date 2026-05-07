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