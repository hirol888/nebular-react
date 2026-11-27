import React, { forwardRef, useEffect, useId, useRef, useState } from 'react';
import { useUncontrolled } from '@nebular-react/hooks';
import { createStyles } from '@nebular-react/styles';
import type { DefaultProps, Selectors } from '@nebular-react/styles';
import { Button } from '../Button';
import { Fieldset } from '../Fieldset';
import { FormControl } from '../FormControl';
import { Input } from '../Input';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationPickerResult extends LocationCoordinates {
  id: string;
  label: string;
  description?: React.ReactNode;
}

export interface LocationPickerMapProps {
  value: LocationCoordinates | null;
  onSelect(value: LocationCoordinates): void;
  disabled: boolean;
}

export interface LocationPickerLabels {
  coordinates: string;
  latitude: string;
  longitude: string;
  latitudeError: string;
  longitudeError: string;
  apply: string;
  clear: string;
  search: string;
  searchButton: string;
  searching: string;
  results: string;
  noResults: string;
  searchError: string;
}

const defaultLabels: LocationPickerLabels = {
  coordinates: 'Coordinates',
  latitude: 'Latitude',
  longitude: 'Longitude',
  latitudeError: 'Enter a latitude between -90 and 90.',
  longitudeError: 'Enter a longitude between -180 and 180.',
  apply: 'Apply coordinates',
  clear: 'Clear location',
  search: 'Address or place',
  searchButton: 'Search',
  searching: 'Searching…',
  results: 'Location results',
  noResults: 'No matching locations.',
  searchError: 'Could not find locations. Try again.'
};

const useStyles = createStyles(() => ({
  root: { display: 'grid', gap: '1rem', minWidth: 0 },
  fields: {
    display: 'grid',
    gap: '0.75rem',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 10rem), 1fr))'
  },
  actions: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBlockStart: '0.75rem' },
  search: { display: 'flex', flexWrap: 'wrap', alignItems: 'end', gap: '0.5rem' },
  searchField: { flex: '1 1 14rem' },
  feedback: { margin: '0.5rem 0 0' },
  error: { color: 'var(--text-danger-color, #b41939)' },
  results: { display: 'grid', gap: '0.25rem', paddingInlineStart: '1.5rem', marginBlockEnd: 0 },
  resultButton: { textAlign: 'start', maxInlineSize: '100%', overflowWrap: 'anywhere' },
  map: {
    minWidth: 0,
    border: '1px solid var(--border-basic-color-3, #e4e9f2)',
    borderRadius: 'var(--border-radius, 0.25rem)',
    overflow: 'hidden'
  }
}));

export type LocationPickerStylesNames = Selectors<typeof useStyles>;

export interface LocationPickerProps extends DefaultProps<LocationPickerStylesNames> {
  value?: LocationCoordinates | null;
  defaultValue?: LocationCoordinates | null;
  onChange?(value: LocationCoordinates | null): void;
  renderMap?(props: LocationPickerMapProps): React.ReactNode;
  searchLocations?(
    query: string,
    options: { signal: AbortSignal }
  ): Promise<readonly LocationPickerResult[]>;
  labels?: Partial<LocationPickerLabels>;
  clearable?: boolean;
  disabled?: boolean;
}

type CoordinateField = keyof LocationCoordinates;
type CoordinateDraft = Record<CoordinateField, string>;
type SearchState =
  | { status: 'idle' | 'loading' | 'error' }
  | { status: 'ready'; results: readonly LocationPickerResult[] };

function isCoordinate(value: number, bound: number): boolean {
  return Number.isFinite(value) && Math.abs(value) <= bound;
}

function isLocation(value: LocationCoordinates): boolean {
  return isCoordinate(value.latitude, 90) && isCoordinate(value.longitude, 180);
}

function parseCoordinate(text: string, bound: number): number | null {
  const trimmed = text.trim();
  if (!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(trimmed)) return null;
  const value = Number(trimmed.replace(',', '.'));
  return isCoordinate(value, bound) ? value : null;
}

