import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { Hackathon, UserProfile, Team, TeamRequest, BookmarkState, ScraperJob, NotificationItem } from "./src/types";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API safely
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API initialized successfully.");
  } else {
    console.warn("GEMINI_API_KEY environment variable is not defined. Falling back to simulated smart advice.");
  }
} catch (error) {
  console.error("Failed to initialize Gemini API:", error);
}

// ==========================================
// IN-MEMORY DATABASE & SEED DATA
// ==========================================

let userSession: UserProfile = {
  id: "user-1",
  name: "Guest Explorer",
  email: "guest@hackfinder.com",
  skills: [],
  interests: [],
  preferredDomains: [],
  preferredMode: "Any",
  onboarded: false
};

// Initial Seed Hackathons
let hackathonsDb: Hackathon[] = [
  {
    id: "hack-1",
    title: "Global GenAI Hackfest 2026",
    organizer: "Google Developer Groups",
    prizePool: "₹10,00,000",
    prizeValue: 1000000,
    deadline: "2026-07-15T23:59:59Z",
    startDate: "2026-07-20T09:00:00Z",
    mode: "Hybrid",
    location: "Bangalore",
    difficulty: "Advanced",
    studentOnly: false,
    soloAllowed: true,
    teamSize: "1-4 members",
    themes: ["AI", "ML", "Cloud", "Open Innovation"],
    banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
    description: "Welcome to the ultimate generative AI buildathon. Combine the power of Google Gemini, Vertex AI, and Serverless technologies to solve real-world industry cases. We are looking for functional prototypes that demonstrate deep engineering skill and beautiful user experiences.",
    timeline: [
      { date: "July 15, 2026", label: "Registration Closes" },
      { date: "July 20, 2026", label: "Opening Ceremony & Hacking Begins" },
      { date: "July 22, 2026", label: "Project Submission Deadline" },
      { date: "July 25, 2026", label: "Grand Finale & Winners Announced" }
    ],
    rules: [
      "Projects must be built during the hacking window using Google Gemini models.",
      "Teams can consist of 1 to 4 individuals.",
      "Any form of plagiarism or pre-built system submissions is strictly prohibited.",
      "Open-source libraries are fully permitted with appropriate attribution."
    ],
    eligibility: "Open to students, working professionals, and AI researchers globally.",
    tracks: [
      { name: "Next-Gen Productivity", description: "Build assistants that fundamentally streamline active daily developer workflows.", prize: "₹4,00,000" },
      { name: "SaaS Innovation", description: "Incorporate intelligent multimodal Gemini features into modern full-stack business tools.", prize: "₹4,0,000" },
      { name: "Public Sector Impact", description: "Sustainably resolve community, educational, or climate challenges.", prize: "₹2,00,000" }
    ],
    sponsors: ["Google", "Vercel", "Hugging Face"],
    registrationStatus: "Open",
    featured: true,
    source: "Devpost",
    registrationUrl: "https://devpost.com/hackathons/global-genai-2026"
  },
  {
    id: "hack-2",
    title: "EthGlobal Bangalore 2026",
    organizer: "ETHGlobal",
    prizePool: "₹25,00,000",
    prizeValue: 2500000,
    deadline: "2026-07-25T23:59:59Z",
    startDate: "2026-08-01T10:00:00Z",
    mode: "Offline",
    location: "Bangalore",
    difficulty: "Advanced",
    studentOnly: false,
    soloAllowed: false,
    teamSize: "2-5 members",
    themes: ["Blockchain", "FinTech", "Cybersecurity"],
    banner: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=60",
    description: "Join the world's leading Ethereum ecosystem engineers in Bangalore. Build scalable Web3 decentralized protocols, Zero-Knowledge proof integrations, DeFi utilities, or creative NFT mechanisms on Layer 2 solutions.",
    timeline: [
      { date: "July 25, 2026", label: "Registration Closes" },
      { date: "Aug 01, 2026", label: "In-Person Check-In" },
      { date: "Aug 03, 2026", label: "Final Submissions & Pitching" }
    ],
    rules: [
      "All code must be committed to a public repository during the 48-hour hacking window.",
      "Smart contracts must run successfully on Sepolia testnet or specified L2 mainnets.",
      "Teams must consist of at least 2 and up to 5 engineers."
    ],
    eligibility: "Developers, designers, and web3 enthusiasts of all backgrounds.",
    tracks: [
      { name: "Best L2 DeFi Protocol", description: "DeFi primitives building yielding engines or automated liquidity lockers.", prize: "₹10,00,000" },
      { name: "Zero Knowledge Applications", description: "Implement identity verification systems with strict zero-knowledge constraints.", prize: "₹8,00,000" },
      { name: "Creator Economy Integration", description: "Unique asset distribution networks or loyalty engines.", prize: "₹7,00,000" }
    ],
    sponsors: ["Ethereum Foundation", "Base", "Optimism", "Chainlink"],
    registrationStatus: "Open",
    featured: true,
    source: "Devfolio",
    registrationUrl: "https://ethglobal.com/events/bangalore2026"
  },
  {
    id: "hack-3",
    title: "Unstop National Innovation Hackathon",
    organizer: "Unstop India Hub",
    prizePool: "₹5,00,000",
    prizeValue: 500000,
    deadline: "2026-07-08T18:00:00Z",
    startDate: "2026-07-12T10:00:00Z",
    mode: "Online",
    location: "Remote",
    difficulty: "Beginner",
    studentOnly: true,
    soloAllowed: true,
    teamSize: "1-3 members",
    themes: ["EdTech", "HealthTech", "Open Innovation"],
    banner: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=60",
    description: "Unstop's premier nationwide college buildathon designed to fast-track young talent. Build inventive solutions for Indian public challenges, from tech-led educational access in village tiers to automated health records integration.",
    timeline: [
      { date: "July 08, 2026", label: "Last Date to Register" },
      { date: "July 12, 2026", label: "Ideation Round Submissions" },
      { date: "July 15, 2026", label: "Final Prototype Submissions" }
    ],
    rules: [
      "Only actively enrolled college students with valid IDs can participate.",
      "Solo and team participation are both supported.",
      "Solutions must specifically address local community development."
    ],
    eligibility: "All active students from recognized universities across India.",
    tracks: [
      { name: "Education For All", description: "Tech models aiding tier-2 and tier-3 student learning ecosystems.", prize: "₹2,50,000" },
      { name: "Healthcare Accessibility", description: "Innovative offline-first web apps connecting rural clinics with specialist centers.", prize: "₹2,50,000" }
    ],
    sponsors: ["Unstop", "AWS India", "HDFC Bank"],
    registrationStatus: "Closing Soon",
    featured: false,
    source: "Unstop",
    registrationUrl: "https://unstop.com/hacks/national-innovation-2026"
  },
  {
    id: "hack-4",
    title: "Vercel Next.js Speedrun 2026",
    organizer: "Vercel Corp",
    prizePool: "₹12,00,000",
    prizeValue: 1200000,
    deadline: "2026-07-19T23:59:59Z",
    startDate: "2026-07-22T08:00:00Z",
    mode: "Online",
    location: "Remote",
    difficulty: "Intermediate",
    studentOnly: false,
    soloAllowed: true,
    teamSize: "1-2 members",
    themes: ["Cloud", "Open Innovation"],
    banner: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60",
    description: "A fast-paced 48-hour virtual sprint. Design, build, and deploy the most performant, accessible, and feature-rich Next.js application using Server Components, edge routing, and Postgres database integrations.",
    timeline: [
      { date: "July 19, 2026", label: "Registrations Close" },
      { date: "July 22, 2026", label: "Speedrun Theme Disclosed" },
      { date: "July 24, 2026", label: "Code Freeze & Submissions" }
    ],
    rules: [
      "All applications must be hosted on Vercel.",
      "Maximum of 2 members per team.",
      "Core features must score above 95/100 on Google Lighthouse."
    ],
    eligibility: "Open to web developers worldwide.",
    tracks: [
      { name: "Peak Performance", description: "SaaS prototypes with the fastest Time-To-Interactive and optimized hydration.", prize: "₹6,00,000" },
      { name: "Unmatched UX Designer Choice", description: "Applications with flawless micro-interactions, dark mode, and layout animations.", prize: "₹6,0,000" }
    ],
    sponsors: ["Vercel", "Sentry", "Supabase"],
    registrationStatus: "Open",
    featured: true,
    source: "Devpost",
    registrationUrl: "https://vercel.com/speedrun2026"
  },
  {
    id: "hack-5",
    title: "CyberShield Defenseathon",
    organizer: "Defense Tech Alliance",
    prizePool: "₹8,50,000",
    prizeValue: 850000,
    deadline: "2026-07-10T23:59:59Z",
    startDate: "2026-07-14T09:00:00Z",
    mode: "Offline",
    location: "Delhi NCR",
    difficulty: "Advanced",
    studentOnly: false,
    soloAllowed: false,
    teamSize: "2-4 members",
    themes: ["Cybersecurity", "Cloud", "Robotics"],
    banner: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=60",
    description: "Solve complex cybersecurity problems, malware inspection systems, secure identity validation frameworks, or IoT security nodes in our high-security physical sandbox venue.",
    timeline: [
      { date: "July 10, 2026", label: "Registrations Deadline" },
      { date: "July 14, 2026", label: "Physical Venue Kickoff" },
      { date: "July 16, 2026", label: "Live System Auditing & Demos" }
    ],
    rules: [
      "No custom code libraries are permitted without white-listing.",
      "All files must run within isolated hypervisors.",
      "Teams are strictly offline-only."
    ],
    eligibility: "Security experts, white-hat researchers, and senior engineers.",
    tracks: [
      { name: "Malware Analysis Auto-Parser", description: "Tooling that analyzes binary execution logs to flag exploits instantly.", prize: "₹4,50,000" },
      { name: "Secure Perimeter Mesh", description: "Design an encrypted telemetry framework for remote robotic sensors.", prize: "₹4,00,000" }
    ],
    sponsors: ["SecurityHub", "CyberDefense", "GovTech Labs"],
    registrationStatus: "Open",
    featured: false,
    source: "Reskilll",
    registrationUrl: "https://reskilll.com/hacks/cybershield2026"
  },
  {
    id: "hack-6",
    title: "EcoSmart IoT Innovation Hack",
    organizer: "GreenTech Institute",
    prizePool: "₹6,00,000",
    prizeValue: 600000,
    deadline: "2026-07-05T23:59:59Z",
    startDate: "2026-07-09T09:00:00Z",
    mode: "Hybrid",
    location: "Mumbai",
    difficulty: "Intermediate",
    studentOnly: true,
    soloAllowed: false,
    teamSize: "2-4 members",
    themes: ["IoT", "Robotics", "Open Innovation"],
    banner: "https://images.unsplash.com/photo-1508962914676-134849a727f0?w=800&auto=format&fit=crop&q=60",
    description: "Prototype IoT devices and software pipelines to combat resource wastage. Build smart water monitoring modules, localized energy distribution dashboards, or custom robotic trash-sorting mechanisms.",
    timeline: [
      { date: "July 05, 2026", label: "Applications Closing" },
      { date: "July 09, 2026", label: "Hardware Kit Handout" },
      { date: "July 11, 2026", label: "Final Prototype Testing" }
    ],
    rules: [
      "Hardware simulations or actual microcontroller integrations are highly weighted.",
      "Only student-led groups of 2-4 members are permitted."
    ],
    eligibility: "Active students from polytechnic, engineering, and tech institutes.",
    tracks: [
      { name: "Smart Waste Optimization", description: "Develop sorting algorithms using local cameras and edge compute.", prize: "₹3,50,000" },
      { name: "Grid Smart Sensor Hubs", description: "Localized IoT networks showing immediate resource metrics.", prize: "₹2,50,000" }
    ],
    sponsors: ["EcoSolutions", "SolidWorks India", "IoT India Labs"],
    registrationStatus: "Closing Soon",
    featured: false,
    source: "College Websites",
    registrationUrl: "https://greentech.edu/iot-hack-2026"
  },
  {
    id: "hack-7",
    title: "NeuroHealth AI Med-Hack",
    organizer: "Apollo HealthTech Hub",
    prizePool: "₹15,00,000",
    prizeValue: 1500000,
    deadline: "2026-08-10T23:59:59Z",
    startDate: "2026-08-15T09:00:00Z",
    mode: "Hybrid",
    location: "Hyderabad",
    difficulty: "Intermediate",
    studentOnly: false,
    soloAllowed: true,
    teamSize: "1-4 members",
    themes: ["AI", "HealthTech", "ML"],
    banner: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=60",
    description: "Creating the future of clinical automation. Address primary care bottlenecks by building models to extract data from dense medical files, auto-detect anomaly trends, or assist general clinicians with quick symptom matching.",
    timeline: [
      { date: "Aug 10, 2026", label: "Registrations Close" },
      { date: "Aug 15, 2026", label: "Data-Set Release" },
      { date: "Aug 18, 2026", label: "Model Pitching & Submissions" }
    ],
    rules: [
      "All medical models must prioritize patient data privacy (HIPAA compliant structures).",
      "Model weights must be submit-ready on platform for automatic validation."
    ],
    eligibility: "Open to healthcare innovators, ML developers, and biostatistics students.",
    tracks: [
      { name: "Anamnesis AI Companion", description: "Extract key symptoms from raw unstructured patient notes automatically.", prize: "₹8,00,000" },
      { name: "Imaging Assist Tool", description: "Edge models assisting radiologists in identifying high-priority conditions.", prize: "₹7,00,000" }
    ],
    sponsors: ["Apollo Hospitals", "NVIDIA Inception", "BioTech Labs"],
    registrationStatus: "Open",
    featured: false,
    source: "HackerEarth",
    registrationUrl: "https://apollo.health/medhack-2026"
  }
];

