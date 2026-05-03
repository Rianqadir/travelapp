'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import type { DbUser, DbCar, DbTrip, DbFuelPrice } from './types';

interface AppContextType {
  dbUser: DbUser | null;
  cars: DbCar[];
  trips: DbTrip[];
  fuelPrices: DbFuelPrice[];
  isLoading: boolean;
  refreshCars: () => Promise<void>;
  refreshTrips: () => Promise<void>;

  refreshUser: () => Promise<void>;
  addCar: (data: { 
    name: string; 
    fuel_type: string; 
    claimed_mileage: number; 
    city_mileage?: number; 
    highway_mileage?: number 
  }) => Promise<DbCar>;
  updateCar: (id: number, data: Partial<DbCar>) => Promise<void>;
  deleteCar: (id: number) => Promise<void>;
  saveTrip: (data: Omit<DbTrip, 'id' | 'user_id' | 'created_at'>) => Promise<DbTrip>;
  deleteTrip: (id: number) => Promise<void>;
  updateFuelPrice: (fuel_type: string, price_per_liter: number) => Promise<void>;
  updateBudget: (amount: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [cars, setCars] = useState<DbCar[]>([]);
  const [trips, setTrips] = useState<DbTrip[]>([]);
  const [fuelPrices, setFuelPrices] = useState<DbFuelPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshFuelPrices = useCallback(async () => {
    const res = await fetch('/api/fuel-prices');
    if (res.ok) setFuelPrices(await res.json());
  }, []);

  // Fetch public fuel prices on mount
  useEffect(() => {
    refreshFuelPrices();
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await fetch('/api/user');
    if (res.ok) setDbUser(await res.json());
  }, []);

  const refreshCars = useCallback(async () => {
    const res = await fetch('/api/cars');
    if (res.ok) setCars(await res.json());
  }, []);

  const refreshTrips = useCallback(async () => {
    const res = await fetch('/api/trips');
    if (res.ok) setTrips(await res.json());
  }, []);

  // Load user data when authenticated
  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    Promise.all([refreshUser(), refreshCars(), refreshTrips()])
      .finally(() => setIsLoading(false));
  }, [isLoaded, isSignedIn]);

  const addCar = async (data: { 
    name: string; 
    fuel_type: string; 
    claimed_mileage: number; 
    city_mileage?: number; 
    highway_mileage?: number 
  }) => {
    const res = await fetch('/api/cars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const newCar: DbCar = await res.json();
    setCars(prev => [...prev, newCar]);
    return newCar;
  };

  const updateCar = async (id: number, data: Partial<DbCar>) => {
    const res = await fetch(`/api/cars/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const updated: DbCar = await res.json();
    setCars(prev => prev.map(c => (c.id === id ? updated : c)));
  };

  const deleteCar = async (id: number) => {
    await fetch(`/api/cars/${id}`, { method: 'DELETE' });
    setCars(prev => prev.filter(c => c.id !== id));
    setTrips(prev => prev.filter(t => t.car_id !== id));
  };

  const saveTrip = async (data: Omit<DbTrip, 'id' | 'user_id' | 'created_at'>) => {
    const res = await fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const newTrip: DbTrip = await res.json();
    setTrips(prev => [newTrip, ...prev]);
    return newTrip;
  };

  const deleteTrip = async (id: number) => {
    await fetch(`/api/trips/${id}`, { method: 'DELETE' });
    setTrips(prev => prev.filter(t => t.id !== id));
  };

  const updateFuelPrice = async (fuel_type: string, price_per_liter: number) => {
    const res = await fetch('/api/fuel-prices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fuel_type, price_per_liter }),
    });
    const updated: DbFuelPrice = await res.json();
    setFuelPrices(prev => prev.map(p => (p.fuel_type === fuel_type ? updated : p)));
  };

  const updateBudget = async (amount: number) => {
    const res = await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monthly_budget: amount }),
    });
    const updated: DbUser = await res.json();
    setDbUser(updated);
  };

  return (
    <AppContext.Provider
      value={{
        dbUser,
        cars,
        trips,
        fuelPrices,
        isLoading,
        refreshCars,
        refreshTrips,
        refreshUser,
        addCar,
        updateCar,
        deleteCar,
        saveTrip,
        deleteTrip,

        updateFuelPrice,
        updateBudget,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
