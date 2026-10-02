const PAYSTACK_URL = "https://api.paystack.co";

export function getPaystackKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error("Missing required server configuration: PAYSTACK_SECRET_KEY");
  }
  return key;
}

export async function paystackRequest(path, options = {}) {
  try {
    const key = getPaystackKey();
    const response = await fetch(`${PAYSTACK_URL}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const body = await response.json().catch(() => null);

    if (!response.ok || !body?.status) {
      const errorMessage = body?.message || "Paystack request failed.";
      return {
        success: false,
        code: "PAYMENT_PROVIDER_ERROR",
        error: errorMessage,
      };
    }

    return {
      success: true,
      data: body.data,
      message: body.message,
    };
  } catch (error) {
    if (error?.message?.includes("PAYSTACK_SECRET_KEY")) {
      return {
        success: false,
        code: "PAYMENT_CONFIGURATION_ERROR",
        error: "Paystack is not configured on the server.",
      };
    }
    return {
      success: false,
      code: "PAYMENT_PROVIDER_ERROR",
      error: "Unable to reach Paystack payment gateway.",
    };
  }
}
