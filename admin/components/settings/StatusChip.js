import { Box } from "@mui/material";

const STATUS_CONFIGS = {
  published: {
    label: "Published",
    bg: "#ECFDF5",
    color: "#059669",
    dot: "#10B981",
    border: "rgba(16, 185, 129, 0.2)",
  },
  draft: {
    label: "Draft",
    bg: "#FFFBEB",
    color: "#B45309",
    dot: "#F59E0B",
    border: "rgba(245, 158, 11, 0.2)",
  },
  scheduled: {
    label: "Scheduled",
    bg: "#F0F9FF",
    color: "#0369A1",
    dot: "#0EA5E9",
    border: "rgba(14, 165, 233, 0.2)",
  },
  archived: {
    label: "Archived",
    bg: "#F3F4F6",
    color: "#4B5563",
    dot: "#9CA3AF",
    border: "#E5E7EB",
  },
};

export function StatusChip({ status = "draft" }) {
  const config = STATUS_CONFIGS[status] || STATUS_CONFIGS.draft;

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        px: "8px",
        py: "2px",
        borderRadius: "12px",
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        fontSize: "0.6875rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        lineHeight: 1.6,
        userSelect: "none",
      }}
    >
      <Box
        component="span"
        sx={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: config.dot,
          boxShadow: `0 0 6px ${config.dot}`,
          flexShrink: 0,
        }}
      />
      <span>{config.label}</span>
    </Box>
  );
}
