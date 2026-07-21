export type SortOrder = 'asc' | 'desc';

export interface ExternalUser {
  id: string;
  username?: string;
  createdAt?: string;
}

export interface ExternalProfile {
  id: string;
  full_name?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface UserSearchRow {
  id: string;
  profileId: string;
  full_name: string;
  username: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  country: string;
  updated_at: string;
  created_at: string;
}

export interface SearchResponse {
  result: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    data: UserSearchRow[];
  };
  error: Record<string, never>;
}