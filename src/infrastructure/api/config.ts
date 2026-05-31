export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:5106",
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/api/auth/login",
      REGISTER: "/api/auth/register",
    },
    PRODUCTS: "/api/products",
    CATEGORIES: "/api/categories",
    COMPANIES: "/api/companies",
    USERS: "/api/users",
    SALES: "/api/sales",
    SUPPLIERS: "/api/suppliers",
    PURCHASES: "/api/purchases",
    EMPLOYEES: "/api/employees",
    ACCOUNTING_TRANSACTIONS: "/api/accounting-transactions",
    CLIENTS: "/api/clients",
  },
};
