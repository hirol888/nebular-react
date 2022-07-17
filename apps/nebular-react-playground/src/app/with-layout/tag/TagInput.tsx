import { NbCard, NbCardBody, NbTagList, NbTag, NbTagInput } from '@nebular-react';
import { uniqueId } from 'lodash';
import { useState } from 'react';
import { trees } from './trees-list';

export function TagInput() {
  const [treeTags, setTreeTags] = useState<string[]>(trees);
  const onTagRemove = (tagIndex: number) => {
    const _treeTags = [...treeTags];
    _treeTags.splice(tagIndex, 1);
    setTreeTags(_treeTags);
  };

  const onTagAdd = (tagText: string) => {
    const _treeTags = [...treeTags, tagText];
    setTreeTags(_treeTags);
  };

  return (
    <NbCard>
      <NbCardBody>
        <NbTagList onTagRemove={(tagIndex) => onTagRemove(tagIndex)}>
          {treeTags.map((tree) => {
            return <NbTag key={uniqueId('tag-')} text={tree} removable></NbTag>;
          })}
          <NbTagInput onTagAdd={(tagText) => onTagAdd(tagText)} fullWidth />
        </NbTagList>
      </NbCardBody>
    </NbCard>
  );
}
