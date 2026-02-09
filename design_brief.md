# Design Brief: Bestellmanagement aus Stückliste

## 1. App Analysis

### What This App Does
This is an **Order Management System driven by Bills of Materials (BOMs/Stücklisten)**. It manages the full procurement workflow: suppliers provide articles, BOMs are imported as project references, and orders are created against suppliers with detailed line items (Bestellpositionen). The system tracks order status from draft through delivery across 8 lifecycle stages.

### Who Uses This
A **procurement manager or operations lead** at a mid-sized manufacturing or construction company. They manage supplier relationships, track incoming orders against project BOMs, and need visibility into spending, order status, and delivery timelines. They think in terms of "which orders need attention" and "how much are we spending."

### The ONE Thing Users Care About Most
**Active order volume and status** — they need to instantly see how many orders are in flight, which ones need action (approvals, confirmations), and the total financial exposure. The order pipeline is their mental model.

### Primary Actions (IMPORTANT!)
1. **Neue Bestellung anlegen** → Primary Action Button (create a new order with supplier, date, status)
2. View order details by clicking on orders
3. Filter/browse orders by status

---

## 2. What Makes This Design Distinctive

### Visual Identity
A **cool industrial palette** with slate-blue undertones and a sharp teal accent. The design feels like a precision instrument panel — clean, structured, but with enough color contrast to make critical information pop. The teal accent is used exclusively for actionable elements and the most important metrics, creating a clear "signal vs. noise" hierarchy. This is not a generic dashboard — it feels purpose-built for someone who manages procurement operations.

### Layout Strategy
The layout uses an **asymmetric two-zone approach on desktop**: a dominant left column (roughly 65%) houses the hero KPI banner and the order status pipeline chart, while a narrower right column (35%) stacks recent orders and supplier summary. This creates natural reading flow — the eye hits the big numbers first, scans the status distribution, then moves to actionable detail on the right.

On mobile, the hero KPI banner takes the full top viewport fold with bold typography, followed by a horizontal-scrolling status breakdown, then vertically stacked sections for chart, recent orders, and supplier stats.

### Unique Element
The **order status pipeline** — a horizontal stacked bar chart showing orders flowing through 8 lifecycle stages (Entwurf → Geliefert/Storniert), using a gradient from cool grays (early stages) to warm teal (completed). Each segment is labeled with count. This gives an instant "pipeline health" read that no simple number can convey.

---

## 3. Theme & Colors

