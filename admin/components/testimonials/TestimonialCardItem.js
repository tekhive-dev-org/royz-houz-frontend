import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Paper,
  Rating,
  Tooltip,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";

export function TestimonialCardItem({
  item,
  index,
  totalItems,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        bgcolor: "#ffffff",
        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
        "&:hover": {
          borderColor: "#cbd5e1",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        },
        display: "flex",
        flexDirection: "column",
        gap: { xs: 1.5, sm: 2 },
      }}
    >
      {/* Top Header Row */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "flex-start" },
          gap: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, sm: 2 }, flex: 1, minWidth: 0 }}>
          {/* Avatar Thumbnail */}
          <Avatar
            src={item.avatar || "/assets/img/talents/blessing.jpg"}
            alt={item.name}
            sx={{
              width: { xs: 44, sm: 52 },
              height: { xs: 44, sm: 52 },
              border: "2px solid #e2e8f0",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
              flexShrink: 0,
            }}
          />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#0f172a", wordBreak: "break-word" }}>
                {item.name}
              </Typography>
              <Chip
                label={item.isActive !== false ? "Active" : "Hidden"}
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  bgcolor: item.isActive !== false ? "#dcfce7" : "#f1f5f9",
                  color: item.isActive !== false ? "#15803d" : "#64748b",
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: "#64748b", wordBreak: "break-word", mt: 0.25 }}>
              {item.role}
            </Typography>
            <Rating value={item.rating ?? 5} readOnly size="small" sx={{ mt: 0.5 }} />
          </Box>
        </Box>

        {/* Action Controls */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "space-between", sm: "flex-end" },
            gap: 0.5,
            pt: { xs: 1, sm: 0 },
            borderTop: { xs: "1px solid #f1f5f9", sm: "none" },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <Tooltip title="Move Up">
            <span>
              <IconButton
                size="small"
                onClick={() => onMoveUp(index)}
                disabled={index === 0}
                sx={{
                  color: "#64748b",
                  p: { xs: 1, sm: 0.5 },
                  border: { xs: "1px solid #e2e8f0", sm: "none" },
                  borderRadius: 1.5,
                }}
              >
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Move Down">
            <span>
              <IconButton
                size="small"
                onClick={() => onMoveDown(index)}
                disabled={index === totalItems - 1}
                sx={{
                  color: "#64748b",
                  p: { xs: 1, sm: 0.5 },
                  border: { xs: "1px solid #e2e8f0", sm: "none" },
                  borderRadius: 1.5,
                }}
              >
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Edit Story">
            <IconButton
              size="small"
              onClick={() => onEdit(item)}
              sx={{
                color: "#2563eb",
                p: { xs: 1, sm: 0.5 },
                border: { xs: "1px solid #bfdbfe", sm: "none" },
                borderRadius: 1.5,
                bgcolor: { xs: "#eff6ff", sm: "transparent" },
                "&:hover": { bgcolor: "#eff6ff" },
              }}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Story">
            <IconButton
              size="small"
              onClick={() => onDelete(item.id)}
              sx={{
                color: "#ef4444",
                p: { xs: 1, sm: 0.5 },
                border: { xs: "1px solid #fecaca", sm: "none" },
                borderRadius: 1.5,
                bgcolor: { xs: "#fef2f2", sm: "transparent" },
                "&:hover": { bgcolor: "#fef2f2" },
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Quote Statement */}
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: "#f8fafc",
          border: "1px solid #f1f5f9",
          display: "flex",
          gap: 1.5,
        }}
      >
        <FormatQuoteIcon sx={{ color: "#94a3b8", transform: "rotate(180deg)", fontSize: 24, flexShrink: 0 }} />
        <Typography
          variant="body2"
          sx={{
            color: "#334155",
            fontStyle: "italic",
            lineHeight: 1.6,
          }}
        >
          {item.quote}
        </Typography>
      </Box>
    </Paper>
  );
}
