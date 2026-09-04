import { useCallback, useEffect, useState } from "react";
import { fetchDashboardSummary } from "@/services/dashboardApi";

export function useDashboardSummary(days) {
  const [state, setState] = useState({ isLoading: true, data: null, error: null });

  const load = useCallback(async () => {
    setState((previous) => ({ ...previous, isLoading: true, error: null }));
    try {
      const data = await fetchDashboardSummary({ days });
      setState({ isLoading: false, data, error: null });
    } catch (error) {
      setState({ isLoading: false, data: null, error: error.message || "Unable to load the dashboard." });
    }
  }, [days]);

  useEffect(() => {
    void load();
  }, [load]);

  return { ...state, retry: load };
}
