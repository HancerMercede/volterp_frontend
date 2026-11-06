import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { Zap } from "lucide-react";
import i18n from "../../i18n";
import { Modal } from "../../components/UI/Modal";
import { DynamicFormFields } from "../../components/UI/DynamicFormFields";
import type { FormField } from "../../hooks/useCrudForm";

beforeAll(async () => {
  await i18n.changeLanguage("en");
});

const FIELDS: FormField[] = [
  {
    name: "name",
    label: "Name",
    type: "text",
    required: true,
    section: "formSections.info",
    span: 3,
  },
  {
    name: "code",
    label: "Code",
    type: "text",
    readonly: true,
    section: "formSections.info",
    span: 1,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    section: "formSections.info",
    span: 3,
    hint: "Shows up on invoices and in the catalog.",
  },
  {
    name: "price",
    label: "Price",
    type: "number",
    section: "formSections.pricing",
    span: 2,
  },
  {
    name: "imageUrl",
    label: "Image",
    type: "file",
    sidebar: true,
  },
  {
    name: "isActive",
    label: "Active",
    type: "checkbox",
    sidebar: true,
    hint: "Visible in sales",
  },
];

const VALUES = {
  name: "Cerveza Presidente 355ml",
  code: "BEB-0001",
  description: "Lata de cerveza pilsener",
  price: 32,
  imageUrl: "",
  isActive: true,
};

describe("Modal shell", () => {
  it("renders the title, subtitle and icon tile in the header", () => {
    render(
      <Modal
        isOpen
        onClose={() => {}}
        title="Edit product"
        subtitle="Cerveza Presidente 355ml"
        icon={<Zap data-testid="icon" />}
      >
        <p>body</p>
      </Modal>,
    );

    expect(screen.getByText("Edit product")).toBeInTheDocument();
    expect(screen.getByText("Cerveza Presidente 355ml")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("closes from the header button", async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Edit product">
        <p>body</p>
      </Modal>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders the footer status next to the actions", () => {
    render(
      <Modal
        isOpen
        onClose={() => {}}
        title="Edit product"
        onSubmit={vi.fn()}
        submitLabel="Save"
        footerStatus={<span>No pending changes</span>}
      >
        <p>body</p>
      </Modal>,
    );

    expect(screen.getByText("No pending changes")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Edit product">
        <p>body</p>
      </Modal>,
    );

    expect(screen.queryByText("Edit product")).toBeNull();
  });
});

describe("DynamicFormFields layout", () => {
  it("renders one eyebrow per section", () => {
    render(
      <DynamicFormFields
        fields={FIELDS}
        values={VALUES}
        errors={{}}
        editingId="p-1"
        onChange={() => {}}
      />,
    );

    expect(screen.getByRole("heading", { name: "Information" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pricing" })).toBeInTheDocument();
  });

  it("renders the hint under the field", () => {
    render(
      <DynamicFormFields
        fields={FIELDS}
        values={VALUES}
        errors={{}}
        editingId="p-1"
        onChange={() => {}}
      />,
    );

    expect(
      screen.getByText("Shows up on invoices and in the catalog."),
    ).toBeInTheDocument();
  });

  it("renders readonly fields as disabled", () => {
    render(
      <DynamicFormFields
        fields={FIELDS}
        values={VALUES}
        errors={{}}
        editingId="p-1"
        onChange={() => {}}
      />,
    );

    expect(screen.getByLabelText("Code")).toBeDisabled();
    expect(screen.getByLabelText(/^Name/)).not.toBeDisabled();
  });

  it("keeps sidebar fields out of the main grid", () => {
    render(
      <DynamicFormFields
        fields={FIELDS}
        values={VALUES}
        errors={{}}
        editingId="p-1"
        onChange={() => {}}
      />,
    );

    const sidebar = screen.getByRole("complementary");
    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toContainElement(screen.getByRole("switch"));
  });

  it("renders a sidebar checkbox as a switch", async () => {
    const onChange = vi.fn();
    render(
      <DynamicFormFields
        fields={FIELDS}
        values={VALUES}
        errors={{}}
        editingId="p-1"
        onChange={onChange}
      />,
    );

    const toggle = screen.getByRole("switch");
    expect(toggle).toBeChecked();

    await userEvent.click(toggle);

    expect(onChange).toHaveBeenCalledWith("isActive", false);
  });

  it("does not create a sidebar when no field asks for one", () => {
    render(
      <DynamicFormFields
        fields={FIELDS.filter((field) => !field.sidebar)}
        values={VALUES}
        errors={{}}
        editingId="p-1"
        onChange={() => {}}
      />,
    );

    expect(screen.queryByRole("complementary")).toBeNull();
    expect(screen.queryByRole("switch")).toBeNull();
  });
});
