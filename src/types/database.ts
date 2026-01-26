export interface Plot {
  id: string;
  title: string;
  description: string | null;
  location: string;
  size_sqm: number;
  price_zmw: number;
  price_usd: number;
  status: 'available' | 'sold' | 'reserved';
  is_sold?: boolean | null;
  is_titled: boolean;
  has_road_access: boolean | null;
  has_water: boolean | null;
  has_electricity: boolean | null;
  soil_type: string | null;
  distance_from_road: string | null;
  images: string[];
  video_url?: string | null;
  audio_url?: string | null;
  is_featured: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  plot_id: string | null;
  status: 'pending' | 'contacted' | 'closed';
  created_at: string;
}

export interface TourRequest {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string;
  preferred_date: string | null;
  preferred_time: string | null;
  message: string | null;
  plot_id: string | null;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
}

export interface Feed {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  video_url?: string | null;
  audio_url?: string | null;
  is_published: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'staff';
  created_at: string;
}

export interface PropertyFilters {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minSize?: number;
  maxSize?: number;
  status?: string;
  isTitled?: boolean;
  hasRoadAccess?: boolean;
  hasWater?: boolean;
  hasElectricity?: boolean;
}