### Font
- **Family:** Space Grotesk
- **URL:** `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap`
- **Why this font:** Space Grotesk is a proportional sans-serif with geometric roots and slightly squared terminals. It reads as technical and precise — perfect for a data-heavy procurement dashboard — without being cold. The weight range from 300 to 700 creates dramatic hierarchy.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(210 20% 97%)` | `--background` |
| Main text | `hsl(215 25% 15%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(215 25% 15%)` | `--card-foreground` |
| Borders | `hsl(210 15% 90%)` | `--border` |
| Primary action (teal) | `hsl(173 58% 39%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(173 40% 94%)` | `--accent` |
| Accent text | `hsl(173 58% 25%)` | `--accent-foreground` |
| Muted background | `hsl(210 15% 95%)` | `--muted` |
| Muted text | `hsl(215 10% 48%)` | `--muted-foreground` |
| Secondary background | `hsl(210 15% 95%)` | `--secondary` |
| Secondary text | `hsl(215 25% 15%)` | `--secondary-foreground` |
| Success/positive | `hsl(152 55% 41%)` | (component use) |
| Error/negative | `hsl(0 72% 51%)` | `--destructive` |

### Why These Colors
The slate-blue-tinted background (`hsl(210 20% 97%)`) creates a subtle cool tone that feels professional and manufacturing-adjacent — not sterile white, but a calm workspace. The teal primary (`hsl(173 58% 39%)`) is the single accent that signals "interactive" and "important." It's distinctive without being loud. All other elements use neutral slates, creating a clear foreground/background separation.

### Background Treatment
The page background is a cool off-white with a slight blue undertone (`hsl(210 20% 97%)`). Cards sit on pure white, creating gentle lift through contrast alone rather than heavy shadows. This layered approach gives depth without visual clutter.

---

## 4. Mobile Layout (Phone)

### Layout Approach
The mobile layout is a **single-column vertical flow** with the hero KPI dominating the first viewport. Visual hierarchy is created through extreme size contrast — the hero value is massive (40px bold) while supporting stats use compact 14px. The status pipeline chart is simplified to a compact horizontal bar.

### What Users See (Top to Bottom)

**Header:**
A compact header with the dashboard title "Bestellmanagement" in 18px/600 weight, left-aligned. On the right, the primary action button "Neue Bestellung" as a teal pill button with a Plus icon.

**Hero Section (The FIRST thing users see):**
A full-width card spanning the viewport with a subtle teal-tinted top border (3px). Contains:
- Label "Offene Bestellungen" in 13px/400 muted text, uppercase tracking-wide
- The count of active orders (all orders NOT geliefert/storniert) displayed as a massive 40px/700 bold number
- Below: total net value of open orders in 20px/500, formatted as EUR currency
- Below that: a compact row of 3 inline mini-stats showing "Entwurf" count, "In Lieferung" count, and "Überfällig" count (orders past gewuenschtes_lieferdatum), each as a small badge-like element

**Section 2: Status Pipeline (compact)**
A horizontal stacked bar (full width, 32px height) showing the distribution of orders across all 8 statuses. Below the bar, only the top 3 statuses with highest counts are labeled. Tapping the bar area does nothing on mobile — it's purely visual.

**Section 3: Bestellvolumen Chart**
A Card titled "Bestellvolumen (30 Tage)" containing a simple area chart showing order value (gesamtwert_netto) aggregated by week over the last 30 days. Uses teal fill with low opacity. Height: 200px. X-axis shows week labels (KW format), Y-axis shows EUR values.

**Section 4: Aktuelle Bestellungen**
A Card titled "Aktuelle Bestellungen" with a list of the 8 most recent orders, each as a compact row:
- Left: Bestellnummer in 14px/600 + Lieferant name below in 13px muted
- Right: gesamtwert_netto formatted as EUR + status badge below

Each row is tappable — opens a detail sheet showing full order info.

**Section 5: Lieferanten-Überblick**
A Card titled "Top Lieferanten" showing the 5 suppliers with the most orders, each as:
- Firmenname in 14px/500
- Number of orders as a muted count
- Total order value in 14px

**Bottom Navigation / Action:**
No fixed bottom nav. The primary action button in the header is sufficient. On scroll, the header remains sticky.

### Mobile-Specific Adaptations
- Hero stats use a horizontal row instead of cards
- Chart is simplified to area chart (no tooltips, cleaner axis)
- Order list items are compact rows, not full cards
- Supplier section uses a simple list, not a table

### Touch Targets
- All list items minimum 48px height
- Primary action button minimum 44px height
- Status badges are display-only (not tappable)

### Interactive Elements
- Order list items → tap to open detail sheet (Dialog) showing all order fields
- Primary action button → opens "Neue Bestellung" form dialog

---

## 5. Desktop Layout

### Overall Structure
A **max-width 1280px container**, centered, with 24px padding. The layout uses a 65/35 split:

**Left column (65%):**
1. Hero KPI banner (full left-column width) — a wide card with the open orders count on the left side, total value in the center, and 3 mini-stat badges on the right. Subtle teal top border (3px).
2. Below: Order Status Pipeline — a horizontal stacked bar chart (full left-column width, 48px height) with all 8 status segments labeled with counts
3. Below: Bestellvolumen area chart card (last 30 days)

**Right column (35%):**
1. Aktuelle Bestellungen — card with 8 most recent orders as compact rows
2. Below: Top Lieferanten — card with top 5 suppliers by order count

**Desktop header:** Full-width row with "Bestellmanagement" title (24px/700), subtitle "aus Stückliste" (14px/400 muted), and on the far right the "Neue Bestellung" primary button.

### Section Layout
- **Top area:** Header row with title + primary action
- **Main content (left):** Hero banner → Pipeline bar → Chart
- **Supporting (right):** Recent orders → Supplier summary
- Gap between columns: 24px
- Gap between rows: 20px

### What Appears on Hover
- Order rows: background shifts to muted, cursor pointer
- Supplier rows: background shifts to muted, cursor pointer
- Pipeline bar segments: tooltip showing status name + count + percentage
- Chart: standard recharts tooltip with date + value

### Clickable/Interactive Areas
- Order rows → click to open detail Dialog with full order information including all positions (Bestellpositionen) for that order
- Supplier rows → click to open Dialog showing supplier details + their recent orders
- Primary action button → opens "Neue Bestellung" form dialog

---

## 6. Components

### Hero KPI
The MOST important metric that users see first.

- **Title:** "Offene Bestellungen"
- **Data source:** Bestellungen app — count all orders where bestellstatus is NOT 'geliefert' and NOT 'storniert'
- **Calculation:** Count of matching records
- **Display:** Large bold number (40px mobile / 48px desktop, weight 700). Accompanied by the total net value (gesamtwert_netto sum) of these orders displayed in 20px/500.
- **Context shown:** Three mini-stat badges: count of "Entwurf" orders, count of "In Lieferung" orders, count of "Überfällig" orders (where gewuenschtes_lieferdatum < today and status not geliefert/storniert)
- **Why this is the hero:** The procurement manager's #1 question is "how much is in the pipeline right now?" This answers it instantly with both count and financial value.

### Secondary KPIs
These appear as the three mini-stat badges within/below the hero:

**Entwürfe**
- Source: Bestellungen where bestellstatus === 'entwurf'
- Calculation: Count
- Format: number
- Display: Small badge with label "Entwürfe" and count, using muted styling

**In Lieferung**
- Source: Bestellungen where bestellstatus === 'in_lieferung'
- Calculation: Count
- Format: number
- Display: Small badge with teal accent background

**Überfällig**
- Source: Bestellungen where gewuenschtes_lieferdatum < today AND bestellstatus NOT in ['geliefert', 'storniert']
- Calculation: Count
- Format: number
- Display: Small badge with destructive/red accent if count > 0, muted if 0

### Status Pipeline Chart
- **Type:** Horizontal stacked bar (single row, using recharts BarChart with stacked layout, horizontal)
- **Title:** "Bestellstatus-Übersicht"
- **What question it answers:** "How are my orders distributed across the pipeline?"
- **Data source:** Bestellungen — count per bestellstatus
- **Segments:** Each of the 8 statuses as a stacked segment. Colors: a gradient from neutral grays (entwurf, zur_pruefung) through blues (freigegeben, versendet, bestaetigt) to teal (in_lieferung, geliefert) with red for storniert.
  - entwurf: `hsl(210 10% 75%)`
  - zur_pruefung: `hsl(210 15% 65%)`
  - freigegeben: `hsl(200 30% 55%)`
  - versendet: `hsl(190 40% 48%)`
  - bestaetigt: `hsl(180 45% 42%)`
  - in_lieferung: `hsl(173 50% 38%)`
  - geliefert: `hsl(152 55% 41%)`
  - storniert: `hsl(0 60% 55%)`
- **Labels:** Below the bar, show count for each non-zero status
- **Mobile simplification:** 32px height, only top 3 labels shown

### Chart: Bestellvolumen (30 Tage)
- **Type:** AreaChart — because it shows cumulative volume over time, and the filled area gives a sense of "mass" that matches the financial weight concept
- **Title:** "Bestellvolumen (30 Tage)"
- **What question it answers:** "What's our recent ordering trend? Are we spending more or less?"
- **Data source:** Bestellungen — filter to last 30 days by bestelldatum, aggregate gesamtwert_netto by week
- **X-axis:** Week (formatted as "KW {number}" using date-fns)
- **Y-axis:** EUR value (formatted with Intl.NumberFormat)
- **Style:** Teal stroke (`hsl(173 58% 39%)`), teal fill with 15% opacity, smooth monotone curve, no dots
- **Mobile simplification:** Reduced height (200px vs 280px desktop), simplified Y-axis labels

### Lists/Tables

**Aktuelle Bestellungen**
- Purpose: Quick access to the most recent orders — users want to see what's new and take action
- Source: Bestellungen, sorted by bestelldatum descending
- Fields shown: bestellnummer, lieferant name (resolved via Lieferanten lookup), gesamtwert_netto, bestellstatus (as color-coded badge)
- Mobile style: compact rows (bestellnummer + lieferant left, value + badge right)
- Desktop style: same compact rows (not a full table — consistent with mobile for familiarity)
- Sort: bestelldatum descending (newest first)
- Limit: 8 items
- Click action: Opens detail Dialog

**Top Lieferanten**
- Purpose: See which suppliers dominate the order book
- Source: Lieferanten, enriched with order count and total value from Bestellungen
- Fields shown: firmenname, order count, total gesamtwert_netto
- Mobile style: simple list rows
- Desktop style: simple list rows with right-aligned numbers
- Sort: By total order value descending
- Limit: 5 items
- Click action: Opens supplier detail Dialog

### Primary Action Button (REQUIRED!)

- **Label:** "Neue Bestellung"
- **Action:** add_record
- **Target app:** Bestellungen
- **What data:** Form Dialog with fields:
  - bestellnummer (text input, required)
  - bestelldatum (date input, defaults to today)
  - lieferant_bestellung (Select dropdown populated from Lieferanten, showing firmenname)
  - gewuenschtes_lieferdatum (date input)
  - bestellstatus (Select dropdown with all 8 status options, defaults to 'entwurf')
  - kostenstelle (text input)
  - bestellung_notizen (textarea)
- **Mobile position:** header (right side, pill button with Plus icon)
- **Desktop position:** header (right side, standard button with Plus icon + text)
- **Why this action:** Creating orders is the core workflow. Every BOM import leads to order creation. This must be one tap away.

---

## 7. Visual Details

### Border Radius
Rounded (8px) — `--radius: 0.5rem`. Cards have soft rounded corners that feel modern but not playful. Buttons and badges use the same radius for consistency.

### Shadows
Subtle — cards use `shadow-sm` (0 1px 2px rgba(0,0,0,0.05)). On hover, order/supplier rows get a slight background shift rather than shadow elevation. The hero card uses `shadow-sm` as well — the teal top border provides the visual weight instead.

### Spacing
Normal-to-spacious — 24px gaps between sections, 16px internal padding in cards, 12px between list items. The hero card has 24px internal padding. Breathing room between the title and content sections.

### Animations
- **Page load:** Gentle stagger-fade for the main sections (hero → pipeline → chart → sidebars). Use Tailwind's `animate-in fade-in` with `duration-500` and incremental `delay-100`.
- **Hover effects:** Order/supplier rows: `transition-colors duration-150`, background shifts to `bg-muted/50`
- **Tap feedback:** Buttons use default shadcn press feedback (slight scale)

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
:root {
  --radius: 0.5rem;
  --background: hsl(210 20% 97%);
  --foreground: hsl(215 25% 15%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(215 25% 15%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(215 25% 15%);
  --primary: hsl(173 58% 39%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(210 15% 95%);
  --secondary-foreground: hsl(215 25% 15%);
  --muted: hsl(210 15% 95%);
  --muted-foreground: hsl(215 10% 48%);
  --accent: hsl(173 40% 94%);
  --accent-foreground: hsl(173 58% 25%);
  --destructive: hsl(0 72% 51%);
  --border: hsl(210 15% 90%);
  --input: hsl(210 15% 90%);
  --ring: hsl(173 58% 39%);
  --chart-1: hsl(173 58% 39%);
  --chart-2: hsl(152 55% 41%);
  --chart-3: hsl(200 30% 55%);
  --chart-4: hsl(210 15% 65%);
  --chart-5: hsl(0 60% 55%);
  --sidebar: hsl(210 15% 95%);
  --sidebar-foreground: hsl(215 25% 15%);
  --sidebar-primary: hsl(173 58% 39%);
  --sidebar-primary-foreground: hsl(0 0% 100%);
  --sidebar-accent: hsl(173 40% 94%);
  --sidebar-accent-foreground: hsl(173 58% 25%);
  --sidebar-border: hsl(210 15% 90%);
  --sidebar-ring: hsl(173 58% 39%);
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font loaded from URL above (Space Grotesk, weights 300-700)
- [ ] All CSS variables copied exactly from Section 8
- [ ] Mobile layout matches Section 4 (single column, hero dominant)
- [ ] Desktop layout matches Section 5 (65/35 split, header row)
- [ ] Hero element is prominent as described (large count + value + mini-stats)
- [ ] Status pipeline bar uses the specified 8 status colors
- [ ] Area chart shows last 30 days of order volume
- [ ] Recent orders list is clickable with detail dialog
- [ ] Supplier list shows enriched data (order count + total value)
- [ ] Primary action "Neue Bestellung" form works with all specified fields
- [ ] Colors create the cool-industrial mood described in Section 2
- [ ] Loading states use Skeleton components
- [ ] Empty states provide helpful guidance
- [ ] Error states include retry options
