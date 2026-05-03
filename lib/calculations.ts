import { Car, Trip, FuelPrice } from './types';

/**
 * Calculate fuel needed for a trip
 * Formula: distance / mileage
 */
export function calculateFuelNeeded(distance: number, mileage: number): number {
  if (mileage <= 0) return 0;
  return distance / mileage;
}

/**
 * Calculate total cost of a trip
 * Formula: (distance / mileage) * fuelPrice
 */
export function calculateTripCost(
  distance: number,
  mileage: number,
  fuelPrice: number
): number {
  const fuelNeeded = calculateFuelNeeded(distance, mileage);
  return fuelNeeded * fuelPrice;
}

/**
 * Calculate cost per kilometer
 */
export function calculateCostPerKm(
  distance: number,
  mileage: number,
  fuelPrice: number
): number {
  if (distance <= 0) return 0;
  const totalCost = calculateTripCost(distance, mileage, fuelPrice);
  return totalCost / distance;
}

/**
 * Get fuel price for a specific fuel type
 */
export function getFuelPrice(
  fuelType: string,
  fuelPrices: FuelPrice[]
): number {
  const price = fuelPrices.find(p => p.fuelType === fuelType);
  return price?.price || 0;
}

/**
 * Calculate trip cost with all necessary information
 */
export function calculateTripSummary(
  trip: Trip,
  car: Car | undefined,
  fuelPrices: FuelPrice[]
) {
  if (!car) return null;

  const fuelPrice = getFuelPrice(car.fuelType, fuelPrices);
  const fuelNeeded = calculateFuelNeeded(trip.distance, car.mileage);
  const totalCost = fuelNeeded * fuelPrice;
  const costPerKm = calculateCostPerKm(trip.distance, car.mileage, fuelPrice);

  return {
    distance: trip.distance,
    mileage: car.mileage,
    fuelPrice,
    fuelNeeded,
    totalCost,
    costPerKm,
  };
}

/**
 * Format currency for PKR
 */
export function formatPKR(amount: number): string {
  return `Rs. ${amount.toFixed(2)}`;
}

/**
 * Format date to readable format
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Calculate average mileage from multiple trips and cars
 */
export function calculateAverageMileage(cars: Car[]): number {
  if (cars.length === 0) return 0;
  const totalMileage = cars.reduce((sum, car) => sum + car.mileage, 0);
  return totalMileage / cars.length;
}

/**
 * Calculate total expenses across multiple trips
 */
export function calculateTotalExpenses(
  trips: Trip[],
  cars: Car[],
  fuelPrices: FuelPrice[]
): number {
  return trips.reduce((total, trip) => {
    const car = cars.find(c => c.id === trip.carId);
    if (!car) return total;
    const cost = calculateTripCost(trip.distance, car.mileage, getFuelPrice(car.fuelType, fuelPrices));
    return total + cost;
  }, 0);
}

/**
 * Group trips by car
 */
export function groupTripsByCar(trips: Trip[]) {
  return trips.reduce((acc, trip) => {
    if (!acc[trip.carId]) {
      acc[trip.carId] = [];
    }
    acc[trip.carId].push(trip);
    return acc;
  }, {} as Record<string, Trip[]>);
}

/**
 * Calculate statistics for a specific car
 */
export function calculateCarStats(
  carId: string,
  trips: Trip[],
  car: Car | undefined,
  fuelPrices: FuelPrice[]
) {
  if (!car) return null;

  const carTrips = trips.filter(t => t.carId === carId);
  const totalDistance = carTrips.reduce((sum, trip) => sum + trip.distance, 0);
  const fuelPrice = getFuelPrice(car.fuelType, fuelPrices);
  const totalCost = calculateTotalExpenses(carTrips, [car], fuelPrices);
  const averageCostPerTrip = carTrips.length > 0 ? totalCost / carTrips.length : 0;

  return {
    tripCount: carTrips.length,
    totalDistance,
    totalCost,
    averageCostPerTrip,
    averageCostPerKm: totalDistance > 0 ? totalCost / totalDistance : 0,
  };
}
