import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Switch,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import { StatusChip } from "@/components/settings/StatusChip";
import { AdminLoadingState } from "@/components/feedback/AdminLoadingState";
import { ConfirmationDialog } from "@/components/feedback/ConfirmationDialog";
import { accessControlApi } from "@/services/accessControlApi";
import { AccessControlStatsBanner } from "./AccessControlStatsBanner";
import styles from "./AccessControlAdmin.module.css";

function requireConfirm(data) {
  return { ...data, confirm: true };
}

export function AccessControlAdmin({ actorUserId }) {
  const [tab, setTab] = useState(0);
  const [profiles, setProfiles] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [assignFor, setAssignFor] = useState(null);
  const [assignRoleIds, setAssignRoleIds] = useState([]);
  const [confirmStatus, setConfirmStatus] = useState(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({ name: "", description: "", permissionIds: [] });
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [inviteToken, setInviteToken] = useState(null);

  const requestIdRef = useRef(0);
  const filterDebounceTimerRef = useRef(null);
  const isMountedRef = useRef(false);

  async function initialLoad() {
    setIsInitialLoading(true);
    setError(null);
    try {
      const [profileData, roleData, permissionData, invitationData] = await Promise.all([
        accessControlApi.listProfiles({ search, status }),
        accessControlApi.listRoles(),
        accessControlApi.listPermissions(),
        accessControlApi.listInvitations(),
      ]);
      setProfiles(profileData);
      setRoles(roleData);
      setPermissions(permissionData);
      setInvitations(invitationData);
    } catch (err) {
      setError(err.message || "Unable to load administrators.");
    } finally {
      setIsInitialLoading(false);
      isMountedRef.current = true;
    }
  }

  async function refresh() {
    setIsUpdating(true);
    setError(null);
    try {
      const [profileData, roleData, permissionData, invitationData] = await Promise.all([
        accessControlApi.listProfiles({ search, status }),
        accessControlApi.listRoles(),
        accessControlApi.listPermissions(),
        accessControlApi.listInvitations(),
      ]);
      setProfiles(profileData);
      setRoles(roleData);
      setPermissions(permissionData);
      setInvitations(invitationData);
    } catch (err) {
      setError(err.message || "Unable to load administrators.");
    } finally {
      setIsUpdating(false);
    }
  }

  useEffect(() => {
    void initialLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Silent background filter effect
  useEffect(() => {
    if (!isMountedRef.current) return;

    if (filterDebounceTimerRef.current) {
      clearTimeout(filterDebounceTimerRef.current);
    }

    filterDebounceTimerRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      setIsUpdating(true);
      try {
        const profileData = await accessControlApi.listProfiles({ search, status });
        if (requestId === requestIdRef.current) {
          setProfiles(profileData);
        }
      } catch (err) {
        if (requestId === requestIdRef.current) {
          setError(err.message || "Unable to filter administrators.");
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setIsUpdating(false);
        }
      }
    }, 250);

    return () => {
      if (filterDebounceTimerRef.current) {
        clearTimeout(filterDebounceTimerRef.current);
      }
    };
  }, [search, status]);

  async function saveAssignments() {
    await accessControlApi.updateProfile(requireConfirm({ userId: assignFor.userId, roleIds: assignRoleIds }));
    setAssignFor(null);
    await refresh();
  }

  async function applyStatus() {
    await accessControlApi.updateProfile(requireConfirm({ userId: confirmStatus.userId, status: confirmStatus.status }));
    setConfirmStatus(null);
    await refresh();
  }

  async function saveRole() {
    await accessControlApi.saveRole(requireConfirm(roleForm), editingRole?.id);
    setRoleDialogOpen(false);
    await refresh();
  }

  async function createInvitation() {
    const result = await accessControlApi.createInvitation({ email: inviteEmail, roleId: inviteRole });
    setInviteToken(result.invitationToken);
    await refresh();
  }

  if (isInitialLoading) return <AdminLoadingState />;

  const isSelf = (profile) => profile.userId === actorUserId;

  const ADMIN_STATUS_PILLS = [
    { label: "All Staff", value: "" },
    { label: "Active Only", value: "active" },
    { label: "Suspended", value: "suspended" },
  ];

  return (
    <Box className={`${styles.container} animate-fade-in`}>
      <Box className={styles.header}>
        <Box>
          <Typography variant="h4" className={styles.title}>Users &amp; Role-Based Access Control</Typography>
          <Typography variant="body1" className={styles.description}>Manage administrators, security role tiers, granular system permissions, and onboarding invitations.</Typography>
        </Box>
        <Box className={styles.headerActions}>
          {tab === 1 ? (
            <Button startIcon={<AddIcon />} variant="contained" className={styles.primaryButton} onClick={() => { setInviteOpen(true); setInviteToken(null); }}>
              Invite Administrator
            </Button>
          ) : null}
          {tab === 2 ? (
            <Button startIcon={<AddIcon />} variant="contained" className={styles.primaryButton} onClick={() => { setEditingRole(null); setRoleForm({ name: "", description: "", permissionIds: [] }); setRoleDialogOpen(true); }}>
              Create Security Role
            </Button>
          ) : null}
        </Box>
      </Box>

      {error ? (
        <Paper elevation={0} sx={{ p: 2, bgcolor: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}>
          {error}
        </Paper>
      ) : null}

      <AccessControlStatsBanner profiles={profiles} roles={roles} invitations={invitations} />

      <Tabs value={tab} onChange={(_, value) => setTab(value)} className={styles.tabs}>
        <Tab icon={<AdminPanelSettingsOutlinedIcon fontSize="small" />} iconPosition="start" label={`Administrators (${profiles.length})`} />
        <Tab icon={<MailOutlineIcon fontSize="small" />} iconPosition="start" label={`Invitations (${invitations.length})`} />
        <Tab icon={<SecurityOutlinedIcon fontSize="small" />} iconPosition="start" label={`Security Roles (${roles.length})`} />
      </Tabs>

      {tab === 0 ? (
        <Box className={styles.tabPanel}>
          {/* Controls Bar */}
          <Box className={styles.controlsBar}>
            <Box className={styles.filtersRow}>
              <TextField
                size="small"
                placeholder="Search staff by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
                InputProps={{
                  startAdornment: (
                    <SearchIcon fontSize="small" sx={{ color: "#9CA3AF", mr: 1 }} />
                  ),
                  endAdornment: search ? (
                    <IconButton size="small" onClick={() => setSearch("")} aria-label="Clear search">
                      <ClearIcon fontSize="small" sx={{ color: "#9CA3AF" }} />
                    </IconButton>
                  ) : null,
                }}
              />
              <TextField
                size="small"
                select
                label="Account Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={styles.filterControl}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </TextField>
            </Box>

            {/* Quick Pills */}
            <Box className={styles.quickFiltersRow}>
              <Box className={styles.quickPills} role="group" aria-label="Account Status Filter">
                {ADMIN_STATUS_PILLS.map((pill) => (
                  <button
                    key={pill.value}
                    type="button"
                    className={`${styles.quickPill} ${status === pill.value ? styles.quickPillActive : ""}`}
                    onClick={() => setStatus(pill.value)}
                  >
                    {pill.label}
                  </button>
                ))}
              </Box>

              <Box className={styles.resultsMeta}>
                <span>
                  {isUpdating ? (
                    <span style={{ color: "#B46A2C", fontWeight: 600 }}>Filtering…</span>
                  ) : (
                    <>
                      Showing <span className={styles.resultsCount}>{profiles.length}</span> staff members
                    </>
                  )}
                </span>
                {(search || status) && (
                  <Button
                    size="small"
                    startIcon={<FilterListOffIcon fontSize="small" />}
                    onClick={() => {
                      setSearch("");
                      setStatus("");
                    }}
                    className={styles.resetFiltersBtn}
                  >
                    Reset
                  </Button>
                )}
              </Box>
            </Box>
          </Box>

          {/* Background updating progress */}
          {isUpdating && (
            <LinearProgress
              sx={{
                height: 2.5,
                borderRadius: 2,
                my: 0.5,
                backgroundColor: "transparent",
                "& .MuiLinearProgress-bar": { backgroundColor: "#B46A2C" },
              }}
            />
          )}

          <TableContainer className={styles.tableContainer}>
            <Table className={styles.table} size="medium">
              <TableHead>
                <TableRow className={styles.tableHeadRow}>
                  <TableCell className={styles.tableHeadCell} style={{ width: "36%" }}>Administrator</TableCell>
                  <TableCell className={styles.tableHeadCell} style={{ width: "30%" }}>Security Roles</TableCell>
                  <TableCell className={styles.tableHeadCell} style={{ width: "16%" }}>Status</TableCell>
                  <TableCell align="right" className={styles.tableHeadCell} style={{ width: "18%" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {profiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6, color: "#6B7280" }}>
                      No administrators found matching criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  profiles.map((profile) => {
                    const name = profile.displayName || "Admin User";
                    const initial = name.charAt(0).toUpperCase();

                    return (
                      <TableRow key={profile.userId} hover className={styles.tableRow}>
                        <TableCell className={styles.tableCell}>
                          <Box className={styles.userCell}>
                            <Box className={styles.avatar}>{initial}</Box>
                            <Box className={styles.userMeta}>
                              <span className={styles.userName}>
                                {name} {isSelf(profile) && <span className={styles.selfBadge}>You</span>}
                              </span>
                              <span className={styles.userEmail}>{profile.email}</span>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell className={styles.tableCell}>
                          {profile.roles?.length ? (
                            profile.roles.map((role) => (
                              <span key={role.id || role.roleKey} className={styles.roleBadge}>
                                {role.roleKey}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: "#9CA3AF", fontSize: "0.8125rem" }}>No roles assigned</span>
                          )}
                        </TableCell>
                        <TableCell className={styles.tableCell}>
                          <StatusChip status={profile.status === "active" ? "published" : "archived"} />
                        </TableCell>
                        <TableCell align="right" className={styles.tableCell}>
                          <Box className={styles.actionsDock}>
                            <Tooltip title="Edit Roles">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setAssignFor(profile);
                                  setAssignRoleIds(profile.roles.map((role) => role.id));
                                }}
                                className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
                                aria-label="Edit roles"
                              >
                                <EditOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {!isSelf(profile) && (
                              profile.status === "active" ? (
                                <Tooltip title="Suspend Access">
                                  <IconButton
                                    size="small"
                                    onClick={() => setConfirmStatus({ userId: profile.userId, status: "suspended" })}
                                    className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                                    aria-label="Suspend access"
                                  >
                                    <BlockOutlinedIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Tooltip title="Activate Access">
                                  <IconButton
                                    size="small"
                                    onClick={() => setConfirmStatus({ userId: profile.userId, status: "active" })}
                                    className={styles.actionBtn}
                                    sx={{ color: "#10B981 !important" }}
                                    aria-label="Activate access"
                                  >
                                    <CheckCircleOutlineIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ) : null}

      {tab === 1 ? (
        <Box className={styles.tabPanel}>
          <TableContainer className={styles.tableContainer}>
            <Table className={styles.table} size="medium">
              <TableHead>
                <TableRow className={styles.tableHeadRow}>
                  <TableCell className={styles.tableHeadCell} style={{ width: "32%" }}>Recipient Email</TableCell>
                  <TableCell className={styles.tableHeadCell} style={{ width: "24%" }}>Designated Role</TableCell>
                  <TableCell className={styles.tableHeadCell} style={{ width: "16%" }}>Invitation Status</TableCell>
                  <TableCell className={styles.tableHeadCell} style={{ width: "16%" }}>Expiry Date</TableCell>
                  <TableCell align="right" className={styles.tableHeadCell} style={{ width: "12%" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invitations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6, color: "#6B7280" }}>
                      No active invitations found. Click &quot;Invite Administrator&quot; to onboard staff.
                    </TableCell>
                  </TableRow>
                ) : (
                  invitations.map((invitation) => (
                    <TableRow key={invitation.id} hover className={styles.tableRow}>
                      <TableCell className={styles.tableCell}>
                        <strong style={{ color: "#111827" }}>{invitation.email}</strong>
                      </TableCell>
                      <TableCell className={styles.tableCell}>
                        <span className={styles.roleBadge}>
                          {invitation.roles?.name || invitation.role_key || invitation.role_id}
                        </span>
                      </TableCell>
                      <TableCell className={styles.tableCell}>
                        <StatusChip status={invitation.status === "pending" ? "scheduled" : "archived"} />
                      </TableCell>
                      <TableCell className={styles.tableCell} sx={{ color: "#64748B", fontSize: "0.8125rem" }}>
                        {invitation.expires_at ? new Date(invitation.expires_at).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell align="right" className={styles.tableCell}>
                        {invitation.status === "pending" ? (
                          <Button size="small" color="error" variant="outlined" sx={{ textTransform: "none", borderRadius: 2 }} onClick={() => accessControlApi.revokeInvitation(invitation.id).then(refresh)}>
                            Revoke Invite
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ) : null}

      {tab === 2 ? (
        <Box className={styles.tabPanel}>
          <Box className={styles.rolesGrid}>
            {roles.map((role) => (
              <Box key={role.id} className={styles.roleCard}>
                <Box className={styles.roleCardHeader}>
                  <span className={styles.roleName}>{role.name}</span>
                  <span className={styles.roleBadge}>{role.roleKey}</span>
                </Box>
                <p className={styles.roleDescription}>
                  {role.description || "No description provided for this security role."}
                </p>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 1, borderTop: "1px solid #F1F3F7" }}>
                  <span style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600 }}>
                    {role.permissions?.length || 0} permissions assigned
                  </span>
                  <Button
                    size="small"
                    variant="outlined"
                    className={styles.outlineButton}
                    onClick={() => {
                      setEditingRole(role);
                      setRoleForm({ name: role.name, description: role.description || "", permissionIds: role.permissionIds });
                      setRoleDialogOpen(true);
                    }}
                  >
                    Configure Role
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      ) : null}

      <Dialog open={Boolean(assignFor)} onClose={() => setAssignFor(null)} fullWidth maxWidth="sm">
        <DialogTitle>Edit roles — {assignFor?.displayName}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Changing role assignments is audited. Administrators cannot modify their own roles, and the last active super administrator cannot be removed.
          </Typography>
          <TextField label="Roles" select SelectProps={{ multiple: true }} value={assignRoleIds} onChange={(e) => setAssignRoleIds(e.target.value)} fullWidth>
            {roles.map((role) => <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignFor(null)}>Cancel</Button>
          <Button variant="contained" onClick={saveAssignments}>Save assignments</Button>
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        open={Boolean(confirmStatus)}
        title={confirmStatus?.status === "suspended" ? "Suspend administrator" : "Activate administrator"}
        description="This is a sensitive change that will be recorded in the audit log."
        confirmLabel={confirmStatus?.status === "suspended" ? "Suspend" : "Activate"}
        onCancel={() => setConfirmStatus(null)}
        onConfirm={applyStatus}
      />

      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingRole ? `Edit role — ${editingRole.name}` : "New role"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Name" value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })} fullWidth required />
            <TextField label="Description" value={roleForm.description} onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })} fullWidth multiline minRows={2} />
            <Typography variant="subtitle2">Permissions</Typography>
            <Box className={styles.permissionGrid}>
              {permissions.map((permission) => (
                <FormControlLabel
                  key={permission.id}
                  control={
                    <Switch
                      size="small"
                      checked={roleForm.permissionIds.includes(permission.id)}
                      onChange={(e) =>
                        setRoleForm((current) => ({
                          ...current,
                          permissionIds: e.target.checked
                            ? [...current.permissionIds, permission.id]
                            : current.permissionIds.filter((id) => id !== permission.id),
                        }))
                      }
                    />
                  }
                  label={permission.permission_key}
                />
              ))}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveRole}>Save role</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={inviteOpen} onClose={() => { setInviteOpen(false); setInviteToken(null); }} fullWidth maxWidth="sm">
        <DialogTitle>Invite administrator</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} fullWidth required />
            <TextField label="Role" select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} fullWidth required>
              {roles.map((role) => <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>)}
            </TextField>
            {inviteToken ? (
              <Paper elevation={0} className={styles.tokenCard}>
                <Typography variant="subtitle2">Share this one-time token with the invitee:</Typography>
                <Typography variant="body2" className={styles.tokenText}>{inviteToken}</Typography>
                <Typography variant="caption" color="text.secondary">It is shown once and only its hash is stored.</Typography>
              </Paper>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setInviteOpen(false); setInviteToken(null); }}>Close</Button>
          {!inviteToken ? <Button variant="contained" onClick={createInvitation}>Create invitation</Button> : null}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
