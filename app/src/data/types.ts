export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type PostStatus = 'active' | 'collected' | 'expired';

export type Post = {
  id: string;
  userId: string;
  userName: string;
  categoryIds: string[]; // a find can belong to more than one category
  title: string;
  description: string;
  addressText: string;
  lat: number;
  lng: number;
  photoUri: string;
  pickupDate: string | null; // ISO date, optional
  status: PostStatus;
  createdAt: string; // ISO datetime
  expiresAt: string; // ISO datetime
};
