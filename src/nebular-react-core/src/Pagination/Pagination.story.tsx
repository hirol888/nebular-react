import React, { useState } from 'react';
import { Pagination } from './Pagination';

export default { title: 'Pagination', component: Pagination };

export function Showcase() {
  const [page, setPage] = useState(1);

  return <Pagination total={20} page={page} onChange={setPage} />;
}

export function Uncontrolled() {
  return <Pagination total={8} defaultPage={3} />;
}

export function Compact() {
  return <Pagination total={5} siblings={0} boundaries={0} />;
}
