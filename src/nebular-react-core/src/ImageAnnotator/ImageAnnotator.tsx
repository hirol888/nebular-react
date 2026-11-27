import React, { forwardRef, useId, useRef, useState } from 'react';
import { useIsomorphicEffect, useUncontrolled } from '@nebular-react/hooks';
import { createStyles } from '@nebular-react/styles';
import type { DefaultProps, Selectors } from '@nebular-react/styles';
import { Button } from '../Button';
import { FormControl } from '../FormControl';
import { Input } from '../Input';
import { NativeSelect } from '../NativeSelect';
import { Textarea } from '../Textarea';

export type ImageAnnotationKind = 'point' | 'rectangle';
interface ImageAnnotationPosition {
  x: number;
  y: number;
}
interface ImageAnnotationBase extends ImageAnnotationPosition {
  id: string;
  comment: string;
}

/** Coordinates and dimensions are fractions of the image between 0 and 1. */
export type ImageAnnotation = ImageAnnotationBase &
  ({ kind: 'point' } | { kind: 'rectangle'; width: number; height: number });

export interface ImageAnnotatorLabels {
  title: string;
  tool: string;
  point: string;
  rectangle: string;
  add: string;
  list: string;
  empty: string;
  marker(index: number): string;
  item(index: number): string;
  comment: string;
  remove: string;
  x: string;
  y: string;
  width: string;
  height: string;
}

const defaults: ImageAnnotatorLabels = {
  title: 'Image annotations',
  tool: 'Annotation tool',
  point: 'Point',
  rectangle: 'Rectangle',
  add: 'Add at center',
  list: 'Annotations',
  empty: 'No annotations.',
  marker: (index) => `Annotation marker ${index}`,
  item: (index) => `Annotation ${index}`,
  comment: 'Comment',
  remove: 'Remove annotation',
  x: 'Horizontal position (%)',
  y: 'Vertical position (%)',
  width: 'Width (%)',
  height: 'Height (%)'
};

const useStyles = createStyles(() => ({
  root: { display: 'grid', gap: '0.75rem', minWidth: 0, color: 'var(--text-basic-color, #222b45)' },
  toolbar: { display: 'flex', flexWrap: 'wrap', alignItems: 'end', gap: '0.5rem' },
  select: { flex: '0 1 14rem' },
  surface: {
    position: 'relative',
    minWidth: 0,
    overflow: 'hidden',
    borderRadius: 'var(--border-radius, 0.25rem)',
    isolation: 'isolate'
  },
  drawing: { cursor: 'crosshair', touchAction: 'none' },
  image: { display: 'block', width: '100%', height: 'auto', userSelect: 'none' },
  annotation: {
    position: 'absolute',
    padding: 0,
    border: '2px solid var(--color-info-500, #00bfff)',
    background: 'color-mix(in srgb, var(--color-info-500, #00bfff) 18%, transparent)',
    color: 'inherit',
    cursor: 'pointer',
    '&:focus-visible': { outline: '3px solid var(--color-warning-500, #ffaa00)', outlineOffset: 1 }
  },
  point: {
    borderRadius: '50%',
    minWidth: '1.25rem',
    minHeight: '1.25rem',
    transform: 'translate(-50%, -50%)',
    background: 'var(--color-info-500, #00bfff)'
  },
  selected: { borderColor: 'var(--color-primary-500, #3366ff)', zIndex: 1 },
  draft: { pointerEvents: 'none', borderStyle: 'dashed' },
  list: { display: 'grid', gap: '0.25rem', margin: 0, paddingInlineStart: '1.5rem' },
  item: { display: 'grid', gap: '0.25rem', overflowWrap: 'anywhere', paddingBlock: '0.25rem' },
  details: {
    display: 'grid',
    gap: '0.75rem',
    padding: '0.75rem',
    border: '1px solid var(--border-basic-color-3, #e4e9f2)',
    borderRadius: 'var(--border-radius, 0.25rem)'
  },
  geometry: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,9rem),1fr))',
    gap: '0.5rem'
  }
}));

export type ImageAnnotatorStylesNames = Selectors<typeof useStyles>;

export interface ImageAnnotatorProps extends DefaultProps<ImageAnnotatorStylesNames> {
  src: string;
  alt: string;
  value?: readonly ImageAnnotation[];
  defaultValue?: readonly ImageAnnotation[];
  onChange?(annotations: readonly ImageAnnotation[]): void;
  labels?: Partial<ImageAnnotatorLabels>;
  disabled?: boolean;
  readOnly?: boolean;
}

const empty: readonly ImageAnnotation[] = [];
const minimumSize = 0.01;

function clamp(value: number, maximum = 1): number {
  return Number.isFinite(value) ? Math.max(0, Math.min(maximum, value)) : 0;
}

