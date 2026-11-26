import React, { useState } from 'react';
import { UploadQueue, UploadQueueItem } from '../UploadQueue';
import { Wizard } from '../Wizard';
import {
  ImportPreview,
  ImportPreviewColumn,
  ImportPreviewField,
  ImportPreviewMapping,
  ImportPreviewRow
} from './ImportPreview';

export default { title: 'ImportPreview', component: ImportPreview };

const contactColumns: ImportPreviewColumn[] = [
  { id: 'contact', label: 'Contact' },
  { id: 'email_address', label: 'Email address' },
  { id: 'marketing', label: 'Subscribed' }
];
const contactFields: ImportPreviewField[] = [
  { id: 'name', label: 'Name', required: true },
  { id: 'email', label: 'Email', required: true },
  { id: 'subscribed', label: 'Subscribed' }
];
const contacts: ImportPreviewRow[] = [
  { id: 1, cells: { contact: 'Ana', email_address: 'ana@example.test', marketing: false } },
  { id: 2, cells: { contact: 'Marta', email_address: 'marta@example.test', marketing: true } }
];

export function Contacts() {
  const [mapping, setMapping] = useState<ImportPreviewMapping>({ name: 'contact' });
  const [message, setMessage] = useState('');

  return (
    <>
      <ImportPreview
        columns={contactColumns}
        fields={contactFields}
        rows={contacts}
        mapping={mapping}
        onMappingChange={setMapping}
        onConfirm={({ rows }) => setMessage(`${rows.length} contacts approved for import.`)}
        pageSize={1}
      />
      {message && <p role="status">{message}</p>}
    </>
  );
}

const inventoryColumns: ImportPreviewColumn[] = [
  { id: 'code', label: 'Product code' },
  { id: 'amount', label: 'Number in stock' }
];
const inventoryFields: ImportPreviewField[] = [
  { id: 'sku', label: 'SKU', required: true },
  { id: 'quantity', label: 'Quantity', required: true }
];
const sample = [
  { code: 'BOLT-M5', amount: 120 },
  { code: 'WASHER-M5', amount: 0 }
];
const sampleUrl = `data:application/json,${encodeURIComponent(JSON.stringify(sample, null, 2))}`;

async function readInventory(file: File): Promise<ImportPreviewRow[]> {
  const parsed: unknown = JSON.parse(await file.text());
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('Choose a nonempty JSON array of inventory records.');
  }

  return parsed.map((record: unknown, index) => {
    const errors: string[] = [];
    const code = record && typeof record === 'object' && 'code' in record ? record.code : null;
    const amount =
      record && typeof record === 'object' && 'amount' in record ? record.amount : null;
    if (typeof code !== 'string' || !code.trim()) errors.push('Product code is required.');
    if (typeof amount !== 'number' || !Number.isInteger(amount) || amount < 0) {
      errors.push('Stock must be a non-negative integer.');
    }
    return {
      id: index,
      cells: {
        code: typeof code === 'string' ? code : null,
        amount: typeof amount === 'number' ? amount : null
      },
      errors
    };
  });
}

export function InventoryWizard() {
  const [item, setItem] = useState<UploadQueueItem | null>(null);
  const [rows, setRows] = useState<ImportPreviewRow[]>([]);
  const [mapping, setMapping] = useState<ImportPreviewMapping>({});
  const [completed, setCompleted] = useState(false);
  const uploading = item?.status === 'uploading';

  const load = async ([file]: File[]) => {
    setCompleted(false);
    setRows([]);
    setMapping({});
    setItem({ id: file.name, name: file.name, status: 'uploading' });
    try {
      setRows(await readInventory(file));
      setItem({ id: file.name, name: file.name, status: 'success' });
    } catch (error) {
      setItem({
        id: file.name,
        name: file.name,
        status: 'error',
        error: error instanceof Error ? error.message : 'Could not read the file.'
      });
    }
  };

  return (
    <>
      <Wizard
        ariaLabel="Inventory import"
        finishLabel="Confirm import"
        onComplete={() => setCompleted(true)}
        steps={[
          {
            key: 'upload',
            title: 'Choose file',
            validate: () => rows.length > 0 && !uploading,
            content: (
              <>
                <p>
                  <a href={sampleUrl} download="inventory.json">
                    Download example inventory
                  </a>
                </p>
                <UploadQueue
                  items={item ? [item] : []}
                  accept=".json"
                  multiple={false}
                  disabled={uploading}
                  onAddFiles={load}
                />
              </>
            )
          },
          {
            key: 'review',
            title: 'Map and review',
            validate: () =>
              Boolean(mapping.sku && mapping.quantity && mapping.sku !== mapping.quantity) &&
              rows.every((row) => !row.errors?.length),
            content: (
              <ImportPreview
                columns={inventoryColumns}
                fields={inventoryFields}
                rows={rows}
                mapping={mapping}
                onMappingChange={setMapping}
              />
            )
          }
        ]}
      />
      {completed && <p role="status">{`${rows.length} inventory records approved for import.`}</p>}
    </>
  );
}
