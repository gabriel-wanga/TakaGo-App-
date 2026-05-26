import { useState } from 'react';
import { 
  User as UserIcon, MapPin as MapPinIcon, Truck as TruckIcon, Phone as PhoneIcon, 
  Shield as ShieldIcon, DollarSign as DollarSignIcon, Award as AwardIcon, 
  MessageSquare as MessageSquareIcon, Map as MapIcon, Settings as SettingsIcon, 
  ClipboardList as ClipboardListIcon, CheckCircle as CheckCircleIcon, 
  TrendingUp as TrendingUpIcon, Power as PowerIcon, Play as PlayIcon, Check as CheckIcon,
  HelpCircle, Navigation 
} from 'lucide-react';
import { UserProfile, PickupRequest, ChatMessage, PickupStatus } from '../types';
import { Language, translations } from '../utils/translations';
import { RECYCLING_RATES } from '../data/mockData';
import MapSimulator from './MapSimulator';
import ChatSimulator from './ChatSimulator';

interface CollectorPortalProps {
  profile: UserProfile;
  allPickups: PickupRequest[];
  chatHistory: ChatMessage[];
  language: Language;
  onUpdatePickup: (pickupId: string, updates: Partial<PickupRequest>) => void;
  onSendChatMessage: (pickupId: string, text: string) => void;
}

