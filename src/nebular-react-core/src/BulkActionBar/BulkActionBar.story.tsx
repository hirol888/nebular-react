import React, { useState } from 'react';
import { Card } from '../Card';
import { Checkbox } from '../Checkbox';
import { Table } from '../Table';
import { BulkActionBar, BulkActionBarSelection } from './BulkActionBar';

export default { title: 'BulkActionBar', component: BulkActionBar };

const companies = ['Solstice Studio', 'Oak Press', 'Windmill Bakery'];

export function PaginatedDirectory() {
  const [selected, setSelected] = useState<string[]>([]);
  const [scope, setScope] = useState<BulkActionBarSelection['scope']>('explicit');
  const [message, setMessage] = useState('');
  const allMatching = scope === 'allMatching';
  const matchingCount = 24;
  const count = allMatching ? matchingCount : selected.length;

  return (
    <>
      <BulkActionBar
        selection={{ count, scope }}
        page={{ count: companies.length, selectedCount: allMatching ? companies.length : count }}
        matchingCount={matchingCount}
        actions={[{ id: 'export', label: 'Export companies', status: 'primary' }]}
        onSelectPage={() => setSelected(companies)}
        onSelectAllMatching={() => setScope('allMatching')}
        onClearSelection={() => {
          setScope('explicit');
          setSelected([]);
        }}
        onAction={() => setMessage(`${count} companies selected for export.`)}
      />
      <Table aria-label="Companies on the current page">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Company</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {companies.map((company) => (
            <Table.Row key={company}>
              <Table.Cell>
                <Checkbox
                  checked={allMatching || selected.includes(company)}
                  disabled={allMatching}
                  onCheck={(checked) =>
                    setSelected((current) =>
                      checked ? [...current, company] : current.filter((item) => item !== company)
                    )
                  }
                >
                  {company}
                </Checkbox>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      {message && <p role="status">{message}</p>}
    </>
  );
}

export function FileGallery() {
  const files = ['Briefing.pdf', 'Rascunho.md', 'Referencias.zip'];
  const [selected, setSelected] = useState<string[]>([]);
  const [archived, setArchived] = useState<string[]>([]);

  return (
    <div style={{ maxWidth: 440 }}>
      <BulkActionBar
        selection={{ count: selected.length, scope: 'explicit' }}
        labels={{
          region: 'Ações em lote',
          selection: ({ count }) => `${count} ${count === 1 ? 'selecionado' : 'selecionados'}`,
          clearSelection: 'Limpar seleção'
        }}
        actions={[{ id: 'archive', label: 'Arquivar', status: 'primary' }]}
        onClearSelection={() => setSelected([])}
        onAction={() => {
          setArchived((current) => [...current, ...selected]);
          setSelected([]);
        }}
      />
      {files
        .filter((file) => !archived.includes(file))
        .map((file) => (
          <Card key={file}>
            <Card.Body>
              <Checkbox
                checked={selected.includes(file)}
                onCheck={(checked) =>
                  setSelected((current) =>
                    checked ? [...current, file] : current.filter((item) => item !== file)
                  )
                }
              >
                {file}
              </Checkbox>
            </Card.Body>
          </Card>
        ))}
      {archived.length > 0 && <p role="status">{`Arquivados: ${archived.join(', ')}`}</p>}
    </div>
  );
}
