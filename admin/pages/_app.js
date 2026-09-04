import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import "@/styles/globals.css";
import { AdminShell } from "@/components/layout/AdminShell";
import { AdminAuthProvider } from "@/components/auth/AdminAuthProvider";
import { useAdminRealtime } from "@/hooks/useAdminRealtime";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#B46A2C",
      light: "#C5854E",
      dark: "#995222",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#DCA43E",
      light: "#E5B962",
      dark: "#B88326",
      contrastText: "#0B0C10",
    },
    background: {
      default: "#F8F9FB",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#111827",
      secondary: "#4B5563",
    },
    divider: "#E8EAEF",
    success: {
      main: "#10B981",
      light: "#ECFDF5",
      dark: "#059669",
    },
    warning: {
      main: "#F59E0B",
      light: "#FFFBEB",
      dark: "#D97706",
    },
    error: {
      main: "#EF4444",
      light: "#FEF2F2",
      dark: "#DC2626",
    },
    info: {
      main: "#0EA5E9",
      light: "#F0F9FF",
      dark: "#0284C7",
    },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: { fontWeight: 800, letterSpacing: "-0.03em" },
    h2: { fontWeight: 700, letterSpacing: "-0.025em" },
    h3: { fontWeight: 700, letterSpacing: "-0.02em" },
    h4: { fontWeight: 700, letterSpacing: "-0.02em" },
    h5: { fontWeight: 600, letterSpacing: "-0.01em" },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 600 },
    body1: { fontSize: "0.9375rem", lineHeight: 1.6 },
    body2: { fontSize: "0.875rem", lineHeight: 1.5 },
    button: { fontWeight: 600, textTransform: "none", letterSpacing: "0.01em" },
    overline: { fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "8px 18px",
          fontWeight: 600,
          boxShadow: "none",
          transition: "all 0.18s ease-in-out",
          "&:hover": {
            boxShadow: "0 2px 8px rgba(180, 106, 44, 0.25)",
            transform: "translateY(-1px)",
          },
          "&:active": {
            transform: "translateY(0)",
          },
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #B46A2C 0%, #A05920 100%)",
          "&:hover": {
            background: "linear-gradient(135deg, #C5854E 0%, #B46A2C 100%)",
          },
        },
        outlinedPrimary: {
          borderColor: "#B46A2C",
          "&:hover": {
            borderColor: "#995222",
            background: "rgba(180, 106, 44, 0.04)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: 14,
          border: "1px solid #E8EAEF",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03), 0 4px 16px rgba(0, 0, 0, 0.02)",
        },
        elevation0: {
          boxShadow: "none",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#B46A2C",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#B46A2C",
            borderWidth: "2px",
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#F9FAFC",
          "& .MuiTableCell-head": {
            color: "#4B5563",
            fontWeight: 700,
            fontSize: "0.75rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            borderBottom: "1px solid #E8EAEF",
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: "background-color 0.15s ease",
          "&:hover": {
            backgroundColor: "#F8F9FB !important",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid #E8EAEF",
          padding: "14px 18px",
          fontSize: "0.875rem",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 46,
        },
        indicator: {
          backgroundColor: "#B46A2C",
          height: 3,
          borderRadius: "3px 3px 0 0",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.9rem",
          minHeight: 46,
          padding: "10px 18px",
          color: "#6B7280",
          "&.Mui-selected": {
            color: "#B46A2C",
            fontWeight: 700,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 20,
          fontSize: "0.75rem",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          border: "1px solid #E8EAEF",
          boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.15)",
        },
      },
    },
  },
});

function RealtimeBridge() {
  useAdminRealtime();
  return null;
}

export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => <AdminShell>{page}</AdminShell>);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AdminAuthProvider>
        <RealtimeBridge />
        {getLayout(<Component {...pageProps} />)}
      </AdminAuthProvider>
    </ThemeProvider>
  );
}
