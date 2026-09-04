import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, IconButton, Typography } from "@mui/material";
import styles from "./ConfirmationDialog.module.css";

const toneIcons = {
  danger: DeleteOutlineRoundedIcon,
  warning: WarningAmberRoundedIcon,
};

/** Accessible confirmation boundary for sensitive and destructive mutations. */
export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isConfirming = false,
  tone = "danger",
  onCancel,
  onConfirm,
}) {
  const ToneIcon = toneIcons[tone] || WarningAmberRoundedIcon;

  return (
    <Dialog
      open={open}
      onClose={isConfirming ? undefined : onCancel}
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
      fullWidth
      maxWidth="xs"
      PaperProps={{ className: styles.dialogPaper }}
    >
      <IconButton
        aria-label="Close confirmation dialog"
        onClick={onCancel}
        disabled={isConfirming}
        className={styles.closeButton}
        size="small"
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      <DialogContent className={styles.content}>
        <Box className={`${styles.iconWrap} ${styles[tone] || styles.warning}`} aria-hidden="true">
          <ToneIcon />
        </Box>
        <Typography id="confirmation-dialog-title" component="h2" className={styles.title}>
          {title}
        </Typography>
        <Typography id="confirmation-dialog-description" className={styles.description}>
          {description}
        </Typography>
      </DialogContent>

      <DialogActions className={styles.actions}>
        <Button onClick={onCancel} disabled={isConfirming} variant="outlined" className={styles.cancelButton}>
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          color={tone === "danger" ? "error" : "warning"}
          variant="contained"
          disabled={isConfirming}
          className={styles.confirmButton}
          startIcon={isConfirming ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {isConfirming ? "Please wait…" : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
