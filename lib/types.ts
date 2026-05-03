// Database row types (matching schema.ts)
export interface DbUser {
  id: number;
  email: string;
  clerk_id: string;
  role: 'user' | 'admin';
  monthly_budget: number | null;
  created_at: string;
}

export interface DbCar {
  id: number;
  user_id: number;
  name: string;
  fuel_type: 'petrol' | 'diesel' | 'high_octane';
  claimed_mileage: number;
  city_mileage: number | null;
  highway_mileage: number | null;
  created_at: string;
}

export interface DbFuelPrice {
  id: number;
  fuel_type: 'petrol' | 'diesel' | 'high_octane';
  price_per_liter: number;
  updated_at: string;
  updated_by: number | null;
}

export interface DbTrip {
  id: number;
  user_id: number;
  car_id: number;
  origin: string;
  destination: string;
  distance_km: number;
  travel_time_minutes: number;
  fuel_required_liters: number;
  fuel_cost_pkr: number;
  cost_per_km: number;
  created_at: string;
}

export interface CalcResult {
  origin: string;
  destination: string;
  origin_coords: [number, number];
  destination_coords: [number, number];
  car_id: number;
  car_name: string;
  fuel_type: string;
  distance_km: number;
  travel_time_minutes: number;
  effective_mileage: number;
  mileage_source: string;
  has_custom_mileage: boolean;
  claimed_mileage: number;
  custom_mileage: number | null;
  price_per_liter: number;
  fuel_required_liters: number;
  fuel_cost_pkr: number;
  cost_per_km: number;
}

export interface GeocodeSuggestion {
  label: string;
  name: string;
  region: string;
  coordinates: [number, number]; // [lng, lat]
}
