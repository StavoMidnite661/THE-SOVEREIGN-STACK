// __tests__/checkout.unit.test.ts
/**
 * @jest-environment node
 */
import { POST } from "@/app/api/checkout/route";
import Stripe from "stripe";

jest.mock("stripe");
jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: any, init: any) => ({
      json: async () => body,
      status: init?.status || 200,
    }),
  },
}));

// Mock the attestor client to avoid network calls (though it has fallback, mocking is cleaner)
jest.mock("../backend/attestor-client", () => ({
    requestAttestation: jest.fn().mockResolvedValue({
        signature: "0x_mock_sig",
        signer: "0x_mock_signer",
        expiresAt: 1234567890
    })
}), { virtual: true });

describe("Checkout route", () => {
  beforeAll(() => {
    (Stripe as any).mockImplementation(() => ({
      paymentIntents: { create: jest.fn().mockResolvedValue({ id: "pi_test", client_secret: "cs_test" }) }
    }));
  });

  it("returns clientSecret on valid request", async () => {
    const req = { 
        json: async () => ({ amount: 5, wallet: "0xabcde12345", merchantId: "m1", orderId: "o1", burnPOSCR: false }) 
    } as any;
    const res = await POST(req);
    const json = await res.json();
    expect(json.clientSecret).toBe("cs_test");
    expect(json.paymentIntentId).toBe("pi_test");
    expect(res.status).not.toBe(500);
  });

  it("rejects invalid payload", async () => {
    const req = { json: async () => ({ amount: 0 }) } as any;
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