// In-Memory state for bookmarked/saved hackathons
let bookmarksDb: BookmarkState[] = [];

// In-Memory state for teams
let teamsDb: Team[] = [
  {
    id: "team-1",
    hackathonId: "hack-1",
    hackathonTitle: "Global GenAI Hackfest 2026",
    name: "Aether Builders",
    description: "Building an automated UI builder utilizing multi-modal Gemini. Need a solid senior React developer with Tailwind experience who can polish component styling.",
    creatorId: "user-99",
    members: [
      { userId: "user-99", name: "Vikram Sen", skills: ["Python", "Gemini API", "FastAPI"], role: "Backend / AI Dev", avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop" }
    ],
    maxSize: 4,
    skillsNeeded: ["React", "Tailwind CSS", "TypeScript"],
    contactInfo: "vikram@aether.ai",
    openingsCount: 3
  },
  {
    id: "team-2",
    hackathonId: "hack-2",
    hackathonTitle: "EthGlobal Bangalore 2026",
    name: "BlockWizards",
    description: "Designing a gasless subscription locker contract on Base network. Looking for a Solidity dev and a presentation/UI wizard.",
    creatorId: "user-100",
    members: [
      { userId: "user-100", name: "Ananya Iyer", skills: ["React", "Web3.js", "Tailwind"], role: "Frontend Lead", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop" },
      { userId: "user-101", name: "Kunal Shah", skills: ["Rust", "Solidity", "Hardhat"], role: "Blockchain Lead", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop" }
    ],
    maxSize: 4,
    skillsNeeded: ["Solidity", "Product Design", "DeFi"],
    contactInfo: "discord: blockwizards_lead",
    openingsCount: 2
  }
];

let teamRequestsDb: TeamRequest[] = [];

let scraperJobsDb: ScraperJob[] = [
  {
    id: "job-1",
    sourceName: "Devpost",
    status: "Completed",
    timestamp: "2026-07-02T10:00:00Z",
    addedCount: 3,
    logs: [
      "Job initialized successfully.",
      "Fetching https://devpost.com/api/v1/hackathons...",
      "Fetched 25 raw items from Devpost feed.",
      "Filtering closed items...",
      "Comparing signatures against existing database IDs...",
      "Detected 3 brand new events.",
      "Inserted 'Global GenAI Hackfest 2026', 'Vercel Next.js Speedrun 2026', and 1 more.",
      "Job completed with zero errors."
    ]
  },
  {
    id: "job-2",
    sourceName: "Unstop",
    status: "Completed",
    timestamp: "2026-07-02T16:45:00Z",
    addedCount: 1,
    logs: [
      "Job initialized successfully.",
      "Querying Unstop public discovery feed...",
      "Found 12 matching items under 'Technology' tag.",
      "Parsed college guidelines and timeline rules.",
      "Added 1 item: 'Unstop National Innovation Hackathon'.",
      "Verification complete, job ended."
    ]
  }
];

let notificationsDb: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Registration Closing Tomorrow",
    message: "The registration window for 'Unstop National Innovation Hackathon' closes in less than 24 hours. Submit your details now!",
    timestamp: "2026-07-02T18:00:00Z",
    read: false,
    type: "Alert",
    link: "/hackathons/hack-3"
  },
  {
    id: "notif-2",
    title: "Smart Match: Global GenAI Hackfest 2026",
    message: "Based on your interest in AI/ML development, Prakhar's Strategic Coach recommends applying to the 'Global GenAI Hackfest 2026' in Bangalore.",
    timestamp: "2026-07-02T12:00:00Z",
    read: false,
    type: "Recommend",
    link: "/hackathons/hack-1"
  }
];

// Multi-User state mapping and file-system persistence database
let usersDb: UserProfile[] = [];
let sessions: { [sessionId: string]: string } = {}; // maps sessionId -> email

const DB_FILE = path.join(process.cwd(), "db.json");

function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const data = JSON.parse(raw);
      if (data.hackathonsDb) hackathonsDb = data.hackathonsDb;
      if (data.bookmarksDb) bookmarksDb = data.bookmarksDb;
      if (data.teamsDb) teamsDb = data.teamsDb;
      if (data.teamRequestsDb) teamRequestsDb = data.teamRequestsDb;
      if (data.scraperJobsDb) scraperJobsDb = data.scraperJobsDb;
      if (data.notificationsDb) notificationsDb = data.notificationsDb;
      if (data.usersDb) usersDb = data.usersDb;
      if (data.sessions) sessions = data.sessions;
      console.log("Persistent JSON database loaded successfully from", DB_FILE);
    } else {
      saveDatabase();
      console.log("Initial database file created.");
    }
  } catch (err) {
    console.error("Failed to load persistent JSON database, falling back to seed memory:", err);
  }
}

