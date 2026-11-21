import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { buildMenuTree, SideMenu } from "../../../components/SideMenu";

const ITEMS = buildMenuTree([
  { path: "/ventas", label: "Ventas" },
  { path: "/ventas/facturas", label: "Facturas" },
]);

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
