export type TermId = 'SERVICE' | 'PRIVACY' | 'LOCATION' | 'MARKETING';

export type TermBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'orderedList'; items: string[] }
  | { type: 'unorderedList'; items: string[] };

export type TermSection = {
  title: string;
  blocks: TermBlock[];
};

export type Term = {
  id: TermId;
  required: boolean;
  listLabel: string;
  title: string;
  lastUpdated: string;
  intro: string;
  sections: TermSection[];
};
