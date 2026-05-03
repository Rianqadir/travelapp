import { pgTable, text, serial, real, timestamp, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  clerk_id: text('clerk_id').notNull().unique(),
  role: text('role').notNull().default('user'),
  monthly_budget: real('monthly_budget'),
  created_at: timestamp('created_at').defaultNow(),
});

export const cars = pgTable('cars', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  fuel_type: text('fuel_type').notNull(), // 'petrol' | 'diesel' | 'high_octane'
  claimed_mileage: real('claimed_mileage').notNull(),
  city_mileage: real('city_mileage'),
  highway_mileage: real('highway_mileage'),
  created_at: timestamp('created_at').defaultNow(),
});

export const fuel_prices = pgTable('fuel_prices', {
  id: serial('id').primaryKey(),
  fuel_type: text('fuel_type').notNull().unique(),
  price_per_liter: real('price_per_liter').notNull(),
  updated_at: timestamp('updated_at').defaultNow(),
  updated_by: integer('updated_by').references(() => users.id),
});

export const trips = pgTable('trips', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  car_id: integer('car_id').notNull().references(() => cars.id),
  origin: text('origin').notNull(),
  destination: text('destination').notNull(),
  distance_km: real('distance_km').notNull(),
  travel_time_minutes: real('travel_time_minutes').notNull(),
  fuel_required_liters: real('fuel_required_liters').notNull(),
  fuel_cost_pkr: real('fuel_cost_pkr').notNull(),
  cost_per_km: real('cost_per_km').notNull(),
  created_at: timestamp('created_at').defaultNow(),
});