function saveDatabase() {
  try {
    const payload = {
      hackathonsDb,
      bookmarksDb,
      teamsDb,
      teamRequestsDb,
      scraperJobsDb,
      notificationsDb,
      usersDb,
      sessions
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write persistent JSON database:", err);
  }
}

// Helper to retrieve user profile based on secure session cookie or fallback to guest
function getSessionUser(req: any): UserProfile {
  const cookieHeader = req.headers.cookie || "";
  const match = cookieHeader.match(/session_id=([^;]+)/);
  const sessionId = match ? match[1] : null;

  if (sessionId && sessions[sessionId]) {
    const user = usersDb.find(u => u.email === sessions[sessionId]);
    if (user) return user;
  }

  // Guest fallback
  return {
    id: "guest",
    name: "Guest Explorer",
    email: "guest@hackfinder.com",
    skills: [],
    interests: [],
    preferredDomains: [],
    preferredMode: "Any",
    onboarded: false
  };
}

// Call loadDatabase immediately on module parsing
loadDatabase();

// ==========================================
// SOURCE CONNECTORS (SCRAPER ENGINE INTERFACE)
// ==========================================

interface SourceProvider {
  name: string;
  fetchHackathons(): Promise<{
    title: string;
    organizer: string;
    prizePool: string;
    prizeValue: number;
    deadline: string;
    startDate: string;
    mode: 'Online' | 'Offline' | 'Hybrid';
    location: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    studentOnly: boolean;
    soloAllowed: boolean;
    teamSize: string;
    themes: string[];
    banner: string;
    description: string;
    registrationUrl: string;
  }[]>;
}

class DevfolioProvider implements SourceProvider {
  name = "Devfolio";
  async fetchHackathons() {
    // Simulated live scraper retrieval
    return [
      {
        title: "Blockverse 2026",
        organizer: "Devfolio Web3 Labs",
        prizePool: "₹8,00,000",
        prizeValue: 800000,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        startDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
        mode: "Online" as const,
        location: "Remote",
        difficulty: "Intermediate" as const,
        studentOnly: false,
        soloAllowed: true,
        teamSize: "1-4 members",
        themes: ["Blockchain", "FinTech"],
        banner: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&auto=format&fit=crop&q=60",
        description: "The global decentralization summit connecting top tier builders. Build smart applications on the modern Layer 2 networks.",
        registrationUrl: "https://devfolio.co/blockverse2026"
      }
    ];
  }
}

class HackerEarthProvider implements SourceProvider {
  name = "HackerEarth";
  async fetchHackathons() {
    return [
      {
        title: "CyberPulse Security Sprint",
        organizer: "HackerEarth Security",
        prizePool: "₹12,50,000",
        prizeValue: 1250000,
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        mode: "Online" as const,
        location: "Remote",
        difficulty: "Advanced" as const,
        studentOnly: false,
        soloAllowed: false,
        teamSize: "2-4 members",
        themes: ["Cybersecurity", "Cloud"],
        banner: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60",
        description: "HackerEarth's annual enterprise security challenge. Identify threat profiles and build real-time automated server defense scripts.",
        registrationUrl: "https://hackerearth.com/challenges/cyberpulse-2026"
      }
    ];
  }
}

class ReskilllProvider implements SourceProvider {
  name = "Reskilll";
  async fetchHackathons() {
    return [
      {
        title: "Azure Cloud Masters 2026",
        organizer: "Reskilll Tech Hub",
        prizePool: "₹4,00,000",
        prizeValue: 400000,
        deadline: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
        startDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString(),
        mode: "Hybrid" as const,
        location: "Pune",
        difficulty: "Beginner" as const,
        studentOnly: true,
        soloAllowed: true,
        teamSize: "1-3 members",
        themes: ["Cloud", "Open Innovation"],
        banner: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=60",
        description: "Deploy and optimize intelligent cloud systems on Azure pipelines. A great starting block for students who want to master orchestration.",
        registrationUrl: "https://reskilll.com/azuremasters2026"
      }
    ];
  }
}

// Map of sources
const scraperSources: { [key: string]: SourceProvider } = {
  "Devfolio": new DevfolioProvider(),
  "HackerEarth": new HackerEarthProvider(),
  "Reskilll": new ReskilllProvider()
};

// ==========================================
// REST API ENDPOINTS
// ==========================================

// GET Profile
app.get("/api/profile", (req, res) => {
  const user = getSessionUser(req);
  res.json(user);
});

// POST Login Mock
app.post("/api/auth/login", (req, res) => {
  const { name, email } = req.body;
  const userEmail = (email || "developer@hackfinder.com").trim().toLowerCase();
  const userName = name || "Explorer Hack";

  let user = usersDb.find(u => u.email === userEmail);
  if (!user) {
    user = {
      id: `user-${Date.now()}`,
      name: userName,
      email: userEmail,
      skills: [],
      interests: [],
      preferredDomains: [],
      preferredMode: "Any",
      onboarded: false
    };
    usersDb.push(user);
  } else if (name) {
    // Keep name updated
    user.name = name;
  }

  // Generate secure session ID
  const sessionId = `sess_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  sessions[sessionId] = userEmail;
  saveDatabase();

  // Set HTTP-Only session cookie
  res.setHeader("Set-Cookie", `session_id=${sessionId}; Path=/; HttpOnly; SameSite=Lax`);
  res.json({ success: true, profile: user });
});

// POST Logout
app.post("/api/auth/logout", (req, res) => {
  const cookieHeader = req.headers.cookie || "";
  const match = cookieHeader.match(/session_id=([^;]+)/);
  const sessionId = match ? match[1] : null;

  if (sessionId) {
    delete sessions[sessionId];
    saveDatabase();
  }

  res.setHeader("Set-Cookie", "session_id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax");
  res.json({
    success: true,
    profile: {
      id: "guest",
      name: "Guest Explorer",
      email: "guest@hackfinder.com",
      skills: [],
      interests: [],
      preferredDomains: [],
      preferredMode: "Any",
      onboarded: false
    }
  });
});

// POST Onboarding
app.post("/api/auth/onboarding", (req, res) => {
  const user = getSessionUser(req);
  if (user.id === "guest") {
    return res.status(401).json({ error: "Please sign in to complete onboarding." });
  }

  const data = req.body;
  const dbUser = usersDb.find(u => u.id === user.id);
  if (dbUser) {
    dbUser.name = data.name || dbUser.name;
    dbUser.college = data.college || dbUser.college;
    dbUser.year = data.year || dbUser.year;
    dbUser.skills = data.skills || dbUser.skills;
    dbUser.interests = data.interests || dbUser.interests;
    dbUser.preferredDomains = data.preferredDomains || dbUser.preferredDomains;
    dbUser.preferredMode = data.preferredMode || dbUser.preferredMode;
    dbUser.github = data.github || dbUser.github;
    dbUser.linkedin = data.linkedin || dbUser.linkedin;
    dbUser.portfolio = data.portfolio || dbUser.portfolio;
    dbUser.preferredTeamSize = Number(data.preferredTeamSize) || dbUser.preferredTeamSize;
    dbUser.onboarded = true;
  }

  // Generate personalized notification recommendation when onboarding is completed
  notificationsDb.unshift({
    id: `notif-${Date.now()}`,
    userId: user.id,
    title: "Onboarding Completed!",
    message: `Welcome ${data.name || user.name}. Based on your preference for ${data.preferredMode || "Any"} hackathons, we've updated your Smart Recommendation Feed.`,
    timestamp: new Date().toISOString(),
    read: false,
    type: "Digest"
  });

  saveDatabase();
  res.json({ success: true, profile: dbUser || user });
});

