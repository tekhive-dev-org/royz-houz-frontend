import Link from "next/link";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { Breadcrumbs, Typography } from "@mui/material";
import { useAdminNavigation } from "@/hooks/useAdminNavigation";
import styles from "./AdminBreadcrumbs.module.css";

export function AdminBreadcrumbs() {
  const navigation = useAdminNavigation();
  const activeItem = navigation.find((item) => item.active) || navigation.find((item) => item.href === "/");
  const isDashboard = activeItem.href === "/";

  return (
    <Breadcrumbs aria-label="Breadcrumb" className={styles.breadcrumbs}>
      {isDashboard ? (
        <Typography className={styles.current} variant="body2">
          Dashboard
        </Typography>
      ) : (
        <Link href="/" className={styles.homeLink}>
          <HomeOutlinedIcon fontSize="small" aria-hidden="true" />
          Dashboard
        </Link>
      )}
      {!isDashboard ? (
        <Typography className={styles.current} variant="body2">
          {activeItem.label}
        </Typography>
      ) : null}
    </Breadcrumbs>
  );
}