function position(event: React.PointerEvent<HTMLDivElement>): ImageAnnotationPosition | null {
  const rect = event.currentTarget.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  return {
    x: clamp((event.clientX - rect.left) / rect.width),
    y: clamp((event.clientY - rect.top) / rect.height)
  };
}

function rectangle(start: ImageAnnotationPosition, end: ImageAnnotationPosition) {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y)
  };
}

function annotationStyle(
  annotation: ImageAnnotationPosition & { width?: number; height?: number }
) {
  return {
    left: `${clamp(annotation.x) * 100}%`,
    top: `${clamp(annotation.y) * 100}%`,
    width:
      annotation.width === undefined
        ? undefined
        : `${clamp(annotation.width, 1 - clamp(annotation.x)) * 100}%`,
    height:
      annotation.height === undefined
        ? undefined
        : `${clamp(annotation.height, 1 - clamp(annotation.y)) * 100}%`
  };
}

type GeometryKey = 'x' | 'y' | 'width' | 'height';

function updateGeometry(
  annotation: ImageAnnotation,
  field: GeometryKey,
  value: number
): ImageAnnotation {
  if (annotation.kind === 'point') {
    return field === 'x' || field === 'y' ? { ...annotation, [field]: clamp(value) } : annotation;
  }
  const bounds = {
    x: [0, 1 - clamp(annotation.width)],
    y: [0, 1 - clamp(annotation.height)],
    width: [minimumSize, 1 - clamp(annotation.x)],
    height: [minimumSize, 1 - clamp(annotation.y)]
  };
  const [minimum, maximum] = bounds[field];
  return { ...annotation, [field]: Math.min(maximum, Math.max(minimum, value)) };
}