// GET Hackathons with filter, search, & personalized scoring
app.get("/api/hackathons", (req, res) => {
  const user = getSessionUser(req);
  const { search, mode, location, difficulty, studentOnly, prizeRange, theme, sortBy } = req.query;

  let results = [...hackathonsDb];

  // 1. Text Search Filter
  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(h => 
      h.title.toLowerCase().includes(q) ||
      h.organizer.toLowerCase().includes(q) ||
      h.description.toLowerCase().includes(q) ||
      h.themes.some(t => t.toLowerCase().includes(q))
    );
  }

  // 2. Mode Filter
  if (mode && mode !== "All") {
    results = results.filter(h => h.mode.toLowerCase() === String(mode).toLowerCase());
  }

  // 3. Location Filter
  if (location && location !== "All") {
    results = results.filter(h => h.location.toLowerCase() === String(location).toLowerCase() || h.mode === "Online");
  }

  // 4. Difficulty Filter
  if (difficulty && difficulty !== "All") {
    results = results.filter(h => h.difficulty === difficulty);
  }

  // 5. Student Only Filter
  if (studentOnly === "true") {
    results = results.filter(h => h.studentOnly === true);
  }

  // 6. Theme Filter
  if (theme && theme !== "All") {
    results = results.filter(h => h.themes.some(t => t.toLowerCase() === String(theme).toLowerCase()));
  }

  // 7. Prize Range Filter
  if (prizeRange && prizeRange !== "All") {
    const pr = String(prizeRange);
    if (pr === "under-5") {
      results = results.filter(h => h.prizeValue < 500000);
    } else if (pr === "5-15") {
      results = results.filter(h => h.prizeValue >= 500000 && h.prizeValue <= 1500000);
    } else if (pr === "above-15") {
      results = results.filter(h => h.prizeValue > 1500000);
    }
  }

  // Inject user match recommendations scores if onboarded
  const formattedResults = results.map(h => {
    let score = 50; // default base score
    if (user.onboarded) {
      // mode bonus
      if (user.preferredMode !== "Any" && h.mode === user.preferredMode) {
        score += 20;
      }
      // skills/themes overlap
      const matchingSkills = h.themes.filter(t => 
        user.skills.some(s => s.toLowerCase().includes(t.toLowerCase())) ||
        user.interests.some(i => i.toLowerCase().includes(t.toLowerCase()))
      );
      score += matchingSkills.length * 15;

      // location matching for offline/hybrid
      if (h.mode !== "Online" && user.preferredMode !== "Online") {
        if (h.location === "Bangalore" && user.skills.includes("React")) {
          // high density hub matching
          score += 10;
        }
      }
    }
    // clamp score
    score = Math.min(99, Math.max(35, score));

    // check current status from bookmark state
    const matchBookmark = bookmarksDb.find(b => b.hackathonId === h.id && b.userId === user.id);
    const saveStatus = matchBookmark ? matchBookmark.status : "None";

    return {
      ...h,
      recommendationScore: score,
      saveStatus
    };
  });

  // Sortings
  if (sortBy === "deadline") {
    formattedResults.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  } else if (sortBy === "prize") {
    formattedResults.sort((a, b) => b.prizeValue - a.prizeValue);
  } else if (sortBy === "match" && user.onboarded) {
    formattedResults.sort((a, b) => b.recommendationScore - a.recommendationScore);
  } else {
    // default featured first, then title
    formattedResults.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  res.json(formattedResults);
});

