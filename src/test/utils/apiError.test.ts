import { describe, expect, it } from "vitest";
import {
  DEFAULT_ERROR_MESSAGE,
  createApiRequestError,
  extractErrorMessage,
  isForbidden,
} from "../../utils/apiError";

describe("extractErrorMessage", () => {
  it("reads the ErrorResponse shape the accounts endpoints use", () => {
    const body = { error: "The code is already in use.", details: null };

    expect(extractErrorMessage(body, 400)).toBe("The code is already in use.");
  });

  it("reads the anonymous message shape sales and purchases use", () => {
    const body = { message: "Transaccion contable no encontrada" };

    expect(extractErrorMessage(body, 404)).toBe("Transaccion contable no encontrada");
  });

  it("prefers error over message when both are present", () => {
    const body = { error: "Account not found.", message: "otra cosa" };

    expect(extractErrorMessage(body, 400)).toBe("Account not found.");
  });

  it("falls back when the body carries no readable message", () => {
    expect(extractErrorMessage({}, 400)).toBe(DEFAULT_ERROR_MESSAGE);
    expect(extractErrorMessage(null, 400)).toBe(DEFAULT_ERROR_MESSAGE);
    expect(extractErrorMessage(404, 400)).toBe(DEFAULT_ERROR_MESSAGE);
  });

  it("reads a bare JSON string, the shape BadRequest(error.Message) answers", () => {
    expect(
      extractErrorMessage("The tax id must be a valid RNC or citizen ID.", 400),
    ).toBe("The tax id must be a valid RNC or citizen ID.");
  });

  it("falls back when a bare JSON string is blank", () => {
    expect(extractErrorMessage("   ", 400)).toBe(DEFAULT_ERROR_MESSAGE);
  });

  it("falls back when the message is blank", () => {
    expect(extractErrorMessage({ error: "   " }, 400)).toBe(DEFAULT_ERROR_MESSAGE);
  });

  it("keeps the generic message on a 5xx so technical detail never reaches the user", () => {
    const problemDetails = {
      type: "https://tools.ietf.org/html/rfc9110",
      title: "An error occurred while processing your request.",
      status: 500,
      detail: "Npgsql.PostgresException: 23505 duplicate key value violates unique constraint",
    };

    expect(extractErrorMessage(problemDetails, 500)).toBe(DEFAULT_ERROR_MESSAGE);
  });

  it("accepts a custom fallback", () => {
    expect(extractErrorMessage(null, 400, "No pudimos conectar con el servidor")).toBe(
      "No pudimos conectar con el servidor",
    );
  });
});

describe("createApiRequestError", () => {
  it("keeps the HTTP status on the error", () => {
    const error = createApiRequestError("Forbidden", 403);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("Forbidden");
    expect(error.status).toBe(403);
  });
});

describe("isForbidden", () => {
  it("detects a forbidden response", () => {
    expect(isForbidden(createApiRequestError("Forbidden", 403))).toBe(true);
  });

  it("ignores other statuses and plain errors", () => {
    expect(isForbidden(createApiRequestError("Not found", 404))).toBe(false);
    expect(isForbidden(new Error("boom"))).toBe(false);
    expect(isForbidden(undefined)).toBe(false);
  });
});
