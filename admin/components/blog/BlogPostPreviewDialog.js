import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

export function BlogPostPreviewDialog({ preview, onClose }) {
  if (!preview) return null;

  const contentBlocks = Array.isArray(preview.content) ? preview.content : [];

  return (
    <Dialog open={Boolean(preview)} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1.5 }}>
        <Typography variant="h6" fontWeight={700}>
          Article Preview: {preview.title || "Untitled"}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 4, bgcolor: "#FFFFFF" }}>
        {/* Cover Image */}
        {preview.image && (
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: { xs: 220, sm: 360 },
              borderRadius: 3,
              overflow: "hidden",
              mb: 3,
              border: "1px solid #E5E7EB",
            }}
          >
            <img src={preview.image} alt={preview.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </Box>
        )}

        {/* Badge & Title */}
        {preview.badge && (
          <Typography
            variant="caption"
            sx={{
              display: "inline-block",
              bgcolor: "#FAF4EF",
              color: "#B46A2C",
              border: "1px solid #F2E4D6",
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              mb: 1.5,
            }}
          >
            {preview.badge}
          </Typography>
        )}

        <Typography variant="h4" fontWeight={800} color="#0A0D14" gutterBottom>
          {preview.title}
        </Typography>

        {/* Meta info */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, color: "#6B7280", fontSize: 14, mb: 3 }}>
          <span>By {preview.author || "Royz Houz Team"}</span>
          <span>•</span>
          <span>{preview.date || "Today"}</span>
          <span>•</span>
          <span>{preview.readTime || "5 min read"}</span>
        </Box>

        {preview.excerpt && (
          <Typography variant="body1" sx={{ color: "#4B5563", fontSize: "1.1rem", fontStyle: "italic", mb: 3, pb: 2, borderBottom: "1px solid #F3F4F6" }}>
            {preview.excerpt}
          </Typography>
        )}

        {/* Content Blocks */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {contentBlocks.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No content blocks added yet.
            </Typography>
          ) : (
            contentBlocks.map((block, idx) => {
              if (block.type === "heading") {
                return (
                  <Typography key={idx} variant={block.level === 3 ? "h6" : "h5"} fontWeight={700} color="#0A0D14" sx={{ mt: 2 }}>
                    {block.text}
                  </Typography>
                );
              }
              if (block.type === "quote") {
                return (
                  <Box key={idx} sx={{ borderLeft: "4px solid #DCA43E", pl: 3, py: 1, fontStyle: "italic", bgcolor: "#FFFDF9", my: 1 }}>
                    <Typography variant="body1" fontWeight={600} color="#1F2937">
                      “{block.text}”
                    </Typography>
                  </Box>
                );
              }
              if (block.type === "callout") {
                return (
                  <Box
                    key={idx}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      bgcolor: "#B46A2C",
                      color: "#FFFFFF",
                      my: 2,
                      boxShadow: "0 4px 20px rgba(180,106,44,0.12)",
                    }}
                  >
                    <Typography variant="caption" fontWeight={800} letterSpacing="0.12em" sx={{ color: "#FDE68A", textTransform: "uppercase", display: "block", mb: 0.5 }}>
                      {block.title || "KEY TAKEAWAY"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#F9FAFB", lineHeight: 1.65 }}>
                      {block.text}
                    </Typography>
                  </Box>
                );
              }
              if (block.type === "image") {
                return (
                  <Box key={idx} sx={{ my: 2 }}>
                    <Box sx={{ width: "100%", height: 280, borderRadius: 2, overflow: "hidden", border: "1px solid #E5E7EB" }}>
                      <img src={block.src} alt={block.alt || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </Box>
                    {block.caption && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", mt: 0.5, fontStyle: "italic" }}>
                        {block.caption}
                      </Typography>
                    )}
                  </Box>
                );
              }
              if (block.type === "list" || block.type === "listItem") {
                return (
                  <Typography key={idx} variant="body2" color="#374151" sx={{ pl: 2 }}>
                    • {block.text}
                  </Typography>
                );
              }
              if (block.type === "divider") {
                return <Divider key={idx} sx={{ my: 2 }} />;
              }
              return (
                <Typography key={idx} variant="body1" color="#374151" sx={{ lineHeight: 1.75 }}>
                  {block.text}
                </Typography>
              );
            })
          )}
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
        {preview.slug ? (
          <Button
            component="a"
            href={`http://localhost:3000/blog/${preview.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<OpenInNewIcon fontSize="small" />}
            size="small"
          >
            Open on Live Website
          </Button>
        ) : <Box />}
        <Button onClick={onClose} variant="contained" sx={{ background: "#B46A2C" }}>
          Close Preview
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BlogPostPreviewDialog;
