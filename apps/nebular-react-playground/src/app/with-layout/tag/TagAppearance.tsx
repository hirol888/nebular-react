import { NbCard, NbCardBody, NbTagList, NbTag } from '@nebular-react';
import { uniqueId } from 'lodash';
import { trees } from './trees-list';

export function TagAppearance() {
  return (
    <NbCard>
      <NbCardBody className="example-items-col">
        <NbTagList>
          {trees.map((tree) => {
            return <NbTag key={uniqueId('tag-')} text={tree} appearance="filled" status="primary"></NbTag>;
          })}
        </NbTagList>
        <NbTagList>
          {trees.map((tree) => {
            return <NbTag key={uniqueId('tag-')} text={tree} appearance="outline" status="success"></NbTag>;
          })}
        </NbTagList>
      </NbCardBody>
    </NbCard>
  );
}
