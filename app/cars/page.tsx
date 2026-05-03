'use client';

import { AppLayout } from '@/components/app-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/lib/context';
import { useState } from 'react';
import { Trash2, Plus, Pencil, X, Check, Search, Car } from 'lucide-react';
import type { DbCar } from '@/lib/types';

const FUEL_LABELS: Record<string, string> = {
  petrol: 'Petrol (RON 92)',
  diesel: 'Diesel',
  high_octane: 'High Octane (RON 97)',
};

// ───── Comprehensive Pakistani Car Database ─────
const PRESET_MODELS = [
  // Suzuki
  { name: 'Suzuki Alto', mileage: 22, fuel: 'petrol' },
  { name: 'Suzuki Alto (AGS)', mileage: 23, fuel: 'petrol' },
  { name: 'Suzuki Cultus', mileage: 15, fuel: 'petrol' },
  { name: 'Suzuki Cultus (AGS)', mileage: 16, fuel: 'petrol' },
  { name: 'Suzuki Mehran', mileage: 18, fuel: 'petrol' },
  { name: 'Suzuki Swift', mileage: 14, fuel: 'petrol' },
  { name: 'Suzuki Wagon R', mileage: 16, fuel: 'petrol' },
  { name: 'Suzuki Wagon R (AGS)', mileage: 17, fuel: 'petrol' },
  { name: 'Suzuki Bolan', mileage: 14, fuel: 'petrol' },
  { name: 'Suzuki Ravi', mileage: 13, fuel: 'petrol' },
  { name: 'Suzuki Every', mileage: 14, fuel: 'petrol' },
  { name: 'Suzuki Jimny', mileage: 12, fuel: 'petrol' },
  // Honda
  { name: 'Honda City 1.2L', mileage: 15, fuel: 'petrol' },
  { name: 'Honda City 1.5L', mileage: 14, fuel: 'petrol' },
  { name: 'Honda Civic 1.5 Turbo', mileage: 12, fuel: 'petrol' },
  { name: 'Honda Civic Oriel', mileage: 11, fuel: 'petrol' },
  { name: 'Honda BR-V', mileage: 13, fuel: 'petrol' },
  { name: 'Honda HR-V', mileage: 12, fuel: 'petrol' },
  { name: 'Honda Vezel', mileage: 18, fuel: 'petrol' },
  // Toyota
  { name: 'Toyota Corolla 1.6L', mileage: 13, fuel: 'petrol' },
  { name: 'Toyota Corolla 1.8L', mileage: 12, fuel: 'petrol' },
  { name: 'Toyota Corolla Grande', mileage: 11, fuel: 'petrol' },
  { name: 'Toyota Corolla Cross', mileage: 14, fuel: 'petrol' },
  { name: 'Toyota Yaris 1.3L', mileage: 15, fuel: 'petrol' },
  { name: 'Toyota Yaris 1.5L', mileage: 14, fuel: 'petrol' },
  { name: 'Toyota Fortuner', mileage: 8, fuel: 'diesel' },
  { name: 'Toyota Hilux Revo', mileage: 9, fuel: 'diesel' },
  { name: 'Toyota Land Cruiser', mileage: 6, fuel: 'petrol' },
  { name: 'Toyota Prado', mileage: 7, fuel: 'diesel' },
  { name: 'Toyota Prius', mileage: 25, fuel: 'petrol' },
  { name: 'Toyota Aqua', mileage: 30, fuel: 'petrol' },
  { name: 'Toyota Vitz', mileage: 18, fuel: 'petrol' },
  // Hyundai
  { name: 'Hyundai Tucson', mileage: 11, fuel: 'petrol' },
  { name: 'Hyundai Elantra', mileage: 12, fuel: 'petrol' },
  { name: 'Hyundai Sonata', mileage: 11, fuel: 'petrol' },
  { name: 'Hyundai Santa Fe', mileage: 9, fuel: 'petrol' },
  { name: 'Hyundai Staria', mileage: 10, fuel: 'diesel' },
  // Kia
  { name: 'Kia Sportage', mileage: 11, fuel: 'petrol' },
  { name: 'Kia Sportage (AWD)', mileage: 10, fuel: 'petrol' },
  { name: 'Kia Picanto', mileage: 18, fuel: 'petrol' },
  { name: 'Kia Stonic', mileage: 14, fuel: 'petrol' },
  { name: 'Kia Sorento', mileage: 9, fuel: 'petrol' },
  { name: 'Kia Carnival', mileage: 8, fuel: 'diesel' },
  // MG
  { name: 'MG HS', mileage: 10, fuel: 'petrol' },
  { name: 'MG HS Essence', mileage: 10, fuel: 'petrol' },
  { name: 'MG ZS', mileage: 12, fuel: 'petrol' },
  { name: 'MG ZS EV', mileage: 25, fuel: 'petrol' }, // EV approximation
  { name: 'MG 3', mileage: 15, fuel: 'petrol' },
  // Changan
  { name: 'Changan Alsvin', mileage: 14, fuel: 'petrol' },
  { name: 'Changan Alsvin Lumiere', mileage: 14, fuel: 'petrol' },
  { name: 'Changan Oshan X7', mileage: 10, fuel: 'petrol' },
  { name: 'Changan Uni-T', mileage: 11, fuel: 'petrol' },
  // Proton
  { name: 'Proton Saga', mileage: 15, fuel: 'petrol' },
  { name: 'Proton X70', mileage: 10, fuel: 'petrol' },
  // Prince / United
  { name: 'Prince Pearl', mileage: 20, fuel: 'petrol' },
  { name: 'United Bravo', mileage: 18, fuel: 'petrol' },
  { name: 'United Alpha', mileage: 17, fuel: 'petrol' },
  // Haval
  { name: 'Haval Jolion', mileage: 11, fuel: 'petrol' },
  { name: 'Haval H6', mileage: 10, fuel: 'petrol' },
  // Isuzu
  { name: 'Isuzu D-Max', mileage: 10, fuel: 'diesel' },
  // DFSK
  { name: 'DFSK Glory 580 Pro', mileage: 10, fuel: 'petrol' },
  // Motorcycles (popular in PK)
  { name: 'Honda CD 70', mileage: 55, fuel: 'petrol' },
  { name: 'Honda CG 125', mileage: 45, fuel: 'petrol' },
  { name: 'Honda CB 150F', mileage: 40, fuel: 'petrol' },
  { name: 'Yamaha YBR 125G', mileage: 42, fuel: 'petrol' },
  { name: 'Suzuki GD 110S', mileage: 50, fuel: 'petrol' },
  { name: 'Suzuki GS 150', mileage: 38, fuel: 'petrol' },
  { name: 'Honda Pridor', mileage: 50, fuel: 'petrol' },
];

