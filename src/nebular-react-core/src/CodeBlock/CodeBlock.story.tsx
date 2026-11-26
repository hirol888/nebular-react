import React from 'react';
import { CodeBlock } from './CodeBlock';

export default { title: 'CodeBlock', component: CodeBlock };

const typescript = `import { useState } from 'react';

// Counts how many times the button was pressed
export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button type="button" onClick={() => setCount(count + 1)}>
      Pressed {count} times
    </button>
  );
}`;

const sql = `SELECT id, name, COUNT(*) AS total
FROM users
WHERE created_at >= '2024-01-01'
GROUP BY id, name
ORDER BY total DESC;`;

export function Showcase() {
  return <CodeBlock code={typescript} language="ts" title="Counter.tsx" />;
}

export function WithLineNumbers() {
  return (
    <CodeBlock
      code={sql}
      language="sql"
      title="report.sql"
      showLineNumbers
      maxHeight={220}
      ariaLabel="SQL report"
    />
  );
}

export function Plain() {
  return <CodeBlock code={'npm install\nnpm run build'} language="bash" highlight={false} />;
}
