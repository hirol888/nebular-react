import React, { useState } from 'react';
import { CodeEditor } from './CodeEditor';
import type { CodeEditorLanguage } from './CodeEditor';

export default { title: 'CodeEditor', component: CodeEditor };

const typescript = `import { useState } from 'react';

// Simple counter used by the editor showcase
export function Counter() {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}`;

const samples: Record<CodeEditorLanguage, string> = {
  text: `Paste any snippet here.
Indentation, line numbers and selection shortcuts still work.`,
  json: `{
  "name": "Nebular",
  "components": 120,
  "stable": true,
  "tags": ["react", "ui"]
}`,
  javascript: `const answer = 42;
const greet = (name) => \`Hello \${name}\`;

// Logs the greeting
console.log(greet('Nebular'));`,
  typescript: `interface Props {
  value: string;
  onChange(value: string): void;
}

export function Field({ value, onChange }: Props) {
  return <input value={value} onChange={(event) => onChange(event.target.value)} />;
}`,
  html: `<!-- Card -->
<section class="card" data-id="42">
  <h1>Nebular</h1>
  <p>React UI components</p>
</section>`,
  css: `/* Card layout */
.card {
  display: flex;
  gap: 1rem;
  padding: 16px;
  color: "red";
  width: 10px;
}

@media screen and (min-width: 768px) {
  .card { padding: 24px; }
}`
};

const languages: CodeEditorLanguage[] = ['text', 'json', 'javascript', 'typescript', 'html', 'css'];

export function Showcase() {
  const [value, setValue] = useState(typescript);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <CodeEditor
        value={value}
        onChange={setValue}
        language="typescript"
        height={280}
        ariaLabel="TypeScript editor"
        placeholder="Write some TypeScript"
      />
      <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{`${value.length} characters`}</span>
    </div>
  );
}

export function Languages() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {languages.map((language) => (
        <div key={language} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{language}</span>
          <CodeEditor
            defaultValue={samples[language]}
            language={language}
            height={140}
            ariaLabel={`${language} editor`}
          />
        </div>
      ))}
    </div>
  );
}

export function ReadOnly() {
  return (
    <CodeEditor
      defaultValue={samples.json}
      language="json"
      readOnly
      height={200}
      ariaLabel="Read only JSON editor"
    />
  );
}