const emptyForm = { name: '', fuel_type: 'petrol', claimed_mileage: '', city_mileage: '', highway_mileage: '' };

export default function CarsPage() {
  const { cars, addCar, updateCar, deleteCar, isLoading } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCustomCar, setIsCustomCar] = useState(false);

  const filteredPresets = searchQuery.length > 0
    ? PRESET_MODELS.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : PRESET_MODELS;

  const handlePreset = (model: { name: string; mileage: number; fuel: string }) => {
    // For presets, we estimate City = 70% of Claimed, Highway = 100% of Claimed
    setFormData(f => ({
      ...f,
      name: model.name,
      claimed_mileage: String(model.mileage),
      city_mileage: String(Math.round(model.mileage * 0.7 * 10) / 10),
      highway_mileage: String(model.mileage),
      fuel_type: model.fuel,
    }));
    setIsCustomCar(false);
    setSearchQuery('');
  };

  const handleCustomCar = () => {
    setIsCustomCar(true);
    setFormData({ ...emptyForm, name: searchQuery });
  };

  const handleAddCar = async () => {
    if (!formData.name || !formData.claimed_mileage) {
      setError('Car name and base mileage are required.');
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      await addCar({
        name: formData.name,
        fuel_type: formData.fuel_type,
        claimed_mileage: parseFloat(formData.claimed_mileage),
        city_mileage: formData.city_mileage ? parseFloat(formData.city_mileage) : undefined,
        highway_mileage: formData.highway_mileage ? parseFloat(formData.highway_mileage) : undefined,
      });
      setFormData(emptyForm);
      setShowForm(false);
      setIsCustomCar(false);
      setSearchQuery('');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEdit = (car: DbCar) => {
    setEditId(car.id);
    setEditData({
      name: car.name,
      fuel_type: car.fuel_type,
      claimed_mileage: String(car.claimed_mileage),
      city_mileage: car.city_mileage ? String(car.city_mileage) : '',
      highway_mileage: car.highway_mileage ? String(car.highway_mileage) : '',
    });
  };

  const handleSaveEdit = async (id: number) => {
    await updateCar(id, {
      name: editData.name,
      fuel_type: editData.fuel_type as DbCar['fuel_type'],
      claimed_mileage: parseFloat(editData.claimed_mileage),
      city_mileage: editData.city_mileage ? parseFloat(editData.city_mileage) : null,
      highway_mileage: editData.highway_mileage ? parseFloat(editData.highway_mileage) : null,
    });
    setEditId(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this car? Associated trips will also be removed.')) {
      await deleteCar(id);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-foreground">
            My <span className="gradient-primary bg-clip-text text-transparent">Cars</span>
          </h1>
          <Button onClick={() => setShowForm(!showForm)} className="btn-gradient">
            <Plus className="w-4 h-4 mr-2" /> Add Car
          </Button>
        </div>

        {/* Add Car Form */}
        {showForm && (
          <Card className="p-6 mb-6 gradient-card glow-accent">
            <h2 className="text-xl font-bold mb-4">Add New <span className="text-accent">Car</span></h2>

            {/* Step 1: Search or add custom */}
            {!formData.name && !isCustomCar && (
              <div className="mb-4">
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search car models or type your own..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto border border-border rounded-lg">
                  {filteredPresets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2">
                      {filteredPresets.map(m => (
                        <button
                          key={m.name}
                          onClick={() => handlePreset(m)}
                          className="w-full text-left px-4 py-3 hover:bg-secondary/50 transition-colors flex items-center justify-between border-b border-border/50 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-accent shrink-0" />
                            <span className="text-sm font-medium">{m.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{m.mileage} km/L · {FUEL_LABELS[m.fuel] || m.fuel}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      No models found for &ldquo;{searchQuery}&rdquo;
                    </div>
                  )}
                </div>
                {searchQuery.length > 0 && (
                  <button
                    onClick={handleCustomCar}
                    className="w-full mt-3 p-3 border-2 border-dashed border-accent/30 rounded-lg hover:border-accent hover:bg-accent/5 transition-colors text-sm text-accent font-medium flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add &ldquo;{searchQuery}&rdquo; as a custom car
                  </button>
                )}
              </div>
            )}

            {/* Step 2: Selected car details */}
            {(formData.name || isCustomCar) && (
              <>
                <div className="flex items-center gap-2 mb-4 p-3 bg-secondary/50 rounded-lg">
                  <Car className="w-5 h-5 text-accent" />
                  <span className="font-semibold">{formData.name || 'Custom Car'}</span>
                  {!isCustomCar && (
                    <span className="text-xs text-muted-foreground ml-auto">From preset database</span>
                  )}
                  {isCustomCar && (
                    <span className="text-xs text-accent ml-auto">Custom entry</span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFormData(emptyForm);
                      setIsCustomCar(false);
                      setSearchQuery('');
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Car Name / Nickname *</label>
                    <Input
                      placeholder="e.g., My Cultus"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Fuel Type</label>
                    <select
                      value={formData.fuel_type}
                      onChange={e => setFormData({ ...formData, fuel_type: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    >
                      <option value="petrol">Petrol (RON 92)</option>
                      <option value="diesel">Diesel</option>
                      <option value="high_octane">High Octane (RON 97)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      City Average (km/L)
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 10"
                      min="1"
                      step="0.1"
                      value={formData.city_mileage}
                      onChange={e => setFormData({ ...formData, city_mileage: e.target.value })}
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">Real-world city traffic mileage</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Highway Average (km/L)
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 16"
                      min="1"
                      step="0.1"
                      value={formData.highway_mileage}
                      onChange={e => setFormData({ ...formData, highway_mileage: e.target.value })}
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">Motorway or long cruise mileage</p>
                  </div>
                </div>

                {error && <p className="text-destructive text-sm mt-2">{error}</p>}
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleAddCar} className="btn-gradient" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Add Car'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setFormData(emptyForm);
                      setIsCustomCar(false);
                      setSearchQuery('');
                      setError('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </Card>
        )}

        {/* Cars Grid */}
        {isLoading ? (
          <p className="text-muted-foreground">Loading cars...</p>
        ) : cars.length === 0 ? (
          <Card className="p-12 text-center gradient-card glow-accent">
            <Car className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg mb-4">You haven&apos;t added any cars yet</p>
            <Button onClick={() => setShowForm(true)} className="btn-gradient">Add Your First Car</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cars.map(car => (
              <Card key={car.id} className="p-6 gradient-card glow-accent">
                {editId === car.id ? (
                  <div className="space-y-3">
                    <Input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                    <select
                      value={editData.fuel_type}
                      onChange={e => setEditData({ ...editData, fuel_type: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    >
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="high_octane">High Octane</option>
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <Input type="number" placeholder="City km/L" value={editData.city_mileage} onChange={e => setEditData({ ...editData, city_mileage: e.target.value })} />
                      <Input type="number" placeholder="Highway km/L" value={editData.highway_mileage} onChange={e => setEditData({ ...editData, highway_mileage: e.target.value })} />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSaveEdit(car.id)} className="btn-gradient"><Check className="w-4 h-4" /></Button>
                      <Button size="sm" variant="outline" onClick={() => setEditId(null)}><X className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{car.name}</h3>
                        <p className="text-sm text-muted-foreground">{FUEL_LABELS[car.fuel_type] ?? car.fuel_type}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button onClick={() => handleStartEdit(car)} variant="ghost" size="sm"><Pencil className="w-4 h-4" /></Button>
                        <Button onClick={() => handleDelete(car.id)} variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                    <div className="space-y-2 py-4 border-t border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground text-sm">🏙️ City Average</span>
                        <span className="font-semibold">{car.city_mileage ?? '—'} km/L</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground text-sm">🛣️ Highway Average</span>
                        <span className="font-semibold">{car.highway_mileage ?? '—'} km/L</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-border/50">
                        <span className="text-muted-foreground text-xs">Claimed (Base)</span>
                        <span className="text-sm font-medium">{car.claimed_mileage} km/L</span>
                      </div>
                    </div>
                  </>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
