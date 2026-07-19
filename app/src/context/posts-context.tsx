import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { seedPosts } from '@/data/seed-posts';
import type { Post } from '@/data/types';
import i18n from '@/i18n';

const STORAGE_KEY = 'sperrshare.posts.v7'; // v7: photoUri -> photoUris (1-3 photos)
const LEGACY_STORAGE_KEY_V6 = 'sperrshare.posts.v6';
const EXPIRY_DAYS_WITHOUT_PICKUP_DATE = 14;
// Single source of truth for the photo cap — create.tsx imports this so the UI
// and this validation layer can't drift apart.
export const MAX_PHOTOS = 3;

type NewPostInput = {
  userId: string;
  userName: string;
  categoryIds: string[];
  title: string;
  description: string;
  addressText: string;
  lat: number;
  lng: number;
  photoUris: string[];
  pickupDate: string | null;
};

type UpdatePostInput = NewPostInput & { id: string };

type PostsContextValue = {
  posts: Post[];
  allPosts: Post[];
  isReady: boolean;
  addPost: (input: NewPostInput) => Promise<Post>;
  updatePost: (input: UpdatePostInput) => Promise<void>;
  deletePost: (id: string, requestingUserId: string) => Promise<void>;
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
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        setPosts(JSON.parse(raw));
        setIsReady(true);
        return;
      }
      // One-time migration from the v6 schema (single photoUri) so existing users'
      // posts survive the upgrade instead of being silently replaced by seed data.
      const legacyRaw = await AsyncStorage.getItem(LEGACY_STORAGE_KEY_V6);
      if (legacyRaw) {
        try {
          const legacyPosts = JSON.parse(legacyRaw) as (Omit<Post, 'photoUris'> & { photoUri?: string })[];
          const migrated: Post[] = legacyPosts.map(({ photoUri, ...rest }) => ({
            ...rest,
            photoUris: photoUri ? [photoUri] : [],
          }));
          setPosts(migrated);
          setIsReady(true);
          await AsyncStorage.removeItem(LEGACY_STORAGE_KEY_V6);
          return;
        } catch {
          // Corrupt legacy data — fall through to seeds rather than crash on load.
        }
      }
      setPosts(seedPosts);
      setIsReady(true);
    })();
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
    const photoUris = input.photoUris.slice(0, MAX_PHOTOS);
    if (!title) throw new Error(i18n.t('errors.title_required'));
    if (!addressText) throw new Error(i18n.t('errors.address_required'));
    if (categoryIds.length === 0) throw new Error(i18n.t('errors.category_required'));
    if (photoUris.length === 0) throw new Error(i18n.t('errors.photo_required'));
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
      photoUris,
      id: `post-${Date.now()}`,
      status: 'active',
      createdAt,
      expiresAt: computeExpiresAt(createdAt, input.pickupDate),
    };
    setPosts((prev) => [newPost, ...prev]);
    return newPost;
  };

  const updatePost = async (input: UpdatePostInput) => {
    // Same defensive validation as addPost, plus an ownership check mirroring the
    // RLS policy a real backend would enforce ("only the owner can edit their post").
    const title = input.title.trim().slice(0, 80);
    const description = input.description.trim().slice(0, 1000);
    const addressText = input.addressText.trim().slice(0, 200);
    const categoryIds = [...new Set(input.categoryIds)].slice(0, 20);
    const photoUris = input.photoUris.slice(0, MAX_PHOTOS);
    if (!title) throw new Error(i18n.t('errors.title_required'));
    if (!addressText) throw new Error(i18n.t('errors.address_required'));
    if (categoryIds.length === 0) throw new Error(i18n.t('errors.category_required'));
    if (photoUris.length === 0) throw new Error(i18n.t('errors.photo_required'));
    if (Math.abs(input.lat) > 90 || Math.abs(input.lng) > 180) {
      throw new Error(i18n.t('errors.invalid_coordinates'));
    }

    setPosts((prev) =>
      prev.map((p) =>
        p.id === input.id && p.userId === input.userId
          ? {
              ...p,
              title,
              description,
              addressText,
              categoryIds,
              lat: input.lat,
              lng: input.lng,
              photoUris,
              pickupDate: input.pickupDate,
              expiresAt: computeExpiresAt(p.createdAt, input.pickupDate),
            }
          : p
      )
    );
  };

  const deletePost = async (id: string, requestingUserId: string) => {
    setPosts((prev) => prev.filter((p) => !(p.id === id && p.userId === requestingUserId)));
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
  // Date.now() is inherently impure — deliberately not memoized; worst case a post reads
  // as active for one extra render, which is fine for a demo.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const withComputedStatus = posts.map((p) =>
    p.status === 'active' && new Date(p.expiresAt).getTime() < now
      ? { ...p, status: 'expired' as const }
      : p
  );
  const visiblePosts = withComputedStatus.filter((p) => p.status === 'active');

  return (
    <PostsContext.Provider
      value={{
        posts: visiblePosts,
        allPosts: withComputedStatus,
        isReady,
        addPost,
        updatePost,
        deletePost,
        markCollected,
      }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error('usePosts must be used within PostsProvider');
  return ctx;
}
