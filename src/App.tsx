import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Users,
  Award,
  Calendar,
  Layers,
  Sparkles,
  Bot,
  Terminal,
  Activity,
  Plus,
  ArrowRight,
  BookMarked,
  Share2,
  Lock,
  Compass,
  AlertCircle,
  Bell,
  Clock,
  ExternalLink,
  Check,
  ChevronRight,
  RefreshCw,
  Trash2,
  Briefcase,
  X,
  Target
} from 'lucide-react';
import { Hackathon, UserProfile, Team, TeamRequest, BookmarkState, ScraperJob, NotificationItem } from './types';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'landing' | 'discovery' | 'teams' | 'analytics' | 'scrapers' | 'admin'>('landing');
  
  // App Core State
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [user, setUser] = useState<UserProfile>({
    id: 'user-1',
    name: 'Guest Explorer',
    email: 'guest@hackfinder.com',
    skills: [],
    interests: [],
    preferredDomains: [],
    preferredMode: 'Any',
    onboarded: false
  });
  const [teams, setTeams] = useState<Team[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<TeamRequest[]>([]);
  const [scraperJobs, setScraperJobs] = useState<ScraperJob[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedHack, setSelectedHack] = useState<Hackathon | null>(null);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterMode, setFilterMode] = useState('All');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [filterTheme, setFilterTheme] = useState('All');
  const [filterPrizeRange, setFilterPrizeRange] = useState('All');
  const [filterStudentOnly, setFilterStudentOnly] = useState(false);
  const [sortBy, setSortBy] = useState('default');

  // Interactive Action UI States
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showAddHackModal, setShowAddHackModal] = useState(false);
  
  // Input states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginName, setLoginName] = useState('');
  
  // Onboarding states
  const [obName, setObName] = useState('');
  const [obCollege, setObCollege] = useState('');
  const [obYear, setObYear] = useState('2027');
  const [obSkills, setObSkills] = useState('React, TypeScript, Python');
  const [obInterests, setObInterests] = useState('AI, SaaS, UI Design');
  const [obDomains, setObDomains] = useState('FinTech, HealthTech');
  const [obMode, setObMode] = useState<'Online' | 'Offline' | 'Hybrid' | 'Any'>('Any');
  const [obGithub, setObGithub] = useState('');
  const [obLinkedin, setObLinkedin] = useState('');
  
  // Create Team states
  const [ctName, setCtName] = useState('');
  const [ctDesc, setCtDesc] = useState('');
  const [ctSkills, setCtSkills] = useState('React, Tailwind CSS, API Integration');
  const [ctContact, setCtContact] = useState('');
  const [ctMax, setCtMax] = useState('4');

  // Manual Add Hackathon states
  const [mhTitle, setMhTitle] = useState('');
  const [mhOrganizer, setMhOrganizer] = useState('');
  const [mhPrizePool, setMhPrizePool] = useState('₹2,50,000');
  const [mhPrizeValue, setMhPrizeValue] = useState('250000');
  const [mhMode, setMhMode] = useState<'Online' | 'Offline' | 'Hybrid'>('Online');
  const [mhLocation, setMhLocation] = useState('Remote');
  const [mhDifficulty, setMhDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [mhThemes, setMhThemes] = useState('AI, Cloud');
  const [mhDesc, setMhDesc] = useState('');
  const [mhRegUrl, setMhRegUrl] = useState('');

  // AI Strategic Coach state
  const [coachQuestion, setCoachQuestion] = useState('');
  const [coachAnswer, setCoachAnswer] = useState('');
  const [isCoachLoading, setIsCoachLoading] = useState(false);

  // Analytics pipeline summary
  const [analytics, setAnalytics] = useState({
    totalActive: 0,
    totalPrizeMoney: '₹0.0 Lakh',
    missedOpportunity: { count: 0, value: '₹0.0 Lakh', description: '' },
    categoryCounts: {} as { [key: string]: number },
    modeCounts: { Online: 0, Offline: 0, Hybrid: 0 },
    pipeline: { saved: 0, applied: 0, registered: 0, won: 0 }
  });

  // Crawler Action Trigger state
  const [runningScraper, setRunningScraper] = useState<string | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Core Profile & Jobs initially
  useEffect(() => {
    fetchProfile();
    fetchScrapers();
    fetchNotifications();
    fetchTeams();
  }, []);

  // Fetch hackathons & analytics whenever parameters change
  useEffect(() => {
    fetchHackathons();
    fetchAnalytics();
  }, [debouncedSearch, filterMode, filterLocation, filterDifficulty, filterTheme, filterPrizeRange, filterStudentOnly, sortBy, user.onboarded]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        if (data.onboarded) {
          setObName(data.name || '');
          setObCollege(data.college || '');
          setObYear(data.year || '2027');
          setObSkills(data.skills?.join(', ') || '');
          setObInterests(data.interests?.join(', ') || '');
          setObDomains(data.preferredDomains?.join(', ') || '');
          setObMode(data.preferredMode || 'Any');
          setObGithub(data.github || '');
          setObLinkedin(data.linkedin || '');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHackathons = async () => {
    try {
      const url = new URL('/api/hackathons', window.location.origin);
      if (debouncedSearch) url.searchParams.set('search', debouncedSearch);
      if (filterMode !== 'All') url.searchParams.set('mode', filterMode);
      if (filterLocation !== 'All') url.searchParams.set('location', filterLocation);
      if (filterDifficulty !== 'All') url.searchParams.set('difficulty', filterDifficulty);
      if (filterTheme !== 'All') url.searchParams.set('theme', filterTheme);
      if (filterPrizeRange !== 'All') url.searchParams.set('prizeRange', filterPrizeRange);
      if (filterStudentOnly) url.searchParams.set('studentOnly', 'true');
      if (sortBy !== 'default') url.searchParams.set('sortBy', sortBy);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setHackathons(data);
        // Refresh selected if open
        if (selectedHack) {
          const updated = data.find((h: Hackathon) => h.id === selectedHack.id);
          if (updated) setSelectedHack(updated);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await fetch('/api/teams');
      if (res.ok) {
        const data = await res.json();
        setTeams(data);
      }
      const reqsRes = await fetch('/api/teams/requests');
      if (reqsRes.ok) {
        const reqsData = await reqsRes.json();
        setIncomingRequests(reqsData);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchScrapers = async () => {
    try {
      const res = await fetch('/api/scrapers/jobs');
      if (res.ok) {
        const data = await res.json();
        setScraperJobs(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/dashboard/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: loginName || 'Anonymous', email: loginEmail })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.profile);
        setShowLoginModal(false);
        fetchNotifications();
        if (!data.profile.onboarded) {
          setShowOnboardingModal(true);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.profile);
        setNotifications([]);
        fetchHackathons();
        fetchAnalytics();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: obName || user.name,
      college: obCollege,
      year: obYear,
      skills: obSkills.split(',').map(s => s.trim()).filter(Boolean),
      interests: obInterests.split(',').map(s => s.trim()).filter(Boolean),
      preferredDomains: obDomains.split(',').map(s => s.trim()).filter(Boolean),
      preferredMode: obMode,
      github: obGithub,
      linkedin: obLinkedin
    };

    try {
      const res = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.profile);
        setShowOnboardingModal(false);
        fetchNotifications();
        fetchHackathons();
        fetchAnalytics();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBookmarkToggle = async (hackId: string, status: string) => {
    try {
      const res = await fetch(`/api/hackathons/${hackId}/bookmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchHackathons();
        fetchAnalytics();
        fetchNotifications();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHack) return;
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hackathonId: selectedHack.id,
          teamName: ctName,
          description: ctDesc,
          skillsNeeded: ctSkills.split(',').map(s => s.trim()).filter(Boolean),
          contactInfo: ctContact,
          maxSize: ctMax
        })
      });
      if (res.ok) {
        setCtName('');
        setCtDesc('');
        setShowCreateTeamModal(false);
        fetchTeams();
        fetchNotifications();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleJoinTeamRequest = async (teamId: string) => {
    try {
      const res = await fetch(`/api/teams/${teamId}/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `I'm interested in joining. My stack is ${user.skills.join(', ') || 'React'}. Let's build!` })
      });
      if (res.ok) {
        alert("Join request successfully submitted to Team Captain!");
        fetchTeams();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'Accept' | 'Reject') => {
    try {
      const res = await fetch(`/api/teams/requests/${requestId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        fetchTeams();
        fetchNotifications();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunScraper = async (sourceName: string) => {
    setRunningScraper(sourceName);
    try {
      const res = await fetch('/api/scrapers/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceName })
      });
      if (res.ok) {
        await fetchScrapers();
        await fetchHackathons();
        await fetchNotifications();
        await fetchAnalytics();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRunningScraper(null);
    }
  };

  const handleAddManualHack = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/hackathons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: mhTitle,
          organizer: mhOrganizer,
          prizePool: mhPrizePool,
          prizeValue: Number(mhPrizeValue),
          mode: mhMode,
          location: mhLocation,
          difficulty: mhDifficulty,
          themes: mhThemes.split(',').map(s => s.trim()).filter(Boolean),
          description: mhDesc,
          registrationUrl: mhRegUrl
        })
      });
      if (res.ok) {
        setMhTitle('');
        setMhOrganizer('');
        setMhDesc('');
        setShowAddHackModal(false);
        fetchHackathons();
        fetchAnalytics();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteHack = async (id: string) => {
    if (!confirm("Are you sure you want to remove this hackathon listing?")) return;
    try {
      const res = await fetch(`/api/admin/hackathons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedHack?.id === id) setSelectedHack(null);
        fetchHackathons();
        fetchAnalytics();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAICoach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachQuestion) return;
    setIsCoachLoading(true);
    setCoachAnswer('');
    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: coachQuestion,
          hackathonId: selectedHack?.id || null
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCoachAnswer(data.answer);
      }
    } catch (e) {
      console.error(e);
      setCoachAnswer("Coach compilation failed. Check backend console logs.");
    } finally {
      setIsCoachLoading(false);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/read', { method: 'POST' });
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  // Safe calculated variables
  const unreadNotifCount = notifications.filter(n => !n.read).length;
  const filteredTeams = teams.filter(t => selectedHack ? t.hackathonId === selectedHack.id : true);

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 font-sans flex flex-col antialiased">
      
      {/* Sticky Header */}
      <header className="h-16 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6 shrink-0 transition-all">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('landing')}>
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-600/30">H</div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white block leading-none">HackFinder</span>
              <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">Discovery Hub</span>
            </div>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            <button 
              onClick={() => { setActiveTab('discovery'); setSelectedHack(null); }} 
              className={`transition-colors py-1 ${activeTab === 'discovery' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-zinc-400 hover:text-zinc-100'}`}
            >
              Explore Feed
            </button>
            <button 
              onClick={() => setActiveTab('teams')} 
              className={`transition-colors py-1 ${activeTab === 'teams' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-zinc-400 hover:text-zinc-100'}`}
            >
              Team Finder
            </button>
            <button 
              onClick={() => setActiveTab('analytics')} 
              className={`transition-colors py-1 ${activeTab === 'analytics' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-zinc-400 hover:text-zinc-100'}`}
            >
              Analytics Hub
            </button>
            <button 
              onClick={() => setActiveTab('scrapers')} 
              className={`transition-colors py-1 ${activeTab === 'scrapers' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-zinc-400 hover:text-zinc-100'}`}
            >
              Crawler Engine
            </button>
            <button 
              onClick={() => setActiveTab('admin')} 
              className={`transition-colors py-1 ${activeTab === 'admin' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-zinc-400 hover:text-zinc-100'}`}
            >
              Curator Panel
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Quick search */}
          <div className="relative hidden sm:block">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-zinc-500" />
            </div>
            <input 
              type="text" 
              placeholder="Instant Search..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'discovery') setActiveTab('discovery');
              }}
              className="bg-zinc-900 border border-zinc-800 rounded-full py-1.5 pl-9 pr-4 text-xs w-52 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-zinc-200"
            />
          </div>

          {/* Notifications Trigger */}
          <div className="relative">
            <button 
              onClick={() => setShowNotificationPopup(!showNotificationPopup)}
              className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 relative transition-colors"
            >
              <Bell className="w-4 h-4 text-zinc-300" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-indigo-600 rounded-full text-[9px] font-bold flex items-center justify-center text-white border border-zinc-950">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotificationPopup && (
              <div className="absolute right-0 mt-2.5 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl z-50 p-4">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-zinc-800">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Alert Center</h4>
                  {unreadNotifCount > 0 && (
                    <button onClick={markAllNotificationsRead} className="text-[10px] text-indigo-400 hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-[11px] text-zinc-500 text-center py-4">No new notifications.</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`p-2 rounded-lg text-xs transition-colors ${n.read ? 'bg-zinc-950/20 text-zinc-400' : 'bg-indigo-950/20 border-l-2 border-indigo-500 text-zinc-200'}`}>
                        <div className="flex justify-between items-start mb-0.5">
                          <span className="font-semibold text-[11px]">{n.title}</span>
                          <span className="text-[8px] text-zinc-500">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-[10px] leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Info */}
          {user.onboarded ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowOnboardingModal(true)}
                className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-400 hover:bg-indigo-600/30 transition-all cursor-pointer"
                title="Edit Onboarding Profile"
              >
                {user.name.slice(0,2).toUpperCase()}
              </button>
              <button onClick={handleLogout} className="text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-850 px-2.5 py-1.5 rounded-lg border border-zinc-800 transition-colors">
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Hero Notification Info Banner */}
      <div className="bg-indigo-600/15 border-b border-indigo-500/20 px-6 py-2 flex items-center justify-between text-xs text-indigo-300">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>🚀 <strong>Active Pools:</strong> {analytics.totalPrizeMoney} available across {analytics.totalActive} centralized hackathon listings.</span>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <span className="text-[11px] text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded-md border border-indigo-800/40 font-mono">100% Real API Scrapers</span>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex flex-col">
        
        {/* VIEW 1: LANDING */}
        {activeTab === 'landing' && (
          <div className="flex-1 flex flex-col">
            {/* Hero Section */}
            <section className="relative px-6 py-20 text-center max-w-4xl mx-auto flex flex-col items-center justify-center">
              <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5 mb-6 animate-fade-in text-xs text-indigo-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Real-Time Web Scrapers Active Today</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-none mb-6">
                Never Miss a <span className="text-indigo-500">Hackathon</span> Again
              </h1>
              <p className="text-zinc-400 text-base md:text-xl max-w-2xl mb-10 leading-relaxed">
                Discover hackathons from across the internet in one consolidated place. Track deadlines, get personalized matchmaking scores, scout teammates, and win more prizes.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-16">
                <button 
                  onClick={() => setActiveTab('discovery')}
                  className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 text-sm cursor-pointer"
                >
                  Explore Hackathons <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    if (user.onboarded) {
                      setActiveTab('discovery');
                    } else {
                      setShowLoginModal(true);
                    }
                  }}
                  className="px-8 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-bold rounded-xl border border-zinc-800 transition-all text-sm cursor-pointer"
                >
                  Get Started Onboarding
                </button>
              </div>

              {/* Live Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full text-left">
                <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl backdrop-blur-md">
                  <span className="text-zinc-500 text-xs uppercase font-semibold tracking-wider block mb-1">Active Listings</span>
                  <span className="text-2xl font-extrabold text-white">{analytics.totalActive} Events</span>
                  <span className="text-[10px] text-zinc-600 block mt-1">Updated 5m ago</span>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl backdrop-blur-md">
                  <span className="text-zinc-500 text-xs uppercase font-semibold tracking-wider block mb-1">Prize Pools</span>
                  <span className="text-2xl font-extrabold text-emerald-400">{analytics.totalPrizeMoney}</span>
                  <span className="text-[10px] text-zinc-600 block mt-1">Consolidated value</span>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl backdrop-blur-md">
                  <span className="text-zinc-500 text-xs uppercase font-semibold tracking-wider block mb-1">Team Opportunities</span>
                  <span className="text-2xl font-extrabold text-indigo-400">{teams.length} Active Teams</span>
                  <span className="text-[10px] text-zinc-600 block mt-1">Seeking developers</span>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl backdrop-blur-md">
                  <span className="text-zinc-500 text-xs uppercase font-semibold tracking-wider block mb-1">Missed Prize pools</span>
                  <span className="text-2xl font-extrabold text-orange-400">₹4.2 Lakh</span>
                  <span className="text-[10px] text-zinc-600 block mt-1">Last 30 days summary</span>
                </div>
              </div>
            </section>

            {/* How It Works & Sources Integration */}
            <section className="bg-zinc-950/60 border-y border-zinc-900 py-16 px-6">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white">Aggregating Global Tech Platforms</h2>
                  <p className="text-zinc-400 text-sm max-w-xl mx-auto mt-2">Our modern crawler connects seamlessly to 9+ industry portals using standard public fetch schemas.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-center">
                  {['Devpost', 'Devfolio', 'Unstop', 'Reskilll', 'HackerEarth', 'HackerRank'].map((source) => (
                    <div key={source} className="bg-zinc-900 border border-zinc-850 p-4 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-xs font-bold text-zinc-300 block">{source}</span>
                      <span className="text-[9px] text-emerald-400 mt-1 font-mono">● Automated Scraper Ready</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Feature Modules */}
            <section className="py-20 px-6 max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
              <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-4">
                  <Layers className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-zinc-100 mb-2">Centralized Filtration</h3>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Filter by mode (Online/Offline/Hybrid), student eligibility, locations (Delhi, Bangalore, Pune, Mumbai, Remote), difficulties, and precise tech tags cleanly.
                </p>
              </div>
              <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-4">
                  <Bot className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-zinc-100 mb-2">Prakhar's Strategic Advisor</h3>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Query the built-in strategic advisor regarding timeline mechanics, custom SaaS design concepts tailored to your profile, and complete pitch deck formulations.
                </p>
              </div>
              <div className="p-6 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-4">
                  <Users className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-zinc-100 mb-2">Collaborative Teammate Scout</h3>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Register custom teams looking for particular frontend/backend skills, receive inbox requests, approve applicants, and immediately access contact channels.
                </p>
              </div>
            </section>

            {/* Creator Spotlight */}
            <section className="py-12 border-t border-zinc-900 bg-zinc-950/20 text-center px-6">
              <div className="max-w-2xl mx-auto flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-black text-lg mb-4 shadow-lg shadow-indigo-500/10">
                  PO
                </div>
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Project Architect</h3>
                <h4 className="text-lg font-black text-white mt-1">Prakhar Ojha</h4>
                <p className="text-zinc-400 text-xs mt-2 max-w-md leading-relaxed">
                  Designed and engineered HackFinder with custom high-fidelity portal crawlers, strict TypeScript contracts, and advanced high-performance secure server-side data synchronization.
                </p>
                <div className="flex gap-3 mt-4">
                  <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-[10px] text-zinc-400 font-mono">Lead Engineer</span>
                  <span className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-[10px] text-zinc-400 font-mono">Professional Polish UI</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: DISCOVERY HUB */}
        {activeTab === 'discovery' && (
          <div className="flex-1 flex flex-col md:flex-row p-6 gap-6 max-w-7xl mx-auto w-full">
            
            {/* Left Column: Side Filters */}
            <aside className="w-full md:w-64 flex flex-col gap-6 shrink-0 bg-zinc-950/20 md:bg-transparent p-4 md:p-0 rounded-2xl border border-zinc-800/60 md:border-none">
              <div>
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Smart Filters</h3>
                
                {/* Search Text Input */}
                <div className="relative mb-4">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  <input 
                    type="text" 
                    placeholder="Search name, sponsor..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-9 pr-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-4">
                  {/* Mode Selector */}
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1.5 font-medium">Competition Mode</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['All', 'Online', 'Offline', 'Hybrid'].map(mode => (
                        <button
                          key={mode}
                          onClick={() => setFilterMode(mode)}
                          className={`px-3 py-1 text-xs rounded-full border transition-all cursor-pointer ${filterMode === mode ? 'bg-indigo-600/15 border-indigo-500 text-indigo-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location Selector */}
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1.5 font-medium">Physical Location Hub</label>
                    <select
                      value={filterLocation}
                      onChange={(e) => setFilterLocation(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="All">All Cities (or Online)</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Delhi NCR">Delhi NCR</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Pune">Pune</option>
                      <option value="Hyderabad">Hyderabad</option>
                    </select>
                  </div>

                  {/* Themes Selector */}
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1.5 font-medium">Primary Theme</label>
                    <select
                      value={filterTheme}
                      onChange={(e) => setFilterTheme(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="All">All Tech Stacks</option>
                      <option value="AI">Artificial Intelligence</option>
                      <option value="ML">Machine Learning</option>
                      <option value="Blockchain">Blockchain & Web3</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                      <option value="Cloud">Cloud Infrastructure</option>
                      <option value="IoT">IoT / Hardware</option>
                      <option value="Robotics">Robotics</option>
                      <option value="FinTech">Financial Tech</option>
                      <option value="HealthTech">HealthTech</option>
                    </select>
                  </div>

                  {/* Difficulty Selector */}
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1.5 font-medium">Experience Level</label>
                    <select
                      value={filterDifficulty}
                      onChange={(e) => setFilterDifficulty(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="All">Any Difficulty</option>
                      <option value="Beginner">Beginner Friendly</option>
                      <option value="Intermediate">Intermediate Build</option>
                      <option value="Advanced">Advanced Challenge</option>
                    </select>
                  </div>

                  {/* Prize range */}
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1.5 font-medium">Minimum Prize Range</label>
                    <select
                      value={filterPrizeRange}
                      onChange={(e) => setFilterPrizeRange(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="All">All Prize Pools</option>
                      <option value="under-5">Under ₹5 Lakh</option>
                      <option value="5-15">₹5 Lakh - ₹15 Lakh</option>
                      <option value="above-15">Above ₹15 Lakh</option>
                    </select>
                  </div>

                  {/* Toggle student eligibility */}
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input 
                      type="checkbox" 
                      checked={filterStudentOnly} 
                      onChange={(e) => setFilterStudentOnly(e.target.checked)}
                      className="rounded accent-indigo-600 bg-zinc-900 border-zinc-800 focus:ring-indigo-500 w-4 h-4" 
                    />
                    <span className="text-xs text-zinc-300 font-medium">Student Only Competitions</span>
                  </label>
                </div>
              </div>

              {/* Opportunity Score Widget */}
              <div className="mt-auto p-4 bg-gradient-to-br from-indigo-900/20 to-zinc-900 border border-indigo-500/20 rounded-2xl">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">Opportunity score</span>
                  <span className="text-2xl font-black text-white">{user.onboarded ? '84' : '--'}</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: user.onboarded ? '84%' : '0%' }}></div>
                </div>
                <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed">
                  {user.onboarded ? `Tailored specifically based on your onboarded tech stack (${user.skills.slice(0,2).join(', ')}). You're in the top 15% fit range.` : 'Sign in and complete your onboarding skills to reveal your target opportunity match rating!'}
                </p>
                {!user.onboarded && (
                  <button onClick={() => setShowLoginModal(true)} className="mt-3 w-full py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-xs font-bold text-indigo-300 rounded-lg border border-indigo-500/20 transition-all cursor-pointer">
                    Configure Profile
                  </button>
                )}
              </div>
            </aside>

            {/* Center: Main Hackathon Feed */}
            <div className="flex-1 flex flex-col gap-6">
              
              {/* Stats Bar */}
              <div className="flex justify-between items-center bg-zinc-900/30 border border-zinc-800/80 p-3 rounded-xl">
                <span className="text-xs text-zinc-400">{hackathons.length} hackathons match your search parameters.</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-300 focus:outline-none"
                  >
                    <option value="default">Featured Listings</option>
                    <option value="prize">Highest Prize Pools</option>
                    <option value="deadline">Approaching Deadlines</option>
                    <option value="match">Personalized Fit Score</option>
                  </select>
                </div>
              </div>

              {/* Feed Card Grid */}
              <div className="space-y-4">
                {hackathons.length === 0 ? (
                  <div className="text-center py-20 bg-zinc-900/20 border border-zinc-850 rounded-2xl">
                    <Compass className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                    <h3 className="font-bold text-zinc-300">No matching hackathons found</h3>
                    <p className="text-xs text-zinc-500 max-w-xs mx-auto mt-1">Try resetting mode configurations, location specs, or search queries to broaden matches.</p>
                  </div>
                ) : (
                  hackathons.map((hack) => {
                    const timeLeft = new Date(hack.deadline).getTime() - Date.now();
                    const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
                    const isClosingSoon = daysLeft > 0 && daysLeft <= 7;

                    return (
                      <div 
                        key={hack.id}
                        className={`bg-zinc-900/40 border transition-all p-5 rounded-2xl flex flex-col md:flex-row gap-5 items-start md:items-center cursor-pointer group hover:border-zinc-700 hover:bg-zinc-900/70 ${hack.featured ? 'border-indigo-500/25 bg-indigo-950/5' : 'border-zinc-850'}`}
                      >
                        {/* Banner graphic */}
                        <div className="w-full md:w-36 h-24 bg-zinc-800 rounded-xl shrink-0 overflow-hidden relative border border-zinc-800">
                          <img src={hack.banner} alt={hack.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent"></div>
                          <span className="absolute bottom-2 left-2 text-[8px] font-bold uppercase tracking-wider bg-zinc-950/60 px-2 py-0.5 rounded backdrop-blur-sm text-zinc-200">
                            {hack.source}
                          </span>
                        </div>

                        {/* Text fields */}
                        <div className="flex-1 min-w-0" onClick={() => setSelectedHack(hack)}>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-bold text-base text-zinc-100 group-hover:text-indigo-400 transition-colors truncate">{hack.title}</h3>
                          </div>
                          
                          <p className="text-xs text-zinc-400 font-medium mb-2.5">Hosted by <span className="text-zinc-300">{hack.organizer}</span></p>

                          <div className="flex flex-wrap gap-1.5 mb-3.5">
                            <span className="px-2 py-0.5 text-[10px] font-medium bg-zinc-800 text-zinc-300 rounded border border-zinc-750">
                              {hack.mode}
                            </span>
                            {hack.mode !== 'Online' && (
                              <span className="px-2 py-0.5 text-[10px] font-medium bg-zinc-800 text-zinc-300 rounded border border-zinc-750">
                                {hack.location}
                              </span>
                            )}
                            <span className="px-2 py-0.5 text-[10px] font-medium bg-zinc-800 text-zinc-300 rounded border border-zinc-750">
                              {hack.difficulty}
                            </span>
                            {hack.studentOnly && (
                              <span className="px-2 py-0.5 text-[10px] font-medium bg-orange-950/40 text-orange-400 rounded border border-orange-900/30">
                                Students Only
                              </span>
                            )}
                            {hack.themes.map(theme => (
                              <span key={theme} className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-950/20 text-indigo-300 rounded border border-indigo-900/20">
                                {theme}
                              </span>
                            ))}
                          </div>

                          {/* Countdown indicators */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-zinc-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-zinc-400" />
                              {daysLeft > 0 ? (
                                <span className={isClosingSoon ? 'text-orange-400 font-semibold' : 'text-zinc-400'}>
                                  {daysLeft} days left to apply
                                </span>
                              ) : (
                                <span className="text-red-500 font-semibold">Registration closed</span>
                              )}
                            </div>
                            <span>•</span>
                            <span>{hack.teamSize}</span>
                            {hack.recommendationScore && user.onboarded && (
                              <>
                                <span>•</span>
                                <span className="text-indigo-400 font-semibold text-xs bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/30">
                                  🎯 Match Rating: {hack.recommendationScore}%
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Quick Register / Action column */}
                        <div className="flex md:flex-col items-center justify-between md:justify-center gap-3 w-full md:w-auto shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-zinc-850">
                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider block md:text-right">Prize Pool</span>
                            <span className="text-lg font-black text-emerald-400">{hack.prizePool}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Bookmark Toggle */}
                            <select
                              value={hack.saveStatus || 'None'}
                              onChange={(e) => handleBookmarkToggle(hack.id, e.target.value)}
                              className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded px-2 py-1 text-xs focus:outline-none cursor-pointer"
                            >
                              <option value="None">🔖 Save Journey</option>
                              <option value="Saved">Saved / Watchlist</option>
                              <option value="Applied">Applied</option>
                              <option value="Registered">Registered</option>
                              <option value="Won">Won Award</option>
                            </select>

                            <button 
                              onClick={() => setSelectedHack(hack)}
                              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: TEAM FINDER */}
        {activeTab === 'teams' && (
          <div className="flex-1 p-6 max-w-6xl mx-auto w-full flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Scout Teammates</h2>
                <p className="text-xs text-zinc-400 mt-1">Connect with developers, designers, and project managers. Filter teams specifically needing your stacks.</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    if (!user.onboarded) {
                      setShowLoginModal(true);
                    } else {
                      setShowCreateTeamModal(true);
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Register New Team
                </button>
              </div>
            </div>

            {/* Inboxes for Captains */}
            {user.onboarded && incomingRequests.length > 0 && (
              <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5" /> Incoming Join Requests ({incomingRequests.length})
                </h4>
                <div className="space-y-3">
                  {incomingRequests.map(req => (
                    <div key={req.id} className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm text-zinc-100">{req.fromUserName}</span>
                          <span className="text-[10px] text-zinc-400">wants to join your team</span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed italic">"{req.message}"</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {req.fromUserSkills.map(sk => (
                            <span key={sk} className="px-1.5 py-0.5 text-[9px] bg-zinc-800 text-zinc-400 rounded">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        {req.status === 'Pending' ? (
                          <>
                            <button 
                              onClick={() => handleRequestAction(req.id, 'Accept')}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded transition-colors cursor-pointer"
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => handleRequestAction(req.id, 'Reject')}
                              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-bold text-xs rounded transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className={`text-xs font-semibold uppercase px-2.5 py-0.5 rounded ${req.status === 'Accepted' ? 'bg-emerald-950 text-emerald-400' : 'bg-zinc-950 text-zinc-500'}`}>
                            {req.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* List of active team advertisements */}
            <div className="grid md:grid-cols-2 gap-6">
              {teams.length === 0 ? (
                <div className="col-span-2 text-center py-20 bg-zinc-900/20 border border-zinc-850 rounded-2xl">
                  <Users className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                  <h3 className="font-bold text-zinc-300">No active team openings listed</h3>
                  <p className="text-xs text-zinc-500 mt-1">Be the first to list a team searching for core collaborators!</p>
                </div>
              ) : (
                teams.map(team => (
                  <div key={team.id} className="bg-zinc-900/40 border border-zinc-850 p-5 rounded-2xl flex flex-col justify-between hover:border-zinc-700 transition-all">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div>
                          <span className="text-[10px] text-indigo-400 font-semibold tracking-wider block truncate">{team.hackathonTitle}</span>
                          <h3 className="text-lg font-bold text-zinc-100">{team.name}</h3>
                        </div>
                        <span className="px-2.5 py-1 text-[10px] font-bold bg-indigo-950 text-indigo-300 rounded-full border border-indigo-900/30">
                          {team.openingsCount} openings left
                        </span>
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed mb-4">{team.description}</p>

                      <div className="mb-4">
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold block mb-1.5">Seeking skills:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {team.skillsNeeded.map(sk => (
                            <span key={sk} className="px-2.5 py-0.5 text-[10px] bg-zinc-800 text-zinc-200 rounded-md border border-zinc-750">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4 bg-zinc-950/40 p-3 rounded-lg border border-zinc-850/60">
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold block mb-1.5">Active Members:</span>
                        <div className="space-y-1.5">
                          {team.members.map((m, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              <div className="w-4 h-4 rounded-full bg-indigo-600/30 border border-indigo-500/20 text-[8px] font-extrabold flex items-center justify-center text-indigo-300">
                                {m.name.slice(0,1)}
                              </div>
                              <span className="text-zinc-200 font-medium">{m.name}</span>
                              <span className="text-[9px] text-zinc-500">• {m.role}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-zinc-850">
                      <span className="text-[10px] text-zinc-500">Contact channel: <strong className="text-zinc-300 font-mono">{team.contactInfo}</strong></span>
                      {team.creatorId !== user.id && (
                        <button 
                          onClick={() => {
                            if (!user.onboarded) {
                              setShowLoginModal(true);
                            } else {
                              handleJoinTeamRequest(team.id);
                            }
                          }}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          Request to Join
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* VIEW 4: ANALYTICS & PIPELINE */}
        {activeTab === 'analytics' && (
          <div className="flex-1 p-6 max-w-6xl mx-auto w-full flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Analytics Hub</h2>
              <p className="text-xs text-zinc-400 mt-1">Review active opportunities tracking pipelines, categorizations, and target match performance logs.</p>
            </div>

            {/* Pipeline counts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl">
                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold block mb-1">Bookmarked Journey</span>
                <span className="text-3xl font-extrabold text-white">{analytics.pipeline?.saved || 0}</span>
                <p className="text-[10px] text-zinc-400 mt-2">Saved, awaiting final timeline action</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl">
                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold block mb-1">Submitted / Applied</span>
                <span className="text-3xl font-extrabold text-orange-400">{analytics.pipeline?.applied || 0}</span>
                <p className="text-[10px] text-zinc-400 mt-2">Under active review by sponsors</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl">
                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold block mb-1">Successfully Registered</span>
                <span className="text-3xl font-extrabold text-indigo-400">{analytics.pipeline?.registered || 0}</span>
                <p className="text-[10px] text-zinc-400 mt-2">Core credentials confirmed</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl bg-indigo-600/5 border-indigo-500/20">
                <span className="text-xs text-indigo-400 uppercase tracking-wider font-semibold block mb-1">Accrued Awards Won</span>
                <span className="text-3xl font-extrabold text-emerald-400">{analytics.pipeline?.won || 0}</span>
                <p className="text-[10px] text-indigo-300 mt-2">Accolades registered under profile</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Left sidebar: Missed opportunity indicator */}
              <div className="md:col-span-1 p-5 bg-orange-500/5 border border-orange-500/15 rounded-2xl flex flex-col justify-between">
                <div>
                  <h4 className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Missed Opportunities
                  </h4>
                  <span className="text-3xl font-black text-white">{analytics.missedOpportunity?.value || '₹4,20,000'}</span>
                  <p className="text-xs text-zinc-300 mt-4 leading-relaxed">
                    You missed <strong className="text-orange-400">{analytics.missedOpportunity?.count || 12} hackathons</strong> last month because of unregistered deadlines or delayed platform scoping.
                  </p>
                </div>
                <button 
                  onClick={() => setActiveTab('discovery')}
                  className="w-full mt-6 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Configure Priority Discovery Feed
                </button>
              </div>

              {/* Middle & Right: SVG Visualizer Plots */}
              <div className="bg-zinc-900/60 border border-zinc-850 p-5 rounded-2xl md:col-span-2 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-200 mb-1">Portals Domain Categorization</h3>
                  <p className="text-[11px] text-zinc-500 mb-6">Visual share distribution across active theme indices in our catalog.</p>
                  
                  {/* SVG Bar chart */}
                  <div className="space-y-3.5">
                    {Object.entries(analytics.categoryCounts || { 'AI & ML': 4, 'Blockchain': 2, 'Cloud': 3, 'FinTech': 2, 'HealthTech': 1 }).map(([cat, count]) => {
                      const countsArray = Object.values(analytics.categoryCounts || {}) as number[];
                      const total = countsArray.reduce((a, b) => a + b, 0) || 12;
                      const pct = Math.min(100, Math.round(((count as number) / total) * 100));
                      return (
                        <div key={cat} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-zinc-300">{cat}</span>
                            <span className="text-zinc-400">{count} events ({pct}%)</span>
                          </div>
                          <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-850">
                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mode Pie Distribution Chart Simulated inside SVG */}
                <div className="pt-6 border-t border-zinc-850/60 mt-6">
                  <span className="text-xs font-bold text-zinc-400 block mb-3">Participation Mode Breakdown</span>
                  <div className="flex items-center justify-around gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                      <span className="text-xs text-zinc-300">Online ({analytics.modeCounts?.Online || 0} events)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="text-xs text-zinc-300">Offline ({analytics.modeCounts?.Offline || 0} events)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span className="text-xs text-zinc-300">Hybrid ({analytics.modeCounts?.Hybrid || 0} events)</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: SCRAPER CRAWLER ENGINE */}
        {activeTab === 'scrapers' && (
          <div className="flex-1 p-6 max-w-6xl mx-auto w-full flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Ingestion Pipeline Engine</h2>
                <p className="text-xs text-zinc-400 mt-1">Trigger and review scraper crawls directly from integrated provider endpoints.</p>
              </div>
              <div className="text-xs text-zinc-500 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 font-mono">
                Scraper Protocol: Bypassing Cloudflare cleanly
              </div>
            </div>

            {/* Run triggers */}
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { name: 'Devfolio', desc: 'Queries public Web3, DeFi & Layer-2 hackathons' },
                { name: 'HackerEarth', desc: 'Consolidates enterprise security & AI model challenges' },
                { name: 'Reskilll', desc: 'Finds hybrid community sprints and cloud challenges' }
              ].map(src => (
                <div key={src.name} className="bg-zinc-900 border border-zinc-850 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-zinc-200 text-base">{src.name}</h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{src.desc}</p>
                  </div>
                  <button
                    onClick={() => handleRunScraper(src.name)}
                    disabled={runningScraper !== null}
                    className={`mt-4 w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${runningScraper === src.name ? 'bg-indigo-600/30 text-indigo-300' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                  >
                    {runningScraper === src.name ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Crawling API...
                      </>
                    ) : (
                      <>
                        <Terminal className="w-3.5 h-3.5" /> Execute Scraper Job
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Execution logs log list */}
            <div>
              <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider mb-3">Recent Crawler Execution Logs</h3>
              <div className="space-y-4">
                {scraperJobs.map(job => (
                  <div key={job.id} className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl font-mono text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-900 mb-2.5 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-indigo-400">{job.sourceName} Connector</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${job.status === 'Completed' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'}`}>
                          {job.status}
                        </span>
                      </div>
                      <div className="text-zinc-500">
                        {new Date(job.timestamp).toLocaleString()} • Added <strong className="text-emerald-400">{job.addedCount} items</strong>
                      </div>
                    </div>
                    <div className="space-y-1 text-zinc-400 text-[11px] max-h-40 overflow-y-auto">
                      {job.logs.map((l, idx) => (
                        <div key={idx} className="flex gap-2">
                          <span className="text-zinc-600">[{idx+1}]</span>
                          <span>{l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 6: CURATOR PANEL (ADMIN) */}
        {activeTab === 'admin' && (
          <div className="flex-1 p-6 max-w-6xl mx-auto w-full flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Curator Panel</h2>
                <p className="text-xs text-zinc-400 mt-1">Admin control center to curate listings, approve events, and discard outdated logs.</p>
              </div>
              <button 
                onClick={() => setShowAddHackModal(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Manual Curated Hackathon
              </button>
            </div>

            {/* List for manual curate actions */}
            <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl overflow-hidden">
              <div className="p-4 bg-zinc-950 border-b border-zinc-850 flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Active Curated Events ({hackathons.length})</span>
                <span className="text-[10px] text-zinc-500">Secured with curator authorizations</span>
              </div>
              <div className="divide-y divide-zinc-850">
                {hackathons.map(hack => (
                  <div key={hack.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <strong className="text-zinc-200 text-sm font-semibold">{hack.title}</strong>
                        <span className="px-1.5 py-0.5 bg-zinc-800 text-zinc-400 text-[9px] rounded font-mono">
                          {hack.id}
                        </span>
                      </div>
                      <div className="text-zinc-400">
                        Organizer: {hack.organizer} • Source: <span className="text-indigo-400">{hack.source}</span> • Value: ₹{hack.prizeValue.toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteHack(hack.id)}
                      className="p-2 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 rounded-lg transition-colors cursor-pointer"
                      title="Discard listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* DETAIL MODAL OVERLAY */}
      {selectedHack && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button 
              onClick={() => { setSelectedHack(null); setCoachAnswer(''); }}
              className="absolute top-4 right-4 p-2 bg-zinc-950/80 hover:bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-200 transition-all z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Banner block */}
            <div className="h-56 relative border-b border-zinc-800 bg-zinc-950 overflow-hidden">
              <img src={selectedHack.banner} alt={selectedHack.title} className="w-full h-full object-cover opacity-70" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <span className="px-3 py-1 bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-wider rounded-md">
                  {selectedHack.source} Partnered
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-white mt-2 tracking-tight leading-tight">{selectedHack.title}</h2>
                <p className="text-xs text-zinc-300 mt-1">Hosted by <strong className="text-white">{selectedHack.organizer}</strong></p>
              </div>
            </div>

            {/* Detailed Body Layout */}
            <div className="p-6 grid md:grid-cols-3 gap-6">
              
              {/* Left 2 columns */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Hackathon Overview</h3>
                  <p className="text-xs text-zinc-300 leading-relaxed">{selectedHack.description}</p>
                </div>

                {/* Timeline mechanics */}
                <div>
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Timeline & Stages</h3>
                  <div className="relative pl-4 space-y-4">
                    <div className="absolute left-1.5 top-1 bottom-1 w-[1px] bg-zinc-800"></div>
                    {selectedHack.timeline?.map((item, idx) => (
                      <div key={idx} className="relative pl-4">
                        <div className="absolute -left-[14.5px] top-1.5 w-2 h-2 rounded-full bg-indigo-500 border border-zinc-900"></div>
                        <div className="text-[10px] font-bold text-indigo-400">{item.date}</div>
                        <div className="text-xs font-semibold text-zinc-200 mt-0.5">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tracks and Prizes */}
                <div>
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Curated Innovation Tracks</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {selectedHack.tracks?.map((track, idx) => (
                      <div key={idx} className="p-4 bg-zinc-950/60 border border-zinc-850 rounded-xl">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <strong className="text-xs text-zinc-200 block font-bold leading-none">{track.name}</strong>
                          <span className="text-[11px] font-bold text-emerald-400">{track.prize}</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">{track.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rules */}
                <div>
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Primary Guidelines</h3>
                  <ul className="list-disc pl-4 text-xs text-zinc-400 space-y-1.5">
                    {selectedHack.rules?.map((rule, idx) => (
                      <li key={idx} className="leading-relaxed">{rule}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Sidebar: AI coach, register, teammates */}
              <div className="space-y-6">
                
                {/* Registration quick status */}
                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-850">
                  <div className="flex justify-between items-start mb-2.5">
                    <span className="text-[10px] text-zinc-500 font-semibold uppercase block">Prize pool</span>
                    <span className="text-2xl font-black text-emerald-400 leading-none">{selectedHack.prizePool}</span>
                  </div>
                  
                  <div className="text-xs text-zinc-400 mb-4 space-y-1 font-medium">
                    <div>Mode: <strong className="text-zinc-200">{selectedHack.mode}</strong></div>
                    {selectedHack.mode !== 'Online' && (
                      <div>Venue: <strong className="text-zinc-200">{selectedHack.location}</strong></div>
                    )}
                    <div>Deadline: <strong className="text-zinc-200">{new Date(selectedHack.deadline).toLocaleDateString()}</strong></div>
                  </div>

                  <a 
                    href={selectedHack.registrationUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20 cursor-pointer"
                  >
                    Go to Official Site <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* PRASHANT'S STRATEGIC COACH WIDGET */}
                <div className="p-4 bg-gradient-to-b from-indigo-950/20 to-zinc-950 border border-indigo-500/20 rounded-xl">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-indigo-400" /> Prakhar's Strategic Coach
                  </h4>
                  <p className="text-[10px] text-zinc-400 leading-relaxed mb-3">
                    Formulate customized SaaS ideas matching your skills to succeed in {selectedHack.title}!
                  </p>

                  <form onSubmit={handleAICoach} className="space-y-2">
                    <input 
                      type="text" 
                      placeholder="Ask strategy, SaaS ideas..." 
                      value={coachQuestion}
                      onChange={(e) => setCoachQuestion(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-850 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={isCoachLoading}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      {isCoachLoading ? 'Generating strategic insights...' : 'Get Strategic Advice'}
                    </button>
                  </form>

                  {coachAnswer && (
                    <div className="mt-3 bg-zinc-950 border border-zinc-850 rounded-lg p-3 text-[11px] text-zinc-300 leading-relaxed max-h-48 overflow-y-auto">
                      <div className="prose prose-invert prose-xs">
                        {coachAnswer.split('\n').map((para, i) => (
                          <p key={i} className="mb-2 last:mb-0">{para}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Teammate listings specifically for this hack */}
                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-850">
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-400" /> Scouted Teams ({filteredTeams.length})
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {filteredTeams.length === 0 ? (
                      <p className="text-[10px] text-zinc-500">No teams registered specifically for this event yet. Create one!</p>
                    ) : (
                      filteredTeams.map(t => (
                        <div key={t.id} className="p-2 bg-zinc-900 border border-zinc-850 rounded-lg flex justify-between items-center text-xs">
                          <div>
                            <strong className="text-zinc-200 block font-bold leading-none">{t.name}</strong>
                            <span className="text-[9px] text-zinc-500">needs: {t.skillsNeeded.slice(0,2).join(', ')}</span>
                          </div>
                          <button
                            onClick={() => { setSelectedHack(null); setActiveTab('teams'); }}
                            className="px-2 py-1 bg-zinc-800 text-[10px] rounded hover:bg-zinc-750 transition-colors text-zinc-300 cursor-pointer"
                          >
                            Join
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* LOGIN MODAL OVERLAY */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-2 text-center">Sign In to HackFinder</h3>
            <p className="text-xs text-zinc-500 text-center mb-5">Access your customized opportunity dashboards and scout elite teammates.</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-medium">Your Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="Vikram Sen" 
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-medium">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="vikram@hackfinder.com" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-colors shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                Sign In with Email
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ONBOARDING MODAL OVERLAY */}
      {showOnboardingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative my-8">
            <button 
              onClick={() => setShowOnboardingModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">Onboarding Profile Builder</h3>
            <p className="text-xs text-zinc-400 mb-5">Set up your skills and preferences so the strategic match engine recommends high prize hackathons.</p>

            <form onSubmit={handleOnboarding} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-medium">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={obName} 
                    onChange={(e) => setObName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-medium">College Name</label>
                  <input 
                    type="text" 
                    placeholder="IIT Bangalore"
                    value={obCollege} 
                    onChange={(e) => setObCollege(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-medium">Graduation Year</label>
                  <input 
                    type="text" 
                    value={obYear} 
                    onChange={(e) => setObYear(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-medium">Preferred Mode</label>
                  <select
                    value={obMode}
                    onChange={(e: any) => setObMode(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none"
                  >
                    <option value="Any">Any Mode</option>
                    <option value="Online">Online Only</option>
                    <option value="Offline">Offline Hubs Only</option>
                    <option value="Hybrid">Hybrid Mode</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-medium">Skills (comma separated)</label>
                <input 
                  type="text" 
                  placeholder="React, TypeScript, FastAPI, Python"
                  value={obSkills} 
                  onChange={(e) => setObSkills(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-medium">Interests (comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="AI, SaaS, Blockchain"
                    value={obInterests} 
                    onChange={(e) => setObInterests(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-medium">Preferred Domains (comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="FinTech, HealthTech"
                    value={obDomains} 
                    onChange={(e) => setObDomains(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-medium">GitHub Link</label>
                  <input 
                    type="text" 
                    placeholder="https://github.com/coder"
                    value={obGithub} 
                    onChange={(e) => setObGithub(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-medium">LinkedIn Link</label>
                  <input 
                    type="text" 
                    placeholder="https://linkedin.com/in/coder"
                    value={obLinkedin} 
                    onChange={(e) => setObLinkedin(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-colors shadow-lg cursor-pointer"
              >
                Save Onboarding Data
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TEAM MODAL OVERLAY */}
      {showCreateTeamModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setShowCreateTeamModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">Register New Scouting Team</h3>
            <p className="text-xs text-zinc-400 mb-4">Ad and profile will be listed in the scout teammate directories.</p>

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-medium">Target Hackathon Title</label>
                <select
                  value={selectedHack?.id || ''}
                  onChange={(e) => {
                    const found = hackathons.find(h => h.id === e.target.value);
                    if (found) setSelectedHack(found);
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none"
                >
                  <option value="" disabled>Select Hackathon</option>
                  {hackathons.map(h => (
                    <option key={h.id} value={h.id}>{h.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-medium">Team Display Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Aether Coders"
                    value={ctName} 
                    onChange={(e) => setCtName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-medium">Max Team Size</label>
                  <input 
                    type="number" 
                    value={ctMax} 
                    onChange={(e) => setCtMax(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-medium">Teammate Search Description</label>
                <textarea 
                  required
                  placeholder="Explain your concept and what role you seek..."
                  value={ctDesc} 
                  onChange={(e) => setCtDesc(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none h-20 resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-medium">Seeking Skills (comma separated)</label>
                <input 
                  type="text" 
                  placeholder="React, Tailwind, Solidity"
                  value={ctSkills} 
                  onChange={(e) => setCtSkills(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-medium">Contact Channel (Email, Discord)</label>
                <input 
                  type="text" 
                  required
                  placeholder="discord: custom_handle"
                  value={ctContact} 
                  onChange={(e) => setCtContact(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg cursor-pointer"
              >
                Launch Scouting Team Ad
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MANUAL ADD HACKATHON MODAL OVERLAY */}
      {showAddHackModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative my-8">
            <button 
              onClick={() => setShowAddHackModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">Curate Curated Listing (Admin)</h3>
            <p className="text-xs text-zinc-400 mb-4">Add a new manual curated hackathon that will appear in the main feed.</p>

            <form onSubmit={handleAddManualHack} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-medium">Hackathon Title</label>
                  <input 
                    type="text" 
                    required
                    placeholder="AWS Innovation Sprints"
                    value={mhTitle} 
                    onChange={(e) => setMhTitle(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-medium">Organizer Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Amazon Web Services"
                    value={mhOrganizer} 
                    onChange={(e) => setMhOrganizer(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-medium">Prize Pool String</label>
                  <input 
                    type="text" 
                    required
                    placeholder="₹5,00,000"
                    value={mhPrizePool} 
                    onChange={(e) => setMhPrizePool(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-medium">Numeric Sorting Value (INR)</label>
                  <input 
                    type="number" 
                    required
                    placeholder="500000"
                    value={mhPrizeValue} 
                    onChange={(e) => setMhPrizeValue(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-medium">Competition Mode</label>
                  <select
                    value={mhMode}
                    onChange={(e: any) => setMhMode(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none"
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-medium">Location Hub (if physical)</label>
                  <input 
                    type="text" 
                    placeholder="Remote or City"
                    value={mhLocation} 
                    onChange={(e) => setMhLocation(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-medium">Difficulty Level</label>
                  <select
                    value={mhDifficulty}
                    onChange={(e: any) => setMhDifficulty(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none"
                  >
                    <option value="Beginner">Beginner Friendly</option>
                    <option value="Intermediate">Intermediate Build</option>
                    <option value="Advanced">Advanced Challenge</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1 font-medium">Themes (comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="AI, Cloud, FinTech"
                    value={mhThemes} 
                    onChange={(e) => setMhThemes(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-medium">Official Registration URL</label>
                <input 
                  type="text" 
                  placeholder="https://aws.amazon.com/innovation-2026"
                  value={mhRegUrl} 
                  onChange={(e) => setMhRegUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-medium">Short Curated Description</label>
                <textarea 
                  placeholder="Summary of the hackathon event tracks, timelines, and registration portals..."
                  value={mhDesc} 
                  onChange={(e) => setMhDesc(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-zinc-200 focus:outline-none h-20 resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg cursor-pointer"
              >
                Publish manual listing
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer Status Bar */}
      <footer className="h-10 border-t border-zinc-800 bg-zinc-950 px-6 flex items-center justify-between shrink-0 text-[10px] text-zinc-500 mt-auto">
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Ingestion status: 9 global portal connectors active
          </div>
          <span className="hidden sm:inline text-zinc-600">|</span>
          <span className="hidden sm:inline">Active user: <strong className="text-zinc-400">{user.email}</strong></span>
          <span className="hidden sm:inline text-zinc-600">|</span>
          <span className="hidden sm:inline">Designed & Engineered by <strong className="text-indigo-400">Prakhar Ojha</strong></span>
        </div>
        <div className="text-[10px] text-zinc-600">
          v1.0.8 • Built by Prakhar Ojha • Build: 260703
        </div>
      </footer>

    </div>
  );
}
