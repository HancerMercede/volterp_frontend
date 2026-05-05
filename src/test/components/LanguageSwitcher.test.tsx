import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageSwitcher } from "../../components/LanguageSwitcher/LanguageSwitcher";
import { useLanguageStore } from "../../stores/languageStore";
import { beforeEach, describe, it } from "vitest";

beforeEach(() => {
  useLanguageStore.setState({ language: "es" });
});

describe("LanguageSwitcher", () => {
  it("renders with Spanish selected by default", () => {
    render(<LanguageSwitcher />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("es");
  });

  it("renders both language options", () => {
    render(<LanguageSwitcher />);
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveValue("es");
    expect(options[1]).toHaveValue("en");
  });

  it("renders options with flag and label text", () => {
    render(<LanguageSwitcher />);
    expect(screen.getByText("🇪🇸 Español")).toBeInTheDocument();
    expect(screen.getByText("🇺🇸 English")).toBeInTheDocument();
  });

  it("calls setLanguage when selection changes", () => {
    render(<LanguageSwitcher />);
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "en" } });
    expect(useLanguageStore.getState().language).toBe("en");
  });

  it("can switch back to Spanish", () => {
    useLanguageStore.setState({ language: "en" });
    render(<LanguageSwitcher />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("en");
    fireEvent.change(select, { target: { value: "es" } });
    expect(useLanguageStore.getState().language).toBe("es");
  });
});
