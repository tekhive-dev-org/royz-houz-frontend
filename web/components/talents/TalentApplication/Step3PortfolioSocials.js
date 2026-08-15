import { useState, useRef } from "react";
import Image from "next/image";
import {
  Link as LinkIcon,
  Trash2,
  Plus,
  UploadCloud,
  ChevronRight,
  X,
  Play,
  Lightbulb,
} from "lucide-react";
import { SOCIAL_PLATFORMS } from "@/constants/talentApplication";
import { CustomDropdown } from "./CustomDropdown";
import { getSocialPlatformIcon } from "./SocialIcons";
import styles from "./TalentApplication.module.css";

/**
 * Step 3: Portfolio & Social Media Links Form (Matches Figma and SVG Mockups)
 */
export function Step3PortfolioSocials({
  formData,
  updateFormData,
  onNext,
  onBack,
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalPlatform, setModalPlatform] = useState("Instagram");
  const [modalCustomName, setModalCustomName] = useState("");
  const [modalProfileUrl, setModalProfileUrl] = useState("");
  const fileInputRef = useRef(null);

  const socialProfiles = formData.socialProfiles || [];

  // Dropdown options with brand SVG icons
  const platformDropdownOptions = SOCIAL_PLATFORMS.map((p) => ({
    id: p.name,
    label: p.name,
    icon: getSocialPlatformIcon(p.name, "w-5 h-5"),
    isOther: p.isOther,
  }));

  const handlePlatformChange = (id, newPlatformName) => {
    updateFormData({
      socialProfiles: socialProfiles.map((p) =>
        p.id === id ? { ...p, platform: newPlatformName } : p
      ),
    });
  };

  const handleUrlChange = (id, newUrl) => {
    updateFormData({
      socialProfiles: socialProfiles.map((p) =>
        p.id === id ? { ...p, url: newUrl } : p
      ),
    });
  };

  const handleRemoveProfile = (id) => {
    if (socialProfiles.length <= 1) {
      updateFormData({
        socialProfiles: [{ id: `sp-${Date.now()}`, platform: "Instagram", url: "" }],
      });
      return;
    }
    updateFormData({
      socialProfiles: socialProfiles.filter((p) => p.id !== id),
    });
  };

  const handleAddPlatformModalSubmit = (e) => {
    e?.preventDefault();
    if (!modalProfileUrl.trim()) return;

    const platformName =
      modalPlatform === "Others" && modalCustomName.trim()
        ? modalCustomName.trim()
        : modalPlatform;

    const newRow = {
      id: `sp-${Date.now()}`,
      platform: platformName,
      url: modalProfileUrl.trim(),
    };

    updateFormData({
      socialProfiles: [...socialProfiles, newRow],
    });

    setModalProfileUrl("");
    setModalCustomName("");
    setIsAddModalOpen(false);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentSamples = formData.workSamples || [];
    const newSamples = files.slice(0, 5 - currentSamples.length).map((file, idx) => {
      let type = "document";
      if (file.type.startsWith("image/")) type = "image";
      else if (file.type.startsWith("video/")) type = "video";
      else if (file.type.startsWith("audio/")) type = "audio";
      else if (file.type.includes("pdf")) type = "pdf";

      return {
        id: `ws-${Date.now()}-${idx}`,
        name: file.name,
        type,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        thumbnail: type === "image" ? URL.createObjectURL(file) : null,
      };
    });

    updateFormData({
      workSamples: [...currentSamples, ...newSamples].slice(0, 5),
    });
  };

  const handleRemoveSample = (id) => {
    updateFormData({
      workSamples: (formData.workSamples || []).filter((s) => s.id !== id),
    });
  };

  const getPlaceholderForPlatform = (platformName) => {
    const norm = String(platformName || "").toLowerCase();
    if (norm.includes("instagram")) return "https://instagram.com/your username";
    if (norm.includes("tiktok")) return "https://tiktok.com/your username";
    if (norm.includes("twitter") || norm === "x" || norm.includes("x /")) return "https://x.com/your username";
    if (norm.includes("youtube")) return "https://youtube.com/your username";
    if (norm.includes("facebook")) return "https://facebook.com/your username";
    if (norm.includes("whatsapp")) return "https://wa.me/234...";
    if (norm.includes("linkedin")) return "https://linkedin.com/in/your username";
    return "https://yourwebsite.com/your username";
  };

  return (
    <div className={styles.stepContentWrapper}>
      {/* Step Header */}
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Portfolio &amp; Socials</h2>
        <p className={styles.stepSubtitle}>
          Add links to your social media profiles and online platforms
        </p>
      </div>

      {/* Social Media Link Rows */}
      <div className={styles.socialList}>
        {socialProfiles.map((item) => (
          <div key={item.id} className={styles.socialRow}>
            {/* 1. Platform Custom Dropdown */}
            <div className={styles.platformCol}>
              <CustomDropdown
                label="Platform"
                options={platformDropdownOptions}
                value={item.platform}
                onChange={(val) => handlePlatformChange(item.id, val)}
              />
            </div>

            {/* 2. Profile URL Input */}
            <div className={styles.urlCol}>
              <label className={styles.inputLabel}>Profile URL</label>
              <input
                type="text"
                value={item.url || ""}
                onChange={(e) => handleUrlChange(item.id, e.target.value)}
                placeholder={getPlaceholderForPlatform(item.platform)}
                className={styles.textInput}
              />
            </div>

            {/* 3. Delete Button */}
            <button
              type="button"
              onClick={() => handleRemoveProfile(item.id)}
              className={styles.deleteSocialBtn}
              aria-label={`Remove ${item.platform} link`}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}

        {/* Add Another Platform Button */}
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className={styles.addPlatformBtn}
        >
          <Plus className="w-4 h-4 mr-1 text-[#B46A2C]" />
          <span>Add Another Platform</span>
        </button>
      </div>

      {/* Other Online Platforms (Optional) */}
      <div className={styles.formFieldFull}>
        <label htmlFor="otherPlatformUrl" className={styles.inputLabel}>
          Other Online Platforms (Optional)
        </label>
        <div className={styles.inputWithIconWrapper}>
          <LinkIcon className={styles.fieldLeftIcon} />
          <input
            id="otherPlatformUrl"
            type="text"
            placeholder="https://yourwebsite.com/your username"
            value={formData.otherPlatformUrl || ""}
            onChange={(e) => updateFormData({ otherPlatformUrl: e.target.value })}
            className={`${styles.textInput} ${styles.inputWithLeftIcon}`}
          />
        </div>
      </div>

      {/* Work Samples Section */}
      <div className={styles.formFieldFull}>
        <label className={styles.inputLabel}>Work Samples</label>
        <p className={styles.fieldHelper}>
          Upload samples of your work (music, videos, documents etc)
        </p>

        <div className={styles.samplesContainer}>
          {/* Upload Drop Zone */}
          <div
            className={styles.uploadDropZone}
            onClick={() => fileInputRef.current?.click()}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileUpload}
            />
            <div className={styles.cloudIconCircle}>
              <UploadCloud className="w-5 h-5 text-[#525866]" />
            </div>
            <span className={styles.uploadDropTitle}>Upload Files</span>
            <span className={styles.uploadDropMeta}>JPG, PNG, MP4, MP3, PDF</span>
            <span className={styles.uploadDropMeta}>• Max 25MB each</span>
            <span className={styles.uploadDropLimit}>You can upload up to 5 files</span>
          </div>

          {/* Uploaded Thumbnails Preview & Count */}
          <div className="flex flex-col gap-2">
            <div className={styles.samplesPreviewList}>
              {(formData.workSamples || []).map((sample) => (
                <div key={sample.id} className={styles.sampleThumbWrapper}>
                  {sample.thumbnail ? (
                    <Image
                      src={sample.thumbnail}
                      alt={sample.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  ) : sample.type === "pdf" ? (
                    <div className={styles.pdfCardPlaceholder}>
                      <div className={styles.pdfBadge}>
                        <span className="text-[10px] font-bold text-[#E53E3E] uppercase tracking-wider">PDF</span>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.sampleFilePlaceholder}>
                      <span className="text-xs font-semibold text-[#B46A2C] uppercase">{sample.type}</span>
                    </div>
                  )}

                  {/* Video Play Button Overlay */}
                  {sample.type === "video" && (
                    <div className={styles.videoOverlayPlay}>
                      <div className={styles.videoPlayCircle}>
                        <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Remove sample tag */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSample(sample.id);
                    }}
                    className={styles.sampleRemoveBtn}
                    aria-label={`Remove ${sample.name}`}
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>

            {formData.workSamples?.length > 0 && (
              <span className={styles.sampleCountText}>
                {formData.workSamples.length} files uploaded
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Add Platform Dialog / Card (Matching the SVG mockup exactly) */}
      {isAddModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsAddModalOpen(false)}>
          <div className={styles.addPlatformCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {modalPlatform === "Others" ? "Add Custom Platform" : "Add Platform"}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className={styles.modalCloseBtn}
                aria-label="Close dialog"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Platform Selector Dropdown */}
            <CustomDropdown
              label="Platform"
              options={platformDropdownOptions}
              value={modalPlatform}
              onChange={(val) => setModalPlatform(val)}
              placeholder="Selected Platform"
            />

            {/* Custom Platform Name if "Others" is selected */}
            {modalPlatform === "Others" && (
              <div className={styles.formField}>
                <label className={styles.inputLabel}>Platform Name</label>
                <input
                  type="text"
                  placeholder="e.g Audiomack, SoundCloud, Behance"
                  value={modalCustomName}
                  onChange={(e) => setModalCustomName(e.target.value)}
                  className={styles.textInput}
                />
              </div>
            )}

            {/* Profile URL Input with Link Icon */}
            <div className={styles.formField}>
              <label className={styles.inputLabel}>Profile URL</label>
              <div className={styles.inputWithIconWrapper}>
                <LinkIcon className={styles.fieldLeftIcon} />
                <input
                  type="text"
                  placeholder="Enter profile URL"
                  value={modalProfileUrl}
                  onChange={(e) => setModalProfileUrl(e.target.value)}
                  className={`${styles.textInput} ${styles.inputWithLeftIcon}`}
                />
              </div>
            </div>

            {/* Add Platform Button */}
            <button
              type="button"
              onClick={handleAddPlatformModalSubmit}
              className={styles.addPlatformSubmitBtn}
            >
              Add Platform
            </button>

            {/* Tip Card */}
            <div className={styles.tipCard}>
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-2xs">
                <Lightbulb className="w-4 h-4 text-[#B46A2C]" />
              </div>
              <div className={styles.tipTextGroup}>
                <span className={styles.tipTitle}>Tip</span>
                <p className={styles.tipDescription}>
                  Add all your active platforms so we can easily discover more of your work
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className={styles.formNavRow}>
        <button type="button" onClick={onBack} className={styles.backBtn}>
          &lt; Back
        </button>

        <button type="button" onClick={onNext} className={styles.nextBtn}>
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default Step3PortfolioSocials;
