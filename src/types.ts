export interface Track {
  name: string;
  description: string;
  prize: string;
}

export interface TimelineItem {
  date: string;
  label: string;
}

export interface Hackathon {
  id: string;
  title: string;
  organizer: string;
  prizePool: string;
  prizeValue: number; // numeric value for sorting/filtering
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
  timeline: TimelineItem[];
  rules: string[];
  eligibility: string;
  tracks: Track[];
  sponsors: string[];
  registrationStatus: 'Open' | 'Closed' | 'Closing Soon';
  featured: boolean;
  source: string;
  registrationUrl: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  college?: string;
  year?: string;
  skills: string[];
  interests: string[];
  preferredDomains: string[];
  github?: string;
  linkedin?: string;
  portfolio?: string;
  preferredTeamSize?: number;
  preferredMode: 'Online' | 'Offline' | 'Hybrid' | 'Any';
  onboarded: boolean;
}

export interface TeamMember {
  userId: string;
  name: string;
  skills: string[];
  role: string;
  avatarUrl?: string;
}

export interface Team {
  id: string;
  hackathonId: string;
  hackathonTitle: string;
  name: string;
  description: string;
  creatorId: string;
  members: TeamMember[];
  maxSize: number;
  skillsNeeded: string[];
  contactInfo: string;
  openingsCount: number;
}

export interface TeamRequest {
  id: string;
  teamId: string;
  fromUserId: string;
  fromUserName: string;
  fromUserSkills: string[];
  message: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
}

export interface BookmarkState {
  userId?: string;
  hackathonId: string;
  status: 'Saved' | 'Applied' | 'Registered' | 'Won' | 'Watchlist' | 'None';
}

export interface ScraperJob {
  id: string;
  sourceName: string;
  status: 'Running' | 'Completed' | 'Failed';
  timestamp: string;
  addedCount: number;
  logs: string[];
}

export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'Alert' | 'Recommend' | 'Team' | 'Digest';
  link?: string;
}
