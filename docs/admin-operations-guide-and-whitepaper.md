# ROYZ HOUZ ADMIN STUDIO
## Operational White Paper & Comprehensive Business User Manual
**A Complete Guide to Managing the Client-Facing Web Platform**

---

### Document Overview & Purpose
This document serves as the official platform white paper and day-to-day operations manual for the **Royz House Admin Studio**. It is designed specifically for business owners, operations managers, editorial staff, event coordinators, and administrative personnel. 

No technical knowledge or coding expertise is required to operate the platform. Every section in this manual explains **what** each administrative tool does, **how** it connects to the public website, and provides **step-by-step instructions** for managing day-to-day operations.

---

# Table of Contents
1. [Executive Summary & Platform Architecture](#1-executive-summary--platform-architecture)
2. [Global Standards: Nigerian Naira (₦) & Currencies](#2-global-standards-nigerian-naira--currencies)
3. [Workspace & Executive Dashboard](#3-workspace--executive-dashboard)
4. [Website Global Settings Studio](#4-website-global-settings-studio)
5. [Homepage & Section Content Management](#5-homepage--section-content-management)
6. [About Page Studio](#6-about-page-studio)
7. [Talents Roster & Booking Management](#7-talents-roster--booking-management)
8. [Events, Showcase Scheduling & Ticket Inventories](#8-events-showcase-scheduling--ticket-inventories)
9. [Editorial Journal & Blog Moderation](#9-editorial-journal--blog-moderation)
10. [Media Hub & Cloud Library](#10-media-hub--cloud-library)
11. [Donations & Giving Campaigns](#11-donations--giving-campaigns)
12. [Ticket Payments & Financial Reconciliation](#12-ticket-payments--financial-reconciliation)
13. [Contact Submissions & Contact Page Studio](#13-contact-submissions--contact-page-studio)
14. [Talent Booking Requests & Join Applications](#14-talent-booking-requests--join-applications)
15. [Newsletter Subscriptions & Export Workflows](#15-newsletter-subscriptions--export-workflows)
16. [Search Engine Optimization (SEO) & Social Sharing](#16-search-engine-optimization-seo--social-sharing)
17. [User Management, Roles & Security Audit Logs](#17-user-management-roles--security-audit-logs)
18. [Troubleshooting & Best Practices Checklist](#18-troubleshooting--best-practices-checklist)

---

# 1. Executive Summary & Platform Architecture

### The Headless Advantage
Royz House operates on a modern, decoupled architecture:
1. **The Admin Studio (`admin`)**: A private, enterprise-grade back-office command center where authorized personnel create events, set ticket quotas, publish blog articles, curate talents, adjust website copy, and monitor financial transactions.
2. **The Public Client (`web`)**: A high-performance, mobile-responsive web experience accessed by fans, creatives, partners, and donors worldwide.

### Live Content Synchronization
When you click **"Publish"** or **"Save Changes"** in the Admin Studio, the public website updates automatically. There is no need to re-deploy software, contact engineers, or wait for server reboots. Changes to copy, pricing, event tickets, causes, and images reflect across the public web immediately.

### Security by Default
- **Data Protection**: Visitor payment information is handled through PCI-compliant Paystack gateways; no credit card numbers or banking secrets are ever stored in the database.
- **Audit Trails**: Every administrative action (edits, deletions, status changes) is automatically logged with the user's name, action type, and exact timestamp.

---

# 2. Global Standards: Nigerian Naira (₦) & Currencies

All financial values across Royz House are standardized in **Nigerian Naira (₦ / NGN)** by default:
- **Event Admissions & Tickets**: Always entered and displayed in `₦`.
- **Donation Causes & Goals**: Target goals, suggested presets (`₦15,000`, `₦25,000`, `₦35,000`, `₦45,000`), and live raised amounts calculate in `₦`.
- **Talent Booking Rates**: Default to `₦`, with optional international currency selections (`$`, `€`, `£`) available for diaspora or foreign engagements.
- **Paystack Checkout Integration**: All transactions are charged in Naira and reconciled in kobo automatically.

---

# 3. Workspace & Executive Dashboard

The **Dashboard (`/`)** provides a real-time snapshot of the Royz House digital ecosystem.

### Key Performance Indicators (KPI Cards)
At the top of the dashboard, four executive summary cards provide real-time counts:
- **Total Published Events**: Number of active events currently visible to the public.
- **Ticket Revenue**: Cumulative gross earnings in `₦` from confirmed ticket purchases.
- **Active Talents**: Number of verified creatives actively showcased on the Talent Hub.
- **Total Giving Raised**: Cumulative donations verified through Paystack in `₦`.

### Operational Shortcuts & Quick Launch
- **Live Production Schedule**: Displays the next 3 scheduled events, showing dates, venues, and a direct `Edit` button.
- **Spotlight Talents**: Shows featured creatives currently receiving prime exposure on the homepage.
- **Recent Activity Audit Feed**: Displays the latest 10 operational mutations (e.g., *"Sarah created Early Bird tickets for Live Showcase"*, *"Admin updated Homepage Hero"*).

---

# 4. Website Global Settings Studio

Located at **Website (`/website`)**, this studio manages sitewide elements that appear on every public page.

### 4.1 Navigation Menu Management
- **Main Header Links**: Controls the navigation bar at the top of the site.
  - **Adding a Link**: Click `Add Navigation Item`, enter the label (e.g., `About`, `Events`), and enter the relative path (e.g., `/about`) or external URL.
  - **Reordering**: Drag items to change their display order from left to right.
  - **Hiding/Disabling**: Switch status to `Draft` to temporarily hide a menu item without deleting it.

### 4.2 Footer Navigation & Columns
- Manage the column headings (`Explore`, `Community`, `Legal`) and individual links located at the bottom of every page.
- Update copyright notices and secondary utility links.

### 4.3 Social Media Channels
- Controls the social icons displayed in the website header, footer, and contact cards.
- Supported platforms: **Instagram, YouTube, TikTok, X (Twitter), Facebook, LinkedIn**.
- Enter the full channel URL (e.g., `https://instagram.com/royzhouz`).

### 4.4 Official Headquarters & Contact Info
- **Official Inquiries Email**: The primary address displayed on the website (e.g., `contact@royzhouz.com`).
- **Official Phone Line**: Displayed in international format (e.g., `+234 816 023 2043`).
- **Physical Headquarters Address**: Rendered in the footer and map sections.

---

# 5. Homepage & Section Content Management

Located at **Homepage (`/homepage`)**, the Sections Editor allows non-technical administrators to customize the public landing page.

### Available Homepage Modules
1. **Hero Section**:
   - Primary Headline (e.g., *"HOME OF CREATIVES, TALENTS & VISIONARIES"*).
   - Tagline / Mission Catchphrase.
   - Primary and Secondary Call-to-Action buttons (e.g., *"Explore Talents"* -> `/talents`, *"Donate Now"* -> `/donate`).
   - Hero background imagery or promotional artwork.
2. **Talent Spotlight Marquee**:
   - Choose whether to spotlight selected talents or pull automatically from the top-rated roster.
3. **Upcoming Events Marquee**:
   - Toggles the live events slider on the homepage.
4. **Impact & Giving Statistics Banner**:
   - Displays real-time patron counters (Creatives empowered, community grants awarded).

### How to Edit & Publish Homepage Sections:
1. Navigate to **Homepage** in the left sidebar.
2. Select the section you wish to modify from the tabs.
3. Edit the headline, description, or button link.
4. Click **"Save Changes"**. The public homepage immediately reflects the update.

---

# 6. About Page Studio

Located at **About (`/about`)**, this studio controls the story, leadership, and institutional vision of Royz House.

### Configurable Sections
- **Hero Banner**: Page badge (`ABOUT US`), dual-tone headline, and introductory paragraph.
- **Our Story & Legacy**: Detailed institutional history, team photo, and bulleted organization pillars.
- **Leadership Profile**:
  - Executive Name (e.g., *"Kennedy Donald"*).
  - Title / Position (e.g., *"CEO Royz Houz"*).
  - Executive Quote: The focal message highlighted across the About page.
  - High-resolution executive portrait upload.
- **Why Choose Us & Mission/Vision**:
  - Mission statement card.
  - Vision statement card.
  - Core values list (Creativity, Excellence, Empowerment, Community).

---

# 7. Talents Roster & Booking Management

Located at **Talents (`/talents`)**, this module is the complete directory of actors, musicians, visual artists, dancers, and creative innovators under Royz House.

### 7.1 Creating a New Talent Profile
1. Click the **"New Talent"** button in the top right.
2. **Basic Information**:
   - **Full Name / Stage Name** (e.g., *"Amara Vance"*).
   - **Primary Category**: Select from Music, Film, Dance, Fashion, Visual Art, Innovation.
   - **Role Title / Specialization**: (e.g., *"Afro-Soul Vocalist & Songwriter"*).
3. **Bio & Overview**:
   - **Summary**: 1–2 sentence catchphrase displayed on talent cards.
   - **Full Biography**: Comprehensive career biography and accomplishments.
4. **Booking & Financials**:
   - **Currency**: Defaults to `₦ (NGN)`.
   - **Starting Booking Rate**: Enter the performance or appearance fee (e.g., `250,000`). If unpriced, choose `Custom` to display *"Contact for Quote"*.
5. **Media & Artwork**:
   - **Avatar Portrait**: Clean, cropped headshot for directory cards.
   - **Hero Banner**: High-resolution performance photo for the top of the talent's profile page.
   - **Media Gallery**: Add production photos, stage shots, and behind-the-scenes images.
6. **Spotlight & Verification**:
   - **Primary Spotlight**: Toggle to `ON` to feature this creative on the homepage and talent marquee.
   - **Verified Badge**: Displays a gold verification checkmark next to their name.
7. Click **"Save Talent"**.

### 7.2 Creative Categories
Manage the genre tabs displayed on the public Talent Hub (e.g., *Music, Visual Arts, Film, Dance*). You can create new categories, rename existing ones, or reorder their display position.

---

# 8. Events, Showcase Scheduling & Ticket Inventories

Located at **Events (`/events`)**, this is the complete event management and ticketing engine.

### 8.1 Creating an Event
1. Click **"Schedule Event"**.
2. **Title & Categorization**:
   - **Event Title** (e.g., *"Echoes of Africa: Live Acoustic Showcase"*).
   - **Category**: (Concert, Workshop, Exhibition, Festival).
3. **Date, Time & Location**:
   - **Start Date & Time**: Set using the intuitive date-time picker.
   - **End Date & Time**: Closing schedule.
   - **Venue Name**: (e.g., *"The Grand Pavilion"*).
   - **Physical Address**: (e.g., *"14 Coste Avenue, Lekki Phase 2, Lagos"*).
   - **Virtual Stream Link**: If this is a hybrid/online event, input the live stream URL.
4. **Admission & Ticket Tiers**:
   - Click **"Add Ticket Tier"** to create pricing options (e.g., *Regular*, *VIP*, *VVIP Table*).
   - **Ticket Name**: (e.g., *"Early Bird Regular"*).
   - **Price (₦)**: Enter numeric price (e.g., `5000`). If free, enter `0`.
   - **Available Quantity**: Enter the starting inventory (e.g., `50`).
   - **Included Features**: Enter benefits one per line (e.g., *Full stage access, Welcome cocktail, VIP lounge*).
   - **Default Tier**: Check to highlight this tier as the recommended option.
5. **Production Details**:
   - Add lineup (Performing Artists & Guest Speakers).
   - Event Schedule / Timetable (e.g., *"6:00 PM - Red Carpet"*, *"7:30 PM - Main Performance"*).
   - Frequently Asked Questions specific to this event.
6. **Status**: Set to `Published` to make it live immediately, or `Draft` to continue working in private.

### 8.2 Automated Ticket Availability Engine
**How Spots Remaining Works**:
- You never have to manually update ticket numbers after a sale.
- When an attendee purchases tickets through Paystack on the website, the platform automatically subtracts the purchased quantity from the available tier inventory.
- The public site accurately displays real-time capacity (e.g., *"7 of 8 spots remaining"*).
- When a tier hits zero tickets, the public site automatically marks that tier as **"Sold Out"**.

---

# 9. Editorial Journal & Blog Moderation

Located at **Blog (`/blog`)**, this module powers the news, cultural essays, and thought leadership articles.

### 9.1 Publishing an Article
1. Click **"Write Article"**.
2. **Title & Excerpt**:
   - Enter a compelling headline.
   - Write a 2-sentence summary for search engines and social cards.
3. **Article Content**:
   - Rich-text editor supporting headings, blockquotes, bullet points, and inline images.
4. **Author & Categories**:
   - Assign an author profile (e.g., *"Editorial Desk"* or specific contributor).
   - Select categories (e.g., *Culture, Talent Spotlight, Industry News*).
5. **Cover Imagery**:
   - Upload high-resolution 16:9 banner photography.
6. **Publishing Schedule**:
   - Choose `Published` for immediate release, or `Scheduled` to auto-publish on a future date.

### 9.2 Interactive Comment Moderation
Readers can leave comments on public articles. To maintain brand safety:
1. Navigate to the **Comment Moderation** tab.
2. Review pending comments submitted by readers.
3. Click **"Approve"** to publish the comment live under the article.
4. Click **"Reject"** or **"Delete"** to discard spam or inappropriate content.

---

# 10. Media Hub & Cloud Library

Located at **Media (`/media`)**, this is the central digital asset library.

### Types of Media Supported
- **High-Definition Video**: Embedded YouTube videos, Vimeo links, or MP4 streams.
- **Audio & Podcasts**: Studio recordings, podcast interviews, musical tracks.
- **Photo Galleries**: High-resolution event photography and talent lookbooks.

### Cloudinary Asset Integration
Images uploaded through the Admin Studio are automatically optimized, compressed, and served via Cloudinary's global content delivery network (CDN), ensuring fast page load times on the client site.

---

# 11. Donations & Giving Campaigns

Located at **Donations (`/donations`)**, this studio manages philanthropic funding causes and tracks contributions.

### 11.1 Managing Giving Causes (Campaigns)
1. **Giving Causes Roster**:
   - Displays all active campaigns (e.g., *"Young Musicians Studio Equipment Fund"*, *"Career Skill Development"*).
   - Shows the live **Raised Amount (₦)**, **Target Goal (₦)**, and **% Funded**.
2. **Creating / Editing a Giving Cause**:
   - Click **"Create Giving Cause"**.
   - **Cause Title**: (e.g., *"Emerging Creative Grants 2026"*).
   - **Summary / Catchphrase**: Short mission phrase.
   - **Full Description**: Detailed explanation of how donated funds will be deployed.
   - **Target Goal (₦)**: Enter the fundraising target (e.g., `10,000,000`). If open-ended, leave blank.
   - **Primary Spotlight**: Toggle to `ON` to make this cause the primary option selected by default on the `/donate` page.
   - Click **"Save Campaign"**.

### 11.2 The Public Donation Progress Bar
- When a patron selects a cause on `/donate`, the form displays an interactive progress bar showing:
  - Total amount raised in `₦`.
  - Target goal in `₦` (or *"Open Community Goal"*).
  - Precise percentage funded with animated brand gold-to-bronze progress bar.
- **Automatic Incrementing**: As soon as a donor completes payment through Paystack, the transaction is verified and the campaign's raised total increments automatically.

### 11.3 Donation Records & Receipts
- Click the **"Donation Records"** tab to view the live audit trail of every gift received.
- View donor names, email addresses, phone numbers, exact contribution amounts in `₦`, frequencies (*One-Time, Monthly, Sponsor*), and Paystack transaction references.
- **Internal Staff Notes**: Click the notes icon on any donation to record follow-up acknowledgments, donor phone calls, or thank-you correspondence.

### 11.4 Donation Page Studio Tab
- Customize the top welcoming hero headline on `/donate`.
- Customize the suggested donation preset chips (`₦15,000`, `₦25,000`, `₦35,000`, `₦45,000`).
- Customize trust badges, security text, and post-donation receipt confirmation messages.

---

# 12. Ticket Payments & Financial Reconciliation

Located at **Ticket Payments (`/payments`)**, this is the live accounting ledger for all event ticket transactions.

### Key Capabilities
- **Transaction Details**: View Paystack reference ID, purchaser name, email, phone, event title, ticket tier, quantity, total amount in `₦`, and payment timestamp.
- **Deep Inspection**: Click the eye icon on any payment to view full Paystack gateway transaction IDs, payment channel (*Card, Bank Transfer, USSD*), and checkout timestamps.
- **CSV Export for Financial Audits**: Click **"Export CSV"** to download an Excel-ready spreadsheet of all transactions filtered by date range or payment status.

---

# 13. Contact Submissions & Contact Page Studio

Located at **Contacts (`/contacts`)**, this unified operations hub manages visitor inquiries and controls the public Contact page.

### 13.1 Inquiries & Submissions Inbox (Tab 1)
- Every message submitted through the website form arrives in real time.
- **Reviewing Inquiries**:
  - Filter by status: *New, In Review, Contacted, Resolved, Closed*.
  - View sender's full name, email, international phone number, inquiry reason, and message.
  - **Assignment**: Assign specific inquiries to team members (e.g., assign *"Partnership Inquiry"* to the Brand Director).
  - **Internal Notes**: Record private notes on meetings held, emails sent, or resolution outcomes.

### 13.2 Contact Page Studio (Tab 2)
Directly control the content displayed on the public **`/contact`** page:
1. **Hero & Header**: Customize the pill badge (`GET IN TOUCH`), dual-tone headline (*LET'S START A CONVERSATION*), and welcome description.
2. **Inquiry Form Options**: Add or remove contact reasons from the dropdown list (e.g., *General Inquiry, Partnership / Collaboration, Talent Booking, Press/Media*).
3. **Headquarters & Map**:
   - Update office name, physical address, and operating hours (*Monday – Friday: 9:00 AM – 6:00 PM*).
   - Enter your Google Maps Directions link.
   - Enter your Google Maps Embed iframe URL to show your exact office pin.
4. **FAQ Accordion**:
   - Add, edit, or reorder questions and answers in the contact accordion.
5. **Talent CTA Banner**:
   - Customize the call-to-action inviting talents to apply at the bottom of the contact page.
6. Click **"Publish Changes"** to make your updates live immediately.

---

# 14. Talent Booking Requests & Join Applications

### 14.1 Talent Bookings (`/bookings`)
When a client, event producer, or brand clicks **"Book Talent"** on any creative's profile, the booking inquiry appears in this dedicated queue:
- **Event Scope**: Event date, location, event type, and estimated budget in `₦`.
- **Client Details**: Name, corporate entity, email, and phone number.
- **Workflow**: Assign an agent or manager, update status (*Pending, Confirmed, Completed, Cancelled*), and record private contract notes.

### 14.2 Join Applications (`/join-applications`)
When emerging creatives apply to join Royz House via `/talents`:
- Review their submitted artistic portfolio, links to Instagram/TikTok/SoundCloud, creative bio, and primary genre.
- Triage candidates through *Under Review*, *Shortlisted*, *Accepted*, or *Archived*.

---

# 15. Newsletter Subscriptions & Export Workflows

Located at **Newsletter (`/newsletter`)**, this repository stores all community opt-ins captured from the website footer and event signups.

### Exporting Subscriber Lists
1. Navigate to **Newsletter**.
2. Click **"Export CSV"**.
3. Import the resulting `.csv` file directly into your email dispatch platform (Mailchimp, Brevo, Sendgrid, Klaviyo) to send event invitations, newsletters, and announcements.

---

# 16. Search Engine Optimization (SEO) & Social Sharing

Located at **SEO (`/seo`)**, this suite ensures Royz House ranks at the top of Google and displays stunning preview cards when links are shared on WhatsApp, iMessage, Twitter/X, and LinkedIn.

### Per-Page Metadata Controls
Select any page (*Home, About, Talents, Events, Blog, Media, Donate, Contact*) to configure:
- **Browser Title Tag**: (e.g., *"Donate & Empower African Creatives — Royz House"*).
- **Meta Description**: 150-character summary that appears beneath your link in Google search results.
- **OpenGraph Social Preview Image**: Upload a high-resolution 1200×630px image that automatically expands as a rich card when sharing links on social media.
- **Search Engine Indexing**: Toggle `noindex` if you ever need to temporarily hide a staging page from search results.

---

# 17. User Management, Roles & Security Audit Logs

Located in the **Administration** sidebar group, these controls maintain organizational security.

### 17.1 Users and Roles (`/users-and-roles`)
- **Inviting New Staff Members**: Click `Invite User`, input their corporate email, and select an operational role:
  - **Super Admin**: Complete platform access including user management and system settings.
  - **Editor / Content Manager**: Can create and edit blog posts, talents, media, and homepage copy.
  - **Events Coordinator**: Can schedule events, manage lineups, and view ticket sales.
  - **Operations / Finance Officer**: Access to ticket payments, donations, and CSV financial exports.
- **Deactivating Access**: Remove staff credentials instantly if a team member departs the organization.

### 17.2 Tamper-Proof Audit Logs (`/audit-logs`)
- Every administrative action is permanently recorded.
- The log records:
  - **Who**: Full name and email of the administrator.
  - **Action**: Exact operation performed (e.g., `events.create`, `talents.update`, `donations.notes`).
  - **Target**: Specific item modified.
  - **Timestamp**: Exact UTC date and time of the event.
- Audit logs cannot be edited or deleted by any user, ensuring total organizational accountability.

---

# 18. Troubleshooting & Best Practices Checklist

| Task | Recommended Best Practice |
| :--- | :--- |
| **Uploading Photos** | Use clear, high-resolution `.jpg` or `.png` images. The platform automatically compresses them via CDN for fast mobile browsing. |
| **Setting Ticket Prices** | Enter the exact amount in Naira without symbols (e.g., `5000` for ₦5,000). The `₦` currency symbol is applied automatically. |
| **Sold Out Events** | Do not delete an event when it sells out. The platform automatically shows "Sold Out" once tickets reach 0, preserving your SEO rankings. |
| **Giving Causes** | Keep cause titles concise (under 60 characters) and include a target amount so donors can see the live progress bar fill up. |
| **Inquiry Follow-up** | Change inquiry status from *New* to *In Review* as soon as you begin investigating, so other team members know it is being handled. |
| **Drafting Content** | Always keep new events, blog posts, and talents set to `Draft` until all photos, copy, and details are finalized, then switch to `Published`. |

---
*Royz House Platform Operations Manual — Version 2.4 — Updated for Production Standard.*
