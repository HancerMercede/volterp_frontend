import { useTranslation } from "react-i18next";
import { ShoppingCart } from "lucide-react";
import { money } from "../../../utils/currency";
import { initialsOf } from "../../../utils/initials";
import type { CartItem } from "../../../domain/types";
import styles from "./Carrito.module.css";

interface Props {
  items: CartItem[];
  /** Los controles trabajan por linea: una venta puede llevar el mismo producto en dos lineas. */
  onQuantityChange: (index: number, delta: number) => void;
  onRemoveItem: (index: number) => void;
}

export function Carrito({ items, onQuantityChange, onRemoveItem }: Props) {
  const { t } = useTranslation();

  return (
    <div className={styles.panel}>
      {items.length === 0 ? (
        <div className={styles.emptyCart}>
          <span><ShoppingCart size={48} strokeWidth={1.2} /></span>
          <p>{t("ventas.cartEmpty")}</p>
          <small>{t("ventas.addProductsHint")}</small>
        </div>
      ) : (
        <div className={styles.cartItems}>
          {items.map((item, index) => (
            <div key={`${item.productId}-${index}`} className={styles.cartItem}>
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className={styles.cartItemImg}
                />
              ) : (
                <span className={styles.cartItemInitials}>
                  {initialsOf(item.productName)}
                </span>
              )}
              <div className={styles.cartItemBody}>
                <div className={styles.cartItemTop}>
                  <span className={styles.cartItemName}>
                    {item.productName}
                  </span>
                  <button
                    className={styles.cartItemDelete}
                    onClick={() => onRemoveItem(index)}
                    aria-label={t("ventas.removeFromCart")}
                  >
                    ×
                  </button>
                </div>
                <div className={styles.cartItemBottom}>
                  <span className={styles.cartItemPrice}>
                    {t("ventas.eachUnit")} {money(item.unitPrice)}
                  </span>
                  <div className={styles.cartItemControls}>
                    <button
                      onClick={() => onQuantityChange(index, -1)}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => onQuantityChange(index, 1)}
                    >
                      +
                    </button>
                  </div>
                  <span className={styles.cartItemSubtotal}>
                    {money(item.subtotal)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}