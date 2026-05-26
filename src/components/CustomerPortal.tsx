import { useState, FormEvent } from 'react';
import { 
  Trash2, Calendar, MapPin, CreditCard, Award, History, HelpCircle, Plus, Star, 
  MessageSquare, Leaf, Truck, ChevronRight, Info, Coins, ShieldCheck, Check, 
  CheckCircle2, Clock, AlertCircle, Navigation 
} from 'lucide-react';
import { 
  UserProfile, PickupRequest, WasteCategory, WasteItem, SupportTicket, ChatMessage, PickupStatus 
} from '../types';
import { Language, translations } from '../utils/translations';
import { RECYCLING_RATES } from '../data/mockData';
import MapSimulator from './MapSimulator';
import ChatSimulator from './ChatSimulator';

interface CustomerPortalProps {
  profile: UserProfile;
  pickups: PickupRequest[];
  tickets: SupportTicket[];
  chatHistory: ChatMessage[];
  language: Language;
  onUpdateProfile: (p: UserProfile) => void;
  onAddPickup: (req: PickupRequest) => void;
  onUpdatePickup: (pickupId: string, updates: Partial<PickupRequest>) => void;
  onAddTicket: (t: SupportTicket) => void;
  onSendChatMessage: (pickupId: string, text: string) => void;
}