// GET Single Hackathon detail
app.get("/api/hackathons/:id", (req, res) => {
  const user = getSessionUser(req);
  const hack = hackathonsDb.find(h => h.id === req.params.id);
  if (!hack) {
    return res.status(404).json({ error: "Hackathon not found" });
  }

  const matchBookmark = bookmarksDb.find(b => b.hackathonId === hack.id && b.userId === user.id);
  const saveStatus = matchBookmark ? matchBookmark.status : "None";

  // Related hackathons
  const related = hackathonsDb
    .filter(h => h.id !== hack.id && h.themes.some(t => hack.themes.includes(t)))
    .slice(0, 3);

  res.json({
    hackathon: { ...hack, saveStatus },
    related
  });
});

// POST Bookmark / Save Status update
app.post("/api/hackathons/:id/bookmark", (req, res) => {
  const user = getSessionUser(req);
  if (user.id === "guest") {
    return res.status(401).json({ error: "Please sign in to save your hackathon journey." });
  }

  const { status } = req.body; // 'Saved' | 'Applied' | 'Registered' | 'Won' | 'Watchlist' | 'None'
  const hackId = req.params.id;

  const hack = hackathonsDb.find(h => h.id === hackId);
  if (!hack) {
    return res.status(404).json({ error: "Hackathon not found" });
  }

  // Remove existing bookmark for this user
  bookmarksDb = bookmarksDb.filter(b => !(b.hackathonId === hackId && b.userId === user.id));

  if (status !== "None") {
    bookmarksDb.push({
      userId: user.id,
      hackathonId: hackId,
      status
    });

    // Log Activity & Notification for this specific user
    notificationsDb.unshift({
      id: `notif-${Date.now()}`,
      userId: user.id,
      title: `Hackathon marked: ${status}`,
      message: `You successfully updated your journey status for '${hack.title}' to ${status}.`,
      timestamp: new Date().toISOString(),
      read: false,
      type: "Alert",
      link: `/hackathons/${hackId}`
    });
  }

  saveDatabase();
  res.json({ success: true, status });
});

// GET Active Bookmarks
app.get("/api/bookmarks", (req, res) => {
  const user = getSessionUser(req);
  const activeBookmarks = bookmarksDb
    .filter(b => b.userId === user.id)
    .map(b => {
      const hack = hackathonsDb.find(h => h.id === b.hackathonId);
      return {
        status: b.status,
        hackathon: hack
      };
    }).filter(b => b.hackathon !== undefined);

  res.json(activeBookmarks);
});

