import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Alert, Snackbar } from "@mui/material";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback(({ message, severity = "success" }) => {
    setToast({ id: Date.now(), message, severity });
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        key={toast?.id}
        open={Boolean(toast)}
        autoHideDuration={5000}
        onClose={(_, reason) => {
          if (reason !== "clickaway") setToast(null);
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setToast(null)} severity={toast?.severity || "success"} variant="filled">
          {toast?.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider.");
  return context;
}
