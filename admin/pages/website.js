import { useCallback, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import NavigationOutlinedIcon from "@mui/icons-material/NavigationOutlined";
import ViewColumnOutlinedIcon from "@mui/icons-material/ViewColumnOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import ContactMailOutlinedIcon from "@mui/icons-material/ContactMailOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { Alert, Box, Button, Tab, Tabs, Typography } from "@mui/material";
import { EntityDialog } from "@/components/settings/EntityDialog";
import { SortableList } from "@/components/settings/SortableList";
import { StatusChip } from "@/components/settings/StatusChip";
import { AdminLoadingState } from "@/components/feedback/AdminLoadingState";
import { ContactInfoPanel, SeoPanel } from "@/components/settings/SingletonPanels";
import { useAdminCollection } from "@/hooks/useAdminCollection";
import { siteApi } from "@/services/siteApi";
import { requireAdminFeature } from "@/lib/auth/requireAdminFeature";
import { ADMIN_FEATURES } from "@/constants/adminFeatures";
import styles from "@/styles/website.module.css";

const NAV_FIELDS = [
  { name: "label", label: "Navigation Label", required: true },
  { name: "href", label: "Destination Link", required: true, helperText: "Internal path (/about) or external https URL." },
];
const NAV_SELECTS = [
  {
    name: "placement",
    label: "Placement Zone",
    options: [
      { value: "header", label: "Header (Main Navigation)" },
      { value: "utility", label: "Utility Bar" },
    ],
  },
];

const FOOTER_SECTION_FIELDS = [
  { name: "slug", label: "Section Slug (e.g. explore, community)", required: true },
  { name: "title", label: "Display Title", required: true },
  { name: "summary", label: "Short Description (Optional)" },
];

const FOOTER_LINK_FIELDS = [
  { name: "label", label: "Link Label", required: true },
  { name: "href", label: "Destination URL/Path", required: true },
];

const SOCIAL_FIELDS = [
  { name: "platform", label: "Platform (e.g. instagram, x, youtube, tiktok)", required: true },
  { name: "url", label: "Profile / Channel URL", required: true },
  { name: "label", label: "Display Label (Optional)" },
];
const SOCIAL_SELECTS = [
  {
    name: "placement",
    label: "Display Zone",
    options: [
      { value: "global", label: "Global (Header & Footer)" },
      { value: "header", label: "Header Only" },
      { value: "footer", label: "Footer Only" },
      { value: "contact", label: "Contact Page Only" },
    ],
  },
];

const SETTING_FIELDS = [
  { name: "slug", label: "Configuration Key", required: true },
  { name: "title", label: "Setting Title", required: true },
  { name: "summary", label: "Description / Value" },
];

function CollectionSection({ title, description, collection, fields, selectFields, getKey, renderPrimary, onCreate }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    setDialogOpen(true);
  }

  async function submit(values) {
    if (onCreate) {
      await onCreate(values, editing?.id);
    } else {
      await collection.save(values, editing?.id);
    }
    setDialogOpen(false);
  }

  if (collection.isLoading && collection.items.length === 0) return <AdminLoadingState />;
  if (collection.error) {
    return (
      <Alert severity="error" action={<Button color="inherit" size="small" onClick={collection.refresh}>Retry</Button>}>
        {collection.error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box className={styles.sectionHeader}>
        <Box>
          <Typography variant="h6" className={styles.sectionTitle}>{title}</Typography>
          <Typography variant="body2" className={styles.sectionDescription}>{description}</Typography>
        </Box>
        <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={openCreate} className={styles.addBtn}>
          Add Entry
        </Button>
      </Box>

      {collection.items.length === 0 ? (
        <Box className={styles.empty}>
          No records configured yet. Click &quot;Add Entry&quot; above to create your first record.
        </Box>
      ) : (
        <SortableList
          items={collection.items}
          getKey={getKey}
          renderPrimary={renderPrimary}
          onMove={(from, to, updatedItems) => {
            const next = updatedItems || move(collection.items, from, to);
            collection.reorder(next.map(getKey), next);
          }}
          onEdit={openEdit}
          onDelete={(item) => collection.remove(getKey(item))}
        />
      )}

      <EntityDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={submit}
        title={editing ? `Edit ${title.toLowerCase()}` : `Add new ${title.toLowerCase()}`}
        fields={fields}
        selectFields={selectFields}
        initial={editing || {}}
        resetKey={editing?.id || "new"}
      />
    </Box>
  );
}

export default function WebsiteSettingsPage() {
  const [tab, setTab] = useState(0);
  const navigation = useAdminCollection({
    list: siteApi.listNavigation,
    save: siteApi.saveNavigation,
    reorder: siteApi.reorderNavigation,
    remove: siteApi.deleteNavigation,
  });
  const footerSections = useAdminCollection({
    list: siteApi.listFooterSections,
    save: siteApi.saveFooterSection,
    reorder: siteApi.reorderFooterSections,
    remove: siteApi.deleteFooterSection,
  });
  const listFooterLinks = useCallback(() => siteApi.listFooterLinks(), []);
  const listSocialLinks = useCallback(() => siteApi.listSocialLinks(), []);
  const footerLinks = useAdminCollection({
    list: listFooterLinks,
    save: siteApi.saveFooterLink,
    reorder: siteApi.reorderFooterLinks,
    remove: siteApi.deleteFooterLink,
  });
  const social = useAdminCollection({
    list: listSocialLinks,
    save: siteApi.saveSocialLink,
    reorder: siteApi.reorderSocialLinks,
    remove: siteApi.deleteSocialLink,
  });
  const settings = useAdminCollection({
    list: siteApi.listSettings,
    save: siteApi.saveSetting,
    reorder: async () => {},
    remove: async () => {},
  });

  return (
    <Box className="animate-fade-in">
      <Typography variant="h4" className={styles.pageTitle}>Website Studio &amp; Settings</Typography>
      <Typography variant="body1" className={styles.pageDescription}>
        Live control over site navigation, footer architecture, social channels, contact details, and SEO metadata.
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        className={styles.tabs}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab icon={<NavigationOutlinedIcon fontSize="small" />} iconPosition="start" label="Navigation" />
        <Tab icon={<ViewColumnOutlinedIcon fontSize="small" />} iconPosition="start" label="Footer Architecture" />
        <Tab icon={<ShareOutlinedIcon fontSize="small" />} iconPosition="start" label="Social Channels" />
        <Tab icon={<ContactMailOutlinedIcon fontSize="small" />} iconPosition="start" label="Contact Details" />
        <Tab icon={<SearchOutlinedIcon fontSize="small" />} iconPosition="start" label="Default SEO" />
        <Tab icon={<TuneOutlinedIcon fontSize="small" />} iconPosition="start" label="General Settings" />
      </Tabs>

      <Box className={styles.tabPanel}>
        {tab === 0 ? (
          <CollectionSection
            title="Navigation Links"
            description="Header and utility menu links displayed across the public website."
            collection={navigation}
            getKey={(item) => item.id}
            fields={NAV_FIELDS}
            selectFields={NAV_SELECTS}
            renderPrimary={(item) => (
              <Box sx={{ minWidth: 0, width: "100%" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  <Typography variant="body2" fontWeight={700} sx={{ wordBreak: "break-word" }}>{item.label}</Typography>
                  <StatusChip status={item.status} />
                </Box>
                <Box className={styles.itemMeta}>
                  <span className={styles.itemUrl}>{item.href}</span>
                  <span className={styles.itemBadge}>{item.placement}</span>
                </Box>
              </Box>
            )}
          />
        ) : null}

        {tab === 1 ? (
          <Box className={styles.stack}>
            <CollectionSection
              title="Footer Columns &amp; Sections"
              description="Primary thematic columns configured in the website footer."
              collection={footerSections}
              getKey={(item) => item.id}
              fields={FOOTER_SECTION_FIELDS}
              selectFields={[]}
              renderPrimary={(item) => (
                <Box sx={{ minWidth: 0, width: "100%" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    <Typography variant="body2" fontWeight={700} sx={{ wordBreak: "break-word" }}>{item.title}</Typography>
                    <StatusChip status={item.status} />
                  </Box>
                  <Box className={styles.itemMeta}>
                    <span className={styles.itemBadge}>slug: {item.slug}</span>
                    {item.summary && <Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-word" }}>{item.summary}</Typography>}
                  </Box>
                </Box>
              )}
            />

            <CollectionSection
              title="Footer Links"
              description="Individual navigation items grouped under footer sections."
              collection={footerLinks}
              getKey={(item) => item.id}
              fields={FOOTER_LINK_FIELDS}
              selectFields={
                footerSections.items.length > 0
                  ? [
                      {
                        name: "footerSectionId",
                        label: "Footer Section",
                        options: footerSections.items.map((s) => ({ value: s.id, label: s.title })),
                        default: footerSections.items[0]?.id,
                      },
                    ]
                  : []
              }
              renderPrimary={(item) => (
                <Box sx={{ minWidth: 0, width: "100%" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    <Typography variant="body2" fontWeight={700} sx={{ wordBreak: "break-word" }}>{item.label}</Typography>
                    <StatusChip status={item.status} />
                  </Box>
                  <Box className={styles.itemMeta}>
                    <span className={styles.itemUrl}>{item.href}</span>
                  </Box>
                </Box>
              )}
            />
          </Box>
        ) : null}

        {tab === 2 ? (
          <CollectionSection
            title="Social Links"
            description="Official social channel URLs displayed on header, footer, and contact surfaces."
            collection={social}
            getKey={(item) => item.id}
            fields={SOCIAL_FIELDS}
            selectFields={SOCIAL_SELECTS}
            renderPrimary={(item) => (
              <Box sx={{ minWidth: 0, width: "100%" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  <Typography variant="body2" fontWeight={700} sx={{ textTransform: "capitalize", wordBreak: "break-word" }}>
                    {item.platform}
                  </Typography>
                  <StatusChip status={item.status} />
                </Box>
                <Box className={styles.itemMeta}>
                  <span className={styles.itemUrl}>{item.url}</span>
                  <span className={styles.itemBadge}>{item.placement}</span>
                  {item.label && item.label !== item.platform && (
                    <Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-word" }}>({item.label})</Typography>
                  )}
                </Box>
              </Box>
            )}
          />
        ) : null}

        {tab === 3 ? <ContactInfoPanel /> : null}
        {tab === 4 ? <SeoPanel /> : null}

        {tab === 5 ? (
          <CollectionSection
            title="General Site Settings"
            description="Named site configuration entities and global metadata."
            collection={settings}
            getKey={(item) => item.id}
            fields={SETTING_FIELDS}
            selectFields={[]}
            renderPrimary={(item) => (
              <Box sx={{ minWidth: 0, width: "100%" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  <Typography variant="body2" fontWeight={700} sx={{ wordBreak: "break-word" }}>{item.title}</Typography>
                  <StatusChip status={item.status} />
                </Box>
                <Box className={styles.itemMeta}>
                  <span className={styles.itemBadge}>key: {item.slug}</span>
                  {item.summary && <Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-word" }}>{item.summary}</Typography>}
                </Box>
              </Box>
            )}
          />
        ) : null}
      </Box>
    </Box>
  );
}

export async function getServerSideProps(context) {
  return requireAdminFeature(context, ADMIN_FEATURES.website);
}
