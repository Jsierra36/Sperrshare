import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { seedPosts } from '@/data/seed-posts';
import type { Post } from '@/data/types';
import i18n from '@/i18n';

const STORAGE_KEY = 'sperrshare.posts.v5'; // v5: tidier demo photos
const EXPIRY_DAYS_WITHOUT_PICKUP_DATE = 14;

type NewPostInput = {
  userId: string;
  userName: string;
  categoryIds: string[];
  title: string;
  description: string;
  addressText: string;
  lat: number;
  lng: number;
  photoUri: string;
  pickupDate: string | null;
};

type PostsContextValue = {
  posts: Post[];
  allPosts: Post[];
  isReady: boolean;
  addPost: (input: NewPostInput) => Promise<Post>;
  markCollected: (id: string, requestingUserId: string) => Promise<void>;
};

const PostsContext = createContext<PostsContextValue | null>(null);

function computeExpiresAt(createdAt: string, pickupDate: string | null): string {
  const base = pickupDate ? new Date(pickupDate) : new Date(createdAt);
  const days = pickupDate ? 1 : EXPIRY_DAYS_WITHOUT_PICKUP_DATE;
  return new Date(base.getTime() + days * 86400000).toISOString();
}

// Demo-only local store. Real backend (Supabase Postgres) is the next step — see docs/roadmap.md.
export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      setPosts(raw ? JSON.parse(raw) : seedPosts);
      setIsReady(true);
    });
  }, []);

  useEffect(() => {
    if (isReady) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }, [posts, isReady]);

  const addPost = async (input: NewPostInput) => {
    // Defensive validation — this stands in for the checks a real backend (Supabase + RLS)
    // would enforce server-side; a client can't be trusted to have done this correctly.
    const title = input.title.trim().slice(0, 80);
    const description = input.description.trim().slice(0, 1000);
    const addressText = input.addressText.trim().slice(0, 200);
    const categoryIds = [...new Set(input.categoryIds)].slice(0, 20);
    if (!title) throw new Error(i18n.t('errors.title_required'));
    if (!addressText) throw new Error(i18n.t('errors.address_required'));
    if (categoryIds.length === 0) throw new Error(i18n.t('errors.category_required'));
    if (!input.photoUri) throw new Error(i18n.t('errors.photo_required'));
    if (Math.abs(input.lat) > 90 || Math.abs(input.lng) > 180) {
      throw new Error(i18n.t('errors.invalid_coordinates'));
    }

    const createdAt = new Date().toISOString();
    const newPost: Post = {
      ...input,
      title,
      description,
      addressText,
      categoryIds,
      id: `post-${Date.now()}`,
      status: 'active',
      createdAt,
      expiresAt: computeExpiresAt(createdAt, input.pickupDate),
    };
    setPosts((prev) => [newPost, ...prev]);
    return newPost;
  };

  const markCollected = async (id: string, requestingUserId: string) => {
    // Ownership check here mirrors what a Supabase RLS policy will enforce server-side
    // once there's a real backend — "only the owner can mutate their own post".
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id && p.userId === requestingUserId ? { ...p, status: 'collected' } : p
      )
    );
  };

  // Lazily expire posts based on expiresAt, computed on read (no cron needed for the demo).
  const withComputedStatus = posts.map((p) =>
    p.status === 'active' && new Date(p.expiresAt).getTime() < Date.now()
      ? { ...p, status: 'expired' as const }
      : p
  );
  const visiblePosts = withComputedStatus.filter((p) => p.status === 'active');

  return (
    <PostsContext.Provider
      value={{ posts: visiblePosts, allPosts: withComputedStatus, isReady, addPost, markCollected }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error('usePosts must be used within PostsProvider');
  return ctx;
}
