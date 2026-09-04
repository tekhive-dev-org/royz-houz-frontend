const MAX_COLLECTION_SIZE = 10;

function asTrimmedString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function asNullableString(value) {
  return asTrimmedString(value) || null;
}

function asHttpsUrl(value) {
  const candidate = asTrimmedString(value);
  if (!candidate) return null;

  try {
    const url = new URL(candidate);
    return url.protocol === "https:" && url.hostname ? url.toString() : null;
  } catch {
    return null;
  }
}

function uniqueUrls(values) {
  return [...new Set(values.filter(Boolean))].slice(0, MAX_COLLECTION_SIZE);
}

function safeStringList(values, maxLength = 100) {
  if (!Array.isArray(values)) return [];

  return values
    .map(asTrimmedString)
    .filter((value) => value && value.length <= maxLength)
    .slice(0, MAX_COLLECTION_SIZE);
}

/**
 * Whitelists the public `/api/join` request body. Browser Files, preview URLs,
 * and any other UI-only form state intentionally remain client-side.
 */
export function buildJoinApplicationPayload(formData) {
  const socialProfiles = (Array.isArray(formData.socialProfiles) ? formData.socialProfiles : [])
    .map((profile) => {
      const platform = asTrimmedString(profile?.platform);
      const url = asHttpsUrl(profile?.url);

      if (!platform || platform.length > 64 || !url) return null;

      const id = asTrimmedString(profile.id);
      return {
        ...(id && id.length <= 100 ? { id } : {}),
        platform,
        url,
      };
    })
    .filter(Boolean)
    .slice(0, MAX_COLLECTION_SIZE);

  const workSampleUrls = (Array.isArray(formData.workSamples) ? formData.workSamples : []).map(
    (sample) => asHttpsUrl(sample?.url || sample?.portfolioUrl)
  );

  return {
    fullName: asTrimmedString(formData.fullName),
    stageName: asNullableString(formData.stageName),
    email: asTrimmedString(formData.emailAddress),
    phone: asTrimmedString(formData.phoneNumber),
    dateOfBirth: asNullableString(formData.dateOfBirth),
    stateRegion: asNullableString(formData.stateRegion),
    talentCategory: asTrimmedString(formData.talentCategory),
    customTalentCategory: asNullableString(formData.customTalentCategory),
    experienceLevel: asNullableString(formData.experienceLevel),
    yearsOfExperience: asNullableString(formData.yearsOfExperience),
    shortBio: asTrimmedString(formData.shortBio),
    genresSpecialties: asNullableString(formData.genresSpecialties),
    socialProfiles,
    portfolioUrls: uniqueUrls([asHttpsUrl(formData.otherPlatformUrl), ...workSampleUrls]),
    availability: {
      interestedInBookings: asTrimmedString(formData.interestedInBookings) || undefined,
      opportunities: safeStringList(formData.opportunities),
      generalAvailability: asTrimmedString(formData.generalAvailability) || undefined,
      preferredEngagement: asTrimmedString(formData.preferredEngagement) || undefined,
      workLocations: safeStringList(formData.workLocations),
    },
    additionalDetails: {
      languages: asTrimmedString(formData.languages) || undefined,
      equipmentResources: asTrimmedString(formData.equipmentResources) || undefined,
      achievements: safeStringList(formData.achievements, 500),
      references: asTrimmedString(formData.references) || undefined,
    },
    confirmedAccuracy: formData.confirmedAccuracy === true,
  };
}

export async function submitJoinApplication(payload) {
  const response = await fetch("/api/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => null);
  return { ok: response.ok && body?.success === true, status: response.status, body };
}

export function getJoinSubmissionError(status) {
  if (status === 429) return "Too many submission attempts. Please wait a moment before trying again.";
  if (status === 400) return "Please review the highlighted information and try again.";
  return "We could not submit your application right now. Please try again.";
}
