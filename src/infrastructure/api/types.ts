export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  companyId: number;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
  companyId: number;
  role?: string;
}

export interface ApiError {
  error: string;
  details?: string;
}

export interface ProductDto {
  id: number;
  name: string;
  category: string;
  description: string | null;
  price: number;
  stock: number;
  categoryId: number | null;
  categoryName: string | null;
  companyId: number;
  isActive: boolean;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateProductRequest {
  name: string;
  category: string;
  description: string | null;
  price: number;
  stock: number;
  categoryId: number | null;
  companyId: number;
  imageUrl?: string | null;
}

export interface UpdateProductRequest {
  name: string;
  category: string;
  description: string | null;
  price: number;
  stock: number;
  categoryId: number | null;
  isActive: boolean;
  imageUrl?: string | null;
}