export default function CustomerPortal({
  profile,
  pickups,
  tickets,
  chatHistory,
  language,
  onUpdateProfile,
  onAddPickup,
  onUpdatePickup,
  onAddTicket,
  onSendChatMessage
}: CustomerPortalProps) {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'schedule' | 'history' | 'rewards' | 'support'>('schedule');

  // Booking states
  const [selectedCats, setSelectedCats] = useState<WasteCategory[]>(['plastic']);
  const [weights, setWeights] = useState<Record<WasteCategory, number>>({
    plastic: 5,
    organic: 10,
    metal: 0,
    paper: 0,
    ewaste: 0
  });
  const [recurrence, setRecurrence] = useState<'oneTime' | 'recurring'>('oneTime');
  const [freq, setFreq] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [address, setAddress] = useState('Kilimani Close, Block 4C Apartment 12A, Nairobi');
  const [payMethod, setPayMethod] = useState<'mpesa' | 'card'>('mpesa');
  
  // Payment PIN modal
  const [showPinModal, setShowPinModal] = useState(false);
  const [mpesaPin, setMpesaPin] = useState('');
  const [isProcessingPay, setIsProcessingPay] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Active chat
  const [activeChatPickupId, setActiveChatPickupId] = useState<string | null>(null);

  // New ticket state
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // Star ratings state
  const [tempRating, setTempRating] = useState<Record<string, number>>({});
  const [tempReview, setTempReview] = useState<Record<string, string>>({});

  // Calculations for prospective booking
  const calculatedItems: WasteItem[] = selectedCats.map(cat => {
    const weight = weights[cat] || 1;
    const points = Math.ceil(weight * (RECYCLING_RATES[cat]?.pointsPerKg || 5));
    return {
      category: cat,
      weightKb: weight,
      pointsReward: points
    };
  });

  const totalWeightStr = calculatedItems.reduce((acc, item) => acc + item.weightKb, 0);
  
  // Costs: Base fee 150 KES + 15 KES per kg
  const estimatedCostStr = Math.max(150, 150 + Math.ceil(totalWeightStr * 15));
  const estimatedPointsReward = calculatedItems.reduce((acc, item) => acc + item.pointsReward, 0);

  const handleToggleCategory = (cat: WasteCategory) => {
    if (selectedCats.includes(cat)) {
      if (selectedCats.length > 1) {
        setSelectedCats(selectedCats.filter(c => c !== cat));
      }
    } else {
      setSelectedCats([...selectedCats, cat]);
    }
  };

  const handleWeightChange = (cat: WasteCategory, val: number) => {
    setWeights({
      ...weights,
      [cat]: val
    });
  };

  const handleOpenPayment = () => {
    if (totalWeightStr === 0) {
      alert(language === 'en' ? "Please set weight greater than 0 kg to proceed!" : "Tafadhali weka uzito mkubwa kuliko 0 kg kwanza!");
      return;
    }
    setShowPinModal(true);
  };

  const handleConfirmPay = () => {
    if (payMethod === 'mpesa' && mpesaPin.length !== 4) {
      alert(language === 'en' ? "Please input a 4-digit M-Pesa PIN!" : "Tafadhali weka tarakimu nne za siri za M-Pesa!");
      return;
    }
    setIsProcessingPay(true);
    setTimeout(() => {
      setIsProcessingPay(false);
      setShowPinModal(false);
      setMpesaPin('');
      
      // Create new request
      const genId = 'TGO-' + Math.floor(1000 + Math.random() * 9000);
      const newReq: PickupRequest = {
        id: genId,
        customerId: profile.id,
        customerName: profile.name,
        customerPhone: profile.phone,
        location: address,
        latitude: -1.2921 + (Math.random() - 0.5) * 0.02,
        longitude: 36.8219 + (Math.random() - 0.5) * 0.02,
        scheduledTime: recurrence === 'oneTime' ? 'Today, ASAP' : `Every Tuesday (${freq})`,
        isRecurring: recurrence === 'recurring',
        recurrenceType: recurrence === 'recurring' ? freq : undefined,
        items: calculatedItems,
        totalWeight: totalWeightStr,
        estimatedCost: estimatedCostStr,
        paymentMethod: payMethod,
        paymentStatus: 'paid',
        status: 'pending'
      };

      onAddPickup(newReq);
      setBookingSuccess(true);
      // Automatically navigate to history tab to track
      setTimeout(() => {
        setBookingSuccess(false);
        setActiveTab('history');
      }, 3500);

    }, 2000);
  };

  const handleRedeemVoucher = (pointsCost: number, voucherName: string) => {
    if (profile.points < pointsCost) {
      alert(language === 'en' ? "Insufficient points! Keep recycling to earn more rewards." : "Alama hazitoshi! Endelea kutenga taka kupata alama zaidi.");
      return;
    }
    const updatedProfile = {
      ...profile,
      points: profile.points - pointsCost
    };
    onUpdateProfile(updatedProfile);
    alert(language === 'en' 
      ? `Successfully redeemed ${voucherName}! Check your phone SMS for the digital voucher block.` 
      : `Umefanikiwa kununua ${voucherName}! Angalia ujumbe kwenye simu yako kwa nambari ya vocha.`);
  };

  const handleRegisterTicket = (e: FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDesc.trim()) return;

    const newTicket: SupportTicket = {
      id: 'TCK-' + Math.floor(1000 + Math.random() * 9000),
      customerId: profile.id,
      customerName: profile.name,
      subject: ticketSubject,
      description: ticketDesc,
      status: 'open',
      createdAt: new Date().toISOString()
    };

    onAddTicket(newTicket);
    setTicketSubject('');
    setTicketDesc('');
    setTicketSuccess(true);
    setTimeout(() => setTicketSuccess(false), 4000);
  };

  const submitRating = (pickupId: string) => {
    const r = tempRating[pickupId] || 5;
    const rev = tempReview[pickupId] || '';
    onUpdatePickup(pickupId, {
      rating: r,
      review: rev
    });
    // Add rewards to the customer profile automatically
    const pickup = pickups.find(p => p.id === pickupId);
    if (pickup) {
      const rewardGained = pickup.items.reduce((acc, it) => acc + it.pointsReward, 0);
      onUpdateProfile({
        ...profile,
        points: profile.points + rewardGained
      });
    }
    alert(language === 'en' 
      ? `Thank you for rating! You earned eco-points from this task.` 
      : 'Asante kwa kutathmini! Alama zako zimeongezwa kwenye akaunti yako.');
  };

  // Find if customer currently has a pickup undergoing active transport status (accepted, on_the_way, collected)
  const activePickup = pickups.find(p => p.customerId === p.customerId && ['accepted', 'on_the_way', 'collected'].includes(p.status));

  return (
    <div className="space-y-6" id="customer-portal-main">
      {/* Top Welcome Panel */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden" id="customer-hero-header">
        <div className="absolute right-0 bottom-0 translate-x-1/10 translate-y-1/10 opacity-10">
          <Leaf className="w-64 h-64" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] bg-emerald-500/55 text-white font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-400/30">
              {t.customer} {language === 'en' ? 'Workspace' : 'Eneo Lako'}
            </span>
            <h1 className="text-2xl font-bold tracking-tight mt-1.5">
              {language === 'en' ? `Habari, ${profile.name}` : `Habari, ${profile.name}`}!
            </h1>
            <p className="text-emerald-100 text-xs">
              {language === 'en' ? 'Every piece of separated plastic counts towards a cleaner county!' : 'Kila plastiki unayotenga inachangia ulinzi wa mazingira yetu.'}
            </p>
          </div>

          <div className="flex space-x-3">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 px-4 border border-white/15 flex items-center space-x-3 shadow-inner">
              <Coins className="w-8 h-8 text-yellow-300 drop-shadow-md" />
              <div>
                <p className="text-[10px] text-emerald-100 uppercase tracking-wider font-bold">{t.points}</p>
                <p className="text-lg font-extrabold text-white leading-none mt-0.5">{profile.points}</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 px-4 border border-white/15 flex items-center space-x-3 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-teal-300 drop-shadow-md" />
              <div>
                <p className="text-[10px] text-emerald-100 uppercase tracking-wider font-bold">Verified Level</p>
                <p className="text-sm font-bold text-white mt-0.5">Eco Champion</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Internal Ribbon Navigation */}
      <div className="flex bg-gray-100/80 p-1 rounded-xl border border-gray-200/50 max-w-lg" id="customer-tab-nav">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
            activeTab === 'schedule' ? 'bg-white text-emerald-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
          id="cust-tab-schedule"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{t.scheduleTab}</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
            activeTab === 'history' ? 'bg-white text-emerald-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
          id="cust-tab-history"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{t.historyTab}</span>
          {pickups.filter(p => p.status === 'pending' || ['accepted', 'on_the_way', 'collected'].includes(p.status)).length > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('rewards')}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
            activeTab === 'rewards' ? 'bg-white text-emerald-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
          id="cust-tab-rewards"
        >
          <Award className="w-3.5 h-3.5" />
          <span>{t.rewardsTab}</span>
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
            activeTab === 'support' ? 'bg-white text-emerald-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
          id="cust-tab-support"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{t.supportTab}</span>
        </button>
      </div>

      {/* Tabs Contents */}
      {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="client-scheduler-section">
          {/* Main Booking Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
            <div>
              <div className="flex items-center space-x-2">
                <Leaf className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-gray-900">{t.pickupSchedule}</h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">{t.selectCategory}</p>
            </div>

            {/* Waste Category Selection & Weight Sliders */}
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-2" id="waste-grid-checklist">
                {(Object.keys(RECYCLING_RATES) as WasteCategory[]).map((cat) => {
                  const data = RECYCLING_RATES[cat];
                  const isSelected = selectedCats.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleToggleCategory(cat)}
                      className={`p-2.5 rounded-2xl border text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelected 
                          ? `${data.bg} ${data.border} ${data.text} ring-2 ring-emerald-500/20 font-semibold shadow-sm` 
                          : 'bg-white border-gray-100 hover:bg-gray-50 text-gray-700'
                      }`}
                      id={`btn-cat-${cat}`}
                    >
                      <span className="text-lg mb-1">
                        {cat === 'plastic' && '🧴'}
                        {cat === 'organic' && '🍌'}
                        {cat === 'metal' && '🥫'}
                        {cat === 'paper' && '📦'}
                        {cat === 'ewaste' && '💻'}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide leading-none">{t[cat]}</span>
                      <span className="text-[9px] text-gray-400 mt-0.5">+{data.pointsPerKg} pts/kg</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Sliders */}
              <div className="space-y-3 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                {selectedCats.map((cat) => {
                  const data = RECYCLING_RATES[cat];
                  return (
                    <div key={cat} className="space-y-1.5" id={`slider-row-${cat}`}>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-gray-800 uppercase flex items-center">
                          <span className="mr-1">{cat === 'plastic' && '🧴'} {cat === 'organic' && '🍌'} {cat === 'metal' && '🥫'} {cat === 'paper' && '📦'} {cat === 'ewaste' && '💻'}</span>
                          {t[cat]}
                        </span>
                        <span className="font-mono bg-white px-2 py-0.5 rounded-md border border-gray-150 font-bold text-emerald-800">
                          {weights[cat] || 0} kg
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="0.5"
                        value={weights[cat] || 0}
                        onChange={(e) => handleWeightChange(cat, parseFloat(e.target.value))}
                        className="w-full accent-emerald-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-ew-resize"
                        id={`input-slider-${cat}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recurrence Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 block uppercase tracking-wide">{language === 'en' ? 'Collection Frequency' : 'Mzunguko wa Kuchukua'}</label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setRecurrence('oneTime')}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    recurrence === 'oneTime' 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm' 
                      : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
                  }`}
                  id="btn-onetime"
                >
                  {t.oneTime}
                </button>
                <button
                  type="button"
                  onClick={() => setRecurrence('recurring')}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    recurrence === 'recurring' 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm' 
                      : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
                  }`}
                  id="btn-recurring"
                >
                  {t.recurring}
                </button>
              </div>

              {recurrence === 'recurring' && (
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center justify-between mt-2">
                  <label className="text-[11px] font-semibold text-emerald-900">{t.recurrence}:</label>
                  <select
                    value={freq}
                    onChange={(e: any) => setFreq(e.target.value)}
                    className="bg-white border border-emerald-200 rounded-lg p-1 text-xs text-emerald-800 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    id="select-recurrence-freq"
                  >
                    <option value="weekly">{t.weekly}</option>
                    <option value="biweekly">{t.biweekly}</option>
                    <option value="monthly">{t.monthly}</option>
                  </select>
                </div>
              )}
            </div>

            {/* Address Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center uppercase tracking-wide">
                <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                {t.address}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-800"
                id="input-address"
              />
              <span className="text-[10px] text-gray-400 block italic leading-none">{t.setSimLocation}</span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 block uppercase tracking-wide">{t.choosePayment}</label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setPayMethod('mpesa')}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center justify-center space-x-2 ${
                    payMethod === 'mpesa' 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-505/20 font-bold' 
                      : 'bg-white border-gray-100 text-gray-650'
                  }`}
                  id="btn-pay-mpesa"
                >
                  <span className="w-4.5 h-4.5 rounded-full bg-green-500 text-white flex items-center justify-center font-extrabold text-[9px] font-mono shadow-sm">M</span>
                  <span>{t.mpesa}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod('card')}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center justify-center space-x-2 ${
                    payMethod === 'card' 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' 
                      : 'bg-white border-gray-100 text-gray-650'
                  }`}
                  id="btn-pay-card"
                >
                  <CreditCard className="w-4 h-4 text-slate-600" />
                  <span>{t.card}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Checkout Right Side Sidebar Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center">
                <Info className="w-4 h-4 mr-1.5 text-emerald-600" />
                {t.bookingSummary}
              </h3>

              <div className="space-y-3" id="booking-items-receipt">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Separated Categories:</span>
                  <span className="font-semibold text-gray-800">{selectedCats.length} types</span>
                </div>

                <div className="space-y-1 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                  {calculatedItems.map((item) => (
                    <div key={item.category} className="flex justify-between items-center text-[11px] text-gray-600">
                      <span className="capitalize">{t[item.category]}</span>
                      <span className="font-mono">{item.weightKb} kg ➔ <span className="text-emerald-700 font-bold">+{item.pointsReward} pts</span></span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-gray-150 pt-3 flex justify-between items-center text-xs">
                  <span className="text-gray-500">{t.totalWaste}:</span>
                  <span className="font-extrabold text-gray-800 font-mono text-sm">{totalWeightStr} kg</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Recycled Eco Points:</span>
                  <span className="text-emerald-600 font-extrabold flex items-center">
                    <Coins className="w-3.5 h-3.5 mr-0.5 text-yellow-400" />
                    +{estimatedPointsReward} pts
                  </span>
                </div>

                <div className="border-t border-gray-150 pt-3 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{t.serviceFee}</p>
                    <p className="text-[10px] text-gray-400 italic">Incl. collector carbon offset</p>
                  </div>
                  <span className="text-xl font-black text-gray-900 font-mono text-emerald-800">
                    {estimatedCostStr} <span className="text-xs font-semibold">{t.kes}</span>
                  </span>
                </div>
              </div>

              {bookingSuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 animate-pulse" id="panel-booking-success">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  <h4 className="text-xs font-extrabold text-emerald-800">Booking Scheduled!</h4>
                  <p className="text-[11px] text-emerald-700/80 leading-relaxed">{t.pickupConfirmation}</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenPayment}
                  className="w-full py-3.5 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 text-xs tracking-wider uppercase transition-colors cursor-pointer block text-center shadow"
                  id="btn-checkout-pay"
                >
                  {t.payNow} ➔
                </button>
              )}
            </div>

            {/* Quick tips widget */}
            <div className="bg-emerald-50/50 rounded-3xl p-5 border border-emerald-100 flex items-start space-x-3">
              <Leaf className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-emerald-900">Separate waste at the source!</h4>
                <p className="text-[11px] text-emerald-800/80 leading-relaxed mt-1">
                  Keep wet organic scraps in a separate bucket. Keep dry cardboard (paper), plastic bottles, and tin cans completely dry. This helps collectors offload waste immediately at the hub!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking History & Active Map Tracker */}
      {activeTab === 'history' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="client-history-tracker-section">
          {/* Active tracking map if exists */}
          {activePickup ? (
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-5 h-5 text-emerald-600 animate-bounce" />
                    <h2 className="text-base font-bold text-gray-900">{language === 'en' ? 'Live Courier Journey' : 'Safari ya Mwendeshaji Mwenzako'}</h2>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                    {t[activePickup.status]}
                  </span>
                </div>

                {/* Shared MAP Sim */}
                <MapSimulator
                  status={activePickup.status}
                  customerName={profile.name}
                  collectorName={activePickup.collectorName || 'Collector Juma'}
                  onSimulationStep={(newStatus) => onUpdatePickup(activePickup.id, { status: newStatus })}
                />
              </div>

              {/* Chat simulator integrated directly below tracking map */}
              <div className="bg-white rounded-3xl border border-gray-150 overflow-hidden shadow-sm" id="customer-integrated-chat">
                <div className="p-4 bg-gray-50/50 border-b border-gray-100">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2 text-emerald-600" />
                    Resident-Collector In-App Communication
                  </h3>
                </div>
                <ChatSimulator
                  pickupId={activePickup.id}
                  senderRole="customer"
                  senderName={profile.name}
                  recipientName={activePickup.collectorName || 'Collector Juma'}
                  chatHistory={chatHistory}
                  language={language}
                  onSendMessage={(text) => onSendChatMessage(activePickup.id, text)}
                />
              </div>
            </div>
          ) : (
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white p-6 rounded-3xl border border-gray-150 text-center py-10 flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-3">
                  <Navigation className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-gray-800">No active pickup journey</h3>
                <p className="text-xs text-gray-400 max-w-sm mt-1">
                  Schedule an on-demand garbage collection to watch a Waste Collector travel on your digital GPS grid real-time and coordinate via text!
                </p>
                <button 
                  onClick={() => setActiveTab('schedule')} 
                  className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                  id="btn-goto-schedule"
                >
                  Book Pickup Now
                </button>
              </div>
            </div>
          )}

          {/* Left / Right column showing full list of history and past reviews */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs uppercase font-extrabold text-gray-500 tracking-wider flex items-center">
              <History className="w-4 h-4 mr-1 text-emerald-600" />
              Collection Records ({pickups.length})
            </h3>

            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1" id="pickups-history-list">
              {pickups.map((pickup) => {
                const isRatingNeeded = pickup.status === 'completed' && !pickup.rating;
                return (
                  <div key={pickup.id} className="p-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-200/60 rounded-2xl space-y-2 transition-all text-xs" id={`history-card-${pickup.id}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-extrabold text-slate-900 font-mono text-[11px]">{pickup.id}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{pickup.scheduledTime}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono ${
                        pickup.status === 'completed' ? 'bg-emerald-100 text-emerald-850' : 
                        pickup.status === 'pending' ? 'bg-yellow-100 text-yellow-850 animate-pulse' : 
                        'bg-sky-100 text-sky-850'
                      }`}>
                        {t[pickup.status]}
                      </span>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-gray-100 space-y-1">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wild flex justify-between">
                        <span>Total Cargo:</span>
                        <strong className="text-slate-800 font-mono font-bold">{pickup.totalWeight} kg</strong>
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wild flex justify-between">
                        <span>Digital Bill:</span>
                        <strong className="text-slate-800 font-mono font-bold">{pickup.estimatedCost} KES</strong>
                      </p>
                      {pickup.collectorName && (
                        <p className="text-[10px] text-gray-400 flex justify-between border-t border-gray-50 pt-1 mt-1">
                          <span>Collector:</span>
                          <span className="font-bold text-emerald-800">{pickup.collectorName}</span>
                        </p>
                      )}
                    </div>

                    {/* Interactive review form directly inside history block */}
                    {isRatingNeeded && (
                      <div className="bg-amber-50/80 border border-amber-100 rounded-xl p-3 mt-1.5 space-y-2" id={`rating-panel-${pickup.id}`}>
                        <p className="font-extrabold text-amber-900 text-[10px] flex items-center">
                          <Star className="w-3 h-3 justify-center fill-amber-400 text-amber-500 mr-1" />
                          Rate Service & Collect Rewards!
                        </p>
                        
                        {/* 5 click stars */}
                        <div className="flex space-x-1 justify-left">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setTempRating({ ...tempRating, [pickup.id]: star })}
                              className="focus:outline-none cursor-pointer"
                              type="button"
                              id={`star-btn-${pickup.id}-${star}`}
                            >
                              <Star className={`w-4 h-4 ${
                                (tempRating[pickup.id] || 5) >= star 
                                  ? 'text-yellow-500 fill-yellow-400' 
                                  : 'text-gray-300'
                              }`} />
                            </button>
                          ))}
                        </div>

                        <input
                          type="text"
                          placeholder="Short review (e.g., Quick and neat...)"
                          value={tempReview[pickup.id] || ''}
                          onChange={(e) => setTempReview({ ...tempReview, [pickup.id]: e.target.value })}
                          className="w-full text-[10px] px-2 py-1 bg-white border border-amber-200 rounded focus:outline-none"
                          id={`review-text-${pickup.id}`}
                        />

                        <button
                          onClick={() => submitRating(pickup.id)}
                          className="w-full text-[10px] py-1 bg-emerald-600 hover:bg-emerald-700 font-bold text-white rounded transition-colors"
                          id={`rating-submit-${pickup.id}`}
                        >
                          Submit Rating
                        </button>
                      </div>
                    )}

                    {/* Render submitted rating */}
                    {pickup.rating && (
                      <div className="flex items-center space-x-1 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                        <span className="text-[10px] text-gray-500">Your Rating:</span>
                        <div className="flex space-x-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`w-3 h-3 ${star <= (pickup.rating || 0) ? 'text-yellow-500 fill-yellow-400' : 'text-gray-200'}`} 
                            />
                          ))}
                        </div>
                        {pickup.review && <p className="text-[10px] text-gray-400 italic block">"{pickup.review}"</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Eco rewards portal */}
      {activeTab === 'rewards' && (
        <div className="space-y-5" id="client-rewards-store">
          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-emerald-900 flex items-center">
                <Award className="w-5 h-5 mr-1.5 text-emerald-700 animate-pulse" />
                {t.rewardsTitle}
              </h2>
              <p className="text-xs text-emerald-800/80 leading-relaxed max-w-xl mt-1">
                {t.rewardsSubtitle}
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur border border-emerald-200/50 p-4 rounded-xl text-center shadow-sm">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.currentPoints}</p>
              <p className="text-2xl font-black text-emerald-800 leading-none mt-1 font-mono">{profile.points}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="vouchers-grid">
            {/* Voucher 1 */}
            <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <span className="text-2xl">🛍️</span>
                <h4 className="text-xs font-extrabold text-gray-900 mt-2">{t.voucher1}</h4>
                <p className="text-[10px] text-gray-400 leading-relaxed">Exchangeable at supermarket counters in Nairobi to eliminate single-use plastics.</p>
              </div>
              <div className="border-t border-gray-50 pt-3 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 font-mono">100 {t.pointsRequired}</span>
                <button
                  onClick={() => handleRedeemVoucher(100, t.voucher1)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-750 text-white rounded-xl text-[10px] font-bold cursor-pointer"
                  id="btn-redeem-01"
                >
                  {t.redeem}
                </button>
              </div>
            </div>

            {/* Voucher 2 */}
            <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <span className="text-2xl">🤳</span>
                <h4 className="text-xs font-extrabold text-gray-900 mt-2">{t.voucher2}</h4>
                <p className="text-[10px] text-gray-400 leading-relaxed">Get hard cash directly back into your linked mobile money wallet wallet instantly.</p>
              </div>
              <div className="border-t border-gray-50 pt-3 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 font-mono">300 {t.pointsRequired}</span>
                <button
                  onClick={() => handleRedeemVoucher(300, t.voucher2)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-750 text-white rounded-xl text-[10px] font-bold cursor-pointer"
                  id="btn-redeem-02"
                >
                  {t.redeem}
                </button>
              </div>
            </div>

            {/* Voucher 3 */}
            <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <span className="text-2xl font-bold">🗑️</span>
                <h4 className="text-xs font-extrabold text-gray-900 mt-2">{t.voucher3}</h4>
                <p className="text-[10px] text-gray-400 leading-relaxed">Saves 40% when purchasing a smart pedal-based separated bin bin at TakaGo stores.</p>
              </div>
              <div className="border-t border-gray-50 pt-3 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 font-mono">200 {t.pointsRequired}</span>
                <button
                  onClick={() => handleRedeemVoucher(200, t.voucher3)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-750 text-white rounded-xl text-[10px] font-bold cursor-pointer"
                  id="btn-redeem-03"
                >
                  {t.redeem}
                </button>
              </div>
            </div>

            {/* Voucher 4 */}
            <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <span className="text-2xl">🌱</span>
                <h4 className="text-xs font-extrabold text-gray-900 mt-2">{t.voucher4}</h4>
                <p className="text-[10px] text-gray-400 leading-relaxed">Waives all residential service fees for all garbage items for 1 calendar month.</p>
              </div>
              <div className="border-t border-gray-50 pt-3 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 font-mono">500 {t.pointsRequired}</span>
                <button
                  onClick={() => handleRedeemVoucher(500, t.voucher4)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-755 text-white rounded-xl text-[10px] font-bold cursor-pointer"
                  id="btn-redeem-04"
                >
                  {t.redeem}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Citizens complaint Support Panel */}
      {activeTab === 'support' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="client-support-tickets">
          {/* Create ticket block */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center">
              <HelpCircle className="w-5 h-5 mr-1.5 text-emerald-600" />
              File Waste dispute or Support Case
            </h3>
            <p className="text-xs text-gray-500 leading-normal">
              Experienced delays, payment errors, or is the collector depot offline? File a citizens support request. Our admins review and reply via SMS within 2 hours.
            </p>

            <form onSubmit={handleRegisterTicket} className="space-y-3" id="citizens-ticket-form">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 block uppercase tracking-wide">Inquiry Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Broken M-Pesa prompt"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-800"
                  required
                  id="support-ticket-subject"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 block uppercase tracking-wide">Explain Details</label>
                <textarea
                  placeholder="Provide timestamps and descriptions..."
                  value={ticketDesc}
                  onChange={(e) => setTicketDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[100px] text-gray-800"
                  required
                  id="support-ticket-desc"
                />
              </div>

              {ticketSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-xl text-[11px] font-semibold animate-pulse">
                  ✓ Ticket successfully dispatched! Admins will reply momentarily.
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-xs rounded-xl tracking-wider uppercase transition-colors text-center shadow-sm cursor-pointer"
                id="btn-sub-ticket"
              >
                Submit Case
              </button>
            </form>
          </div>

          {/* Ticket lists and replies */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs uppercase font-extrabold text-gray-500 tracking-wider">Citizens Tickets & Support Logs</h3>
            
            <div className="space-y-3 max-h-[350px] overflow-y-auto" id="citizen-tickets-display">
              {tickets.map((tck) => (
                <div key={tck.id} className="p-3.5 bg-gray-50 border border-gray-200/50 rounded-2xl text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-slate-800 font-mono">{tck.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono ${
                      tck.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-rose-100 text-rose-800 animate-pulse'
                    }`}>
                      {tck.status}
                    </span>
                  </div>

                  <div>
                    <h5 className="font-bold text-gray-900">{tck.subject}</h5>
                    <p className="text-gray-500 text-[10px] leading-relaxed mt-0.5">{tck.description}</p>
                  </div>

                  {tck.reply && (
                    <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-150 text-[11px] text-emerald-800 leading-relaxed">
                      <strong className="block text-[10px] text-emerald-900 uppercase font-bold tracking-wider">TakaGo Citizen Support Team:</strong>
                      <p className="italic mt-0.5">"{tck.reply}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* M-PESA SIMULATION DIALOG POPUP MODAL (Strictly Client Side Only) */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" id="mpesa-dialog-overlay">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-150 animate-scale-up" id="mpesa-dialog-box">
            <div className="bg-emerald-600 px-5 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-bold bg-white text-emerald-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">M</span>
                <span className="font-extrabold tracking-wide uppercase text-xs">{t.paymentSimTitle}</span>
              </div>
              <button 
                onClick={() => setShowPinModal(false)} 
                className="opacity-80 hover:opacity-100 font-bold p-1 hover:bg-emerald-700 rounded-md cursor-pointer text-xs"
                id="btn-close-mpesa"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center space-y-1">
                <p className="text-xs text-gray-500">{t.paymentSimDesc}</p>
                <p className="text-2xl font-black text-emerald-800 font-mono tracking-tight mt-1">
                  KES {estimatedCostStr}.00
                </p>
              </div>

              {isProcessingPay ? (
                <div className="space-y-3 py-6 text-center animate-pulse flex flex-col items-center justify-center" id="mpesa-loader">
                  <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-gray-500 font-semibold">{t.processingPayment}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1 text-center">
                    <input
                      type="password"
                      maxLength={4}
                      value={mpesaPin}
                      onChange={(e) => setMpesaPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 1234"
                      className="w-32 mx-auto text-center font-mono text-2xl tracking-[0.5em] px-3 py-2 border-2 border-emerald-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      id="mpesa-pin-field"
                    />
                  </div>

                  <div className="flex space-x-3 text-xs pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPinModal(false)}
                      className="flex-1 py-2.5 border border-gray-205 text-gray-500 rounded-xl hover:bg-gray-50 cursor-pointer"
                      id="btn-cancel-mpesa"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmPay}
                      className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold transition-colors cursor-pointer"
                      id="btn-confirm-mpesa"
                    >
                      Authenticate Pay
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-center space-x-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <p className="text-[10px] text-gray-400 font-semibold">TakaGo Secures Mobile Transactions via Sandbox</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
