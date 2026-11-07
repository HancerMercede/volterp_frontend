import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import { SearchableSelect } from "../../../components/UI";
import type { Product } from "../../../domain/types";
import styles from "./LineasCompraEditor.module.css";

export interface LineaCompra {
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Props {
  lineas: LineaCompra[];
  productos: Product[];
  invalid?: boolean;
  onChange: (lineas: LineaCompra[]) => void;
}

export function LineasCompraEditor({
  lineas,
  productos,
  invalid = false,
  onChange,
}: Props) {
  const { t } = useTranslation();

  const options = useMemo(
    () =>
      productos.map((product) => ({
        value: product.id,
        label: product.name,
        description: product.code,
      })),
    [productos],
  );

  const updateLinea = (index: number, changes: Partial<LineaCompra>) => {
    onChange(
      lineas.map((linea, i) => {
        if (i !== index) return linea;
        const next = { ...linea, ...changes };
        return { ...next, subtotal: next.quantity * next.unitPrice };
      }),
    );
  };

  const handleProduct = (productId: string) => {
    const product = productos.find((item) => item.id === productId);
    if (!product) return;
    const unitPrice = Number(product.price);
    onChange([
      ...lineas,
      {
        productId: product.id,
        productName: product.name,
        productCode: product.code,
        quantity: 1,
        unitPrice,
        subtotal: unitPrice,
      },
    ]);
  };

  return (
    <div className={styles.wrapper}>
      <h4 className={styles.title}>{t("compras.itemsSection")}</h4>
      <div className={styles.picker}>
        <SearchableSelect
          id="line-product"
          label={t("compras.product")}
          options={options}
          value=""
          clearOnSelect
          placeholder={t("compras.productSearch")}
          emptyLabel={t("compras.noProductsFound")}
          onChange={handleProduct}
        />
      </div>

      {lineas.length === 0 ? (
        <p className={styles.empty}>{t("compras.emptyLines")}</p>
      ) : (
        <div className={styles.lines}>
          {lineas.map((linea, index) => (
            <div className={styles.line} key={index}>
              <div className={styles.product}>
                <span className={styles.productName}>{linea.productName}</span>
              </div>
              <input
                type="number"
                min={1}
                className={styles.quantity}
                aria-label={t("compras.quantity")}
                value={linea.quantity}
                onChange={(event) =>
                  updateLinea(index, { quantity: Number(event.target.value) })
                }
              />
              <input
                type="number"
                min={0}
                className={styles.price}
                aria-label={t("compras.unitPrice")}
                value={linea.unitPrice}
                onChange={(event) =>
                  updateLinea(index, { unitPrice: Number(event.target.value) })
                }
              />
              <span className={styles.subtotal}>
                {linea.subtotal.toLocaleString()}
              </span>
              <button
                type="button"
                className={styles.remove}
                aria-label={t("compras.removeLine")}
                onClick={() =>
                  onChange(lineas.filter((_, i) => i !== index))
                }
              >
                <Trash2 size={16} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      )}

      {invalid && <p className={styles.error}>{t("compras.itemsRequired")}</p>}
    </div>
  );
}
