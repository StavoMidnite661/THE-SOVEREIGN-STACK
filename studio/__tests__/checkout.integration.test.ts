// __tests__/checkout.integration.test.ts
/**
 * @jest-environment node
 */
import { POST } from "@/app/api/checkout/route";

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: any, init: any) => ({
      json: async () => body,
      status: init?.status || 200,
    }),
  },
}));

// Mock attestor client for integration too, unless we want to hit real dev fallback
jest.mock("../backend/attestor-client", () => ({
    requestAttestation: jest.fn().mockResolvedValue({
        signature: "0x_mock_sig_integration",
        signer: "0x_mock_signer",
        expiresAt: 9999999999
    })
}), { virtual: true });

describe("integration", () => {
  it("integration path returns client secret", async () => {
    // Note: Integration test usually hits real Stripe relative to the env keys
    // If keys are valid, this works. If not, Stripe might error.
    // The previous agent ensured keys are present.
    const req = { 
        json: async () => ({ amount: 12.5, wallet: "0x12345abcde", merchantId: "m2", orderId: "ord2" }) 
    } as any;
    const res = await POST(req);
    const data = await res.json();
    
    if (res.status === 500) {
        console.warn("Integration test failed with 500:", data);
    }

    expect(data.clientSecret).toBeDefined();
  });
});
