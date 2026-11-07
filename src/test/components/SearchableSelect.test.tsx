import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { SearchableSelect } from "../../components/UI/SearchableSelect";
import { matchesQuery } from "../../hooks/useFilter";

const OPTIONS = [
  { value: "c1", label: "Acme Corp", description: "ventas@acme.do" },
  { value: "c2", label: "Distribuidora Áurora", description: "SUP-001" },
];

const OPTIONS_WITH_EMPTY_FIELDS = [
  ...OPTIONS,
  { value: "c3", label: "", description: "", keywords: [] },
];

const ControlledSelect = () => {
  const [value, setValue] = useState("c1");
  return (
    <SearchableSelect
      options={OPTIONS}
      value={value}
      onChange={(next) => setValue(next)}
    />
  );
};

describe("SearchableSelect", () => {
  it("opens the list on focus and closes it on an outside mousedown", async () => {
    render(<SearchableSelect options={OPTIONS} value="" onChange={vi.fn()} />);

    const input = screen.getByRole("combobox");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    await userEvent.click(input);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await userEvent.click(document.body);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("reports an empty value and the typed text while typing", async () => {
    const onChange = vi.fn();
    render(<SearchableSelect options={OPTIONS} value="" onChange={onChange} />);

    await userEvent.type(screen.getByRole("combobox"), "ac");

    expect(onChange).toHaveBeenCalledWith("", "ac");
  });

  it("reports the option value and label and closes the list on selection", async () => {
    const onChange = vi.fn();
    render(<SearchableSelect options={OPTIONS} value="" onChange={onChange} />);

    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(screen.getByRole("button", { name: /Acme Corp/ }));

    expect(onChange).toHaveBeenCalledWith("c1", "Acme Corp");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("empties the input after selecting when clearOnSelect is set", async () => {
    render(
      <SearchableSelect
        options={OPTIONS}
        value=""
        clearOnSelect
        onChange={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(screen.getByRole("button", { name: /Acme Corp/ }));

    expect(screen.getByRole("combobox")).toHaveValue("");
  });

  it("shows the selected option label when clearOnSelect is not set", async () => {
    render(<SearchableSelect options={OPTIONS} value="" onChange={vi.fn()} />);

    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(screen.getByRole("button", { name: /Acme Corp/ }));

    expect(screen.getByRole("combobox")).toHaveValue("Acme Corp");
  });

  it("moves the active option with the arrow keys and selects it with Enter", async () => {
    const onChange = vi.fn();
    render(<SearchableSelect options={OPTIONS} value="" onChange={onChange} />);

    await userEvent.click(screen.getByRole("combobox"));

    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("option", { name: /Acme Corp/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("option", { name: /Áurora/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await userEvent.keyboard("{ArrowUp}");
    expect(screen.getByRole("option", { name: /Acme Corp/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await userEvent.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith("c1", "Acme Corp");
  });

  it("closes the list with Escape", async () => {
    render(<SearchableSelect options={OPTIONS} value="" onChange={vi.fn()} />);

    await userEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("filters by label and by description ignoring accents and case", async () => {
    render(<SearchableSelect options={OPTIONS} value="" onChange={vi.fn()} />);

    const input = screen.getByRole("combobox");

    await userEvent.type(input, "acme");
    expect(
      screen.getByRole("option", { name: /Acme Corp/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: /Áurora/ }),
    ).not.toBeInTheDocument();

    await userEvent.clear(input);
    await userEvent.type(input, "SUP-001");
    expect(
      screen.getByRole("option", { name: /Áurora/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: /Acme Corp/ }),
    ).not.toBeInTheDocument();

    await userEvent.clear(input);
    await userEvent.type(input, "aurora");
    expect(
      screen.getByRole("option", { name: /Áurora/ }),
    ).toBeInTheDocument();
  });

  it("marks the input as invalid only when the invalid prop is set", () => {
    const { rerender } = render(
      <SearchableSelect options={OPTIONS} value="" invalid onChange={vi.fn()} />,
    );

    expect(screen.getByRole("combobox").className).toContain("invalid");

    rerender(<SearchableSelect options={OPTIONS} value="" onChange={vi.fn()} />);

    expect(screen.getByRole("combobox").className).not.toContain("invalid");
  });

  it("shows the label of the initial value", () => {
    render(<SearchableSelect options={OPTIONS} value="c1" onChange={vi.fn()} />);

    expect(screen.getByRole("combobox")).toHaveValue("Acme Corp");
  });

  it("keeps the typed text when the parent reflects the empty value back", async () => {
    render(<ControlledSelect />);

    const input = screen.getByRole<HTMLInputElement>("combobox");
    await userEvent.type(input, "nuevo");

    expect(input.value).toContain("nuevo");
  });

  it("does not bubble the Escape key", async () => {
    const onDocumentKeyDown = vi.fn();
    document.addEventListener("keydown", onDocumentKeyDown);

    render(<SearchableSelect options={OPTIONS} value="" onChange={vi.fn()} />);

    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.keyboard("{Escape}");

    document.removeEventListener("keydown", onDocumentKeyDown);

    expect(onDocumentKeyDown).not.toHaveBeenCalled();
  });

  it("focuses the input when autoFocus is set", () => {
    render(
      <SearchableSelect options={OPTIONS} value="" autoFocus onChange={vi.fn()} />,
    );

    expect(screen.getByRole("combobox")).toHaveFocus();
  });

  it("matches an option by keyword without rendering the keyword", async () => {
    render(
      <SearchableSelect
        options={[{ ...OPTIONS[0], keywords: ["CLI-001"] }]}
        value=""
        onChange={vi.fn()}
      />,
    );

    await userEvent.type(screen.getByRole("combobox"), "CLI-001");

    expect(
      screen.getByRole("option", { name: /Acme Corp/ }),
    ).toBeInTheDocument();
    expect(screen.queryByText("CLI-001")).not.toBeInTheDocument();
  });

  it("shows every option for a whitespace-only text, including an option with empty fields", async () => {
    render(
      <SearchableSelect
        options={OPTIONS_WITH_EMPTY_FIELDS}
        value=""
        onChange={vi.fn()}
      />,
    );

    await userEvent.type(screen.getByRole("combobox"), "   ");

    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("matches the label, the description and the keywords of an option", async () => {
    const options = [
      {
        value: "c1",
        label: "Acme Corp",
        description: "ventas@acme.do",
        keywords: ["CLI-001"],
      },
      { value: "c2", label: "Distribuidora Áurora", description: "SUP-001" },
    ];
    render(
      <SearchableSelect options={options} value="" onChange={vi.fn()} />,
    );

    const input = screen.getByRole("combobox");

    for (const [query, expected] of [
      ["acme", "Acme Corp"],
      ["ventas@acme.do", "Acme Corp"],
      ["cli-001", "Acme Corp"],
      ["aurora", "Distribuidora Áurora"],
      ["sup-001", "Distribuidora Áurora"],
    ]) {
      await userEvent.clear(input);
      await userEvent.type(input, query);

      const rendered = screen.getAllByRole("option");
      expect(rendered).toHaveLength(1);
      expect(rendered[0]).toHaveTextContent(expected);
    }
  });

  it("shows every option when the term is empty", async () => {
    render(
      <SearchableSelect
        options={OPTIONS_WITH_EMPTY_FIELDS}
        value=""
        onChange={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("combobox"));

    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("shows every option while the text is the label of the current selection", async () => {
    render(
      <SearchableSelect
        options={OPTIONS_WITH_EMPTY_FIELDS}
        value="c1"
        onChange={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("combobox"));

    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("matches the same options as matchesQuery for the same query", async () => {
    const options = [
      {
        value: "c1",
        label: "Acme Corp",
        description: "ventas@acme.do",
        keywords: ["CLI-001"],
      },
      { value: "c2", label: "Distribuidora Áurora", description: "SUP-001" },
    ];
    render(
      <SearchableSelect options={options} value="" onChange={vi.fn()} />,
    );

    const input = screen.getByRole("combobox");

    for (const query of ["001", "aurora", "acme"]) {
      await userEvent.clear(input);
      await userEvent.type(input, query);

      const expected = options
        .filter((option) =>
          matchesQuery(
            [option.label, option.description ?? "", ...(option.keywords ?? [])],
            query,
          ),
        )
        .map((option) => `${option.label}${option.description ?? ""}`);

      expect(screen.getAllByRole("option").map((el) => el.textContent)).toEqual(
        expected,
      );
    }
  });

  it("replaces the selected label when typing after focusing", async () => {
    const onChange = vi.fn();
    render(<SearchableSelect options={OPTIONS} value="c1" onChange={onChange} />);

    const input = screen.getByRole<HTMLInputElement>("combobox");
    await userEvent.click(input);

    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe("Acme Corp".length);

    // The implicit click of type() would move the caret to the end of the value.
    await userEvent.type(input, "x", { skipClick: true });

    expect(onChange).toHaveBeenCalledWith("", "x");
  });

  it("replaces the selected label when typing after the mount focus", async () => {
    const onChange = vi.fn();
    render(
      <SearchableSelect
        options={OPTIONS}
        value="c1"
        autoFocus
        onChange={onChange}
      />,
    );

    const input = screen.getByRole<HTMLInputElement>("combobox");
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe("Acme Corp".length);

    await userEvent.type(input, "x", { skipClick: true });

    expect(onChange).toHaveBeenCalledWith("", "x");
  });
});
