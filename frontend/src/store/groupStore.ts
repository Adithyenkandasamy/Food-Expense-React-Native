/**
 * MessMate - Group Store (Zustand)
 * Manages the currently selected group.
 */
import { create } from 'zustand';
import type { Group } from '../types';

interface GroupState {
    currentGroup: Group | null;
    setCurrentGroup: (group: Group | null) => void;
}

export const useGroupStore = create<GroupState>((set) => ({
    currentGroup: null,
    setCurrentGroup: (group) => set({ currentGroup: group }),
}));
