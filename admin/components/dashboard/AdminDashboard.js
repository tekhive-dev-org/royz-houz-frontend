import { useState } from "react";
import { Alert, Box, Button, FormControl, InputLabel, MenuItem, Select, Skeleton, Typography } from "@mui/material";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";
import { QuickLaunchBar } from "./QuickLaunchBar";
import { OperationalPillarCards } from "./OperationalPillarCards";
import { AttentionQueueCard } from "./AttentionQueueCard";
import { UpcomingEventsWidget } from "./UpcomingEventsWidget";
import { SpotlightTalentsWidget } from "./SpotlightTalentsWidget";
import { RecentActivityTable } from "./RecentActivityTable";
import { PlatformHealthBar } from "./PlatformHealthBar";
import styles from "./AdminDashboard.module.css";

const DATE_RANGES = [
  { value: 7, label: "Last 7 days" },
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" },
];

export function AdminDashboard() {
  const [days, setDays] = useState(30);
  const { data, error, isLoading, retry } = useDashboardSummary(days);

  return (
    <Box className="animate-fade-in">
      {/* Executive Header */}
      <Box className={styles.header}>
        <Box>
          <div className={styles.headerEyebrow}>Royz House Executive Studio</div>
          <Typography component="h1" variant="h4" className={styles.title}>
            Operational Command Center
          </Typography>
          <Typography variant="body1" className={styles.description}>
            Live platform metrics, talent roster management, production schedules, and administrative queues.
          </Typography>
        </Box>

        <Box className={styles.headerActions}>
          <FormControl size="small" className={styles.rangeControl}>
            <InputLabel id="dashboard-range-label">Timeframe</InputLabel>
            <Select
              labelId="dashboard-range-label"
              id="dashboard-range"
              value={days}
              label="Timeframe"
              onChange={(event) => setDays(Number(event.target.value))}
            >
              {DATE_RANGES.map((range) => (
                <MenuItem key={range.value} value={range.value}>
                  {range.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshOutlinedIcon />}
            onClick={retry}
            className={styles.refreshBtn}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Quick 1-Click Launch Bar */}
      <QuickLaunchBar />

      {error ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={retry}>
              Retry
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      ) : null}

      {isLoading ? (
        <Box className={styles.skeletonGrid}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={140}
              sx={{ borderRadius: "12px" }}
            />
          ))}
          <Skeleton
            variant="rectangular"
            height={200}
            sx={{ borderRadius: "12px", gridColumn: "1 / -1", mt: 2 }}
          />
        </Box>
      ) : data ? (
        <>
          {/* 4 Core Strategic Operational Pillar KPI Cards */}
          <OperationalPillarCards cards={data.cards} />

          {/* Action Center / Needs Attention Queue */}
          <AttentionQueueCard items={data.attentionItems || []} />

          {/* Split Operations Grid: Upcoming Events & Spotlight Talents */}
          <Box className={styles.splitGrid}>
            <UpcomingEventsWidget events={data.upcomingEventsList || []} />
            <SpotlightTalentsWidget talents={data.spotlightTalents || []} />
          </Box>

          {/* Audit Stream Table */}
          <Box className={styles.activity}>
            <RecentActivityTable
              activities={data.recentActivity?.activities || []}
              hidden={data.recentActivity?.hidden}
            />
          </Box>

          {/* Platform Infrastructure Health Bar */}
          <PlatformHealthBar />
        </>
      ) : null}
    </Box>
  );
}
