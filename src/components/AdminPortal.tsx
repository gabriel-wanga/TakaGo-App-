import { useState } from 'react';
import { 
  Layers, Users, Wrench, ShieldAlert, DollarSign, Award, TrendingUp, Check, 
  Trash, UserCheck, RefreshCw, FileText, BarChart2, AlertTriangle, ChevronRight, 
  Trash2, ShieldCheck, HelpCircle, Inbox, Mail, CheckCircle2 
} from 'lucide-react';
import { 
  UserProfile, PickupRequest, SupportTicket, SystemStats, WasteCategory 
} from '../types';
import { Language, translations } from '../utils/translations';
import { initialStats, RECYCLING_RATES } from '../data/mockData';

interface AdminPortalProps {
  pickups: PickupRequest[];
  tickets: SupportTicket[];
  language: Language;
  onUpdatePickup: (pickupId: string, updates: Partial<PickupRequest>) => void;
  onUpdateTicket: (ticketId: string, updates: Partial<SupportTicket>) => void;
}

export default function AdminPortal({
  pickups,
  tickets,
  language,
  onUpdatePickup,
  onUpdateTicket
}: AdminPortalProps) {
  const t = translations[language];
  const [adminTab, setAdminTab] = useState<'analytics' | 'dispatch' | 'support' | 'users'>('analytics');
  
  // Simulated admin actions
  const [selectedCollector, setSelectedCollector] = useState<Record<string, string>>({});
  const [ticketReplies, setTicketReplies] = useState<Record<string, string>>({});

  // Dynamic calculations based on pickups + base system credentials
  const completedCount = pickups.filter(p => p.status === 'completed').length;
  const currentRevenue = pickups.reduce((acc, p) => acc + p.estimatedCost, 0);

  // Sum points awarded to residents
  const currentPointsAwarded = pickups.reduce((acc, p) => {
    return acc + p.items.reduce((sum, item) => sum + item.pointsReward, 0);
  }, 0);

  // Sum waste weight
  const totalWeightKg = pickups.reduce((acc, p) => acc + p.totalWeight, 0);

  // Admin stats
  const aggregateStats = {
    totalWasteCollectedKg: initialStats.totalWasteCollectedKg + totalWeightKg,
    totalPointsAwarded: initialStats.totalPointsAwarded + currentPointsAwarded,
    totalEarningsKes: initialStats.totalEarningsKes + currentRevenue,
    totalOrdersCompleted: initialStats.totalOrdersCompleted + completedCount
  };

  // Calculate waste split for graphs
  const categoriesSplit: Record<WasteCategory, number> = {
    plastic: 250, // base mock metric to look realistic
    organic: 420,
    metal: 90,
    paper: 180,
    ewaste: 110
  };

  // Add the loaded weights
  pickups.forEach(p => {
    p.items.forEach(it => {
      categoriesSplit[it.category] = (categoriesSplit[it.category] || 0) + it.weightKb;
    });
  });

  const totalWasteSplitWeight = Object.values(categoriesSplit).reduce((a, b) => a + b, 0);

  // Available Collectors roster
  const COLLECTORS_ROSTER = [
    { id: 'coll_99', name: 'Juma Joseph', phone: '+254722998877', activeJobs: pickups.filter(p => p.collectorId === 'coll_99' && p.status !== 'completed').length },
    { id: 'coll_02', name: 'Karanja Edwin', phone: '+254711223344', activeJobs: pickups.filter(p => p.collectorId === 'coll_02' && p.status !== 'completed').length },
    { id: 'coll_03', name: 'Fatuma Abdi', phone: '+254733667788', activeJobs: pickups.filter(p => p.collectorId === 'coll_03' && p.status !== 'completed').length }
  ];

  // Pending pickups for dispatch overrides
  const pendingRequests = pickups.filter(p => p.status === 'pending');

  const handleManualDispatch = (pickupId: string) => {
    const rId = selectedCollector[pickupId];
    if (!rId) {
      alert(language === 'en' ? 'Please select a waste collector to dispatch!' : 'Tafadhali chagua mkusanyaji mmoja wa kumpa kazi!');
      return;
    }
    const collector = COLLECTORS_ROSTER.find(r => r.id === rId);
    if (!collector) return;

    onUpdatePickup(pickupId, {
      status: 'accepted',
      collectorId: collector.id,
      collectorName: collector.name
    });

    alert(language === 'en' 
      ? `Dispatched Waste Collector "${collector.name}" manually to pickup case ${pickupId}.` 
      : `Imempangia Mkusanyaji "${collector.name}" kazi hii kwa mikono ya kesi ${pickupId}.`);
  };

  const handleResolveTicket = (ticketId: string) => {
    const replyText = ticketReplies[ticketId] || '';
    if (!replyText.trim()) {
      alert(language === 'en' ? 'Please input an official reply message!' : 'Tafadhali andika jibu rasmi kwanza!');
      return;
    }

    onUpdateTicket(ticketId, {
      status: 'resolved',
      reply: replyText
    });

    alert(language === 'en' ? 'Ticket resolved and citizen notified!' : 'Tiketi imesuluhishwa na mteja amearifiwa!');
  };

  return (
    <div className="space-y-6" id="admin-portal-main">
      {/* Admin Title panel */}
      <div className="bg-emerald-800 text-white rounded-3xl p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4" id="admin-header-tile">
        <div className="space-y-1">
          <span className="text-[10px] bg-emerald-750 text-emerald-300 font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full border border-emerald-700/60">
            {t.admin} {language === 'en' ? 'Control Console' : 'Dawati la Usimamizi'}
          </span>
          <h1 className="text-xl font-bold tracking-tight mt-1">{t.adminOverview}</h1>
          <p className="text-emerald-100 text-xs">
            {language === 'en' ? 'Monitoring real-time household dispatch matches and landfill diversion indices.' : 'Inasimamia maombi ya kuchukua taka, malipo, na kuratibu madereva jijini Nairobi.'}
          </p>
        </div>

        {/* Mini stats */}
        <div className="flex bg-emerald-900 border border-emerald-750 p-3 rounded-2xl space-x-4 shrink-0 text-xs text-center font-mono" id="admin-mini-hud">
          <div>
            <p className="text-emerald-300 uppercase text-[9px] font-bold">Pending Orders</p>
            <p className="text-base font-black text-white mt-0.5">{pendingRequests.length}</p>
          </div>
          <div className="w-px bg-emerald-800 self-stretch"></div>
          <div>
            <p className="text-emerald-300 uppercase text-[9px] font-bold">Unresolved Tickets</p>
            <p className="text-base font-black text-red-400 mt-0.5">
              {tickets.filter(tck => tck.status === 'open').length}
            </p>
          </div>
        </div>
      </div>

      {/* Admin sub menu tab selector */}
      <div className="flex bg-gray-100/80 p-1 rounded-xl border border-gray-200/50 max-w-md" id="admin-tab-nav">
        <button
          onClick={() => setAdminTab('analytics')}
          className={`flex-1 flex items-center justify-center space-x-1 py-2 rounded-lg text-xs font-semibold tracking-wide cursor-pointer transition-all ${
            adminTab === 'analytics' ? 'bg-white text-emerald-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
          id="admin-tab-btn-analytics"
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Dashboard' : 'Mwenendo'}</span>
        </button>

        <button
          onClick={() => setAdminTab('dispatch')}
          className={`flex-1 flex items-center justify-center space-x-1 py-2 rounded-lg text-xs font-semibold tracking-wide cursor-pointer transition-all ${
            adminTab === 'dispatch' ? 'bg-white text-emerald-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
          id="admin-tab-btn-dispatch"
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Dispatch' : 'Kugawa Kazi'}</span>
          {pendingRequests.length > 0 && (
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('support')}
          className={`flex-1 flex items-center justify-center space-x-1 py-2 rounded-lg text-xs font-semibold tracking-wide cursor-pointer transition-all relative ${
            adminTab === 'support' ? 'bg-white text-emerald-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
          id="admin-tab-btn-support"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Citizens Desk' : 'Dawati la Msaada'}</span>
          {tickets.filter(t => t.status === 'open').length > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 bg-rose-500 rounded-full animate-bounce"></span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('users')}
          className={`flex-1 flex items-center justify-center space-x-1 py-2 rounded-lg text-xs font-semibold tracking-wide cursor-pointer transition-all ${
            adminTab === 'users' ? 'bg-white text-emerald-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
          id="admin-tab-btn-users"
        >
          <Users className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Rosters' : 'Orodha'}</span>
        </button>
      </div>

      {/* Tab Panels */}
      {adminTab === 'analytics' && (
        <div className="space-y-6" id="admin-tab-panel-analytics">
          {/* Key Metric Bento grids */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="admin-bento-grid">
            {/* Metric 1 */}
            <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide">Total Garbage Collected</p>
                  <p className="text-xl font-black text-slate-800 font-mono mt-1">{aggregateStats.totalWasteCollectedKg.toFixed(1)} kg</p>
                </div>
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                  <Layers className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center">
                <span>Diverted from Landfills</span>
              </p>
            </div>

            {/* Metric 2 */}
            <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide">Economic Revenue</p>
                  <p className="text-xl font-black text-slate-800 font-mono mt-1">KES {aggregateStats.totalEarningsKes}</p>
                </div>
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                  <DollarSign className="w-5 h-5 font-bold" />
                </div>
              </div>
              <p className="text-[10px] text-emerald-600 font-semibold">County service deposits</p>
            </div>

            {/* Metric 3 */}
            <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide">Eco Reward Points Out</p>
                  <p className="text-xl font-black text-slate-800 font-mono mt-1">+{aggregateStats.totalPointsAwarded} pts</p>
                </div>
                <div className="p-2 bg-yellow-50 rounded-xl text-yellow-600">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[10px] text-emerald-60s font-bold text-yellow-600">Vesting green loyalty balance</p>
            </div>

            {/* Metric 4 */}
            <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide">Collection Completed</p>
                  <p className="text-xl font-black text-slate-800 font-mono mt-1">{aggregateStats.totalOrdersCompleted} trans</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[10px] text-blue-600 font-semibold">100% collector fulfillment rate</p>
            </div>
          </div>

          {/* Graphics layout representation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="admin-charts-columns">
            {/* Handcrafted Vector waste split analytics */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-gray-150 shadow-sm space-y-5">
              <div>
                <h3 className="text-sm font-bold text-gray-900">{t.analytics}</h3>
                <p className="text-xs text-gray-400 mt-1">Distribution array comparing separated categories weight ratios (kg)</p>
              </div>

              {/* Stacked bar diagram visualization */}
              <div className="space-y-4" id="metric-split-bars">
                {(Object.keys(categoriesSplit) as WasteCategory[]).map((cat) => {
                  const weight = categoriesSplit[cat];
                  const percentage = totalWasteSplitWeight > 0 ? (weight / totalWasteSplitWeight) * 100 : 0;
                  const data = RECYCLING_RATES[cat] || { bg: 'bg-emerald-50', text: 'text-emerald-700' };

                  return (
                    <div key={cat} className="space-y-1.5" id={`analytics-chart-row-${cat}`}>
                      <div className="flex justify-between text-xs font-medium">
                        <span className="capitalize text-gray-700 flex items-center">
                          <span className="mr-1">{cat === 'plastic' && '🧴'} {cat === 'organic' && '🍌'} {cat === 'metal' && '🥫'} {cat === 'paper' && '📦'} {cat === 'ewaste' && '💻'}</span>
                          {t[cat]}
                        </span>
                        <span className="font-mono text-gray-500">
                          <strong>{weight.toFixed(1)} kg</strong> ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      
                      {/* Bar indicator */}
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-gray-150/50">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            cat === 'plastic' ? 'bg-emerald-500' :
                            cat === 'organic' ? 'bg-yellow-550 bg-amber-500' :
                            cat === 'metal' ? 'bg-sky-500' :
                            cat === 'paper' ? 'bg-indigo-505 bg-indigo-500' :
                            'bg-purple-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Help guidelines & carbon offset impact registry */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-gray-150 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="text-xs uppercase font-extrabold text-emerald-805 text-emerald-700 tracking-wider">County Environmental Impact</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Separating waste reduces global methane deposits. By diverting organic matter to specialized green compost makers in Kitengela and sending plastics directly to recycling fabricators, TakaGo achieved:
                </p>
              </div>

              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3 font-semibold text-xs text-emerald-950">
                <div className="flex justify-between">
                  <span>Carbon Offset Equivalent:</span>
                  <span className="font-mono text-emerald-800">4.5 Metric Tons CO₂</span>
                </div>
                <div className="flex justify-between">
                  <span>Plastics Re-extruded:</span>
                  <span className="font-mono text-emerald-800">289 kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Compost Generated:</span>
                  <span className="font-mono text-emerald-800">540 kg</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 flex items-center space-x-2 text-[10px] text-gray-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <p>Nairobi County Sustainability Board Verified Audit Records.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dispatch dashboard */}
      {adminTab === 'dispatch' && (
        <div className="space-y-4" id="admin-dispatch-override-hub">
          <div className="bg-emerald-50 border border-emerald-150 p-4 rounded-xl">
            <h3 className="text-xs font-bold text-emerald-950 uppercase">{t.manualAssign}</h3>
            <p className="text-[11px] text-emerald-800 mt-1 leading-normal">
              If citizens report waste collectors are caught in traffic, or if automated matches fail, administrators can manually dispatch any eco-collector within Nairobi to fulfill any unassigned collection request.
            </p>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-gray-150 flex flex-col items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mb-2" />
              <h4 className="text-sm font-bold text-gray-800">All collection queues cleared</h4>
              <p className="text-xs text-gray-400 max-w-sm mt-1">
                Excellent! Citizens have no unassigned pickup cases awaiting collector allocations. Any new requests placed by residents will appear on this control list.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="override-dispatch-lists">
              {pendingRequests.map((req) => (
                <div key={req.id} className="bg-white border border-gray-150 p-5 rounded-3xl space-y-3" id={`dispatch-override-card-${req.id}`}>
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <p className="font-extrabold text-slate-900 font-mono text-sm">{req.id}</p>
                      <p className="text-gray-400 text-[10px] mt-0.5">Resident: {req.customerName}</p>
                    </div>
                    <span className="bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded uppercase text-[10px] font-mono tracking-wide">
                      Unassigned
                    </span>
                  </div>

                  <div className="bg-gray-50/50 p-2.5 rounded-2xl border border-gray-100 text-[11px] text-gray-500 space-y-1">
                    <p><strong>Cargo Type:</strong> {req.items.map(it=> t[it.category]).join(', ')} ({req.totalWeight} kg)</p>
                    <p className="truncate"><strong>Location:</strong> {req.location}</p>
                  </div>

                  {/* Manual match form dropdown */}
                  <div className="flex items-center space-x-2 pt-2" id={`dispatch-controls-${req.id}`}>
                    <select
                      value={selectedCollector[req.id] || ''}
                      onChange={(e) => setSelectedCollector({ ...selectedCollector, [req.id]: e.target.value })}
                      className="flex-1 bg-white border border-gray-200 rounded-xl p-2 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      id={`select-collector-picker-${req.id}`}
                    >
                      <option value="">-- Choose Waste Collector --</option>
                      {COLLECTORS_ROSTER.map((collector) => (
                        <option key={collector.id} value={collector.id}>
                          {collector.name} ({collector.activeJobs} jobs active)
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleManualDispatch(req.id)}
                      className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl tracking-wide cursor-pointer flex items-center shrink-0 shadow-sm"
                      id={`btn-manual-dispatch-action-${req.id}`}
                    >
                      Dispatch Collector
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Citizens Complaint cases Coordinator */}
      {adminTab === 'support' && (
        <div className="space-y-4" id="admin-citizen-tickets-screen">
          <div className="bg-emerald-50 border border-emerald-150 p-4 rounded-xl flex items-center space-x-3 text-emerald-800">
            <Mail className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs leading-relaxed font-semibold">
              {t.complaints}: Read messages filed by residents regarding pickup bottlenecks, local waste collections, or reward card adjustments.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="tickets-resolution-lists">
            {/* Main ticket list */}
            <div className="lg:col-span-7 space-y-3 bg-white p-5 rounded-3xl border border-gray-150 shadow-sm">
              <h3 className="text-xs uppercase font-extrabold text-gray-500 tracking-wider">Citizen Support Tickets Queue</h3>
              
              <div className="space-y-2 max-h-[500px] overflow-y-auto" id="admin-tickets-items-viewport">
                {tickets.map((tck) => (
                  <div key={tck.id} className="p-4 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 rounded-2xl text-xs space-y-2 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-extrabold text-slate-800 font-mono text-[11px]">{tck.id}</span>
                        <p className="text-gray-450 text-[10px]">Citizen: <strong>{tck.customerName}</strong></p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono ${
                        tck.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-rose-100 text-rose-800 animate-pulse'
                      }`}>
                        {tck.status}
                      </span>
                    </div>

                    <div>
                      <p className="font-bold text-slate-900">{tck.subject}</p>
                      <p className="text-gray-500 leading-relaxed mt-0.5">{tck.description}</p>
                    </div>

                    {tck.reply && (
                      <p className="bg-emerald-50 text-emerald-850 p-2 rounded border border-emerald-100 text-[11px]">
                        <strong>Admin Reply:</strong> "{tck.reply}"
                      </p>
                    )}

                    {/* Quick Reply Form inside ticket card if open */}
                    {tck.status === 'open' && (
                      <div className="space-y-1.5 border-t border-gray-150 pt-2.5 mt-2" id={`reply-form-${tck.id}`}>
                        <input
                          type="text"
                          placeholder="Type customer reply message..."
                          value={ticketReplies[tck.id] || ''}
                          onChange={(e) => setTicketReplies({ ...ticketReplies, [tck.id]: e.target.value })}
                          className="w-full text-xs px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-800"
                          id={`input-reply-${tck.id}`}
                        />
                        <button
                          onClick={() => handleResolveTicket(tck.id)}
                          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-[11px] rounded-lg transition-colors cursor-pointer"
                          id={`btn-resolve-case-${tck.id}`}
                        >
                          Resolve Case & Reply
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Support policies and SLA */}
            <div className="lg:col-span-5 bg-emerald-50/50 rounded-3xl p-6 border border-emerald-100 space-y-4">
              <h4 className="text-xs font-bold text-emerald-950 uppercase">Citizen Care SLA Guidelines</h4>
              <p className="text-xs text-emerald-850/80 leading-relaxed">
                Nairobi environmental coordinators resolve household payment disputes within 2 hours of citizen dispatches. Be clear and polite when authorizing point credits. Keep communication professional on the main county portal.
              </p>
              <div className="p-4 bg-white rounded-2xl border border-emerald-200/50 space-y-2 text-xs">
                <div className="flex justify-between font-semibold">
                  <span>Target SLA response:</span>
                  <span className="text-emerald-800">120 Minutes</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Resolved this cycle:</span>
                  <span className="text-emerald-850 font-mono">100% Cases</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users / Roster database views */}
      {adminTab === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="profiles-rosters-lists">
          {/* Active Citizen Residents roster */}
          <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm space-y-3">
            <h3 className="text-xs uppercase font-extrabold text-gray-500 tracking-wider">Verified Citizen Residents</h3>
            
            <div className="space-y-2.5 max-h-[400px] overflow-y-auto" id="admin-resident-roster">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-500 text-white font-extrabold flex items-center justify-center">GW</div>
                  <div>
                    <h4 className="font-bold text-slate-900">Grace Wambui</h4>
                    <p className="text-[10px] text-gray-400">Kilimani Road, Nairobi</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">450 pts</span>
              </div>

              <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-full bg-purple-500 text-white font-extrabold flex items-center justify-center">DM</div>
                  <div>
                    <h4 className="font-bold text-slate-900">Dennis Mutua</h4>
                    <p className="text-[10px] text-gray-400">Ngong Road, Kibera Link</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">180 pts</span>
              </div>
            </div>
          </div>

          {/* Active Eco riders roster */}
          <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm space-y-3">
            <h3 className="text-xs uppercase font-extrabold text-gray-500 tracking-wider">County Waste Collectors Roster</h3>
            
            <div className="space-y-2.5 max-h-[400px] overflow-y-auto" id="admin-collectors-roster">
              {COLLECTORS_ROSTER.map((collector) => (
                <div key={collector.id} className="p-3 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between text-xs" id={`roster-collector-${collector.id}`}>
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-extrabold flex items-center justify-center">
                      {collector.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{collector.name}</h4>
                      <p className="text-[10px] text-gray-400 font-mono">{collector.phone}</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-850 font-bold px-2 py-0.5 rounded">
                    {collector.activeJobs} Jobs Pending
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
