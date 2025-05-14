
// Types for user permissions functionality
export type UserPermissionRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  edit_product: boolean;
  delete_product: boolean;
  add_product: boolean;
  edit_pricehist: boolean;
  delete_pricehist: boolean;
  add_pricehist: boolean;
};

// Simplified type for Supabase realtime payload to avoid excessive type instantiation
export type SupabaseRealtimePayload = {
  commit_timestamp: string;
  eventType: string;
  schema: string;
  table: string;
  new: Record<string, any>;
  old: Record<string, any>;
};
