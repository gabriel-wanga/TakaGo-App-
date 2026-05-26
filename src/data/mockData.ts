import { UserProfile, PickupRequest, SupportTicket, SystemStats } from '../types';

export const initialCustomerProfile: UserProfile = {
  id: 'cust_01',
  name: 'Grace Wambui',
  email: 'grace.wambui@yahoo.com',
  phone: '+254712345678',
  location: 'Kilimani Close, Nairobi, Kenya',
  points: 450,
  joinedDate: 'Feb 15, 2026',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
};

export const initialCollectorProfile: UserProfile = {
  id: 'coll_99',
  name: 'Juma Joseph',
  email: 'juma.taka@collector.com',
  phone: '+254722998877',
  location: 'Westlands Transit Point, Nairobi',
  points: 120,
  joinedDate: 'Jan 10, 2026',
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
};

export const defaultPickups: PickupRequest[] = [
  {
    id: 'TGO-5821',
    customerId: 'cust_01',
    customerName: 'Grace Wambui',
    customerPhone: '+254712345678',
    location: 'Kilimani Road, Apartments Block B, Nairobi',
    latitude: -1.2921,
    longitude: 36.8219,
    scheduledTime: 'Today, 10:00 AM',
    isRecurring: false,
    items: [
      { category: 'plastic', weightKb: 4.5, pointsReward: 45 },
      { category: 'metal', weightKb: 2.0, pointsReward: 40 },
      { category: 'paper', weightKb: 6.0, pointsReward: 30 }
    ],
    totalWeight: 12.5,
    estimatedCost: 350,
    paymentMethod: 'mpesa',
    paymentStatus: 'paid',
    status: 'completed',
    collectorId: 'coll_99',
    collectorName: 'Juma Joseph',
    completedAt: 'Yesterday, 11:15 AM',
    rating: 5,
    review: 'Excellent and quick. He even gave me a reusable bag!'
  },
  {
    id: 'TGO-9930',
    customerId: 'cust_01',
    customerName: 'Grace Wambui',
    customerPhone: '+254712345678',
    location: 'Chaka Road, Garden Villa, Nairobi',
    latitude: -1.2895,
    longitude: 36.8055,
    scheduledTime: 'Tomorrow, 02:30 PM',
    isRecurring: true,
    recurrenceType: 'weekly',
    items: [
      { category: 'organic', weightKb: 8.0, pointsReward: 24 },
      { category: 'paper', weightKb: 3.5, pointsReward: 17 }
    ],
    totalWeight: 11.5,
    estimatedCost: 250,
    paymentMethod: 'mpesa',
    paymentStatus: 'paid',
    status: 'pending'
  },
  {
    id: 'TGO-1049',
    customerId: 'cust_temp_01',
    customerName: 'Dennis Mutua',
    customerPhone: '+254701234000',
    location: 'Ngong Road, Greenhouse Mall Parking, Nairobi',
    latitude: -1.3005,
    longitude: 36.7821,
    scheduledTime: 'Today, ASAP',
    isRecurring: false,
    items: [
      { category: 'ewaste', weightKb: 14.0, pointsReward: 280 },
      { category: 'plastic', weightKb: 3.0, pointsReward: 30 }
    ],
    totalWeight: 17.0,
    estimatedCost: 650,
    paymentMethod: 'card',
    paymentStatus: 'paid',
    status: 'pending'
  }
];

export const initialTickets: SupportTicket[] = [
  {
    id: 'TCK-4819',
    customerId: 'cust_01',
    customerName: 'Grace Wambui',
    subject: 'Delayed Pickup on Tuesday',
    description: 'The collector did not arrive during the scheduled 10 AM slot. He completed the job at 11:15 AM instead. Can you assist?',
    status: 'resolved',
    createdAt: '2026-05-24T08:00:00Z',
    reply: 'Our apologies Grace, the waste collector Juma was caught up in heavy Westlands traffic. We have credited 50 extra points to your profile.'
  },
  {
    id: 'TCK-2022',
    customerId: 'cust_01',
    customerName: 'Grace Wambui',
    subject: 'M-Pesa validation failed on click',
    description: 'Trying to pay for premium services but received network timeout.',
    status: 'open',
    createdAt: '2026-05-25T15:30:00Z'
  }
];

export const initialStats: SystemStats = {
  totalWasteCollectedKg: 1438.5,
  totalPointsAwarded: 14200,
  totalEarningsKes: 48900,
  totalOrdersCompleted: 98
};

export const RECYCLING_RATES = {
  plastic: { ratePerKg: 10, pointsPerKg: 10, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  organic: { ratePerKg: 5, pointsPerKg: 3, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  metal: { ratePerKg: 25, pointsPerKg: 20, bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  paper: { ratePerKg: 8, pointsPerKg: 5, bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  ewaste: { ratePerKg: 40, pointsPerKg: 20, bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' }
};
