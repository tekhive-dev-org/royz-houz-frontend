import { useState } from "react";
import Head from "next/head";
import { Box, Paper, Tab, Tabs, Typography } from "@mui/material";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import ContactMailOutlinedIcon from "@mui/icons-material/ContactMailOutlined";
import { SubmissionsAdmin } from "@/components/submissions/SubmissionsAdmin";
import { ContactPageSettingsEditor } from "@/components/contact/ContactPageSettingsEditor";
import { MediaPicker } from "@/components/content/MediaPicker";
import { requireAdminFeature } from "@/lib/auth/requireAdminFeature";
import { ADMIN_FEATURES } from "@/constants/adminFeatures";

export default function ContactsAdminPage() {
  const [tab, setTab] = useState(0);
  const [mediaPicker, setMediaPicker] = useState(null);

  return (
    <>
      <Head>
        <title>Contacts &amp; Page Studio | Royz Houz Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#0F172A", mb: 0.5 }}>
          Contact Management
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748B" }}>
          Manage visitor inquiries and customize public contact page sections.
        </Typography>
      </Box>

      <Paper
        sx={{
          mb: 3,
          borderRadius: 2,
          border: "1px solid #E2E8F0",
          overflow: "hidden",
        }}
        elevation={0}
      >
        <Tabs
          value={tab}
          onChange={(_, val) => setTab(val)}
          sx={{
            background: "#FFFFFF",
            px: 2,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.875rem",
              minHeight: 52,
            },
          }}
        >
          <Tab
            icon={<InboxOutlinedIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Inquiries &amp; Submissions"
          />
          <Tab
            icon={<ContactMailOutlinedIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Contact Page Studio"
          />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <SubmissionsAdmin
          module="contacts"
          title="Contact submissions"
          description="Review, assign, and resolve public contact submissions."
        />
      )}

      {tab === 1 && (
        <ContactPageSettingsEditor
          onOpenMediaPicker={(onSelect) => setMediaPicker({ onSelect })}
        />
      )}

      {mediaPicker && (
        <MediaPicker
          open
          onClose={() => setMediaPicker(null)}
          onSelect={(url) => {
            mediaPicker.onSelect?.(url);
            setMediaPicker(null);
          }}
        />
      )}
    </>
  );
}

export async function getServerSideProps(context) {
  return requireAdminFeature(context, ADMIN_FEATURES.contacts);
}
