import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AgencyPost, AgencyPostType } from '@appTypes/agency';
import { SEED_AGENCY_POSTS } from '@constants/mockAgencyPosts';

export interface AgencyPostInput {
  type: AgencyPostType;
  title: string;
  description: string;
  imageUri?: string | null;
}

interface AgencyPostsState {
  posts: AgencyPost[];
  hasSeeded: boolean;
}

interface AgencyPostsActions {
  seedIfNeeded: () => void;
  getPostsByAgencyId: (agencyId: string) => AgencyPost[];
  addPost: (agencyId: string, input: AgencyPostInput) => AgencyPost;
  updatePost: (postId: string, agencyId: string, input: AgencyPostInput) => void;
  deletePost: (postId: string, agencyId: string) => void;
}

type AgencyPostsStore = AgencyPostsState & AgencyPostsActions;

function buildPost(agencyId: string, input: AgencyPostInput, id?: string): AgencyPost {
  const timestamp = new Date().toISOString();

  return {
    id: id ?? `agency-post-${Date.now()}`,
    agencyId,
    type: input.type,
    title: input.title.trim(),
    description: input.description.trim(),
    imageUri: input.imageUri ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export const useAgencyPostsStore = create<AgencyPostsStore>()(
  persist(
    (set, get) => ({
      posts: [],
      hasSeeded: false,

      seedIfNeeded: () => {
        if (get().hasSeeded) {
          return;
        }

        set({
          posts: SEED_AGENCY_POSTS,
          hasSeeded: true,
        });
      },

      getPostsByAgencyId: (agencyId) => {
        get().seedIfNeeded();
        return get()
          .posts.filter((post) => post.agencyId === agencyId)
          .sort(
            (left, right) =>
              new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
          );
      },

      addPost: (agencyId, input) => {
        get().seedIfNeeded();
        const post = buildPost(agencyId, input);
        set((state) => ({
          posts: [post, ...state.posts],
        }));
        return post;
      },

      updatePost: (postId, agencyId, input) => {
        get().seedIfNeeded();
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === postId && post.agencyId === agencyId
              ? {
                  ...buildPost(agencyId, input, postId),
                  createdAt: post.createdAt,
                  updatedAt: new Date().toISOString(),
                }
              : post,
          ),
        }));
      },

      deletePost: (postId, agencyId) => {
        get().seedIfNeeded();
        set((state) => ({
          posts: state.posts.filter((post) => !(post.id === postId && post.agencyId === agencyId)),
        }));
      },
    }),
    {
      name: 'civicbuild-agency-posts-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        posts: state.posts,
        hasSeeded: state.hasSeeded,
      }),
    },
  ),
);

export function getAgencyPosts(agencyId: string): AgencyPost[] {
  return useAgencyPostsStore.getState().getPostsByAgencyId(agencyId);
}