export default function CollectorPortal({
  profile,
  allPickups,
  chatHistory,
  language,
  onUpdatePickup,
  onSendChatMessage
}: CollectorPortalProps) {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'earnings'>('available');
  const [isOnline, setIsOnline] = useState(true);

  // Filter pickups
  const pendingPickups = allPickups.filter(p => p.status === 'pending');
  
  // Collector Juma's active job (accepted, on_the_way, collected)
  const activeJob = allPickups.find(p => p.collectorId === profile.id && ['accepted', 'on_the_way', 'collected'].includes(p.status));
  
  // Collector Juma's completed history
  const completedJobs = allPickups.filter(p => p.collectorId === profile.id && p.status === 'completed');

  // Collector earnings calculation (70% of pickup cost)
  const calculatedEarnings = completedJobs.reduce((acc, job) => acc + (job.estimatedCost * 0.7), 0);

  const handleGoOnlineToggle = () => {
    setIsOnline(!isOnline);
  };

  const handleAcceptJob = (pickupId: string) => {
    onUpdatePickup(pickupId, {
      status: 'accepted',
      collectorId: profile.id,
      collectorName: profile.name
    });
    setActiveTab('active');
  };

  const handleRejectJob = (pickupId: string) => {
    alert(language === 'en' 
      ? `You declined job ${pickupId}. It remains available for nearby waste collectors.` 
      : `Umekataa kazi ${pickupId}. Itabaki kupatikana kwa wakusanyaji wengine.`);
  };

  const handleUpdateStatus = (pickupId: string, nextStatus: PickupStatus) => {
    onUpdatePickup(pickupId, { status: nextStatus });
    if (nextStatus === 'completed') {
      onUpdatePickup(pickupId, { completedAt: 'Just Now' });
    }
  };

  const handleSendQuickReply = (pickupId: string, text: string) => {
    onSendChatMessage(pickupId, text);
  };

  // Preset quick messages to speed up simulator interaction
  const PRESET_MESSAGES = language === 'en' ? [
    "I am heading out now, see you in 5 minutes!",
    "I have arrived outside, please fetch the waste bags.",
    "Is it okay if I pick up the e-waste today?",
    "Perfect, thank you!"
  ] : [
    "Ninaanza kuja sasa hivi, nitafika baada ya dakika tano!",
    "Nimefika nje ya geti lako, tafadhali leta mifuko ya taka.",
    "Je, ni sawa nikichukua taka za kielektroniki leo?",
    "Sawa kabisa, asante!"
  ];

  return (
    <div className="space-y-6" id="collector-portal-main">
      {/* Top Collector Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-lg border border-slate-800" id="collector-hero-header">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img 
                src={profile.avatar} 
                alt={profile.name} 
                className="w-14 h-14 rounded-full border-2 border-emerald-500 object-cover"
                id="collector-avatar-img"
              />
              <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-slate-900 rounded-full ${
                isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`}></span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border border-emerald-500/30">
                {t.collector} {language === 'en' ? 'Duty Shift' : 'Zamu Kazini'}
              </span>
              <h1 className="text-xl font-bold tracking-tight mt-1">{profile.name}</h1>
              <p className="text-slate-400 text-xs">
                {isOnline ? t.dutyOn : t.dutyOff} • Wallet: <span className="text-emerald-400 font-bold font-mono">KES {calculatedEarnings}</span>
              </p>
            </div>
          </div>

          {/* Duty Control Toggle */}
          <button
            onClick={handleGoOnlineToggle}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold tracking-wide flex items-center space-x-2 transition-all cursor-pointer ${
              isOnline 
                ? 'bg-rose-600/90 hover:bg-rose-700 text-white' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
            id="duty-toggle-btn"
          >
            <PowerIcon className="w-4 h-4" />
            <span>{isOnline ? (language === 'en' ? 'Go Offline' : 'Weka Siko Kazini') : (language === 'en' ? 'Go Online' : 'Weka Niko Kazini')}</span>
          </button>
        </div>
      </div>

      {/* Internal Portal Navigation */}
      <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200/50 max-w-sm" id="collector-tab-nav">
        <button
          onClick={() => setActiveTab('available')}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
            activeTab === 'available' ? 'bg-white text-emerald-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
          disabled={!isOnline}
          title={!isOnline ? "Go online to see available jobs" : ""}
          id="coll-tab-available"
        >
          <ClipboardListIcon className="w-3.5 h-3.5" />
          <span>{t.availableJobs}</span>
          {pendingPickups.length > 0 && isOnline && (
            <span className="bg-amber-500 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-1">
              {pendingPickups.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer relative ${
            activeTab === 'active' ? 'bg-white text-emerald-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
          id="coll-tab-active"
        >
          <MapIcon className="w-3.5 h-3.5" />
          <span>{t.myActiveJob}</span>
          {activeJob && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('earnings')}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
            activeTab === 'earnings' ? 'bg-white text-emerald-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
          id="coll-tab-earnings"
        >
          <TrendingUpIcon className="w-3.5 h-3.5" />
          <span>{t.earnings}</span>
        </button>
      </div>

      {/* Offline Alert Placeholder */}
      {!isOnline && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-6 text-center space-y-2" id="offline-warning-block">
          <PowerIcon className="w-8 h-8 text-amber-500 mx-auto animate-pulse" />
          <h3 className="text-sm font-extrabold">{language === 'en' ? 'Shift Disconnected' : 'Mzunguko Umekatika'}</h3>
          <p className="text-xs text-amber-800/80 max-w-sm mx-auto">
            {language === 'en' 
              ? 'You are currently offline. Toggle your shift state to "Go Online" at the top header to discover nearby waste collections.' 
              : 'Kwa sasa hauko kazini. Washa jukumu lako juu ili kuanza kupokea maombi ya taka.'}
          </p>
        </div>
      )}

      {/* Tab contents */}
      {isOnline && activeTab === 'available' && (
        <div className="space-y-4" id="available-radar-screen">
          <div className="flex justify-between items-center bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
            <div>
              <h3 className="text-xs font-bold text-emerald-900 uppercase">Live Pickup Dispatch Radar</h3>
              <p className="text-[11px] text-emerald-850/80 mt-0.5">Showing unassigned residential requests within 5km radius</p>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-850 font-bold px-2 py-0.5 rounded">GPS Enabled</span>
          </div>

          {pendingPickups.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-gray-150 py-12 flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                <Navigation className="w-5 h-5 animate-spin-pulse" />
              </div>
              <h4 className="text-sm font-bold text-gray-800">Searching neighborhood...</h4>
              <p className="text-xs text-gray-400 max-w-sm mt-1">
                No citizen pickups currently waiting in Kilimani. Keep this tab open; new requests stream here live when citizens check out.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="available-jobs-grid">
              {pendingPickups.map((pickup) => (
                <div key={pickup.id} className="bg-white border border-gray-200/85 hover:border-emerald-500 rounded-3xl p-5 shadow-sm space-y-4 transition-all" id={`coll-job-card-${pickup.id}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-slate-900 font-mono text-sm">{pickup.id}</h4>
                      <p className="text-gray-400 text-[10px] mt-0.5">Scheduled for: <span className="text-slate-700 font-bold">{pickup.scheduledTime}</span></p>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200/50">
                      Collector Pay: <strong className="font-mono text-emerald-800">KES {Math.ceil(pickup.estimatedCost * 0.7)}</strong>
                    </span>
                  </div>

                  <div className="p-3 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-2 text-xs">
                    <p className="text-gray-400 flex justify-between text-[11px]">
                      <span>Citizen Resident:</span>
                      <strong className="text-slate-800">{pickup.customerName}</strong>
                    </p>
                    <p className="text-gray-400 flex justify-between text-[11px]">
                      <span>Location:</span>
                      <strong className="text-slate-800 truncate max-w-[180px]">{pickup.location}</strong>
                    </p>
                    <p className="text-gray-400 flex justify-between text-[11px]">
                      <span>Weight Estimate:</span>
                      <strong className="text-emerald-700 font-mono font-bold">{pickup.totalWeight} kg</strong>
                    </p>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {pickup.items.map((it) => (
                        <span key={it.category} className="bg-white px-2 py-0.5 border border-gray-150 rounded text-[9px] uppercase text-gray-500 font-semibold font-mono">
                          {t[it.category]} ({it.weightKb}k)
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={() => handleRejectJob(pickup.id)}
                      className="flex-1 py-2 border border-gray-205 text-gray-500 hover:bg-gray-50 text-[11px] font-bold rounded-xl cursor-pointer"
                      id={`btn-reject-${pickup.id}`}
                    >
                      {t.rejectJob}
                    </button>
                    <button
                      onClick={() => handleAcceptJob(pickup.id)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold rounded-xl shadow-sm cursor-pointer"
                      id={`btn-accept-${pickup.id}`}
                    >
                      {t.acceptJob} ➔
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active Assignment Workspace */}
      {isOnline && activeTab === 'active' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="collector-active-job-workspace">
          {activeJob ? (
            <>
              {/* Left Details Panel & Navigation map */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-gray-150/70 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <TruckIcon className="w-5 h-5 text-emerald-600" />
                      <h2 className="text-base font-extrabold text-slate-800">{t.myActiveJob}: {activeJob.id}</h2>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-800 font-bold px-2 py-0.5 rounded-full font-mono uppercase">
                      {t[activeJob.status]}
                    </span>
                  </div>

                  {/* Collector milestones / Status transition controllers */}
                  <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-150 space-y-3" id="collector-status-controller-card">
                    <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">Workflow Dispatcher</h4>
                    <p className="text-[11px] text-emerald-800 leading-normal">Configure the status coordinates as you drive and load waste. This updates the customer's feed automatically.</p>
                    
                    <div className="flex flex-col sm:flex-row gap-2 pt-1" id="collector-workflow-buttons">
                      {/* Milestones toggled in sequence */}
                      {activeJob.status === 'accepted' && (
                        <button
                          onClick={() => handleUpdateStatus(activeJob.id, 'on_the_way')}
                          className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl flex items-center justify-center space-x-1.5 shadow"
                          id="btn-status-ontheway"
                        >
                          <PlayIcon className="w-3.5 h-3.5 fill-white" />
                          <span>Dispatch "On the Way" Route</span>
                        </button>
                      )}

                      {activeJob.status === 'on_the_way' && (
                        <button
                          onClick={() => handleUpdateStatus(activeJob.id, 'collected')}
                          className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl flex items-center justify-center space-x-1.5 shadow"
                          id="btn-status-collected"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                          <span>Mark Trash Picked Up & Loaded 🧴</span>
                        </button>
                      )}

                      {activeJob.status === 'collected' && (
                        <button
                          onClick={() => handleUpdateStatus(activeJob.id, 'completed')}
                          className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold rounded-2xl flex items-center justify-center space-x-1.5 shadow"
                          id="btn-status-completed"
                        >
                          <AwardIcon className="w-4 h-4" />
                          <span>Deliver Cargo & Unlock Earnings Wallet</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Display Customer Bio Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs" id="coll-customer-sheet">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-150 space-y-2">
                      <h4 className="font-extrabold text-slate-800 uppercase text-[10px] tracking-wide">{t.customerDetails}</h4>
                      <p className="font-bold text-sm text-gray-900">{activeJob.customerName}</p>
                      <p className="text-gray-500 font-mono mt-1">{activeJob.customerPhone}</p>
                      <div className="flex items-center space-x-1 text-[11px] text-gray-500 pt-1">
                        <MapPinIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{activeJob.location}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-150 space-y-2">
                      <h4 className="font-extrabold text-slate-800 uppercase text-[10px] tracking-wide">Trash Composition</h4>
                      {activeJob.items.map((it) => (
                        <div key={it.category} className="flex justify-between items-center text-[11px]">
                          <span className="capitalize">{t[it.category]}</span>
                          <span className="font-mono font-bold text-slate-700">{it.weightKb} kg</span>
                        </div>
                      ))}
                      <div className="border-t border-gray-200 pt-1.5 mt-1 flex justify-between font-bold">
                        <span>Total Weight:</span>
                        <span className="font-mono text-emerald-800">{activeJob.totalWeight} kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Built-in GPS MAP component */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-gray-500 uppercase flex items-center">
                      <MapIcon className="w-4 h-4 mr-1 text-emerald-600" />
                      {t.activeRoute}
                    </h3>
                    <MapSimulator
                      status={activeJob.status}
                      customerName={activeJob.customerName}
                      collectorName={profile.name}
                      onSimulationStep={(newStatus) => onUpdatePickup(activeJob.id, { status: newStatus })}
                    />
                  </div>
                </div>
              </div>

              {/* Connected Chat Widget on the Collector Right Column */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm" id="collector-chat-widget">
                  <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-xs font-extrabold text-gray-600 uppercase tracking-wide flex items-center">
                      <MessageSquareIcon className="w-4 h-4 mr-1.5 text-emerald-600" />
                      Chat with Customer
                    </h3>
                    <span className="text-[10px] bg-emerald-100 text-emerald-900 border font-bold px-1.5 py-0.5 rounded">Resident Feed</span>
                  </div>

                  <ChatSimulator
                    pickupId={activeJob.id}
                    senderRole="collector"
                    senderName={profile.name}
                    recipientName={activeJob.customerName}
                    chatHistory={chatHistory}
                    language={language}
                    onSendMessage={(text) => onSendChatMessage(activeJob.id, text)}
                  />

                  {/* Collector presets block */}
                  <div className="p-3.5 bg-gray-50 border-t border-gray-100 space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Collector Quick Helper Texts</p>
                    <div className="flex flex-wrap gap-1.5" id="preset-chat-replies-list">
                      {PRESET_MESSAGES.map((msgText, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendQuickReply(activeJob.id, msgText)}
                          className="bg-white hover:bg-gray-100 px-2.5 py-1.5 border border-gray-200 rounded-lg text-[10px] text-gray-700 text-left truncate max-w-full cursor-pointer hover:border-emerald-400 transition-colors"
                        >
                          {msgText}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="lg:col-span-12 p-10 bg-white border border-gray-150 rounded-3xl text-center flex flex-col items-center justify-center py-12" id="no-active-collector-job">
              <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-3">
                <TruckIcon className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-gray-800">No active pickup assignment</h3>
              <p className="text-xs text-gray-400 max-w-sm mt-1">
                Excellent! Open the "Nearby Work" tab to browse pending citizen requests in Kilimani and accept tasks!
              </p>
              <button
                onClick={() => setActiveTab('available')}
                className="mt-4 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl cursor-pointer shadow-sm"
              >
                Browse Pending Citizen Orders
              </button>
            </div>
          )}
        </div>
      )}

      {/* Earnings Summary Dashboard */}
      {isOnline && activeTab === 'earnings' && (
        <div className="space-y-6" id="collector-earnings-dashboard">
          {/* Earnings metrics grids */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="collector-earnings-metrics">
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Wallet Balance</p>
                <p className="text-xl font-black text-slate-800 font-mono mt-1">KES {calculatedEarnings}</p>
                <p className="text-[10px] text-emerald-605 font-bold mt-1">Ready to withdraw</p>
              </div>
              <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 font-bold font-mono">KES</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Completed Collections</p>
                <p className="text-xl font-black text-slate-800 font-mono mt-1">{completedJobs.length} tasks</p>
                <p className="text-[10px] text-gray-400 mt-1">Nairobi Hub transfers</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Total Waste Delivered</p>
                <p className="text-xl font-black text-slate-800 font-mono mt-1">
                  {completedJobs.reduce((acc, job) => acc + job.totalWeight, 0).toFixed(1)} kg
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-1">Processed at eco-plant</p>
              </div>
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                <AwardIcon className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Simulated Mobile Money Withdrawal Form */}
          <div className="bg-emerald-50/50 rounded-3xl p-6 border border-emerald-100 space-y-4">
            <h3 className="text-sm font-bold text-emerald-950 flex items-center">
              <DollarSignIcon className="w-4 h-4 mr-1 text-emerald-600" />
              Withdraw Instant Earnings (M-Pesa / Cashout)
            </h3>
            <p className="text-xs text-emerald-800/80 leading-normal max-w-xl">
              Withdraw is linked directly to your phone. Cash enters your mobile wallet immediately with 0% interest charges as part of the Green Collectors County Benefit scheme!
            </p>
            <button
              type="button"
              onClick={() => {
                if (calculatedEarnings <= 0) {
                  alert(language === 'en' ? "Your balance is 0 KES. Complete pickups to earn payout!" : "Salio lako ni 0 KES. Kamilisha kazi ili kupata mgao!");
                  return;
                }
                alert(language === 'en' 
                  ? `Withdrawing KES ${calculatedEarnings} directly to your registered M-Pesa line...` 
                  : `Inahamisha KES ${calculatedEarnings} kwenda kwenye akaunti yako ya M-PESA...`);
              }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-xs rounded-xl transition-all cursor-pointer shadow-sm"
              id="collector-cashout-btn"
            >
              Transfer to M-Pesa Wallet
            </button>
          </div>

          {/* Historical Collector List */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-xs uppercase font-extrabold text-gray-500 tracking-wider">Completed Task Ledger ({completedJobs.length})</h3>
            
            {completedJobs.length === 0 ? (
              <p className="text-xs text-gray-400 py-3 block">No completed records exist in your wallet yet.</p>
            ) : (
              <div className="space-y-2.5" id="collector-history-list">
                {completedJobs.map((job) => (
                  <div key={job.id} className="p-3 bg-gray-50/50 border border-gray-150 rounded-xl text-xs flex justify-between items-center">
                    <div>
                      <p className="font-extrabold text-slate-800 font-mono">{job.id}</p>
                      <p className="text-[10px] text-gray-400">{job.completedAt || 'Recently'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-emerald-800 font-mono">+{(job.estimatedCost * 0.7).toFixed(0)} KES</p>
                      <p className="text-[9px] text-gray-400">{job.totalWeight} kg delivered</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
