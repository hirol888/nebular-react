import { debounce } from 'lodash';
import React, { useState } from 'react';
import { Card } from '../Card';
import { Tags } from './Tags';
import { TagType } from './types';

export default { title: 'Tags' };

const trees: string[] = [
  'Prometheus',
  'Methuselah',
  'Gran Abuelo',
  'Scofield Juniper',
  'Panke Baobab',
  'Jaya Sri Maha Bodhi'
];

export function Showcase() {
  const [treeTags, setTreeTags] = useState<string[]>(trees);

  const handleTagRemove = (tag: string) => {
    const toRemoveIndex = treeTags.indexOf(tag);
    const _treeTags = [...treeTags];
    _treeTags.splice(toRemoveIndex, 1);
    setTreeTags(_treeTags);
  };

  return (
    <Card>
      <Card.Body>
        <Tags tags={treeTags} onTagRemove={(tag) => handleTagRemove(tag)} />
      </Card.Body>
    </Card>
  );
}

export function WithInput() {
  const [treeTags, setTreeTags] = useState<string[]>(trees);

  const handleTagRemove = (tag: string) => {
    const toRemoveIndex = treeTags.indexOf(tag);
    const _treeTags = [...treeTags];
    _treeTags.splice(toRemoveIndex, 1);
    setTreeTags(_treeTags);
  };

  return (
    <Card>
      <Card.Body>
        <Tags
          withInput
          fullWidth
          tags={treeTags}
          onTagRemove={(tag) => handleTagRemove(tag)}
          onTagAdd={(tag) => setTreeTags([...treeTags, tag])}
        />
      </Card.Body>
    </Card>
  );
}

export function WithAutocomplete() {
  const [treeTags, setTreeTags] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>(trees);

  const handleTagRemove = (tag: string) => {
    const toRemoveIndex = treeTags.indexOf(tag);
    const _treeTags = [...treeTags];
    _treeTags.splice(toRemoveIndex, 1);
    setTreeTags(_treeTags);
  };

  const handleTagAdd = (tag: string) => {
    setTreeTags([...treeTags, tag]);
    setOptions(trees);
  };

  const handleInputChange = (event: string) => {
    const debouncedHandler = debounce(() => {
      const newOptions = trees.filter((option) =>
        option.toLocaleLowerCase().includes(event.toLocaleLowerCase())
      );
      setOptions(newOptions);
    }, 100);

    debouncedHandler();
  };

  return (
    <Card>
      <Card.Body>
        <Tags
          withInput
          withAutocomplete
          fullWidth
          tags={treeTags}
          onTagRemove={(tag) => handleTagRemove(tag)}
          onTagAdd={(tag) => handleTagAdd(tag)}
          onInputChange={(event) => handleInputChange(event)}
          autocompleteProps={{ data: options }}
        />
      </Card.Body>
    </Card>
  );
}

export function AppearanceAndStatus() {
  const trees2: TagType[] = [
    { tag: 'Prometheus', removable: true, appearance: 'filled', status: 'primary' },
    { tag: 'Methuselah', removable: true, appearance: 'filled', status: 'success' },
    { tag: 'Gran Abuelo', removable: true, appearance: 'outline', status: 'info' },
    { tag: 'Scofield Juniper', removable: true, appearance: 'filled', status: 'warning' },
    { tag: 'Panke Baobab', removable: true, appearance: 'filled', status: 'danger' },
    { tag: 'Jaya Sri Maha Bodhi', removable: true, appearance: 'outline', status: 'basic' }
  ];
  const [treeTags, setTreeTags] = useState<TagType[]>(trees2);

  const handleTagRemove = (tag: string) => {
    const toRemoveIndex = treeTags.map((t) => t.tag).indexOf(tag);
    const _treeTags = [...treeTags];
    _treeTags.splice(toRemoveIndex, 1);
    setTreeTags(_treeTags);
  };

  return (
    <Card>
      <Card.Body>
        <Tags tags={treeTags} onTagRemove={(tag) => handleTagRemove(tag)} />
      </Card.Body>
    </Card>
  );
}

export function Size() {
  const trees2: TagType[] = [
    { tag: 'Prometheus', removable: true, appearance: 'filled', status: 'primary' },
    { tag: 'Methuselah', removable: true, appearance: 'filled', status: 'success' },
    { tag: 'Gran Abuelo', removable: true, appearance: 'outline', status: 'info' },
    { tag: 'Scofield Juniper', removable: true, appearance: 'filled', status: 'warning' },
    { tag: 'Panke Baobab', removable: true, appearance: 'filled', status: 'danger' },
    { tag: 'Jaya Sri Maha Bodhi', removable: true, appearance: 'outline', status: 'basic' }
  ];
  const [treeTags1, setTreeTags1] = useState<TagType[]>(trees2);
  const [treeTags2, setTreeTags2] = useState<TagType[]>(trees2);
  const [treeTags3, setTreeTags3] = useState<TagType[]>(trees2);
  const [treeTags4, setTreeTags4] = useState<TagType[]>(trees2);
  const [treeTags5, setTreeTags5] = useState<TagType[]>(trees2);

  const handleTagRemove1 = (tag: string) => {
    const toRemoveIndex = treeTags1.map((t) => t.tag).indexOf(tag);
    const _treeTags = [...treeTags1];
    _treeTags.splice(toRemoveIndex, 1);
    setTreeTags1(_treeTags);
  };

  const handleTagRemove2 = (tag: string) => {
    const toRemoveIndex = treeTags2.map((t) => t.tag).indexOf(tag);
    const _treeTags = [...treeTags2];
    _treeTags.splice(toRemoveIndex, 1);
    setTreeTags2(_treeTags);
  };

  const handleTagRemove3 = (tag: string) => {
    const toRemoveIndex = treeTags3.map((t) => t.tag).indexOf(tag);
    const _treeTags = [...treeTags3];
    _treeTags.splice(toRemoveIndex, 1);
    setTreeTags3(_treeTags);
  };

  const handleTagRemove4 = (tag: string) => {
    const toRemoveIndex = treeTags4.map((t) => t.tag).indexOf(tag);
    const _treeTags = [...treeTags4];
    _treeTags.splice(toRemoveIndex, 1);
    setTreeTags4(_treeTags);
  };

  const handleTagRemove5 = (tag: string) => {
    const toRemoveIndex = treeTags5.map((t) => t.tag).indexOf(tag);
    const _treeTags = [...treeTags5];
    _treeTags.splice(toRemoveIndex, 1);
    setTreeTags5(_treeTags);
  };

  return (
    <>
      <Card>
        <Card.Body>
          <Tags size="tiny" tags={treeTags1} onTagRemove={(tag) => handleTagRemove1(tag)} />
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <Tags size="small" tags={treeTags2} onTagRemove={(tag) => handleTagRemove2(tag)} />
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <Tags size="medium" tags={treeTags3} onTagRemove={(tag) => handleTagRemove3(tag)} />
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <Tags size="large" tags={treeTags4} onTagRemove={(tag) => handleTagRemove4(tag)} />
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <Tags size="giant" tags={treeTags5} onTagRemove={(tag) => handleTagRemove5(tag)} />
        </Card.Body>
      </Card>
    </>
  );
}
