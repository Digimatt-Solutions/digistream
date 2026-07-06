export type Role = "super_admin" | "content_manager" | "client_admin" | "client_staff" | "viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  clientId?: string;
  avatar?: string;
}

export const ROLES: Record<Role, { label: string; description: string }> = {
  super_admin: { label: "Super Admin", description: "Full platform access across all tenants" },
  content_manager: { label: "Content Manager", description: "Manage content, categories, playlists" },
  client_admin: { label: "Client Administrator", description: "Manage own workspace, team & devices" },
  client_staff: { label: "Client Staff", description: "Operate playlists and devices" },
  viewer: { label: "Viewer", description: "Read-only access to catalogue" },
};

export const USERS: User[] = [
  { id: "u1", name: "Amara Okafor", email: "amara@digimatt.io", role: "super_admin" },
  { id: "u2", name: "Liam Chen", email: "liam@digimatt.io", role: "content_manager" },
  { id: "u3", name: "Sofia Herrera", email: "sofia@lumenhotels.com", role: "client_admin", clientId: "c1" },
  { id: "u4", name: "Noah Patel", email: "noah@lumenhotels.com", role: "client_staff", clientId: "c1" },
  { id: "u5", name: "Ella Novak", email: "ella@arenafit.co", role: "client_admin", clientId: "c2" },
];

export interface Client {
  id: string;
  name: string;
  industry: string;
  plan: "Basic" | "Standard" | "Premium";
  devices: number;
  users: number;
  status: "active" | "trialing" | "suspended";
  since: string;
  mrr: number;
  logoColor: string;
}

export const CLIENTS: Client[] = [
  { id: "c1", name: "Lumen Hotels Group", industry: "Hospitality", plan: "Premium", devices: 142, users: 18, status: "active", since: "2024-03-11", mrr: 4890, logoColor: "#f97316" },
  { id: "c2", name: "ArenaFit Studios", industry: "Fitness", plan: "Standard", devices: 64, users: 9, status: "active", since: "2024-07-22", mrr: 1890, logoColor: "#0ea5e9" },
  { id: "c3", name: "Cascade Retail Co.", industry: "Retail", plan: "Standard", devices: 88, users: 12, status: "active", since: "2024-11-04", mrr: 2340, logoColor: "#10b981" },
  { id: "c4", name: "Northwind Airlines", industry: "Travel", plan: "Premium", devices: 210, users: 24, status: "active", since: "2023-12-19", mrr: 7290, logoColor: "#8b5cf6" },
  { id: "c5", name: "Meridian Clinics", industry: "Healthcare", plan: "Basic", devices: 22, users: 4, status: "trialing", since: "2026-06-01", mrr: 0, logoColor: "#ec4899" },
  { id: "c6", name: "Terra Coffee Co.", industry: "F&B", plan: "Basic", devices: 31, users: 3, status: "suspended", since: "2025-05-14", mrr: 590, logoColor: "#eab308" },
];

export type ContentType = "Movie" | "TV Show" | "Audio" | "DJ Mix" | "Podcast" | "Live Stream" | "Promo";

export interface Content {
  id: string;
  title: string;
  type: ContentType;
  category: string;
  duration: string;
  status: "Published" | "Draft" | "Scheduled" | "Archived";
  views: number;
  updated: string;
  thumbColor: string;
}

const catByType: Record<ContentType, string[]> = {
  Movie: ["Drama", "Action", "Documentary"],
  "TV Show": ["Series", "Reality", "News"],
  Audio: ["Ambient", "Classical", "Lounge"],
  "DJ Mix": ["House", "Techno", "Afrobeat"],
  Podcast: ["Business", "Tech", "Culture"],
  "Live Stream": ["Sports", "News", "Events"],
  Promo: ["Brand", "Product", "Campaign"],
};

const titles = [
  "Golden Horizon", "Midnight Frequency", "The Cascade Report", "Echoes of Lagos", "Neon Sessions Vol. 4",
  "Founders Weekly", "Terminal Bloom", "Sunset Boulevard Live", "Coastline Beats", "Urban Odyssey",
  "Quiet Hours", "Studio 88 Mix", "Boardroom Insights", "Skyline Cinema", "Deep House Nights",
  "Morning Brief", "Afrobeat Fusion", "The Long Weekend", "Retail Rhythms", "Cabin Sounds",
  "Frontier Docs", "Runway 27L", "Focus State", "Backstage Pass", "Concourse Live",
];
const colors = ["#f97316","#ea580c","#dc2626","#9333ea","#0891b2","#059669","#ca8a04","#db2777","#4f46e5","#0d9488"];
const types: ContentType[] = ["Movie","TV Show","Audio","DJ Mix","Podcast","Live Stream","Promo"];
const statuses: Content["status"][] = ["Published","Published","Published","Draft","Scheduled","Archived"];

