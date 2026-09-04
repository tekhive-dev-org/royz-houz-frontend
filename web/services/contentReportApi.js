export async function submitContentReportRequest(input) {
  const response = await fetch("/api/reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    const error = new Error(
      payload?.error?.message || "Your report could not be submitted. Please try again."
    );
    error.fields = payload?.error?.details || [];
    throw error;
  }

  return payload.data;
}
