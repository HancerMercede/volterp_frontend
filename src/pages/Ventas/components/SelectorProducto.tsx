import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Package } from "lucide-react";
import { ImageCell, Pagination, SearchInput } from "../../../components/UI";
import { useFilter } from "../../../hooks/useFilter";
import { initialsOf } from "../../../utils/initials";
import { money } from "../../../utils/currency";
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
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if (event.key === "F2") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", focusSearch);
    return () => document.removeEventListener("keydown", focusSearch);
  }, []);

  const categorias = useMemo(() => {
    const cats = [...new Set(productos.map((p) => p.category))];
    return ["todos", ...cats];
  }, [productos]);

  const filteredProducts = useFilter({
    data: productos,
    searchTerm,
    searchFields: (p) => [p.name, p.code],
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
        <h3>
          <Package size={20} strokeWidth={1.8} /> {t("ventas.products")}
        </h3>
        <div className={styles.searchWrap}>
          <SearchInput
            value={searchTerm}
            onChange={onSearchChange}
            placeholder={t("ventas.searchProductsOrCode")}
            className={styles.productSearchInput}
            inputRef={searchInputRef}
          />
          <kbd className={styles.shortcutBadge}>F2</kbd>
        </div>
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
            <div className={styles.productThumb}>
              {producto.imageUrl ? (
                <ImageCell
                  src={producto.imageUrl}
                  name={producto.name}
                  type="product"
                  showInfo={false}
                />
              ) : (
                <span className={styles.productInitials}>
                  {initialsOf(producto.name)}
                </span>
              )}
            </div>
            <span className={styles.productName}>{producto.name}</span>
            <span className={styles.productCategory}>{producto.category}</span>
            <div className={styles.productFooter}>
              <span className={styles.productPrice}>
                {money(producto.price)}
              </span>
              <button
                className={styles.addBtn}
                aria-label={t("ventas.addToCart")}
              >
                +
              </button>
            </div>
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
