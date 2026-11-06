import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../infrastructure/api/userService", () => ({
  userService: {
    getUsers: vi.fn(),
    createUser: vi.fn(),
    updateUserRole: vi.fn(),
    updateUserStatus: vi.fn(),
    deleteUser: vi.fn(),
  },
}));

import i18n from "../../i18n";
import { userService } from "../../infrastructure/api/userService";
import { useAuthStore } from "../../stores/authStore";
import { useUIStore } from "../../stores/uiStore";
import { UserManagement } from "../../components/UserManagement/UserManagement";
import type { UserDto } from "../../domain/types";

const USER: UserDto = {
  id: "u-1",
  code: "U-1",
  username: "jdoe",
  email: "jdoe@example.com",
  fullName: "Jane Doe",
  role: "ventas",
  isActive: true,
  companyId: "co-1",
};

beforeAll(async () => {
  await i18n.changeLanguage("en");
});

beforeEach(() => {
  vi.clearAllMocks();
  useUIStore.setState({ toasts: [], modals: [], isLoading: false });
  vi.mocked(userService.getUsers).mockResolvedValue({
    rowCount: 1,
    pageNumber: 1,
    pageSize: 10,
    pageCount: 1,
    items: [USER],
  });
  vi.mocked(userService.deleteUser).mockResolvedValue(undefined);
  useAuthStore.setState({
    token: "token-1",
    user: {
      username: "admin",
      email: "admin@example.com",
      fullName: "Admin",
      role: "admin",
      companyId: "co-1",
    },
  });
});

const confirmDelete = async () => {
  await userEvent.click(await screen.findByRole("button", { name: "Eliminar" }));
  await userEvent.click(await screen.findByRole("button", { name: "Yes, delete" }));
};

describe("UserManagement delete flow", () => {
  it("deletes the user and reports success when there is a token", async () => {
    render(<UserManagement />);

    await screen.findByText("jdoe@example.com");
    await confirmDelete();

    await waitFor(() =>
      expect(userService.deleteUser).toHaveBeenCalledWith("u-1"),
    );
    await waitFor(() => {
      const [toast] = useUIStore.getState().toasts;
      expect(toast).toMatchObject({ type: "success" });
    });
  });

  it("does not call the service and reports the failure when there is no token", async () => {
    render(<UserManagement />);

    await screen.findByText("jdoe@example.com");
    act(() => {
      useAuthStore.setState({ token: null });
    });

    await confirmDelete();

    await waitFor(() => {
      const toasts = useUIStore.getState().toasts;
      expect(toasts).toHaveLength(1);
      expect(toasts[0]).toMatchObject({ type: "error" });
    });
    expect(userService.deleteUser).not.toHaveBeenCalled();
    expect(
      useUIStore.getState().toasts.some((t) => t.type === "success"),
    ).toBe(false);
  });
});
