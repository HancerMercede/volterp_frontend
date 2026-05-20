import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ImageCell, Pagination, SearchInput } from "../../../components/UI";
import { useFilter } from "../../../hooks/useFilter";
import type { Product } from "../../../domain/types";
import styles from "./SelectorProducto.module.css";

interface Props {
  productos: Product[];
  onAddProduct: (producto: Product) => void;
  categoriaFilter: string;
  onCategoriaChange: (categoria: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

export function SelectorProducto({
  productos,
  onAddProduct,
  categoriaFilter,
  onCategoriaChange,
  searchTerm,
  onSearchChange,
}: Props) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 50;

  const categorias = useMemo(() => {
    const cats = [...new Set(productos.map((p) => p.category))];
    return ["todos", ...cats];
  }, [productos]);

  const filteredProducts = useFilter({
    data: productos,
    searchTerm,
    searchFields: (p) => [p.name],
    filter: (p) =>
      categoriaFilter === "todos" || p.category === categoriaFilter,
  });

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage;
    return filteredProducts.slice(start, start + productsPerPage);
  }, [filteredProducts, currentPage]);

  const totalProductPages = Math.ceil(
    filteredProducts.length / productsPerPage,
  );

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3>📦 {t("ventas.products")}</h3>
        <SearchInput
          value={searchTerm}
          onChange={onSearchChange}
          placeholder={t("ventas.searchProducts")}
          className={styles.productSearchInput}
        />
      </div>

      <div className={styles.categoryTabs}>
        {categorias.map((cat) => (
          <button
            key={cat}
            className={`${styles.categoryTab} ${categoriaFilter === cat ? styles.active : ""}`}
            onClick={() => {
              onCategoriaChange(cat);
              setCurrentPage(1);
            }}
          >
            {cat === "todos" ? t("ventas.allProducts") : cat}
          </button>
        ))}
      </div>

      <div className={styles.productsGrid}>
        {paginatedProducts.map((producto) => (
          <div
            key={producto.id}
            className={styles.productCard}
            onClick={() => onAddProduct(producto)}
          >
            <ImageCell
              src={producto.imageUrl || ""}
              name={producto.name}
              subtext={producto.category}
              type="product"
            />
            <span className={styles.productName}>{producto.name}</span>
            <span className={styles.productPrice}>
              {formatCurrency(producto.price)}
            </span>
            <button className={styles.addBtn}>+</button>
          </div>
        ))}
      </div>

      {totalProductPages > 1 && (
        <div className={styles.paginationWrapper}>
          <Pagination
            pagination={{
              total: filteredProducts.length,
              page: currentPage,
              pageSize: productsPerPage,
              totalPages: totalProductPages,
              hasNext: currentPage < totalProductPages,
              hasPrev: currentPage > 1,
            }}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}