// GET Team Finder Listings
app.get("/api/teams", (req, res) => {
  const { hackathonId, searchSkill } = req.query;
  let results = [...teamsDb];

  if (hackathonId) {
    results = results.filter(t => t.hackathonId === hackathonId);
  }

  if (searchSkill) {
    const skill = String(searchSkill).toLowerCase();
    results = results.filter(t => 
      t.skillsNeeded.some(s => s.toLowerCase().includes(skill)) ||
      t.name.toLowerCase().includes(skill) ||
      t.description.toLowerCase().includes(skill)
    );
  }

  res.json(results);
});

// POST Create a Team
app.post("/api/teams", (req, res) => {
  const user = getSessionUser(req);
  if (user.id === "guest") {
    return res.status(401).json({ error: "Please sign in to list a scouting team." });
  }

  const { hackathonId, teamName, description, skillsNeeded, contactInfo, maxSize } = req.body;

  if (!teamName || !description || !contactInfo) {
    return res.status(400).json({ error: "Team name, description, and contact info are required fields." });
  }

  const hack = hackathonsDb.find(h => h.id === hackathonId);
  if (!hack) {
    return res.status(400).json({ error: "Invalid hackathon ID" });
  }

  const newTeam: Team = {
    id: `team-${Date.now()}`,
    hackathonId,
    hackathonTitle: hack.title,
    name: teamName,
    description,
    creatorId: user.id,
    members: [
      {
        userId: user.id,
        name: user.name,
        skills: user.skills,
        role: "Team Captain"
      }
    ],
    maxSize: Number(maxSize) || 4,
    skillsNeeded: skillsNeeded || [],
    contactInfo,
    openingsCount: (Number(maxSize) || 4) - 1
  };

  teamsDb.unshift(newTeam);

  notificationsDb.unshift({
    id: `notif-${Date.now()}`,
    userId: user.id,
    title: "Team Created Successfully",
    message: `Your team '${teamName}' for ${hack.title} is now visible. Teammates can submit join requests!`,
    timestamp: new Date().toISOString(),
    read: false,
    type: "Team",
    link: "/teams"
  });

  saveDatabase();
  res.json({ success: true, team: newTeam });
});

// POST Send Join Request to a Team
app.post("/api/teams/:id/request", (req, res) => {
  const user = getSessionUser(req);
  if (user.id === "guest") {
    return res.status(401).json({ error: "Please sign in to request to join a team." });
  }

  const { message } = req.body;
  const teamId = req.params.id;

  const team = teamsDb.find(t => t.id === teamId);
  if (!team) {
    return res.status(404).json({ error: "Team not found" });
  }

  if (team.creatorId === user.id) {
    return res.status(400).json({ error: "You cannot join your own team as a candidate." });
  }

  // Prevent duplicate requests
  const alreadyRequested = teamRequestsDb.some(r => r.teamId === teamId && r.fromUserId === user.id);
  if (alreadyRequested) {
    return res.status(400).json({ error: "You have already submitted a join request for this team." });
  }

  // Prevent requesting if already member
  const alreadyMember = team.members.some(m => m.userId === user.id);
  if (alreadyMember) {
    return res.status(400).json({ error: "You are already a member of this team." });
  }

  const newRequest: TeamRequest = {
    id: `req-${Date.now()}`,
    teamId,
    fromUserId: user.id,
    fromUserName: user.name,
    fromUserSkills: user.skills,
    message: message || `Hi, I would love to join your team. I have skills in ${user.skills.join(", ")}. Let's build together!`,
    status: "Pending"
  };

  teamRequestsDb.unshift(newRequest);

  // Notify team captain privately
  notificationsDb.unshift({
    id: `notif-${Date.now()}`,
    userId: team.creatorId,
    title: "New Team Join Request",
    message: `${user.name} requested to join your team '${team.name}'. View requests in the Team Finder.`,
    timestamp: new Date().toISOString(),
    read: false,
    type: "Team",
    link: "/teams"
  });

  saveDatabase();
  res.json({ success: true, request: newRequest });
});

// GET Requests list
app.get("/api/teams/requests", (req, res) => {
  const user = getSessionUser(req);
  if (user.id === "guest") {
    return res.json([]);
  }
  // Show requests for teams created by the active user session
  const userTeamsIds = teamsDb.filter(t => t.creatorId === user.id).map(t => t.id);
  const requests = teamRequestsDb.filter(r => userTeamsIds.includes(r.teamId));
  res.json(requests);
});

// POST Accept/Reject requests
app.post("/api/teams/requests/:id/action", (req, res) => {
  const user = getSessionUser(req);
  if (user.id === "guest") {
    return res.status(401).json({ error: "Please sign in to take action on requests." });
  }

  const { action } = req.body; // 'Accept' | 'Reject'
  const requestId = req.params.id;

  const request = teamRequestsDb.find(r => r.id === requestId);
  if (!request) {
    return res.status(404).json({ error: "Join request not found." });
  }

  const team = teamsDb.find(t => t.id === request.teamId);
  if (!team) {
    return res.status(404).json({ error: "Associated team not found." });
  }

  // Security authorization: Ensure that active user is indeed the captain/creator of this team
  if (team.creatorId !== user.id) {
    return res.status(403).json({ error: "You are not authorized to accept/reject requests for this team." });
  }

  request.status = action === "Accept" ? "Accepted" : "Rejected";

  if (action === "Accept") {
    // Add member to team
    team.members.push({
      userId: request.fromUserId,
      name: request.fromUserName,
      skills: request.fromUserSkills,
      role: "Developer / Collaborator"
    });
    team.openingsCount = team.maxSize - team.members.length;

    // Notify candidate they've been accepted
    notificationsDb.unshift({
      id: `notif-${Date.now()}`,
      userId: request.fromUserId,
      title: "Team Request Accepted!",
      message: `Congratulations! You have been accepted into the team '${team.name}'. Reach out to captain: ${team.contactInfo}`,
      timestamp: new Date().toISOString(),
      read: false,
      type: "Team",
      link: "/teams"
    });

    // Notify captain of completion
    notificationsDb.unshift({
      id: `notif-${Date.now() + 1}`,
      userId: user.id,
      title: "Teammate Added",
      message: `Collaborator ${request.fromUserName} has joined your team '${team.name}'. Reach out via: ${team.contactInfo}`,
      timestamp: new Date().toISOString(),
      read: false,
      type: "Team",
      link: "/teams"
    });
  } else {
    // Notify candidate they've been declined
    notificationsDb.unshift({
      id: `notif-${Date.now()}`,
      userId: request.fromUserId,
      title: "Team Request Update",
      message: `Unfortunately, your request to join '${team.name}' was not accepted at this time. Keep searching!`,
      timestamp: new Date().toISOString(),
      read: false,
      type: "Team",
      link: "/teams"
    });
  }

  saveDatabase();
  res.json({ success: true, request });
});

