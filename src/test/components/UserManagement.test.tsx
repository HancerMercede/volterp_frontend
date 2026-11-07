import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../infrastructure/api/userService", () => ({
  userService: {
    getUsers: vi.fn(),
    createUser: vi.fn(),
    inviteUser: vi.fn(),
    resendInvitation: vi.fn(),
    sendPasswordReset: vi.fn(),
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

const INVITED_USER: UserDto = {
  id: "u-2",
  code: "U-2",
  username: "pending",
  email: "pending@example.com",
  fullName: "Pending Person",
  role: "ventas",
  isActive: false,
  status: "invited",
  companyId: "co-1",
};

function mockUsers(items: UserDto[]) {
  vi.mocked(userService.getUsers).mockResolvedValue({
    rowCount: items.length,
    pageNumber: 1,
    pageSize: 10,
    pageCount: 1,
    items,
  });
}

beforeAll(async () => {
  await i18n.changeLanguage("en");
});

beforeEach(() => {
  vi.clearAllMocks();
  useUIStore.setState({ toasts: [], modals: [], isLoading: false });
  mockUsers([USER]);
  vi.mocked(userService.deleteUser).mockResolvedValue(undefined);
  vi.mocked(userService.inviteUser).mockResolvedValue(INVITED_USER);
  vi.mocked(userService.resendInvitation).mockResolvedValue(undefined);
  vi.mocked(userService.sendPasswordReset).mockResolvedValue(undefined);
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

const openInviteModal = async () => {
  await userEvent.click(await screen.findByRole("button", { name: "Invite user" }));
  return screen.findByRole("dialog");
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

describe("UserManagement invite flow", () => {
  it("opens the invite modal without asking for a password", async () => {
    render(<UserManagement />);

    const dialog = await openInviteModal();

    expect(within(dialog).getByLabelText("Email")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Name")).toBeInTheDocument();
    expect(dialog.querySelector('input[type="password"]')).toBeNull();
  });

  it("invites the user with the entered payload and reports success", async () => {
    render(<UserManagement />);

    const dialog = await openInviteModal();
    await userEvent.type(within(dialog).getByLabelText("Email"), "new@example.com");
    await userEvent.type(within(dialog).getByLabelText("Name"), "New Person");
    await userEvent.selectOptions(within(dialog).getByRole("combobox"), "admin");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Send invitation" }),
    );

    await waitFor(() =>
      expect(userService.inviteUser).toHaveBeenCalledWith({
        email: "new@example.com",
        fullName: "New Person",
        role: "admin",
        username: undefined,
      }),
    );
    await waitFor(() => {
      expect(useUIStore.getState().toasts[0]).toMatchObject({
        type: "success",
        message: "Invitation sent",
      });
    });
  });

  it("keeps the modal open and reports the failure when the invitation is rejected", async () => {
    vi.mocked(userService.inviteUser).mockRejectedValue(
      new Error("Email already invited"),
    );
    render(<UserManagement />);

    const dialog = await openInviteModal();
    await userEvent.type(within(dialog).getByLabelText("Email"), "new@example.com");
    await userEvent.type(within(dialog).getByLabelText("Name"), "New Person");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Send invitation" }),
    );

    await waitFor(() => {
      expect(useUIStore.getState().toasts[0]).toMatchObject({
        type: "error",
        message: "Email already invited",
      });
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(userService.getUsers).toHaveBeenCalledTimes(1);
  });
});

describe("UserManagement user states", () => {
  it("shows the invited badge and the resend action for a pending user", async () => {
    mockUsers([INVITED_USER]);
    render(<UserManagement />);

    await screen.findByText("pending@example.com");

    expect(await screen.findByText("Invited")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Resend invitation" }),
    ).toBeInTheDocument();
    // ActionButtons keeps a hardcoded Spanish title for the status toggle.
    expect(
      screen.queryByRole("button", { name: "Activar/Desactivar" }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Reset password" }),
    ).toBeNull();
  });

  it("resends the invitation for a pending user", async () => {
    mockUsers([INVITED_USER]);
    render(<UserManagement />);

    await userEvent.click(
      await screen.findByRole("button", { name: "Resend invitation" }),
    );

    await waitFor(() =>
      expect(userService.resendInvitation).toHaveBeenCalledWith("u-2"),
    );
    await waitFor(() => {
      expect(useUIStore.getState().toasts[0]).toMatchObject({
        type: "success",
        message: "Invitation resent",
      });
    });
  });

  it("sends the password reset for an active user after the confirmation", async () => {
    render(<UserManagement />);

    await userEvent.click(
      await screen.findByRole("button", { name: "Reset password" }),
    );

    const dialog = await screen.findByRole("alertdialog");
    expect(dialog).toHaveTextContent("jdoe@example.com");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Confirm" }),
    );

    await waitFor(() =>
      expect(userService.sendPasswordReset).toHaveBeenCalledWith("u-1"),
    );
    await waitFor(() => {
      expect(useUIStore.getState().toasts[0]).toMatchObject({
        type: "success",
        message: "Password reset email sent",
      });
    });
  });
});
