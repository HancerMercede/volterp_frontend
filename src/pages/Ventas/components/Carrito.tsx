import { useTranslation } from "react-i18next";
import { ShoppingCart } from "lucide-react";
import { money } from "../../../utils/currency";
import type { CartItem } from "../../../domain/types";
import styles from "./Carrito.module.css";

interface Props {
  items: CartItem[];
  onQuantityChange: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export function Carrito({ items, onQuantityChange, onRemoveItem, onClearCart }: Props) {
  const { t } = useTranslation();

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3><ShoppingCart size={20} strokeWidth={1.8} /> {t("ventas.cart")}</h3>
        {items.length > 0 && (
          <button className={styles.clearCart} onClick={onClearCart}>
            {t("ventas.clear")}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className={styles.emptyCart}>
          <span><ShoppingCart size={48} strokeWidth={1.2} /></span>
          <p>{t("ventas.cartEmpty")}</p>
          <small>{t("ventas.addProductsHint")}</small>
        </div>
      ) : (
        <div className={styles.cartItems}>
          {items.map((item) => (
            <div key={item.productId} className={styles.cartItem}>
              <img
                src={item.imageUrl}
                alt={item.productName}
                className={styles.cartItemImg}
              />
              <div className={styles.cartItemInfo}>
                <span className={styles.cartItemName}>
                  {item.productName}
                </span>
                <span className={styles.cartItemPrice}>
                  {money(item.unitPrice)}
                </span>
              </div>
              <div className={styles.cartItemControls}>
                <button
                  onClick={() => onQuantityChange(item.productId, -1)}
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => onQuantityChange(item.productId, 1)}
                >
                  +
                </button>
              </div>
              <span className={styles.cartItemSubtotal}>
                {money(item.subtotal)}
              </span>
              <button
                className={styles.cartItemDelete}
                onClick={() => onRemoveItem(item.productId)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={styles.cartFooter}>
        <div className={styles.cartTotal}>
          <span>{t("ventas.totalItems")}:</span>
          <strong>{totalItems}</strong>
        </div>
        <div className={styles.cartTotal}>
          <span>{t("common.total")}:</span>
          <strong>{money(subtotal)}</strong>
        </div>
      </div>
    </div>
  );
}