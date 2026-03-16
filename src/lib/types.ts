export type BriefStatus = 'requested' | 'reviewing' | 'revising' | 'completed';
export type RevisionStatus = 'pending' | 'confirmed';

export interface FieldType {
  id: number;
  name: string;
  placeholder: string | null;
  sort_order: number;
  created_at: string;
}

export interface Brief {
  id: number;
  project_name: string;
  reference: string | null;
  concept: string | null;
  draft_deadline: string;
  status: BriefStatus;
  created_at: string;
  fields?: BriefField[];
  revision_count?: number;
}

export interface SelectedBriefField {
  field_type_id: number;
  field_name: string;
  content: string;
}

export interface BriefField {
  id: number;
  brief_id: number;
  field_type_id: number;
  field_name: string;
  content: string | null;
  sort_order: number;
}

export interface Revision {
  id: number;
  brief_id: number;
  round: number;
  overall_note: string | null;
  status: RevisionStatus;
  created_at: string;
  items?: RevisionItem[];
}

export interface RevisionItem {
  id: number;
  revision_id: number;
  image_path: string | null;
  crop_data: string | null;
  description: string;
  sort_order: number;
}
