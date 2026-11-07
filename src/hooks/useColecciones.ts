import { useEffect } from "react";
import { useCategoryStore } from "../stores/categoryStore";
import { useClienteStore } from "../stores/clienteStore";
import { useProductoStore } from "../stores/productoStore";
import { useProveedorStore } from "../stores/proveedorStore";

const PAGE_SIZE = 100;

/**
 * El POS filtra y pagina las colecciones en memoria, no contra el servidor:
 * necesita el listado completo, no la página del módulo. Esta utilidad nació
 * para el POS y Compras la usa por la misma razón.
 */
export function useClientes() {
  const { clientes, fetchClientes } = useClienteStore();
  useEffect(() => {
    fetchClientes(1, PAGE_SIZE);
  }, [fetchClientes]);
  return clientes;
}

export function useProductos() {
  const { productos, fetchProductos } = useProductoStore();
  useEffect(() => {
    fetchProductos(1, PAGE_SIZE);
  }, [fetchProductos]);
  return productos;
}

export function useProveedores() {
  const { proveedores, fetchProveedores } = useProveedorStore();
  useEffect(() => {
    fetchProveedores(1, PAGE_SIZE);
  }, [fetchProveedores]);
  return proveedores;
}

export function useCategorias() {
  const { categories, fetchCategories } = useCategoryStore();
  useEffect(() => {
    fetchCategories(1, PAGE_SIZE);
  }, [fetchCategories]);
  return categories;
}
