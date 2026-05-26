import { useState, useEffect, FormEvent } from 'react';
import { 
  Leaf, User, ShieldAlert, Award, Globe, Bell, Trash2, HelpCircle, 
  ChevronDown, X, CheckSquare, MessageCircle, RefreshCw, LogOut, Building, Check
} from 'lucide-react';

import { 
  UserRole, UserProfile, PickupRequest, SupportTicket, ChatMessage 
} from './types';
import { Language, translations } from './utils/translations';
import { 
  initialCustomerProfile, initialCollectorProfile, defaultPickups, 
  initialTickets 
} from './data/mockData';

// Portals
import CustomerPortal from './components/CustomerPortal';
import CollectorPortal from './components/CollectorPortal';
import AdminPortal from './components/AdminPortal';
import AppLogo from './assets/images/takago_official_logo_1779788639254.png';

export default function App() {
  const [role, setRole] = useState<UserRole>('customer');
  const [language, setLanguage] = useState<Language>('en');

  // Nairobi estates login and loading states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedEstate, setSelectedEstate] = useState('Kilimani');
  const [loginRole, setLoginRole] = useState<UserRole>('customer');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Core synchronized master states
  const [customerProfile, setCustomerProfile] = useState<UserProfile>(initialCustomerProfile);
  const [collectorProfile, setCollectorProfile] = useState<UserProfile>(initialCollectorProfile);
  const [pickups, setPickups] = useState<PickupRequest[]>(defaultPickups);
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets);
  
  // Real-time chat history log
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'msg_01',
      pickupId: 'TGO-5821',
      senderRole: 'customer',
      text: "Hello! Please don't forget we have extra cardboard in the garage today.",
      timestamp: 'Yesterday, 10:45 AM'
    },
    {
      id: 'msg_02',
      pickupId: 'TGO-5821',
      senderRole: 'collector',
      text: "Sawa Grace! I am wrapping up near Westlands and will load them. No extra charges.",
      timestamp: 'Yesterday, 10:50 AM'
    }
  ]);

  // Integrated system notifications log
  const [notifications, setNotifications] = useState<Array<{ id: string, text: string, time: string, read: boolean }>>([
    { id: 'n1', text: 'Welcome to TakaGo! Start separating your waste to earn eco rewards.', time: 'Just Now', read: false },
    { id: 'n2', text: 'Recycling pickup scheduled successfully: Case TGO-5821.', time: 'Yesterday', read: true }
  ]);

  const [showNotifPanel, setShowNotifPanel] = useState(false);

  // Nairobi estates list
  const NAIROBI_ESTATES = [
    'Kilimani',
    'Kileleshwa',
    'Westlands',
    'Lavington',
    'Lang\'ata',
    'Runda',
    'Karen',
    'Muthaiga',
    'South C',
    'South B',
    'Parklands'
  ];

  const LOADING_STEPS = [
    "Establishing secure connection to County Waste Ledger...",
    "Matching nearby eco-collectors in {estate} estate...",
    "Optimizing green transportation routes on Kilimani map grid...",
    "Syncing your eco reward balance & transaction history...",
    "Access authorized! Preparing system workspace dashboards..."
  ];

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadingStep(0);
    setLoadingProgress(0);

    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 2.5;
      setLoadingProgress(Math.min(progress, 100));

      if (progress < 25) {
        setLoadingStep(0);
      } else if (progress < 50) {
        setLoadingStep(1);
      } else if (progress < 75) {
        setLoadingStep(2);
      } else if (progress < 90) {
        setLoadingStep(3);
      } else {
        setLoadingStep(4);
      }

      if (progress >= 100) {
        clearInterval(progressInterval);
        setTimeout(() => {
          setIsLoading(false);
          setIsLoggedIn(true);
          setRole(loginRole);
          // Set selected estate prefix or location on customer profiles or simulated states if necessary
          setCustomerProfile(prev => ({
            ...prev,
            location: `${selectedEstate} Close, Block 4C, Nairobi`
          }));
          handleAddNotification(`Identity verified: Logged into ${selectedEstate} estate as ${loginRole === 'customer' ? 'Resident' : loginRole === 'collector' ? 'Waste Collector' : 'Administrator'}.`);
        }, 500);
      }
    }, 80); // 100 / 2.5 = 40 chunks * 80ms = 3200ms of loading time
  };

  // Auto replies simulator: when user types message as resident or collector, complementary responses trigger after 2 seconds
  const handleAddNotification = (text: string) => {
    const newNotif = {
      id: 'notif_' + Math.floor(1000 + Math.random() * 9000),
      text,
      time: 'Just Now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleUpdatePickup = (pickupId: string, updates: Partial<PickupRequest>) => {
    setPickups(prev => prev.map(p => {
      if (p.id === pickupId) {
        const merged = { ...p, ...updates };
        
        // Trigger localized system notifications depending on status updates
        if (updates.status) {
          if (updates.status === 'accepted') {
            handleAddNotification(`Waste Collector Juma Joseph accepted garbage collection task ${pickupId}!`);
          } else if (updates.status === 'on_the_way') {
            handleAddNotification(`GPS Tracking Active: Collector is approaching Kilimani address on the map!`);
          } else if (updates.status === 'collected') {
            handleAddNotification(`Waste loaded successfully. Transit to regional Eco-Plant in progress!`);
          } else if (updates.status === 'completed') {
            handleAddNotification(`✓ Collection ${pickupId} processed successfully! Rewards points unlocked.`);
          }
        }
        return merged;
      }
      return p;
    }));
  };

  const handleAddPickup = (newReq: PickupRequest) => {
    setPickups(prev => [newReq, ...prev]);
    handleAddNotification(`New household collection scheduled at ${newReq.location}!`);
  };

  const handleAddTicket = (newTck: SupportTicket) => {
    setTickets(prev => [newTck, ...prev]);
    handleAddNotification(`Citizen support ticket ${newTck.id} received at central admin panel.`);
  };

  const handleUpdateTicket = (ticketId: string, updates: Partial<SupportTicket>) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const merged = { ...t, ...updates };
        if (updates.status === 'resolved') {
          handleAddNotification(`Citizens ticket ${ticketId} resolved by operations administrator!`);
        }
        return merged;
      }
      return t;
    }));
  };

  const handleSendChatMessage = (pickupId: string, text: string) => {
    const curTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: ChatMessage = {
      id: 'msg_' + Math.floor(1000 + Math.random() * 9000),
      pickupId,
      senderRole: role === 'customer' ? 'customer' : 'collector',
      text,
      timestamp: `Today, ${curTime}`
    };

    setChatHistory(prev => [...prev, newMsg]);

    // AUTO BOT REPLY SIMULATOR TO DEMONSTRATE DYNAMIC INTERACTIONS
    setTimeout(() => {
      let automatedReply = '';
      if (role === 'customer') {
        // Customer typed message -> Collector replies automatically
        automatedReply = `Habari! Sawa, nimepokea ujumbe wako. Niko karibu sana na hapo Kilimani. Naongeza mwendo!`;
      } else {
        // Collector typed message -> Resident customer replies automatically
        automatedReply = `Awesome Juma! The gates are open and everything is categorized in green bags near the sidewalk.`;
      }

      const botMsg: ChatMessage = {
        id: 'msg_bot_' + Math.floor(1000 + Math.random() * 9000),
        pickupId,
        senderRole: role === 'customer' ? 'collector' : 'customer',
        text: automatedReply,
        timestamp: `Today, ${curTime}`
      };

      setChatHistory(prev => [...prev, botMsg]);
      handleAddNotification(`New chat reply message concerning order ${pickupId}`);
    }, 2500);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const t = translations[language];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans" id="login-container">
        {/* Decorative ambient blobs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="w-full max-w-sm bg-white rounded-3xl border border-gray-100 shadow-2xl p-7 space-y-5 relative z-10" id="login-card">
          {isLoading ? (
            <div className="text-center py-6 space-y-5" id="login-loading-overlay">
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <img 
                  src={AppLogo} 
                  alt="TakaGo Logo" 
                  className="w-12 h-12 object-cover rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="space-y-1.5 max-w-xs mx-auto">
                <h4 className="font-extrabold text-sm text-slate-900 tracking-tight">
                  Signing into {selectedEstate} Hub
                </h4>
                <p className="text-xs text-slate-500 min-h-[36px] flex items-center justify-center leading-normal">
                  {LOADING_STEPS[loadingStep].replace('{estate}', selectedEstate)}
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
                <span className="font-mono text-[10px] text-emerald-700 font-bold">{Math.floor(loadingProgress)}% Synchronized</span>
              </div>
            </div>
          ) : (
            <>
              {/* Branding Section */}
              <div className="text-center space-y-1.5">
                <div className="w-14 h-14 rounded-2xl bg-white border border-gray-150 p-2 flex items-center justify-center overflow-hidden shadow-md mx-auto">
                  <img 
                    src={AppLogo} 
                    alt="TakaGo Logo" 
                    className="w-full h-full object-cover rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-slate-800">
                    Taka<span className="text-emerald-600">Go</span> Portal
                  </h1>
                  <p className="text-[11px] text-slate-500 font-medium">Nairobi Sustainability Green Scheme</p>
                </div>
              </div>

              {/* Form Section */}
              <form onSubmit={handleLoginSubmit} className="space-y-4" id="login-form">
                
                {/* Role select buttons */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Access Protocol Role</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setLoginRole('customer')}
                      className={`py-2 rounded-2xl border text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                        loginRole === 'customer' 
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold shadow-sm' 
                          : 'bg-white border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                      id="login-role-resident"
                    >
                      <User className="w-4 h-4 mb-0.5" />
                      <span className="text-[9px] tracking-wide uppercase leading-none font-bold">Resident</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLoginRole('collector')}
                      className={`py-2 rounded-2xl border text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                        loginRole === 'collector' 
                          ? 'bg-slate-900 border-slate-900 text-white font-bold shadow-md' 
                          : 'bg-white border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                      id="login-role-collector"
                    >
                      <CheckSquare className="w-4 h-4 mb-0.5" />
                      <span className="text-[9px] tracking-wide uppercase leading-none font-bold">Collector</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setLoginRole('admin')}
                      className={`py-2 rounded-2xl border text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                        loginRole === 'admin' 
                          ? 'bg-emerald-800 border-emerald-850 text-white font-bold shadow-sm' 
                          : 'bg-white border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                      id="login-role-admin"
                    >
                      <ShieldAlert className="w-4 h-4 mb-0.5" />
                      <span className="text-[9px] tracking-wide uppercase leading-none font-bold">Admin</span>
                    </button>
                  </div>
                </div>

                {/* Estate dropdown */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Nairobi Location Estate</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Building className="w-3.5 h-3.5" />
                    </div>
                    <select
                      value={selectedEstate}
                      onChange={(e) => setSelectedEstate(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                      id="login-estate-selector"
                    >
                      {NAIROBI_ESTATES.map(estate => (
                        <option key={estate} value={estate}>{estate} Estate</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Slogan Container matching constraints */}
                <div className="bg-emerald-50 rounded-xl p-2.5 text-center border border-emerald-100">
                  <p className="text-[10px] text-emerald-800 font-extrabold">"Waste collection made simple."</p>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all hover:shadow-lg shadow-emerald-600/20 cursor-pointer text-center"
                  id="btn-login-submit"
                >
                  Access Central Hub Console ➔
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/75 flex flex-col font-sans" id="takago-app-root">
      
      {/* Dynamic Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200/80 shadow-xs" id="takago-app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-11 h-11 rounded-xl bg-white border border-gray-150 p-1 flex items-center justify-center overflow-hidden shadow-sm shadow-emerald-600/5">
              <img 
                src={AppLogo} 
                alt="TakaGo Logo" 
                className="w-full h-full object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-800 font-sans">
                Taka<span className="text-emerald-600">Go</span>
              </span>
              <p className="text-[10px] text-emerald-600 font-semibold tracking-wide uppercase leading-none mt-0.5">{t.tagline}</p>
            </div>
          </div>

          {/* Testing Workspace Selector Panel */}
          <div className="bg-gray-100 p-1 rounded-2xl flex items-center space-x-1 border border-gray-200/40" id="role-switcher-banner">
            <button
              onClick={() => { setRole('customer'); handleAddNotification("Switched to Resident Workspace view."); }}
              className={`px-4.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center space-x-1.5 ${
                role === 'customer' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' : 'text-gray-500 hover:text-gray-800'
              }`}
              id="role-switch-resident"
            >
              <User className="w-3.5 h-3.5" />
              <span>{t.customer}</span>
            </button>

            <button
              onClick={() => { setRole('collector'); handleAddNotification("Switched to Waste Collector Workspace view."); }}
              className={`px-4.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center space-x-1.5 ${
                role === 'collector' ? 'bg-slate-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-800'
              }`}
              id="role-switch-rider"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{t.collector}</span>
            </button>

            <button
              onClick={() => { setRole('admin'); handleAddNotification("Switched to Administrator Workspace view."); }}
              className={`px-4.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center space-x-1.5 ${
                role === 'admin' ? 'bg-emerald-800 text-white shadow-md' : 'text-gray-500 hover:text-gray-800'
              }`}
              id="role-switch-admin"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{t.admin}</span>
            </button>
          </div>

          {/* Controls Bar: Languages and alerts */}
          <div className="flex items-center space-x-3 shrink-0">
            {/* Language Picker */}
            <div className="flex items-center bg-gray-100/80 p-0.5 rounded-lg border border-gray-150" id="lang-switcher-row">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                  language === 'en' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-855'
                }`}
                id="btn-lang-en"
                title="English Language"
              >
                🇺🇸 EN
              </button>
              <button
                onClick={() => setLanguage('sw')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                  language === 'sw' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-855'
                }`}
                id="btn-lang-sw"
                title="Kiswahili Language"
              >
                🇰🇪 SW
              </button>
            </div>

            {/* Premium Sign Out Button */}
            <button
              onClick={() => {
                setIsLoggedIn(false);
                handleAddNotification("Logged out of central Sustainability workspace.");
              }}
              className="px-3 py-1.5 bg-gray-100 hover:bg-rose-50 hover:text-rose-650 border border-gray-200 hover:border-rose-150 text-gray-600 rounded-xl transition-all cursor-pointer flex items-center space-x-1"
              id="btn-sign-out"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold pr-0.5">Sign Out</span>
            </button>

            {/* Notification triggers bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifPanel(!showNotifPanel)}
                className="p-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-600 rounded-xl transition-colors cursor-pointer relative"
                id="header-notif-bell-btn"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Slide Drawer Panel */}
              {showNotifPanel && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden" id="notifications-drawer">
                  <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b">
                    <span className="text-xs font-bold tracking-wide uppercase flex items-center">
                      <Bell className="w-3.5 h-3.5 mr-1.5" />
                      {t.notifTitle}
                    </span>
                    <button 
                      onClick={() => setShowNotifPanel(false)}
                      className="opacity-75 hover:opacity-100 font-bold p-1 cursor-pointer"
                      id="close-notif-btn"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 text-xs">
                    {notifications.length === 0 ? (
                      <p className="text-gray-400 p-4 font-semibold text-center">{t.notifEmpty}</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-3 bg-gray-50/50 hover:bg-gray-50 flex flex-col space-y-0.5">
                          <p className="text-gray-800 leading-normal font-medium">{n.text}</p>
                          <span className="text-[9px] text-gray-400 font-mono mt-0.5">{n.time}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2 border-t border-gray-100 bg-gray-50 text-center flex justify-between px-3">
                    <button 
                      onClick={clearNotifications}
                      className="text-[10px] text-red-500 hover:text-red-700 font-bold hover:underline cursor-pointer"
                      id="btn-clear-alerts"
                    >
                      Clear All
                    </button>
                    <span className="text-[10px] text-gray-400 font-semibold font-mono">TakaGo Hub Alerts</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8" id="takago-portal-container">
        
        {/* Render respective workspaces */}
        {role === 'customer' && (
          <CustomerPortal 
            profile={customerProfile}
            pickups={pickups}
            tickets={tickets}
            chatHistory={chatHistory}
            language={language}
            onUpdateProfile={setCustomerProfile}
            onAddPickup={handleAddPickup}
            onUpdatePickup={handleUpdatePickup}
            onAddTicket={handleAddTicket}
            onSendChatMessage={handleSendChatMessage}
          />
        )}

        {role === 'collector' && (
          <CollectorPortal
            profile={collectorProfile}
            allPickups={pickups}
            chatHistory={chatHistory}
            language={language}
            onUpdatePickup={handleUpdatePickup}
            onSendChatMessage={handleSendChatMessage}
          />
        )}

        {role === 'admin' && (
          <AdminPortal
            pickups={pickups}
            tickets={tickets}
            language={language}
            onUpdatePickup={handleUpdatePickup}
            onUpdateTicket={handleUpdateTicket}
          />
        )}
      </main>

      {/* Responsive Humble Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12" id="takago-app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center space-x-2.5">
            <img 
              src={AppLogo} 
              alt="TakaGo Logo" 
              className="w-5 h-5 rounded-md object-cover border border-gray-100"
              referrerPolicy="no-referrer"
            />
            <p className="font-semibold text-slate-700">TakaGo — {t.tagline}</p>
          </div>
          <p>© 2026 Nairobi Sustainability Green Scheme. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
