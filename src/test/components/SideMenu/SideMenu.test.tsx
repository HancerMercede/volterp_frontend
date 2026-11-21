import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildMenuTree, SideMenu } from "../../../components/SideMenu";

const ITEMS = buildMenuTree([
  { path: "/ventas", label: "Ventas" },
  { path: "/ventas/facturas", label: "Facturas" },
]);

const CSS_DEL_MODULO = join(
  process.cwd(),
  "src",
  "components",
  "SideMenu",
  "side-menu.css",
);

/**
 * The declarations of a rule of the stylesheet of the module. jsdom does not
 * lay out, so the way a panel collapses can only be pinned here.
 */
const reglaDe = (selector: string): string => {
  const css = readFileSync(CSS_DEL_MODULO, "utf8");
  const escapado = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const encontrado = new RegExp(`${escapado}\\s*\\{([^}]*)\\}`).exec(css);
  return encontrado ? encontrado[1] : "";
};

describe("SideMenu", () => {
  it("el grupo se dibuja como boton con aria-expanded y aria-controls", () => {
    render(<SideMenu items={ITEMS} />);

    const button = screen.getByRole("button", { name: "Ventas" });
    expect(button).toHaveAttribute("aria-expanded", "false");

    const panelId = button.getAttribute("aria-controls");
    expect(panelId).toBeTruthy();
    expect(document.getElementById(panelId as string)).toBeInTheDocument();
  });

  it("el boton abre y cierra el grupo", async () => {
    render(<SideMenu items={ITEMS} />);

    const button = screen.getByRole("button", { name: "Ventas" });
    await userEvent.click(button);

    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Facturas" })).toBeInTheDocument();

    await userEvent.click(button);

    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("la hoja activa lleva aria-current='page'", () => {
    render(<SideMenu items={ITEMS} activeId="/ventas/facturas" />);

    expect(screen.getByRole("link", { name: "Facturas" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Resumen" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("el menu sigue la ruta activa y abre los grupos que la contienen", () => {
    render(<SideMenu items={ITEMS} activeId="/ventas/facturas" />);

    expect(screen.getByRole("button", { name: "Ventas" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("el grupo se puede cerrar a mano aunque la ruta activa este dentro", async () => {
    render(<SideMenu items={ITEMS} activeId="/ventas/facturas" />);

    const button = screen.getByRole("button", { name: "Ventas" });
    expect(button).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(button);

    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("el cierre manual se respeta hasta que la ruta cambia", async () => {
    const { rerender } = render(
      <SideMenu items={ITEMS} activeId="/ventas/facturas" />,
    );

    const button = screen.getByRole("button", { name: "Ventas" });

    await userEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");

    // El usuario navego a otra pantalla del grupo: el grupo se abre solo.
    rerender(<SideMenu items={ITEMS} activeId="/ventas" />);
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("los hijos de un grupo cerrado no reciben el foco", async () => {
    const { container } = render(<SideMenu items={ITEMS} />);

    const button = screen.getByRole("button", { name: "Ventas" });
    const panel = document.getElementById(
      button.getAttribute("aria-controls") as string,
    ) as HTMLElement;
    const link = container.querySelector(
      'a[href="/ventas/facturas"]',
    ) as HTMLElement;

    expect(link).not.toBeVisible();

    await userEvent.tab();
    expect(button).toHaveFocus();

    await userEvent.tab();
    expect(panel).not.toContainElement(document.activeElement as HTMLElement);
    expect(link).not.toHaveFocus();
  });

  it("los hijos de un grupo abierto si reciben el foco", async () => {
    const { container } = render(<SideMenu items={ITEMS} />);

    const button = screen.getByRole("button", { name: "Ventas" });
    const panel = document.getElementById(
      button.getAttribute("aria-controls") as string,
    ) as HTMLElement;
    const link = container.querySelector(
      'a[href="/ventas/facturas"]',
    ) as HTMLElement;

    await userEvent.click(button);
    expect(link).toBeVisible();

    await userEvent.tab();
    expect(panel).toContainElement(document.activeElement as HTMLElement);
  });

  it("el grupo se abre y se cierra con el teclado", async () => {
    render(<SideMenu items={ITEMS} />);

    const button = screen.getByRole("button", { name: "Ventas" });

    await userEvent.tab();
    expect(button).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    expect(button).toHaveAttribute("aria-expanded", "true");

    await userEvent.keyboard(" ");
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("los grupos que empiezan abiertos vienen en defaultOpenIds", () => {
    render(<SideMenu items={ITEMS} defaultOpenIds={["/ventas::group"]} />);

    expect(screen.getByRole("button", { name: "Ventas" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("los permisos del llamante podan las hojas", () => {
    const items = buildMenuTree([
      { path: "/ventas", label: "Ventas", permission: "ventas.read" },
      { path: "/ventas/facturas", label: "Facturas", permission: "ventas.read" },
      { path: "/inventario", label: "Inventario", permission: "inventario.read" },
      { path: "/inventario/productos", label: "Productos" },
    ]);

    render(<SideMenu items={items} permissions={["inventario.read"]} />);

    expect(screen.queryByRole("link", { name: "Facturas" })).toBeNull();
    expect(
      screen.getByRole("button", { name: "Inventario" }),
    ).toBeInTheDocument();
  });

  it("los grupos que quedan vacios desaparecen", () => {
    const items = buildMenuTree([
      { path: "/ventas/facturas", label: "Facturas", permission: "ventas.read" },
    ]);

    render(<SideMenu items={items} permissions={[]} />);

    expect(screen.queryByRole("button", { name: "Ventas" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Facturas" })).toBeNull();
  });

  it("sin permisos se ve todo el menu", () => {
    render(<SideMenu items={ITEMS} />);

    expect(screen.getByRole("button", { name: "Ventas" })).toBeInTheDocument();
  });

  it("el nav lleva su etiqueta", () => {
    render(<SideMenu items={ITEMS} ariaLabel="Menu principal" />);

    expect(screen.getByRole("navigation")).toHaveAttribute(
      "aria-label",
      "Menu principal",
    );
  });

  it("el panel cerrado se colapsa: su fila pasa a cero", () => {
    const panel = reglaDe(".sm-panel");
    expect(panel).toMatch(/display:\s*grid/);
    expect(panel).toMatch(/grid-template-rows:\s*1fr/);

    const cerrado = reglaDe(".sm-panel--closed");
    expect(cerrado).toMatch(/grid-template-rows:\s*0fr/);
    expect(cerrado).toMatch(/visibility:\s*hidden/);
  });

  it("el contenido del panel se recorta para que la fila colapsada lo esconda", () => {
    const contenido = reglaDe(".sm-panelInner");
    expect(contenido).toMatch(/min-height:\s*0/);
    expect(contenido).toMatch(/overflow:\s*hidden/);
  });

  it("el panel tiene un solo hijo: el que envuelve la lista de los hijos", () => {
    render(<SideMenu items={ITEMS} />);

    const button = screen.getByRole("button", { name: "Ventas" });
    const panel = document.getElementById(
      button.getAttribute("aria-controls") as string,
    ) as HTMLElement;

    expect(panel.children.length).toBe(1);

    const lista = panel.querySelector("ul") as HTMLElement;
    expect(lista).not.toBeNull();
    expect(lista.parentElement).toBe(panel.children[0]);
    expect(lista.children.length).toBeGreaterThan(0);
    for (const hijo of Array.from(lista.children)) {
      expect(hijo.tagName).toBe("LI");
    }
  });

  it("el enlace indice del grupo hereda el icono de la ruta del grupo", () => {
    const items = buildMenuTree([
      {
        path: "/ventas",
        label: "Ventas",
        icon: <span data-testid="icono-ventas" />,
      },
      {
        path: "/ventas/facturas",
        label: "Facturas",
        icon: <span data-testid="icono-facturas" />,
      },
    ]);

    render(<SideMenu items={items} defaultOpenIds={["/ventas::group"]} />);

    const resumen = screen.getByRole("link", { name: "Resumen" });
    expect(within(resumen).getByTestId("icono-ventas")).toBeInTheDocument();
  });

  it("el enlace indice hereda el icono del grupo cuando la ruta no trae icono", () => {
    const items = buildMenuTree(
      [
        { path: "/ventas", label: "Ventas" },
        { path: "/ventas/facturas", label: "Facturas" },
      ],
      {
        "/ventas": {
          label: "Ventas",
          icon: <span data-testid="icono-grupo" />,
        },
      },
    );

    render(<SideMenu items={items} defaultOpenIds={["/ventas::group"]} />);

    const resumen = screen.getByRole("link", { name: "Resumen" });
    expect(within(resumen).getByTestId("icono-grupo")).toBeInTheDocument();
  });

  it("la app dibuja la hoja con su propio router", () => {
    render(
      <SideMenu
        items={ITEMS}
        activeId="/ventas/facturas"
        renderLeaf={({ item, active }) => (
          <a href={item.href} aria-current={active ? "page" : undefined}>
            {item.label}
          </a>
        )}
      />,
    );

    expect(screen.getByRole("link", { name: "Facturas" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