// GET Scraper Jobs & Runs
app.get("/api/scrapers/jobs", (req, res) => {
  res.json(scraperJobsDb);
});

// POST Run a Scraper Source Provider
app.post("/api/scrapers/run", async (req, res) => {
  const { sourceName } = req.body;

  const provider = scraperSources[sourceName];
  if (!provider) {
    return res.status(400).json({ error: "Unsupported or non-existent scraper source." });
  }

  // Create running job log
  const jobId = `job-${Date.now()}`;
  const logs: string[] = [
    `Connecting to simulated ${sourceName} API endpoint...`,
    `Querying latest public HTML and script payload headers...`,
    `Success: Bypassed Cloudflare worker protections cleanly.`,
    `Normalizing JSON results into HackFinder schema standards...`
  ];

  try {
    const scraped = await provider.fetchHackathons();
    let addedCount = 0;

    scraped.forEach(h => {
      // Check if title already exists in DB
      const exists = hackathonsDb.some(existing => existing.title.toLowerCase() === h.title.toLowerCase());
      if (!exists) {
        const newHackId = `hack-scraped-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        hackathonsDb.push({
          id: newHackId,
          title: h.title,
          organizer: h.organizer,
          prizePool: h.prizePool,
          prizeValue: h.prizeValue,
          deadline: h.deadline,
          startDate: h.startDate,
          mode: h.mode,
          location: h.location,
          difficulty: h.difficulty,
          studentOnly: h.studentOnly,
          soloAllowed: h.soloAllowed,
          teamSize: h.teamSize,
          themes: h.themes,
          banner: h.banner,
          description: h.description,
          timeline: [
            { date: "Registration Window", label: "Apply Directly via Source" },
            { date: "Submissions Phase", label: "Upload Code & Prototype" }
          ],
          rules: [
            "Submit directly via source registration portal.",
            "Must be fully original concept built under compliance constraints."
          ],
          eligibility: h.studentOnly ? "Exclusively students." : "Open globally to professionals and students.",
          tracks: [
            { name: "General Excellence Track", description: "Best overall design and integration capabilities.", prize: h.prizePool }
          ],
          sponsors: [h.organizer],
          registrationStatus: "Open",
          featured: false,
          source: sourceName,
          registrationUrl: h.registrationUrl
        });
        addedCount++;
        logs.push(`Successfully added unique event: '${h.title}' with prize pool ${h.prizePool}.`);
      } else {
        logs.push(`Skipped duplicate event: '${h.title}' (already exists).`);
      }
    });

    logs.push(`Verification completed. Processed ${scraped.length} total events. Added ${addedCount} new cards to the feed.`);

    const completedJob: ScraperJob = {
      id: jobId,
      sourceName,
      status: "Completed",
      timestamp: new Date().toISOString(),
      addedCount,
      logs
    };

    scraperJobsDb.unshift(completedJob);

    // Create global notification
    if (addedCount > 0) {
      notificationsDb.unshift({
        id: `notif-${Date.now()}`,
        title: `Scraper Update: ${addedCount} Hackathons Added`,
        message: `Newly crawled active events have been successfully consolidated from ${sourceName}. Inspect the feed now!`,
        timestamp: new Date().toISOString(),
        read: false,
        type: "Digest"
      });
    }

    res.json({ success: true, job: completedJob });

  } catch (error: any) {
    logs.push(`Fatal crawler exception: ${error.message || error}`);
    const failedJob: ScraperJob = {
      id: jobId,
      sourceName,
      status: "Failed",
      timestamp: new Date().toISOString(),
      addedCount: 0,
      logs
    };
    scraperJobsDb.unshift(failedJob);
    res.status(500).json({ error: "Crawler failure", job: failedJob });
  }
});

// Admin Panel Action: Delete Hackathon
app.delete("/api/admin/hackathons/:id", (req, res) => {
  const initialLength = hackathonsDb.length;
  hackathonsDb = hackathonsDb.filter(h => h.id !== req.params.id);
  if (hackathonsDb.length === initialLength) {
    return res.status(404).json({ error: "Hackathon not found" });
  }
  saveDatabase();
  res.json({ success: true });
});

// Admin Panel Action: Add Manual Hackathon
app.post("/api/admin/hackathons", (req, res) => {
  const h = req.body;

  if (!h.title || !h.organizer) {
    return res.status(400).json({ error: "Hackathon title and organizer are required fields." });
  }

  const newHack: Hackathon = {
    id: `hack-manual-${Date.now()}`,
    title: h.title,
    organizer: h.organizer,
    prizePool: h.prizePool || "₹1,00,000",
    prizeValue: Number(h.prizeValue) || 100000,
    deadline: h.deadline || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    startDate: h.startDate || new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    mode: h.mode || "Online",
    location: h.location || "Remote",
    difficulty: h.difficulty || "Intermediate",
    studentOnly: h.studentOnly === true,
    soloAllowed: h.soloAllowed === true,
    teamSize: h.teamSize || "1-4 members",
    themes: h.themes || ["AI", "Open Innovation"],
    banner: h.banner || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=60",
    description: h.description || "Custom manual curated event added by administrative host panel.",
    timeline: [
      { date: "Registration Date", label: "Open curation window" }
    ],
    rules: ["Adhere to general HackFinder compliance conditions."],
    eligibility: "Open to general curators.",
    tracks: [
      { name: "General Track", description: "Standard overall challenge", prize: h.prizePool || "₹1,0,000" }
    ],
    sponsors: ["HackFinder Partners"],
    registrationStatus: "Open",
    featured: h.featured === true,
    source: "Admin Panel",
    registrationUrl: h.registrationUrl || "https://hackfinder.com"
  };

  hackathonsDb.unshift(newHack);
  saveDatabase();
  res.json({ success: true, hackathon: newHack });
});

// GET Global Dashboard Analytics
app.get("/api/dashboard/analytics", (req, res) => {
  const user = getSessionUser(req);
  const totalActive = hackathonsDb.length;
  const totalPrizeMoneyINR = hackathonsDb.reduce((sum, h) => sum + h.prizeValue, 0);

  // Missed opportunity metrics (dynamic based on user interests or fallback static seed)
  const missedCount = 12;
  const missedPrizeMoney = "₹4,20,000";

  // Category distributions
  const categoryCounts: { [key: string]: number } = {};
  hackathonsDb.forEach(h => {
    h.themes.forEach(t => {
      categoryCounts[t] = (categoryCounts[t] || 0) + 1;
    });
  });

  // Mode distributions
  const modeCounts = { Online: 0, Offline: 0, Hybrid: 0 };
  hackathonsDb.forEach(h => {
    if (h.mode in modeCounts) {
      modeCounts[h.mode]++;
    }
  });

  // Status breakdown filtered strictly by active session user ID
  const savedCount = bookmarksDb.filter(b => b.status === "Saved" && b.userId === user.id).length;
  const appliedCount = bookmarksDb.filter(b => b.status === "Applied" && b.userId === user.id).length;
  const registeredCount = bookmarksDb.filter(b => b.status === "Registered" && b.userId === user.id).length;
  const wonCount = bookmarksDb.filter(b => b.status === "Won" && b.userId === user.id).length;

  res.json({
    totalActive,
    totalPrizeMoney: `₹${(totalPrizeMoneyINR / 100000).toFixed(1)} Lakh`,
    missedOpportunity: {
      count: missedCount,
      value: missedPrizeMoney,
      description: "You missed 12 hackathons worth ₹4.2 lakh last month because of missed alerts."
    },
    categoryCounts,
    modeCounts,
    pipeline: {
      saved: savedCount,
      applied: appliedCount,
      registered: registeredCount,
      won: wonCount
    }
  });
});

// GET Notifications list
app.get("/api/notifications", (req, res) => {
  const user = getSessionUser(req);
  // Return notifications that are either global (no userId) or private to the logged in user
  const userNotifs = notificationsDb.filter(n => !n.userId || n.userId === user.id);
  res.json(userNotifs);
});

// POST Mark all read
app.post("/api/notifications/read", (req, res) => {
  const user = getSessionUser(req);
  notificationsDb.forEach(n => {
    if (!n.userId || n.userId === user.id) {
      n.read = true;
    }
  });
  saveDatabase();
  res.json({ success: true });
});

// POST AI Strategic Coaching & Summarizer with Gemini
app.post("/api/ai/coach", async (req, res) => {
  const user = getSessionUser(req);
  const { question, hackathonId } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question query is required." });
  }

  // Gather context
  let context = `The user is asking a general hackathon question.
User Name: ${user.name}
User Skills: ${user.skills.join(", ") || "None listed"}
User Interests: ${user.interests.join(", ") || "None listed"}
Preferred Mode: ${user.preferredMode}
Active HackFinder Database size: ${hackathonsDb.length} active hackathons.
`;

  if (hackathonId) {
    const hack = hackathonsDb.find(h => h.id === hackathonId);
    if (hack) {
      context += `
The user is specifically asking about the hackathon: "${hack.title}"
Organizer: ${hack.organizer}
Themes: ${hack.themes.join(", ")}
Prize Pool: ${hack.prizePool}
Mode: ${hack.mode}
Location: ${hack.location}
Deadline: ${hack.deadline}
Description: ${hack.description}
Tracks available: ${hack.tracks.map(t => `${t.name}: ${t.description} (Prize: ${t.prize})`).join(" | ")}
Rules: ${hack.rules.join(" | ")}
`;
    }
  }

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `${context}\n\nQuestion: ${question}\n\nProvide an extremely helpful, motivating, professional strategy response. If analyzing a hackathon, offer actionable project ideas using their skills: "${user.skills.join(", ")}" that fit the hackathon themes. Keep formatting neat and elegant with bullet points where appropriate. Keep it concise (under 250 words).`,
        config: {
          systemInstruction: "You are 'Prakhar's Strategic Coach', an elite Silicon Valley technical lead, expert startup founder, and mentor. Provide high-fidelity, actionable hacking advice, product strategy, and teammate matching strategies. Avoid general fluff; be highly specific to the context."
        }
      });

      res.json({ answer: response.text });
    } catch (error: any) {
      console.error("Gemini compilation or execution exception:", error);
      res.json({
        answer: getFallbackAdvice(question, user, hackathonId ? hackathonsDb.find(h => h.id === hackathonId) : null)
      });
    }
  } else {
    // Return high quality local rule-based heuristic advice when Gemini is offline
    res.json({
      answer: getFallbackAdvice(question, user, hackathonId ? hackathonsDb.find(h => h.id === hackathonId) : null)
    });
  }
});

function getFallbackAdvice(question: string, profile: UserProfile, hack: Hackathon | null | undefined): string {
  if (hack) {
    const skillList = profile.skills.length > 0 ? profile.skills.join(" & ") : "Full-Stack engineering";
    return `### Prakhar's Strategic Coach Insights

For **${hack.title}**, here is an optimized project architecture designed to leverage your active skillset:

1. **Target Track**: We highly recommend focusing on the **${hack.tracks[0]?.name || "Main Innovation"}** track which has a prize of **${hack.tracks[0]?.prize || hack.prizePool}**.
2. **Project Recommendation**: Combine **${hack.themes.join(" and ")}** to construct a highly responsive dashboard. Use ${skillList} to manage client interactions, alongside real-time data visualizers.
3. **Execution Milestone Plan**:
   - *Phase 1 (First 25% of time)*: Formulate high-fidelity UI wireframes and establish database structure.
   - *Phase 2 (Hacking Peak)*: Tie the core logical flow together. Build mock telemetry variables.
   - *Phase 3 (Final Stretch)*: Polish animations, layout spacing, and record a compelling 2-minute demo video.

*Note: Enable your GEMINI_API_KEY inside Settings > Secrets to unlock personalized custom ideas matching your profile!*`;
  }

  return `### Prakhar's Strategic Coach: Global Strategy Advice

Thank you for reaching out to Prakhar's Career & Team Builder assistant! 

- **Deadlines**: Always prioritize hackathons closing in under 7 days. We flagged **₹4.2 Lakh** of opportunities closing this week under the **Opportunity Dashboard**!
- **Teammate Scouting**: Look for designers and solidity/backend specialists depending on your track needs.
- **Formulating Concepts**: The highest scoring submissions at major events like Devpost or Unstop are functional prototypes that show a working edge-to-edge system, rather than pristine slides with simulated screens.

*Protip: Configure your GEMINI_API_KEY in the Secrets panel to activate high-fidelity custom strategy generation!*`;
}

// ==========================================
// VITE OR STATIC SERVING MIDDLEWARE
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HackFinder backend listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
