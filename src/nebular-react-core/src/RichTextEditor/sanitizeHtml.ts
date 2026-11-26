/**
 * HTML sanitizer used for pasted content.
 *
 * The DOM based implementation is preferred because attribute values are
 * decoded by the parser before the checks run (so `&#106;avascript:` is caught).
 * A conservative regex fallback is used when no DOM is available (SSR).
 */

const REMOVED_TAGS = new Set([
  'script',
  'style',
  'iframe',
  'frame',
  'frameset',
  'object',
  'embed',
  'applet',
  'form',
  'input',
  'button',
  'textarea',
  'select',
  'option',
  'optgroup',
  'meta',
  'link',
  'base',
  'template',
  'noscript',
  'svg',
  'math',
  'canvas',
  'audio',
  'video',
  'source',
  'track'
]);

const REMOVED_SELECTOR = Array.from(REMOVED_TAGS)
  .map((tag) => tag)
  .join(',');

const ALLOWED_TAGS = new Set([
  'a',
  'abbr',
  'b',
  'blockquote',
  'br',
  'caption',
  'code',
  'col',
  'colgroup',
  'dd',
  'del',
  'details',
  'div',
  'dl',
  'dt',
  'em',
  'figcaption',
  'figure',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'img',
  'ins',
  'kbd',
  'li',
  'mark',
  'ol',
  'p',
  'pre',
  'q',
  's',
  'samp',
  'small',
  'span',
  'strike',
  'strong',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
  'u',
  'ul',
  'var'
]);

const GLOBAL_ATTRIBUTES = new Set(['style', 'title']);

const TAG_ATTRIBUTES: Record<string, Set<string>> = {
  a: new Set(['href', 'target', 'rel']),
  blockquote: new Set(['cite']),
  col: new Set(['span', 'width']),
  colgroup: new Set(['span', 'width']),
  del: new Set(['cite', 'datetime']),
  img: new Set(['src', 'alt', 'width', 'height']),
  ins: new Set(['cite', 'datetime']),
  li: new Set(['value']),
  ol: new Set(['start', 'type', 'reversed']),
  q: new Set(['cite']),
  span: new Set(['data-mention-id', 'data-mention-label']),
  table: new Set(['border', 'cellpadding', 'cellspacing']),
  td: new Set(['colspan', 'rowspan', 'headers']),
  th: new Set(['colspan', 'rowspan', 'headers', 'scope', 'abbr'])
};

const URL_ATTRIBUTES = new Set([
  'href',
  'src',
  'cite',
  'action',
  'formaction',
  'poster',
  'background',
  'xlink:href'
]);

const DANGEROUS_STYLE_PATTERN =
  /expression\s*\(|(?:javascript|vbscript)\s*:|behavior\s*:|-moz-binding|url\s*\(\s*['"]?\s*(?:javascript|vbscript|data)\s*:/i;

const DANGEROUS_SCHEME_PATTERN = /^(?:javascript|vbscript|data):/i;

function removeDangerousSchemeSpacing(value: string): string {
  let result = '';

  for (const character of value) {
    const code = character.charCodeAt(0);

    if (code > 0x20 && code !== 0x7f) {
      result += character;
    }
  }

  return result.toLowerCase();
}

function hasDangerousUrlScheme(value: string): boolean {
  return DANGEROUS_SCHEME_PATTERN.test(removeDangerousSchemeSpacing(value));
}

function isAllowedAttribute(tagName: string, attributeName: string): boolean {
  if (attributeName.startsWith('on')) {
    return false;
  }

  if (GLOBAL_ATTRIBUTES.has(attributeName)) {
    return true;
  }

  return TAG_ATTRIBUTES[tagName]?.has(attributeName) ?? false;
}

function unwrapElement(element: Element): void {
  const parent = element.parentNode;

  if (!parent) {
    return;
  }

  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }

  parent.removeChild(element);
}

function isExternalUrl(value: string): boolean {
  return /^(?:https?:)?\/\//i.test(value.trim());
}

function sanitizeElement(element: Element): void {
  const tagName = element.tagName.toLowerCase();

  if (REMOVED_TAGS.has(tagName)) {
    element.remove();
    return;
  }

  if (!ALLOWED_TAGS.has(tagName)) {
    unwrapElement(element);
    return;
  }

  Array.from(element.attributes).forEach((attribute) => {
    const attributeName = attribute.name.toLowerCase();

    if (attributeName.startsWith('on')) {
      element.removeAttribute(attribute.name);
      return;
    }

    if (attributeName === 'style') {
      if (DANGEROUS_STYLE_PATTERN.test(attribute.value)) {
        element.removeAttribute(attribute.name);
      }
      return;
    }

    if (!isAllowedAttribute(tagName, attributeName)) {
      element.removeAttribute(attribute.name);
      return;
    }

    if (URL_ATTRIBUTES.has(attributeName) && hasDangerousUrlScheme(attribute.value)) {
      element.removeAttribute(attribute.name);
    }
  });

  if (tagName === 'a') {
    const href = element.getAttribute('href');

    if (!href) {
      element.removeAttribute('target');
      element.removeAttribute('rel');
    } else if (isExternalUrl(href) || element.getAttribute('target') === '_blank') {
      element.setAttribute('rel', 'noopener noreferrer');
    }
  }

  if (tagName === 'img' && !element.hasAttribute('alt')) {
    element.setAttribute('alt', '');
  }
}

function sanitizeHtmlWithoutDom(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(
      /<\s*(script|style|iframe|object|embed|template|noscript)\b[\s\S]*?<\s*\/\s*\1\s*>/gi,
      ''
    )
    .replace(/<\s*(script|style|iframe|object|embed|template|noscript)\b[^>]*\/?\s*>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s+(?:href|src)\s*=\s*(["'])\s*(?:javascript|vbscript|data)\s*:[^"']*\1/gi, '')
    .replace(
      /\s+style\s*=\s*(["'])(?:(?!\1).)*(?:expression|javascript:|vbscript:|data:)(?:(?!\1).)*\1/gi,
      ''
    );
}

/**
 * Removes executable/dangerous markup while preserving basic rich text
 * formatting (bold, italic, links, lists, tables, images with safe sources).
 */
export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string' || html.length === 0) {
    return '';
  }

  if (typeof document === 'undefined') {
    return sanitizeHtmlWithoutDom(html);
  }

  const parsingDocument = document.implementation.createHTMLDocument('nebular-sanitizer');
  const container = parsingDocument.createElement('div');
  container.innerHTML = html;

  Array.from(container.querySelectorAll(REMOVED_SELECTOR)).forEach((element) => {
    element.remove();
  });

  // Process children before parents so unwrapping keeps sanitized content.
  const elements = Array.from(container.querySelectorAll('*')).reverse();
  elements.forEach((element) => sanitizeElement(element));

  return container.innerHTML;
}