const LocationPicker = forwardRef<HTMLDivElement, LocationPickerProps>((props, ref) => {
  const {
    value,
    defaultValue,
    onChange,
    renderMap,
    searchLocations,
    labels,
    clearable,
    disabled = false,
    className,
    classNames,
    styles,
    unstyled
  } = props;
  const text = { ...defaultLabels, ...labels };
  const { classes, cx } = useStyles(null, {
    name: 'location-picker',
    classNames,
    styles,
    unstyled
  });
  const [selected, setSelected] = useUncontrolled({
    value,
    defaultValue,
    finalValue: null,
    onChange
  });
  const selectionKey = selected ? `${String(selected.latitude)}/${String(selected.longitude)}` : '';
  const [edit, setEdit] = useState<{ key: string; draft: CoordinateDraft; attempted: boolean }>();
  const draft =
    edit?.key === selectionKey
      ? edit.draft
      : {
          latitude: selected ? String(selected.latitude) : '',
          longitude: selected ? String(selected.longitude) : ''
        };
  const attempted = edit?.key === selectionKey && edit.attempted;
  const latitude = parseCoordinate(draft.latitude, 90);
  const longitude = parseCoordinate(draft.longitude, 180);
  const [query, setQuery] = useState('');
  const [lookup, setLookup] = useState<SearchState>({ status: 'idle' });
  const request = useRef<AbortController | null>(null);
  const latitudeRef = useRef<HTMLInputElement>(null);
  const longitudeRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const searchEnabled = Boolean(searchLocations && !disabled);

  useEffect(() => {
    if (!searchEnabled) setLookup({ status: 'idle' });
    return () => {
      request.current?.abort();
      request.current = null;
    };
  }, [searchEnabled]);

  const select = (location: LocationCoordinates | null) => {
    if (disabled || (location && !isLocation(location))) return;
    setEdit(undefined);
    setSelected(location ? { latitude: location.latitude, longitude: location.longitude } : null);
  };

  const apply = () => {
    if (disabled) return;
    if (latitude === null || longitude === null) {
      setEdit({ key: selectionKey, draft, attempted: true });
      (latitude === null ? latitudeRef : longitudeRef).current?.focus();
      return;
    }
    select({ latitude, longitude });
  };

  const search = async () => {
    const term = query.trim();
    if (!searchLocations || !term || disabled) return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLookup({ status: 'loading' });
    try {
      const results = await searchLocations(term, { signal: controller.signal });
      if (request.current === controller && !controller.signal.aborted) {
        setLookup({ status: 'ready', results: results.filter(isLocation) });
      }
    } catch {
      if (request.current === controller && !controller.signal.aborted) {
        setLookup({ status: 'error' });
      }
    } finally {
      if (request.current === controller) request.current = null;
    }
  };

  const onEnter = (event: React.KeyboardEvent<HTMLInputElement>, action: () => void) => {
    if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
      event.preventDefault();
      action();
    }
  };

  const coordinateField = (
    field: CoordinateField,
    invalid: boolean,
    inputRef: React.Ref<HTMLInputElement>
  ) => {
    const inputId = `${id}-${field}`;
    const errorId = `${inputId}-error`;
    const error = invalid ? text[field === 'latitude' ? 'latitudeError' : 'longitudeError'] : null;
    return (
      <FormControl
        label={text[field]}
        htmlFor={inputId}
        error={error && <span id={errorId}>{error}</span>}
      >
        <Input
          id={inputId}
          ref={inputRef}
          value={draft[field]}
          disabled={disabled}
          inputMode="decimal"
          fullWidth
          status={invalid ? 'danger' : 'basic'}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : undefined}
          onChange={(event) => {
            setEdit({
              key: selectionKey,
              draft: { ...draft, [field]: event.target.value },
              attempted: !!attempted
            });
          }}
          onKeyDown={(event) => onEnter(event, apply)}
        />
      </FormControl>
    );
  };

  return (
    <div ref={ref} className={cx(classes.root, className)}>
      {searchLocations && (
        <div>
          <div className={classes.search}>
            <FormControl
              label={text.search}
              htmlFor={`${id}-search`}
              className={classes.searchField}
            >
              <Input
                id={`${id}-search`}
                ref={searchRef}
                type="search"
                fullWidth
                value={query}
                disabled={disabled}
                onKeyDown={(event) => onEnter(event, search)}
                onChange={(event) => {
                  request.current?.abort();
                  request.current = null;
                  setLookup({ status: 'idle' });
                  setQuery(event.target.value);
                }}
              />
            </FormControl>
            <Button
              type="button"
              onClick={search}
              disabled={disabled || !query.trim() || lookup.status === 'loading'}
            >
              {text.searchButton}
            </Button>
          </div>
          {lookup.status === 'loading' && (
            <p role="status" className={classes.feedback}>
              {text.searching}
            </p>
          )}
          {lookup.status === 'error' && (
            <p role="alert" className={cx(classes.feedback, classes.error)}>
              {text.searchError}
            </p>
          )}
          {lookup.status === 'ready' &&
            (lookup.results.length ? (
              <ul aria-label={text.results} className={classes.results}>
                {lookup.results.map((result) => (
                  <li key={result.id}>
                    <Button
                      type="button"
                      appearance="ghost"
                      className={classes.resultButton}
                      disabled={disabled}
                      onClick={() => {
                        select(result);
                        setQuery(result.label);
                        setLookup({ status: 'idle' });
                        searchRef.current?.focus();
                      }}
                    >
                      {result.label}
                    </Button>
                    {result.description && <div>{result.description}</div>}
                  </li>
                ))}
              </ul>
            ) : (
              <p role="status" className={classes.feedback}>
                {text.noResults}
              </p>
            ))}
        </div>
      )}
      {renderMap && (
        <div className={classes.map}>
          {renderMap({ value: selected, onSelect: select, disabled })}
        </div>
      )}
      <Fieldset legend={text.coordinates}>
        <div className={classes.fields}>
          {coordinateField('latitude', Boolean(attempted && latitude === null), latitudeRef)}
          {coordinateField('longitude', Boolean(attempted && longitude === null), longitudeRef)}
        </div>
        <div className={classes.actions}>
          <Button type="button" disabled={disabled} onClick={apply}>
            {text.apply}
          </Button>
          {clearable && (
            <Button
              type="button"
              appearance="ghost"
              disabled={disabled || (!selected && !draft.latitude && !draft.longitude)}
              onClick={() => {
                select(null);
                latitudeRef.current?.focus();
              }}
            >
              {text.clear}
            </Button>
          )}
        </div>
      </Fieldset>
    </div>
  );
});

LocationPicker.displayName = 'LocationPicker';

export { LocationPicker };
