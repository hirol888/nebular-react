import {
  NbCard,
  NbCardBody,
  NbTagList,
  NbTag,
  NbTagInput,
  NbFormField,
  NbIcon,
  NbFormFieldAddon,
  NbAutocomplete,
  NbOption
} from '@nebular-react';
import { uniqueId } from 'lodash';
import { useRef, useState } from 'react';
import { trees } from './trees-list';

export function TagInputWithAutocomplete() {
  const tagListRef = useRef<HTMLDivElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const [options, setOptions] = useState<string[]>(trees);

  const onChange = (value: string) => {
    const newOptions = trees.filter((o) => o.toLowerCase().includes(value.toLowerCase()));
    setOptions(newOptions);
  };

  const [treeTags, setTreeTags] = useState<string[]>([]);
  const onTagRemove = (tagIndex: number) => {
    const _treeTags = [...treeTags];
    _treeTags.splice(tagIndex, 1);
    setTreeTags(_treeTags);
  };

  const onTagAdd = (tagText: string) => {
    const _treeTags = [...treeTags, tagText];
    setTreeTags(_treeTags);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    tagInputRef.current!.value = '';
    setOptions(trees);
  };

  return (
    <NbCard>
      <NbCardBody>
        <NbFormField>
          <NbTagList ref={tagListRef} onTagRemove={(tagIndex) => onTagRemove(tagIndex)}>
            {treeTags.map((tree) => {
              return <NbTag key={uniqueId('tag-')} text={tree} removable></NbTag>;
            })}
            <NbTagInput ref={tagInputRef} onInputChange={(e) => onChange(e)} fullWidth />
          </NbTagList>
          <NbFormFieldAddon type="suffix">
            <NbIcon icon="search" pack="eva"></NbIcon>
          </NbFormFieldAddon>
        </NbFormField>
        <NbAutocomplete
          customHostRef={tagListRef}
          customInputRef={tagInputRef}
          hideOnSelect={false}
          onChange={(event) => onTagAdd(event as string)}
        >
          {options.map((tree) => {
            return <NbOption key={uniqueId('nb-option-')} title={tree} value={tree}></NbOption>;
          })}
        </NbAutocomplete>
      </NbCardBody>
    </NbCard>
  );
}
