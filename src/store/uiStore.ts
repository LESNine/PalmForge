import { create } from 'zustand'

interface UIStore {
  searchModalOpen: boolean
  detailPanelOpen: boolean
  selectedParameter: string | null
  searchQuery: string
  selectedCategory: string | null
  expandedCategories: string[]

  setSearchModalOpen: (open: boolean) => void
  setDetailPanelOpen: (open: boolean) => void
  setSelectedParameter: (name: string | null) => void
  setSearchQuery: (query: string) => void
  setSelectedCategory: (id: string | null) => void
  toggleCategory: (id: string) => void
}

export const useUIStore = create<UIStore>((set) => ({
  searchModalOpen: false,
  detailPanelOpen: false,
  selectedParameter: null,
  searchQuery: '',
  selectedCategory: null,
  expandedCategories: [],

  setSearchModalOpen: (open) => set({ searchModalOpen: open }),
  setDetailPanelOpen: (open) => set({ detailPanelOpen: open }),
  setSelectedParameter: (name) => set({ selectedParameter: name }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (id) => set({ selectedCategory: id }),
  toggleCategory: (id) =>
    set((state) => ({
      expandedCategories: state.expandedCategories.includes(id)
        ? state.expandedCategories.filter((c) => c !== id)
        : [...state.expandedCategories, id],
    })),
}))
