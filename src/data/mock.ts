export type BusinessStatus = "active" | "paused" | "completed";
export type Stage =
  | "Discovery"
  | "Brand Identity"
  | "Stationery"
  | "Social Kit"
  | "Website"
  | "Launch";

export interface BusinessWorkspace {
  id: string;
  name: string;
  category: string;
  city: string;
  country: string;
  logo: string;       // emoji or short letters
  cover: string;      // image URL
  color: string;      // brand accent
  manager: string;
  managerAvatar: string;
  deadline: string;
  budget: string;
  progress: number;   // 0-100
  status: BusinessStatus;
  stage: Stage;
  lastActivity: string;
  palette: string[];
  font: string;
  slogan: string;
}

export const businesses: BusinessWorkspace[] = [
  {
    id: "spicebite",
    name: "SpiceBite Restaurant",
    category: "Restaurant & Hospitality",
    city: "Singapore",
    country: "Singapore",
    logo: "🌶️",
    cover:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80",
    color: "#E63946",
    manager: "Aarav Mehta",
    managerAvatar: "AM",
    deadline: "Aug 28, 2026",
    budget: "$24,000",
    progress: 68,
    status: "active",
    stage: "Website",
    lastActivity: "2h ago — Website hero approved",
    palette: ["#E63946", "#F1573D", "#003B73", "#F8FAFC", "#0B132B"],
    font: "Playfair Display + Inter",
    slogan: "Bold flavors. Honest food.",
  },
  {
    id: "elite-travel",
    name: "Elite Travel Agency",
    category: "Travel & Tourism",
    city: "Dubai",
    country: "UAE",
    logo: "✈️",
    cover:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1400&q=80",
    color: "#177BBB",
    manager: "Sara Kim",
    managerAvatar: "SK",
    deadline: "Sep 12, 2026",
    budget: "$18,500",
    progress: 42,
    status: "active",
    stage: "Social Kit",
    lastActivity: "Yesterday — Instagram kit drafted",
    palette: ["#003B73", "#177BBB", "#F1F5F9", "#0B132B"],
    font: "DM Serif + Inter",
    slogan: "The world, beautifully arranged.",
  },
  {
    id: "glowbeauty",
    name: "GlowBeauty Salon",
    category: "Beauty & Wellness",
    city: "London",
    country: "UK",
    logo: "💄",
    cover:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1400&q=80",
    color: "#F1573D",
    manager: "Lina Park",
    managerAvatar: "LP",
    deadline: "Jul 30, 2026",
    budget: "$12,000",
    progress: 86,
    status: "active",
    stage: "Launch",
    lastActivity: "3h ago — Launch banner pending approval",
    palette: ["#F1573D", "#E63946", "#FFF7F2", "#1F2937"],
    font: "Cormorant + Inter",
    slogan: "Effortless glow, every day.",
  },
  {
    id: "fitzone",
    name: "FitZone Gym",
    category: "Fitness & Health",
    city: "New York",
    country: "USA",
    logo: "🏋️",
    cover:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=80",
    color: "#003B73",
    manager: "Marco Reyes",
    managerAvatar: "MR",
    deadline: "Oct 02, 2026",
    budget: "$21,000",
    progress: 24,
    status: "active",
    stage: "Brand Identity",
    lastActivity: "Today — Logo concepts in review",
    palette: ["#003B73", "#16A34A", "#0B132B", "#F8FAFC"],
    font: "Archivo + Inter",
    slogan: "Stronger every day.",
  },
  {
    id: "urbannest",
    name: "UrbanNest Real Estate",
    category: "Real Estate",
    city: "Toronto",
    country: "Canada",
    logo: "🏙️",
    cover:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80",
    color: "#0B132B",
    manager: "Hannah Cole",
    managerAvatar: "HC",
    deadline: "Nov 15, 2026",
    budget: "$32,000",
    progress: 55,
    status: "active",
    stage: "Stationery",
    lastActivity: "Yesterday — Letterhead delivered",
    palette: ["#0B132B", "#177BBB", "#E5EAF2", "#FFFFFF"],
    font: "Manrope + Inter",
    slogan: "Find the address of your life.",
  },
  {
    id: "swiftcart",
    name: "SwiftCart E-commerce",
    category: "E-commerce & Retail",
    city: "Berlin",
    country: "Germany",
    logo: "🛒",
    cover:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=80",
    color: "#16A34A",
    manager: "Yuki Tanaka",
    managerAvatar: "YT",
    deadline: "Dec 01, 2026",
    budget: "$28,500",
    progress: 12,
    status: "paused",
    stage: "Discovery",
    lastActivity: "3 days ago — On hold for client docs",
    palette: ["#16A34A", "#003B73", "#F8FAFC", "#0B132B"],
    font: "Space Grotesk + Inter",
    slogan: "Shop the everyday, faster.",
  },
];

