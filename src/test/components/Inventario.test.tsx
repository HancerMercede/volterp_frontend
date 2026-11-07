import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "../../i18n";
import { Inventario } from "../../pages/Inventario/Inventario";
import { useCategoryStore } from "../../stores/categoryStore";
import { useCompanyStore } from "../../stores/companyStore";
import { useProductoStore } from "../../stores/productoStore";
import { useUIStore } from "../../stores/uiStore";
import type { CategoryDto, CompanyDto, ProductDto } from "../../domain/types";

const CATEGORIA: CategoryDto = {
  id: "cat-1",
  code: "CAT-001",
  name: "Lácteos",
  description: null,
  companyId: "c1",
  isActive: true,
  createdAt: "2026-11-01T10:00:00Z",
};

const PRODUCTO: ProductDto = {
  id: "p1",
  code: "PRD-001",
  name: "Leche entera",
  category: "Lácteos",
  description: null,
  price: 32,
  stock: 10,
  categoryId: "cat-1",
  categoryName: "Lácteos",
  companyId: "c1",
  isActive: true,
  imageUrl: null,
  createdAt: "2026-11-01T10:00:00Z",
  updatedAt: null,
};

const COMPANY: CompanyDto = {
  id: "c1",
  name: "Volterp",
  taxId: "RNC-1",
  logoUrl: null,
  isActive: true,
  address: "Calle 1",
  legalName: "Volterp SRL",
  phone: "809-000-0000",
  email: "hola@volterp.do",
};

beforeEach(() => {
  useUIStore.setState({ addToast: vi.fn() });
  useCompanyStore.setState({ currentCompany: COMPANY });
  useCategoryStore.setState({
    categories: [CATEGORIA],
    totalCount: 1,
    fetchCategories: vi.fn(),
  });
  useProductoStore.setState({
    productos: [PRODUCTO],
    totalCount: 1,
    error: null,
    fetchProductos: vi.fn(),
    createProducto: vi.fn(),
    updateProducto: vi.fn(),
    deleteProducto: vi.fn(),
  });
});

const openForm = async () => {
  await userEvent.click(
    screen.getByRole("button", {
      name: new RegExp(i18n.t("inventario.newProduct"), "i"),
    }),
  );
};

const categorySelect = () =>
  screen.getByLabelText(new RegExp(i18n.t("common.category"), "i"));

describe("Inventario", () => {
  it("creates the product with the category picked in the form", async () => {
    const createProducto = vi.fn();
    useProductoStore.setState({ createProducto });

    render(<Inventario />);
    await openForm();

    await userEvent.type(
      screen.getByLabelText(new RegExp(i18n.t("common.name"), "i")),
      "Leche entera",
    );
    await userEvent.selectOptions(categorySelect(), "cat-1");
    await userEvent.click(
      screen.getByRole("button", { name: i18n.t("common.create") }),
    );

    expect(createProducto).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: "cat-1",
        category: "Lácteos",
      }),
    );
  });

  it("shows the current category of the product when editing", async () => {
    render(<Inventario />);

    await userEvent.click(screen.getByTitle("Editar"));

    expect(categorySelect()).toHaveValue("cat-1");
  });

  it("does not refetch the categories when the products' page changes", async () => {
    const fetchProductos = vi.fn();
    const fetchCategories = vi.fn();
    useProductoStore.setState({ totalCount: 25, fetchProductos });
    useCategoryStore.setState({ fetchCategories });

    render(<Inventario />);

    expect(fetchCategories).toHaveBeenCalledTimes(1);
    expect(fetchCategories).toHaveBeenCalledWith(1, 100);

    await userEvent.click(screen.getByRole("button", { name: "2" }));

    expect(fetchProductos).toHaveBeenCalledWith(2, 10);
    expect(fetchCategories).toHaveBeenCalledTimes(1);
  });
});
