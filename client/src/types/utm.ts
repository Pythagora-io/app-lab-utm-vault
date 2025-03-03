export interface UtmLink {
  id: string;
  destination: string;
  medium: string;
  source: string;
  campaign: string;
  term?: string;
  content?: string;
  createdAt: string;
  createdBy: string;
}

export interface UtmDropdownValue {
  id: string;
  value: string;
  type: 'medium' | 'source' | 'campaign';
}