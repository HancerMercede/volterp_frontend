import { render, screen, within } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import i18n from "../../i18n";
import { ReadinessChecklist } from "../../components/UI/ReadinessChecklist";
import type {
  FiscalReadinessDocumentTypeDto,
  FiscalReadinessDto,
} from "../../domain/types";

/** El tipo de consumo electronico (E32) con numeros en su rango. */
const CONSUMPTION: FiscalReadinessDocumentTypeDto = {
  code: "E32",
  documentType: 32,
  name: "Consumer",
  isIssuable: true,
  remaining: 45,
  rangeExpiresAt: "2026-12-31T00:00:00Z",
  blockerCode: null,
  blocker: null,
};

/** El mismo tipo, con el rango agotado: el backend dice por que y en ingles. */
const CONSUMPTION_WITHOUT_ROOM: FiscalReadinessDocumentTypeDto = {
  ...CONSUMPTION,
  isIssuable: false,
  remaining: 0,
  blockerCode: "range-exhausted",
  blocker: "The authorized range of e-NCF for the type E32 is exhausted.",
};

const READY: FiscalReadinessDto = {
  emissionMode: "Electronic",
  usesElectronicEmission: true,
  isInContingency: false,
  hasValidCertificate: true,
  certificateExpiresAt: "2027-01-31T00:00:00Z",
  isReady: true,
  blockers: [],
  documentTypes: [CONSUMPTION],
};

const NOT_READY: FiscalReadinessDto = {
  ...READY,
  isReady: false,
  blockers: [
    {
      code: "range-exhausted",
      message: "The authorized range of e-NCF for the type E32 is exhausted.",
      documentTypeCode: "E32",
    },
  ],
  documentTypes: [CONSUMPTION_WITHOUT_ROOM],
};

/** El contribuyente que factura en papel, dentro de una contingencia. */
const ON_PAPER: FiscalReadinessDto = {
  emissionMode: "Normal",
  usesElectronicEmission: false,
  isInContingency: true,
  hasValidCertificate: false,
  certificateExpiresAt: null,
  isReady: false,
  blockers: [
    {
      code: "range-missing",
      message: "There is no authorized range of NCF for the type B02.",
      documentTypeCode: "B02",
    },
  ],
  documentTypes: [
    {
      code: "B02",
      documentType: 2,
      name: "Consumer",
      isIssuable: false,
      remaining: 0,
      rangeExpiresAt: null,
      blockerCode: "range-missing",
      blocker: "There is no authorized range of NCF for the type B02.",
    },
  ],
};

/**
 * Dos tipos electronicos sin numeros y un bloqueo que habla de uno solo: el
 * mensaje del backend no dice de que tipo habla, asi que el unico dato que
 * lo identifica es el codigo del tipo que trae el bloqueo.
 */
const TWO_EXHAUSTED: FiscalReadinessDto = {
  ...READY,
  isReady: false,
  blockers: [
    {
      code: "range-exhausted",
      message: "The authorized range of e-NCF is exhausted.",
      documentTypeCode: "E33",
    },
  ],
  documentTypes: [
    {
      code: "E32",
      documentType: 32,
      name: "Consumer",
      isIssuable: false,
      remaining: 0,
      rangeExpiresAt: "2026-12-31T00:00:00Z",
      blockerCode: "range-exhausted",
      blocker: "The authorized range of e-NCF for the type E32 is exhausted.",
    },
    {
      code: "E33",
      documentType: 33,
      name: "FiscalCredit",
      isIssuable: false,
      remaining: 0,
      rangeExpiresAt: "2026-12-31T00:00:00Z",
      blockerCode: "range-exhausted",
      blocker: "The authorized range of e-NCF for the type E33 is exhausted.",
    },
  ],
};

/** El contribuyente electronico sin certificado: el bloqueo no habla de ningun tipo. */
const WITHOUT_CERTIFICATE: FiscalReadinessDto = {
  ...READY,
  isReady: false,
  hasValidCertificate: false,
  certificateExpiresAt: null,
  blockers: [
    {
      code: "certificate-missing",
      message: "There is no valid signing certificate for the issuer 10101010.",
      documentTypeCode: null,
    },
  ],
};

