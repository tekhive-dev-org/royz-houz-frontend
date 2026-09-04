import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import StarIcon from "@mui/icons-material/Star";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CodeIcon from "@mui/icons-material/Code";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import MusicNoteOutlinedIcon from "@mui/icons-material/MusicNoteOutlined";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import styles from "./TalentsAdmin.module.css";

export function TalentPreviewDialog({ preview, onClose }) {
  const [showRawJson, setShowRawJson] = useState(false);

  if (!preview) return null;

  const body = preview.body || {};
  const name = body.name || preview.title || "Untitled Talent";
  const slug = preview.slug || "";
  const category = body.badge || body.category || body.profession || "Creative Discipline";
  const profession = body.profession || "";
  const genre = body.genre || "";
  const location = preview.location || body.location || "";
  const subtitle = body.subtitle || preview.summary || "";
  const bio = body.bio || preview.summary || "";
  const image = body.image || "/assets/img/talents/julius.jpg";
  const imageAlt = body.alt || name;
  const coverImage = body.coverImage || body.image || "/assets/img/talents/producer-hero.jpg";
  const rating = body.rating ?? "";
  const followers = body.followers || "";
  const startingRate = body.bookingPrice || body.startingRate || "";
  const availability = body.availability || "Available for Booking";
  const isHot = Boolean(body.isHot);
  const isFeatured = Boolean(preview.featured);
  const awards = body.awards || [];
  const achievements = body.achievements || [];
  const galleryImages = body.galleryImages || [];
  const videos = body.videos || [];
  const musicTracks = body.musicTracks || [];
  const publications = body.publications || [];
  const socials = body.socials || {};
  const activeTabs = body.tabs || ["ABOUT", "GALLERY", "VIDEOS"];

  return (
    <Dialog open={Boolean(preview)} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 1.5,
          px: 3,
          background: "#0A0D14",
          color: "#FFFFFF",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: "#FFFFFF", fontSize: "1.1rem" }}>
            Talent Visual Profile Preview
          </Typography>
          <span style={{ fontSize: "0.75rem", color: "#B46A2C", background: "rgba(180, 106, 44, 0.15)", padding: "2px 8px", borderRadius: 6, fontWeight: 700 }}>
            LIVE CARD
          </span>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={showRawJson ? <VisibilityIcon /> : <CodeIcon />}
            onClick={() => setShowRawJson(!showRawJson)}
            sx={{
              color: "#94A3B8",
              borderColor: "rgba(255, 255, 255, 0.2)",
              fontSize: "0.75rem",
              textTransform: "none",
              "&:hover": { borderColor: "#FFFFFF", color: "#FFFFFF" },
            }}
          >
            {showRawJson ? "Visual Card" : "Raw JSON"}
          </Button>
          <Tooltip title="Open Live Public Web Page">
            <IconButton
              size="small"
              component="a"
              href={`/talents/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: "#F59E0B", "&:hover": { color: "#FFFFFF" } }}
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={onClose} sx={{ color: "#94A3B8", "&:hover": { color: "#FFFFFF" } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, background: "#06080D" }}>
        {showRawJson ? (
          <pre className={styles.preview}>{JSON.stringify(preview, null, 2)}</pre>
        ) : (
          <Stack spacing={2.5}>
            {/* Visual Hero Header Card */}
            <Box className={styles.previewHero}>
              {/* Cover Banner Backdrop */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverImage} alt={`${name} cover`} className={styles.previewCover} />

              <Box className={styles.previewHeroContent}>
                <Box className={styles.previewAvatarWrapper}>
                  <Avatar src={image} alt={imageAlt} variant="rounded" className={styles.previewAvatar} />
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                    <span className={styles.previewBadge}>{category}</span>
                    {isFeatured && (
                      <span style={{ background: "rgba(99, 102, 241, 0.2)", color: "#A5B4FC", border: "1px solid rgba(99, 102, 241, 0.4)", padding: "4px 10px", borderRadius: 9999, fontSize: "0.8rem", fontWeight: 700 }}>
                        FEATURED
                      </span>
                    )}
                    {isHot && (
                      <span style={{ background: "rgba(239, 68, 68, 0.2)", color: "#FCA5A5", border: "1px solid rgba(239, 68, 68, 0.4)", padding: "4px 10px", borderRadius: 9999, fontSize: "0.8rem", fontWeight: 700 }}>
                        TRENDING 🔥
                      </span>
                    )}
                  </Box>
                </Box>

                <Box>
                  <Typography className={styles.previewName}>{name}</Typography>
                  {subtitle && <Typography className={styles.previewSubtitle}>{subtitle}</Typography>}
                  {(profession || genre) && (
                    <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                      {[profession, genre].filter(Boolean).join(" · ")}
                    </Typography>
                  )}
                </Box>

                <Box className={styles.previewStats}>
                  {location ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <LocationOnOutlinedIcon sx={{ fontSize: 16, color: "#B46A2C" }} />
                      <span>{location}</span>
                    </Box>
                  ) : null}
                  {rating !== "" ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#F59E0B" }}>
                      <StarIcon sx={{ fontSize: 16 }} />
                      <span style={{ fontWeight: 700 }}>{rating} / 5.0</span>
                    </Box>
                  ) : null}
                  {followers ? <span>👥 {followers} Followers</span> : null}
                  <span style={{ color: "#10B981" }}>● {availability}</span>
                </Box>
              </Box>
            </Box>

            {/* Biography & Storytelling Card */}
            {bio && (
              <Box className={styles.previewGlassCard}>
                <Typography className={styles.previewCardTitle}>
                  <span>About &amp; Artist Narrative</span>
                </Typography>
                <Typography variant="body2" sx={{ color: "#CBD5E1", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                  {bio}
                </Typography>
              </Box>
            )}

            {/* Booking & Availability Highlight Card */}
            <Box className={styles.previewGlassCard}>
              <Typography className={styles.previewCardTitle}>
                <EventAvailableOutlinedIcon sx={{ color: "#B46A2C", fontSize: 20 }} />
                <span>Booking &amp; Availability</span>
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, background: "#181C28", p: 2, borderRadius: 2 }}>
                {startingRate ? (
                  <Box>
                    <Typography variant="caption" sx={{ color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Starting Rate
                    </Typography>
                    <Typography variant="h6" fontWeight={800} sx={{ color: "#B46A2C" }}>
                      {startingRate}
                    </Typography>
                  </Box>
                ) : null}
                <Box>
                  <Typography variant="caption" sx={{ color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Current Status
                  </Typography>
                  <Typography variant="body2" fontWeight={700} sx={{ color: "#10B981" }}>
                    {availability}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="contained"
                  component="a"
                  href={`/talents/${slug}/book`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ background: "#B46A2C", "&:hover": { background: "#9A5B26" }, fontWeight: 700, textTransform: "none" }}
                >
                  Book Talent Online
                </Button>
              </Box>
            </Box>

            {/* Recognition & Achievements Row */}
            {(awards.length > 0 || achievements.length > 0) && (
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                {awards.length > 0 && (
                  <Box className={styles.previewGlassCard}>
                    <Typography className={styles.previewCardTitle}>
                      <EmojiEventsOutlinedIcon sx={{ color: "#F59E0B", fontSize: 20 }} />
                      <span>Awards &amp; Recognition ({awards.length})</span>
                    </Typography>
                    <Box className={styles.previewList}>
                      {awards.map((award, idx) => (
                        <Box key={idx} className={styles.previewListItem}>
                          <span style={{ color: "#F59E0B" }}>★</span>
                          <span>{award}</span>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {achievements.length > 0 && (
                  <Box className={styles.previewGlassCard}>
                    <Typography className={styles.previewCardTitle}>
                      <AutoAwesomeOutlinedIcon sx={{ color: "#38BDF8", fontSize: 20 }} />
                      <span>Key Achievements ({achievements.length})</span>
                    </Typography>
                    <Box className={styles.previewList}>
                      {achievements.map((item, idx) => (
                        <Box key={idx} className={styles.previewListItem}>
                          <span style={{ color: "#38BDF8" }}>✦</span>
                          <span>{item}</span>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {/* Showcase Media (Gallery, Videos, Music Tracks) */}
            {(galleryImages.length > 0 || videos.length > 0 || musicTracks.length > 0) && (
              <Box className={styles.previewGlassCard}>
                <Typography className={styles.previewCardTitle}>
                  <MusicNoteOutlinedIcon sx={{ color: "#B46A2C", fontSize: 20 }} />
                  <span>Showcase Media &amp; Portfolio</span>
                </Typography>

                {/* Gallery Strip */}
                {galleryImages.length > 0 && (
                  <Box>
                    <Typography variant="caption" sx={{ color: "#94A3B8", mb: 1, display: "block" }}>
                      PORTFOLIO PHOTOGRAPHY ({galleryImages.length} photos)
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1.5, overflowX: "auto", pb: 1 }}>
                      {galleryImages.map((src, idx) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={idx}
                          src={src}
                          alt={`Gallery preview ${idx + 1}`}
                          style={{ width: 80, height: 80, borderRadius: 8, objectFit: "cover", flexShrink: 0, border: "1px solid rgba(255, 255, 255, 0.1)" }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Videos Showcase */}
                {videos.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" sx={{ color: "#94A3B8", mb: 1, display: "block" }}>
                      VIDEO SHOWCASE ({videos.length} videos)
                    </Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
                      {videos.map((vid, idx) => (
                        <Box key={idx} sx={{ background: "#181C28", p: 1.5, borderRadius: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
                          <PlayCircleOutlineIcon sx={{ color: "#B46A2C", fontSize: 28 }} />
                          <Box sx={{ overflow: "hidden" }}>
                            <Typography variant="body2" fontWeight={700} noWrap sx={{ color: "#FFFFFF" }}>
                              {vid.title || "Video Clip"}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                              {[vid.artist, vid.duration].filter(Boolean).join(" · ") || "Performance"}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Music Tracks */}
                {musicTracks.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" sx={{ color: "#94A3B8", mb: 1, display: "block" }}>
                      AUDIO TRACKS &amp; RELEASES ({musicTracks.length} tracks)
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {musicTracks.map((track, idx) => (
                        <Box key={idx} sx={{ background: "#181C28", px: 2, py: 1, borderRadius: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <span style={{ color: "#B46A2C", fontWeight: 700 }}>#{idx + 1}</span>
                            <Typography variant="body2" sx={{ color: "#F8FAFC", fontWeight: 600 }}>
                              {track.title}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <span style={{ fontSize: "0.75rem", color: "#94A3B8" }}>{track.streams || track.plays || "Streams"}</span>
                            <span style={{ fontSize: "0.75rem", color: "#CBD5E1", fontFamily: "monospace" }}>{track.duration || "3:30"}</span>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {publications.length > 0 && (
              <Box className={styles.previewGlassCard}>
                <Typography className={styles.previewCardTitle}>
                  <span>Publications &amp; Press ({publications.length})</span>
                </Typography>
                <Box className={styles.previewList}>
                  {publications.map((publication, idx) => (
                    <Box key={publication.id || idx} className={styles.previewListItem}>
                      <span>{publication.title || "Untitled publication"}</span>
                      <span style={{ color: "#94A3B8" }}>
                        {[publication.type, publication.year, publication.publisher].filter(Boolean).join(" · ")}
                      </span>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Social & Streaming Links */}
            {Object.values(socials).some(Boolean) && (
              <Box className={styles.previewGlassCard}>
                <Typography className={styles.previewCardTitle}>
                  <span>Connected Streaming &amp; Social Channels</span>
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {socials.spotify && <a href={socials.spotify} target="_blank" rel="noopener noreferrer" className={styles.previewSocialPill}>🎵 Spotify</a>}
                  {socials.appleMusic && <a href={socials.appleMusic} target="_blank" rel="noopener noreferrer" className={styles.previewSocialPill}>🍎 Apple Music</a>}
                  {socials.youtube && <a href={socials.youtube} target="_blank" rel="noopener noreferrer" className={styles.previewSocialPill}>▶ YouTube</a>}
                  {socials.facebook && <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className={styles.previewSocialPill}>Facebook</a>}
                  {socials.instagram && <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className={styles.previewSocialPill}>📷 Instagram</a>}
                  {socials.twitter && <a href={socials.twitter} target="_blank" rel="noopener noreferrer" className={styles.previewSocialPill}>𝕏 Twitter</a>}
                  {socials.tiktok && <a href={socials.tiktok} target="_blank" rel="noopener noreferrer" className={styles.previewSocialPill}>🎶 TikTok</a>}
                  {socials.soundcloud && <a href={socials.soundcloud} target="_blank" rel="noopener noreferrer" className={styles.previewSocialPill}>☁ SoundCloud</a>}
                </Box>
              </Box>
            )}

            {/* Active Profile Tabs */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", px: 1 }}>
              <Typography variant="caption" sx={{ color: "#94A3B8", textTransform: "uppercase" }}>
                Active Profile Tabs:
              </Typography>
              {activeTabs.map((t) => (
                <span key={t} style={{ background: "#1E2433", color: "#E2E8F0", padding: "2px 8px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 600 }}>
                  {t}
                </span>
              ))}
            </Box>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
