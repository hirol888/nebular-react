import { ComponentOrCustomStatus } from '@nebular-react/styles';

export type TagAppearance = 'filled' | 'outline';

export interface TagType {
  tag: string;
  removable?: boolean;
  status?: ComponentOrCustomStatus;
  appearance?: TagAppearance;
}