export const ImageAnnotator = forwardRef<HTMLDivElement, ImageAnnotatorProps>((props, ref) => {
  const {
    src,
    alt,
    value,
    defaultValue,
    onChange,
    labels,
    disabled,
    readOnly,
    className,
    style,
    classNames,
    styles,
    unstyled
  } = props;
  const text = { ...defaults, ...labels };
  const { classes, cx } = useStyles(null, {
    name: 'image-annotator',
    classNames,
    styles,
    unstyled
  });
  const [annotations, setAnnotations] = useUncontrolled({
    value,
    defaultValue,
    finalValue: empty,
    onChange
  });
  const [tool, setTool] = useState<ImageAnnotationKind>('point');
  const [selected, select] = useState<string>();
  const [draft, setDraft] = useState<ReturnType<typeof rectangle>>();
  const [dimension, setDimension] = useState<{ id: string; field: GeometryKey; text: string }>();
  const pointer = useRef<{ id: number; start: ImageAnnotationPosition } | null>(null);
  const sequence = useRef(0);
  const focusComment = useRef<string | null>(null);
  const comment = useRef<HTMLTextAreaElement>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const id = useId();
  const editable = !disabled && !readOnly;
  const active = annotations.find((annotation) => annotation.id === selected) ?? annotations[0];
  const activeId = active?.id;
  const commentId = `${id}-comment`;

  useIsomorphicEffect(() => {
    if (activeId && focusComment.current === activeId) {
      focusComment.current = null;
      comment.current?.focus();
    }
  }, [activeId]);

  const add = (geometry: ImageAnnotationPosition & { width?: number; height?: number }) => {
    if (!editable) return;
    do {
      sequence.current += 1;
    } while (annotations.some((annotation) => annotation.id === `${id}-${sequence.current}`));
    const annotationId = `${id}-${sequence.current}`;
    const base = { id: annotationId, x: geometry.x, y: geometry.y, comment: '' };
    const annotation: ImageAnnotation =
      tool === 'rectangle'
        ? {
            ...base,
            kind: 'rectangle',
            width: geometry.width ?? 0.2,
            height: geometry.height ?? 0.2
          }
        : { ...base, kind: 'point' };
    focusComment.current = annotationId;
    select(annotationId);
    setAnnotations([...annotations, annotation]);
  };

  const endPointer = () => {
    pointer.current = null;
    setDraft(undefined);
  };

  const replace = (annotation: ImageAnnotation) => {
    if (editable)
      setAnnotations(annotations.map((item) => (item.id === annotation.id ? annotation : item)));
  };

  const renderDimension = (annotation: ImageAnnotation, field: GeometryKey) => {
    if (annotation.kind === 'point' && field !== 'x' && field !== 'y') return null;
    const inputId = `${id}-${field}`;
    const fraction =
      field === 'x' || field === 'y'
        ? annotation[field]
        : annotation.kind === 'rectangle'
          ? annotation[field]
          : 0;
    const editing = dimension?.id === annotation.id && dimension.field === field;
    return (
      <FormControl key={field} label={text[field]} htmlFor={inputId}>
        <Input
          id={inputId}
          type="number"
          min={0}
          max={100}
          step="any"
          fullWidth
          value={editing ? dimension.text : Number((clamp(fraction) * 100).toFixed(4))}
          disabled={!editable}
          onChange={(event) => setDimension({ id: annotation.id, field, text: event.target.value })}
          onBlur={(event) => {
            if (!editing) return;
            const next = event.target.valueAsNumber;
            setDimension(undefined);
            if (Number.isFinite(next)) replace(updateGeometry(annotation, field, next / 100));
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              event.currentTarget.blur();
            }
          }}
        />
      </FormControl>
    );
  };

  return (
    <div
      ref={ref}
      style={style}
      className={cx(classes.root, className)}
      role="region"
      aria-label={text.title}
    >
      {editable && (
        <div className={classes.toolbar}>
          <NativeSelect
            className={classes.select}
            label={text.tool}
            value={tool}
            data={[
              { value: 'point', label: text.point },
              { value: 'rectangle', label: text.rectangle }
            ]}
            onChange={(next) => setTool(next === 'rectangle' ? 'rectangle' : 'point')}
          />
          <Button
            type="button"
            ref={addButton}
            onClick={() => add(tool === 'point' ? { x: 0.5, y: 0.5 } : { x: 0.4, y: 0.4 })}
          >
            {text.add}
          </Button>
        </div>
      )}
      <div
        className={cx(classes.surface, editable && classes.drawing)}
        onPointerDown={(event) => {
          if (
            !editable ||
            pointer.current ||
            event.button !== 0 ||
            (event.target as Element).closest('button')
          )
            return;
          const start = position(event);
          if (!start) return;
          event.currentTarget.setPointerCapture?.(event.pointerId);
          pointer.current = { id: event.pointerId, start };
        }}
        onPointerMove={(event) => {
          const start = pointer.current;
          if (!start || start.id !== event.pointerId || tool !== 'rectangle') return;
          const end = position(event);
          if (end) setDraft(rectangle(start.start, end));
        }}
        onPointerUp={(event) => {
          const start = pointer.current;
          if (!start || start.id !== event.pointerId) return;
          const end = position(event);
          endPointer();
          if (!end) return;
          if (tool === 'point') {
            add(end);
          } else {
            const bounds = rectangle(start.start, end);
            if (bounds.width >= minimumSize && bounds.height >= minimumSize) add(bounds);
          }
        }}
        onPointerCancel={(event) => {
          if (pointer.current?.id === event.pointerId) endPointer();
        }}
        onLostPointerCapture={(event) => {
          if (pointer.current?.id === event.pointerId) endPointer();
        }}
      >
        <img className={classes.image} src={src} alt={alt} draggable={false} />
        {annotations.map((annotation, index) => (
          <button
            key={annotation.id}
            type="button"
            style={annotationStyle(annotation)}
            className={cx(
              classes.annotation,
              annotation.kind === 'point' && classes.point,
              activeId === annotation.id && classes.selected
            )}
            aria-label={text.marker(index + 1)}
            aria-pressed={activeId === annotation.id}
            onClick={() => select(annotation.id)}
          />
        ))}
        {draft && (
          <div
            aria-hidden="true"
            className={cx(classes.annotation, classes.draft)}
            style={annotationStyle(draft)}
          />
        )}
      </div>
      {annotations.length > 0 ? (
        <ol aria-label={text.list} className={classes.list}>
          {annotations.map((annotation, index) => (
            <li key={annotation.id}>
              <div className={classes.item}>
                <Button
                  type="button"
                  size="small"
                  appearance="ghost"
                  status="basic"
                  aria-pressed={activeId === annotation.id}
                  onClick={() => select(annotation.id)}
                >
                  {text.item(index + 1)}
                </Button>
                {annotation.comment && <span>{annotation.comment}</span>}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p role="status">{text.empty}</p>
      )}
      {active && (
        <div className={classes.details}>
          <FormControl label={text.comment} htmlFor={commentId}>
            <Textarea
              id={commentId}
              ref={comment}
              fullWidth
              value={active.comment}
              readOnly={!editable}
              onChange={(event) => replace({ ...active, comment: event.target.value })}
            />
          </FormControl>
          <div className={classes.geometry}>
            {(['x', 'y', 'width', 'height'] as const).map((field) =>
              renderDimension(active, field)
            )}
          </div>
          {editable && (
            <Button
              type="button"
              appearance="outline"
              status="danger"
              onClick={() => {
                const next = annotations.filter((item) => item.id !== active.id);
                select(next[0]?.id);
                setAnnotations(next);
                addButton.current?.focus();
              }}
            >
              {text.remove}
            </Button>
          )}
        </div>
      )}
    </div>
  );
});

ImageAnnotator.displayName = 'ImageAnnotator';
