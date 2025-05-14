
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Simple payload type that avoids excessive nesting
type SimplePayload = {
  eventType: string;
  schema: string;
  table: string;
  [key: string]: any;
};

export async function createViewOnlyUser() {
  try {
    // Generate random password and viewer email
    const randomString = Math.random().toString(36).substring(2, 10);
    const viewerEmail = `viewer-${randomString}@example.com`;
    const viewerPassword = `View-${randomString}-${Math.floor(Math.random() * 1000)}`;
    
    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: viewerEmail,
      password: viewerPassword
    });
    
    if (authError) throw authError;
    
    if (authData.user) {
      // Update profile to set as viewer
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: 'viewer',
          role_key: 'viewer',
          first_name: 'Demo',
          last_name: 'Viewer'
        })
        .eq('id', authData.user.id);
        
      if (profileError) throw profileError;
      
      // Set permissions as view-only (all false)
      await setUpViewerPermissions(authData.user.id);
      
      toast.success("View-only user created successfully");
      return { 
        success: true, 
        viewerEmail, 
        viewerPassword 
      };
    }
    
    return { success: false };
  } catch (error) {
    console.error("Error creating view-only user:", error);
    toast.error("Failed to create view-only user");
    return { success: false };
  }
}

export async function seedReferenceUsers() {
  try {
    // Create a regular user
    const { data: regularUserData, error: regularUserError } = await supabase.auth.signUp({
      email: `user-${Math.random().toString(36).substring(2, 10)}@example.com`,
      password: `Password-${Math.random().toString(36).substring(2, 10)}`
    });
    
    if (regularUserError) throw regularUserError;
    
    // Create an editor user
    const { data: editorUserData, error: editorUserError } = await supabase.auth.signUp({
      email: `editor-${Math.random().toString(36).substring(2, 10)}@example.com`,
      password: `Password-${Math.random().toString(36).substring(2, 10)}`
    });
    
    if (editorUserError) throw editorUserError;
    
    // Update profiles and set permissions
    if (regularUserData.user) {
      await supabase
        .from('profiles')
        .update({
          role: 'user',
          role_key: 'user',
          first_name: 'Regular',
          last_name: 'User'
        })
        .eq('id', regularUserData.user.id);
      
      await supabase
        .from('user_permissions')
        .insert([
          { user_id: regularUserData.user.id, table_name: 'product', can_add: true, can_edit: false, can_delete: false },
          { user_id: regularUserData.user.id, table_name: 'pricehist', can_add: true, can_edit: false, can_delete: false }
        ]);
    }
    
    if (editorUserData.user) {
      await supabase
        .from('profiles')
        .update({
          role: 'user',
          role_key: 'user',
          first_name: 'Editor',
          last_name: 'User'
        })
        .eq('id', editorUserData.user.id);
      
      await supabase
        .from('user_permissions')
        .insert([
          { user_id: editorUserData.user.id, table_name: 'product', can_add: true, can_edit: true, can_delete: false },
          { user_id: editorUserData.user.id, table_name: 'pricehist', can_add: true, can_edit: true, can_delete: false }
        ]);
    }
    
    toast.success("Reference users created successfully");
    return { success: true };
  } catch (error) {
    console.error("Error creating reference users:", error);
    toast.error("Failed to create reference users");
    return { success: false };
  }
}

async function setUpViewerPermissions(userId: string) {
  await supabase
    .from('user_permissions')
    .insert([
      { user_id: userId, table_name: 'product', can_add: false, can_edit: false, can_delete: false },
      { user_id: userId, table_name: 'pricehist', can_add: false, can_edit: false, can_delete: false }
    ]);
}
