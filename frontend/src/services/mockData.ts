// بيانات وهمية للاستخدام في حالة فشل الاتصال بالخادم
import { Advertisement } from './advertisementService';
import { User } from './userService';
import { AdminStats } from './statsService';

// تعريف واجهة بيانات الاتصال
export interface Contact {
  id: string;
  advertiserName: string;
  advertiserPhone: string;
  requesterName: string;
  requesterPhone: string;
  advertisementId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

// بيانات الإعلانات الوهمية
export const mockAdvertisements: Advertisement[] = [
  {
    id: '1',
    name: 'أحمد محمد',
    documentType: 'هوية شخصية',
    location: 'بغداد',
    landmark: 'قرب المدرسة المركزية',
    phone: '07701234567',
    date: '2023-10-15',
    status: 'pending',
    images: ['https://via.placeholder.com/150?text=بطاقة+هوية'],
    userId: 'user1'
  },
  {
    id: '2',
    name: 'سارة علي',
    documentType: 'جواز سفر',
    location: 'البصرة',
    landmark: 'شارع الخليج',
    phone: '07801234567',
    date: '2023-10-10',
    status: 'approved',
    images: ['https://via.placeholder.com/150?text=جواز+سفر'],
    userId: 'user2'
  },
  {
    id: '3',
    name: 'محمد حسين',
    documentType: 'رخصة قيادة',
    location: 'أربيل',
    landmark: 'قرب مول الأصدقاء',
    phone: '07501234567',
    date: '2023-10-05',
    status: 'rejected',
    images: ['https://via.placeholder.com/150?text=رخصة+قيادة'],
    userId: 'user3'
  },
  {
    id: '4',
    name: 'نور عبد الله',
    documentType: 'شهادة ميلاد',
    location: 'النجف',
    landmark: 'شارع الروضة',
    phone: '07901234567',
    date: '2023-09-28',
    status: 'resolved',
    images: ['https://via.placeholder.com/150?text=شهادة+ميلاد'],
    userId: 'user4'
  },
  {
    id: '5',
    name: 'علي حسن',
    documentType: 'هوية طالب',
    location: 'كربلاء',
    landmark: 'قرب مركز المدينة',
    phone: '07601234567',
    date: '2023-09-20',
    status: 'pending',
    images: ['https://via.placeholder.com/150?text=هوية+طالب'],
    userId: 'user5'
  }
];

// بيانات المستخدمين الوهمية
export const mockUsers: User[] = [
  {
    id: 'user1',
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
    phone: '07701234567',
    isBlocked: false,
    createdAt: '2023-09-01'
  },
  {
    id: 'user2',
    name: 'سارة علي',
    email: 'sara@example.com',
    phone: '07801234567',
    isBlocked: false,
    createdAt: '2023-09-05'
  },
  {
    id: 'user3',
    name: 'محمد حسين',
    email: 'mohamed@example.com',
    phone: '07501234567',
    isBlocked: false,
    createdAt: '2023-08-15'
  },
  {
    id: 'user4',
    name: 'نور عبد الله',
    email: 'noor@example.com',
    phone: '07901234567',
    isBlocked: false,
    createdAt: '2023-08-20'
  },
  {
    id: 'user5',
    name: 'علي حسن',
    email: 'ali@example.com',
    phone: '07601234567',
    isBlocked: false,
    createdAt: '2023-08-25'
  }
];

// بيانات طلبات الاتصال الوهمية
export const mockContacts: Contact[] = [
  {
    id: 'contact1',
    advertiserName: 'أحمد محمد',
    advertiserPhone: '07701234567',
    requesterName: 'سارة علي',
    requesterPhone: '07801234567',
    advertisementId: '2',
    status: 'pending',
    createdAt: '2023-10-12'
  },
  {
    id: 'contact2',
    advertiserName: 'محمد حسين',
    advertiserPhone: '07501234567',
    requesterName: 'أحمد محمد',
    requesterPhone: '07701234567',
    advertisementId: '1',
    status: 'approved',
    createdAt: '2023-10-10'
  },
  {
    id: 'contact3',
    advertiserName: 'نور عبد الله',
    advertiserPhone: '07901234567',
    requesterName: 'علي حسن',
    requesterPhone: '07601234567',
    advertisementId: '5',
    status: 'rejected',
    createdAt: '2023-10-08'
  }
];

// إحصائيات وهمية للوحة التحكم
export const mockStats: AdminStats = {
  totalUsers: 125,
  totalAdvertisements: 87,
  pendingAdvertisements: 32,
  approvedAdvertisements: 42,
  rejectedAdvertisements: 8,
  resolvedAdvertisements: 5,
  totalContacts: 64,
  pendingContacts: 28,
  approvedContacts: 32,
  rejectedContacts: 4
}; 