beforeAll(async () => {
  await i18n.changeLanguage("es");
});

describe("ReadinessChecklist compacto", () => {
  it("dice que se puede facturar cuando el contribuyente esta listo", () => {
    render(
      <ReadinessChecklist variant="compact" readiness={READY} loading={false} />,
    );

    expect(screen.getByText("Listo para facturar")).toBeInTheDocument();
  });

  it("dice por que no se puede facturar, en espanol y sin el mensaje del backend", () => {
    render(
      <ReadinessChecklist
        variant="compact"
        readiness={NOT_READY}
        loading={false}
      />,
    );

    expect(
      screen.getByText(/No se puede facturar ahora/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/El rango autorizado de e-NCF del tipo E32 se agotó/),
    ).toBeInTheDocument();
    // El mensaje del backend esta en ingles: la pantalla nunca lo muestra.
    expect(screen.queryByText(/exhausted/i)).toBeNull();
  });

  it("empareja el bloqueo con su tipo por el codigo del tipo, no por el mensaje", () => {
    render(
      <ReadinessChecklist
        variant="compact"
        readiness={TWO_EXHAUSTED}
        loading={false}
      />,
    );

    // El bloqueo habla del E33: el E32 comparte su codigo de bloqueo, pero
    // no es el tipo del bloqueo.
    expect(
      screen.getByText(/El rango autorizado de e-NCF del tipo E33 se agotó/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/del tipo E32 se agotó/)).toBeNull();
  });

  it("explica el bloqueo del certificado, que no habla de ningun tipo", () => {
    render(
      <ReadinessChecklist
        variant="compact"
        readiness={WITHOUT_CERTIFICATE}
        loading={false}
      />,
    );

    expect(
      screen.getByText(/No hay un certificado de firma válido/),
    ).toBeInTheDocument();
  });

  it("avisa que no pudo verificar cuando la llamada falla", () => {
    render(
      <ReadinessChecklist
        variant="compact"
        readiness={null}
        loading={false}
        error="boom"
      />,
    );

    expect(
      screen.getByText("No se pudo verificar si se puede facturar"),
    ).toBeInTheDocument();
  });
});

describe("ReadinessChecklist completo", () => {
  it("muestra los numeros que le quedan a cada rango", () => {
    render(
      <ReadinessChecklist variant="full" readiness={READY} loading={false} />,
    );

    const table = screen.getByRole("table");
    expect(within(table).getByText("E32")).toBeInTheDocument();
    expect(within(table).getByText("45")).toBeInTheDocument();
    expect(within(table).getByText("2026-12-31")).toBeInTheDocument();
    expect(within(table).getByText("Se puede emitir")).toBeInTheDocument();
  });

  it("dice en la tabla por que un tipo no se puede emitir", () => {
    render(
      <ReadinessChecklist
        variant="full"
        readiness={NOT_READY}
        loading={false}
      />,
    );

    const table = screen.getByRole("table");
    expect(
      within(table).getByText(
        /El rango autorizado de e-NCF del tipo E32 se agotó/,
      ),
    ).toBeInTheDocument();
  });

  it("muestra la ruta de papel, la contingencia y el codigo B02", () => {
    render(
      <ReadinessChecklist variant="full" readiness={ON_PAPER} loading={false} />,
    );

    expect(screen.getByText("Papel (NCF)")).toBeInTheDocument();
    expect(
      screen.getByText(/Contingencia activa: la venta sale en papel/),
    ).toBeInTheDocument();
    // En la ruta de papel no hace falta certificado de firma.
    expect(
      screen.getByText("No hace falta en la ruta de papel"),
    ).toBeInTheDocument();

    const table = screen.getByRole("table");
    expect(within(table).getByText("B02")).toBeInTheDocument();
  });

  it("muestra el certificado de firma y cuando vence", () => {
    render(
      <ReadinessChecklist variant="full" readiness={READY} loading={false} />,
    );

    expect(screen.getByText("Certificado de firma")).toBeInTheDocument();
    expect(screen.getByText("Válido hasta 2027-01-31")).toBeInTheDocument();
  });
});
