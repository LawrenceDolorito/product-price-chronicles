
export type UserPermission = {
  id: string;
  user_id: string;
  table_name: string;
  can_add: boolean;
  can_edit: boolean;
  can_delete: boolean;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: string;
  email: string;
  role: string;
  role_key: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  permissions: UserPermission[];
};