export const CONTENT: Content[] = titles.map((title, i) => {
  const type = types[i % types.length];
  const cats = catByType[type];
  return {
    id: `ct${i + 1}`,
    title,
    type,
    category: cats[i % cats.length],
    duration: `${20 + ((i * 7) % 90)}m`,
    status: statuses[i % statuses.length],
    views: 1200 + ((i * 8123) % 98000),
    updated: `2026-0${(i % 7) + 1}-${String(((i * 3) % 27) + 1).padStart(2, "0")}`,
    thumbColor: colors[i % colors.length],
  };
});

export interface Device {
  id: string;
  name: string;
  deviceId: string;
  clientId: string;
  playlist: string;
  status: "online" | "offline" | "syncing";
  lastSeen: string;
  location: string;
  uptime: string;
}

export const DEVICES: Device[] = Array.from({ length: 24 }).map((_, i) => {
  const client = CLIENTS[i % CLIENTS.length];
  const status: Device["status"] = i % 6 === 0 ? "offline" : i % 9 === 0 ? "syncing" : "online";
  return {
    id: `d${i + 1}`,
    name: `${client.name.split(" ")[0]} Player ${String(i + 1).padStart(3, "0")}`,
    deviceId: `DMT-${String(1000 + i)}-${String.fromCharCode(65 + (i % 26))}`,
    clientId: client.id,
    playlist: ["Lobby Loop", "Fitness Peak", "Retail Rush", "Cabin Zen", "Waiting Room"][i % 5],
    status,
    lastSeen: status === "online" ? "just now" : status === "syncing" ? "2m ago" : `${(i % 12) + 1}h ago`,
    location: ["New York, US","London, UK","Lagos, NG","Dubai, AE","Singapore, SG","Berlin, DE"][i % 6],
    uptime: `${95 + (i % 5)}.${(i * 3) % 10}%`,
  };
});

export interface Playlist {
  id: string;
  name: string;
  items: number;
  duration: string;
  clientId: string;
  devices: number;
  updated: string;
}

export const PLAYLISTS: Playlist[] = [
  { id: "p1", name: "Lobby Loop — Morning", items: 42, duration: "4h 12m", clientId: "c1", devices: 38, updated: "2 days ago" },
  { id: "p2", name: "Fitness Peak Hours", items: 68, duration: "6h 40m", clientId: "c2", devices: 24, updated: "5 hours ago" },
  { id: "p3", name: "Retail Rush", items: 55, duration: "5h 05m", clientId: "c3", devices: 61, updated: "yesterday" },
  { id: "p4", name: "Cabin Zen — Long Haul", items: 120, duration: "12h 30m", clientId: "c4", devices: 88, updated: "3 days ago" },
  { id: "p5", name: "Waiting Room Calm", items: 28, duration: "2h 45m", clientId: "c1", devices: 14, updated: "1 week ago" },
];

export const PLANS = [
  { name: "Basic", price: 199, devices: 25, apiCalls: "10K/mo", features: ["Standard catalogue","Email support","1 workspace"] },
  { name: "Standard", price: 499, devices: 100, apiCalls: "100K/mo", features: ["Extended catalogue","Priority support","Custom playlists","Analytics"] },
  { name: "Premium", price: 1299, devices: 500, apiCalls: "Unlimited", features: ["Full catalogue + Live","Dedicated CSM","White-label portal","API + Webhooks","SSO"] },
];

// Chart data
export const viewsSeries = Array.from({ length: 14 }).map((_, i) => ({
  day: `Jun ${20 + i > 30 ? i - 10 : 20 + i}`,
  views: 12000 + Math.round(Math.sin(i / 2) * 3000 + i * 400 + Math.random() * 1200),
  streams: 3200 + Math.round(Math.cos(i / 3) * 900 + i * 120 + Math.random() * 400),
}));

export const watchByType = [
  { type: "Movies", hours: 3820 },
  { type: "TV Shows", hours: 5140 },
  { type: "Audio", hours: 2210 },
  { type: "DJ Mix", hours: 1780 },
  { type: "Podcast", hours: 940 },
  { type: "Live", hours: 3300 },
];

export const clientGrowth = Array.from({ length: 8 }).map((_, i) => ({
  month: ["Nov","Dec","Jan","Feb","Mar","Apr","May","Jun"][i],
  clients: 42 + i * 6 + (i % 2) * 3,
  mrr: 38000 + i * 4200,
}));

export const ACTIVITY = [
  { who: "Sofia Herrera", what: "published playlist", detail: "Lobby Loop — Morning", when: "12m ago" },
  { who: "Content Bot", what: "scheduled", detail: "Neon Sessions Vol. 4", when: "48m ago" },
  { who: "Liam Chen", what: "uploaded", detail: "Frontier Docs — S02E04", when: "2h ago" },
  { who: "Amara Okafor", what: "upgraded plan for", detail: "Northwind Airlines → Premium", when: "5h ago" },
  { who: "System", what: "flagged offline", detail: "DMT-1012-M in Dubai", when: "7h ago" },
  { who: "Ella Novak", what: "invited", detail: "3 new team members", when: "yesterday" },
];