export const employees = [
  { name: "Aarav Mehta", role: "Project Manager", initials: "AM", load: 8, clients: 4 },
  { name: "Sara Kim", role: "Brand Designer", initials: "SK", load: 6, clients: 3 },
  { name: "Lina Park", role: "Social Designer", initials: "LP", load: 5, clients: 3 },
  { name: "Marco Reyes", role: "Web Developer", initials: "MR", load: 7, clients: 2 },
  { name: "Hannah Cole", role: "Copywriter", initials: "HC", load: 4, clients: 5 },
  { name: "Yuki Tanaka", role: "Marketing Lead", initials: "YT", load: 6, clients: 4 },
];

export const deliverables = [
  { key: "logo", title: "Logo & Brand Identity", progress: 90, status: "Waiting Client Approval" },
  { key: "stationery", title: "Stationery Kit", progress: 70, status: "In Progress" },
  { key: "social", title: "Social Media Kit", progress: 55, status: "In Progress" },
  { key: "website", title: "Website / Landing Page", progress: 40, status: "In Progress" },
  { key: "guidelines", title: "Brand Guidelines", progress: 15, status: "Not Started" },
];

export const brandBuilderSteps = [
  {
    title: "Brand Identity & Strategy",
    items: [
      { name: "Business Category & Name", status: "Completed" },
      { name: "Brand Slogan / Tagline", status: "Completed" },
      { name: "Mission & Vision", status: "In Progress" },
    ],
  },
  {
    title: "Visual Identity",
    items: [
      { name: "Professional Logo (Primary / Secondary / Icon)", status: "Waiting Client Approval" },
      { name: "Brand Color Palette", status: "Completed" },
      { name: "Typography / Font", status: "Completed" },
    ],
  },
  {
    title: "Stationery & Marketing Kit",
    items: [
      { name: "Business Card", status: "In Progress" },
      { name: "Letterhead & Invoice", status: "In Progress" },
      { name: "Company Profile PDF", status: "Not Started" },
      { name: "Email Signature", status: "Not Started" },
    ],
  },
  {
    title: "Digital & Social Media Presence",
    items: [
      { name: "Social Media Kit", status: "In Progress" },
      { name: "5 Post Templates (FB / IG / LinkedIn)", status: "Revision Requested" },
      { name: "Website / Landing Page", status: "In Progress" },
    ],
  },
  {
    title: "Launch & Marketing",
    items: [
      { name: "Brand Guidelines / Brand Book", status: "Not Started" },
      { name: "Launch Post & Banner", status: "Not Started" },
    ],
  },
];

export const tasksByStatus = {
  Backlog: [
    { title: "Photoshoot brief — SpiceBite", assignee: "LP", priority: "Low", due: "Aug 02" },
    { title: "Domain renewal — UrbanNest", assignee: "MR", priority: "Medium", due: "Aug 04" },
  ],
  "To Do": [
    { title: "Logo round 2 — FitZone", assignee: "SK", priority: "High", due: "Jul 23" },
    { title: "Caption pack — Elite Travel", assignee: "HC", priority: "Medium", due: "Jul 24" },
  ],
  "In Progress": [
    { title: "Website hero — SpiceBite", assignee: "MR", priority: "High", due: "Jul 22" },
    { title: "Stationery — UrbanNest", assignee: "SK", priority: "Medium", due: "Jul 25" },
  ],
  "Waiting Client Approval": [
    { title: "Brand identity — SpiceBite", assignee: "AM", priority: "High", due: "Jul 22" },
  ],
  "Revision Requested": [
    { title: "Post templates — Elite Travel", assignee: "LP", priority: "High", due: "Jul 21" },
  ],
  Completed: [
    { title: "Discovery call — GlowBeauty", assignee: "AM", priority: "Medium", due: "Jul 10" },
    { title: "Color palette — GlowBeauty", assignee: "SK", priority: "Medium", due: "Jul 14" },
  ],
} as const;

export const activity = [
  { who: "Sara Kim", action: "uploaded a new logo concept for", target: "SpiceBite Restaurant", time: "12m ago" },
  { who: "Aarav Mehta", action: "scheduled a brand review meeting with", target: "Elite Travel Agency", time: "1h ago" },
  { who: "Lina Park", action: "submitted social posts for approval —", target: "GlowBeauty Salon", time: "3h ago" },
  { who: "Marco Reyes", action: "published staging site for", target: "SpiceBite Restaurant", time: "6h ago" },
  { who: "Hannah Cole", action: "delivered brand strategy doc to", target: "UrbanNest Real Estate", time: "Yesterday" },
];

export const meetings = [
  { title: "Brand Review", business: "SpiceBite Restaurant", time: "Today · 3:30 PM", type: "Brand Review" },
  { title: "Website Walkthrough", business: "Elite Travel Agency", time: "Tomorrow · 11:00 AM", type: "Website Review" },
  { title: "Discovery Call", business: "FitZone Gym", time: "Fri · 5:00 PM", type: "Discovery Call" },
];

export const insights = [
  "SpiceBite is 68% complete — push launch banner to hit deadline 4 days early.",
  "Elite Travel social CTR is below benchmark. Suggest A/B testing two captions.",
  "FitZone logo round 2 is overdue — reassign to Sara for fastest turnaround.",
];
