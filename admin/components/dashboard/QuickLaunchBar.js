import Link from "next/link";
import { Box, Button } from "@mui/material";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import styles from "./QuickLaunchBar.module.css";

const ACTIONS = [
  {
    id: "new-event",
    label: "Schedule Event",
    href: "/events?action=new",
    icon: EventOutlinedIcon,
    variant: "contained",
    primary: true,
  },
  {
    id: "new-talent",
    label: "Add Talent",
    href: "/talents?action=new",
    icon: PersonAddOutlinedIcon,
    variant: "outlined",
  },
  {
    id: "write-article",
    label: "Draft Article",
    href: "/blog?action=new",
    icon: EditNoteOutlinedIcon,
    variant: "outlined",
  },
  {
    id: "upload-media",
    label: "Upload Media",
    href: "/media?action=new",
    icon: CloudUploadOutlinedIcon,
    variant: "outlined",
  },
];

export function QuickLaunchBar() {
  return (
    <Box className={styles.bar} aria-label="Quick launch administrative actions">
      <div className={styles.actionGroup}>
        <span className={styles.barLabel}>Quick Actions:</span>
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              component={Link}
              href={action.href}
              size="small"
              variant={action.variant}
              startIcon={<Icon fontSize="small" />}
              className={action.primary ? styles.primaryBtn : styles.actionBtn}
            >
              {action.label}
            </Button>
          );
        })}
      </div>

      <div className={styles.secondaryGroup}>
        <Button
          component="a"
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
          size="small"
          variant="text"
          endIcon={<OpenInNewOutlinedIcon fontSize="inherit" />}
          className={styles.liveSiteBtn}
        >
          View Public Site
        </Button>
      </div>
    </Box>
  );
}
