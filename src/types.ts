export type UserRole = 'customer' | 'collector' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  points: number;
  joinedDate: string;
  avatar: string;
}

export type WasteCategory = 'plastic' | 'organic' | 'metal' | 'paper' | 'ewaste';

export interface WasteItem {
  category: WasteCategory;
  weightKb: number; // in kg
  pointsReward: number; // calculated points
}

export type PickupStatus = 'pending' | 'accepted' | 'on_the_way' | 'collected' | 'completed' | 'cancelled';

export interface PickupRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  location: string;
  latitude: number; // simulated coordinates
  longitude: number;
  scheduledTime: string;
  isRecurring: boolean;
  recurrenceType?: 'weekly' | 'biweekly' | 'monthly';
  items: WasteItem[];
  totalWeight: number;
  estimatedCost: number; // in KES (Kenyan Shilling) or localized currencies
  paymentMethod: 'mpesa' | 'card';
  paymentStatus: 'pending' | 'paid';
  status: PickupStatus;
  collectorId?: string;
  collectorName?: string;
  completedAt?: string;
  rating?: number;
  review?: string;
}

export interface ChatMessage {
  id: string;
  pickupId: string;
  senderRole: 'customer' | 'collector';
  text: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  customerId: string;
  customerName: string;
  subject: string;
  description: string;
  status: 'open' | 'resolved';
  createdAt: string;
  reply?: string;
}

export interface SystemStats {
  totalWasteCollectedKg: number;
  totalPointsAwarded: number;
  totalEarningsKes: number;
  totalOrdersCompleted: number;
}
