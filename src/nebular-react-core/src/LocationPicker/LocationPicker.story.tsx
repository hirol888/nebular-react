import React, { useState } from 'react';
import { Button } from '../Button';
import { LocationPicker } from './LocationPicker';
import type { LocationCoordinates, LocationPickerResult } from './LocationPicker';

export default { title: 'LocationPicker', component: LocationPicker };

export function Coordinates() {
  const [value, setValue] = useState<LocationCoordinates | null>({
    latitude: -23.5505,
    longitude: -46.6333
  });
  return (
    <div style={{ maxWidth: '36rem' }}>
      <LocationPicker
        value={value}
        onChange={setValue}
        clearable
        labels={{
          coordinates: 'Coordenadas',
          apply: 'Aplicar coordenadas',
          clear: 'Limpar localização',
          latitudeError: 'Informe uma latitude entre -90 e 90.',
          longitudeError: 'Informe uma longitude entre -180 e 180.'
        }}
      />
      <output>{value ? [value.latitude, value.longitude].join(', ') : 'Sem localização'}</output>
    </div>
  );
}

const places: LocationPickerResult[] = [
  { id: 'library', label: 'Central library', latitude: 47.6067, longitude: -122.3325 },
  { id: 'museum', label: 'Art museum', latitude: 47.6071, longitude: -122.3372 }
];

export function SearchAndMapAdapter() {
  return (
    <div style={{ maxWidth: '36rem' }}>
      <LocationPicker
        clearable
        searchLocations={async (query) =>
          places.filter((place) => place.label.toLowerCase().includes(query.toLowerCase()))
        }
        renderMap={({ value, onSelect, disabled }) => (
          <div
            role="group"
            aria-label="Locations on the map"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              padding: '2.5rem 1rem',
              backgroundColor: 'var(--background-basic-color-2)',
              backgroundImage:
                'repeating-linear-gradient(0deg, transparent 0 23px, var(--border-basic-color-3) 23px 24px), repeating-linear-gradient(90deg, transparent 0 23px, var(--border-basic-color-3) 23px 24px)'
            }}
          >
            {places.map((place) => (
              <Button
                key={place.id}
                type="button"
                size="small"
                aria-pressed={
                  value?.latitude === place.latitude && value.longitude === place.longitude
                }
                onClick={() => onSelect(place)}
                disabled={disabled}
              >
                {place.label}
              </Button>
            ))}
          </div>
        )}
      />
    </div>
  );
}
