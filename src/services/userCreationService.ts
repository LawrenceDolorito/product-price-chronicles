
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { REFERENCE_USERS } from "@/constants/admin";

export async function createViewOnlyUser() {
  try {
    const randomId = Math.random().toString(36).substring(2, 10);
    const email = `viewer-${randomId}@example.com`;
    const password = `Viewer${randomId}!`;
    
    // Create user in auth system
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: "Viewer",
        last_name: "User"
      }
    });
    
    if (authError) throw authError;
    
    const userId = authData.user.id;
    
    // Set user role to viewer
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ 
        role: "viewer", 
        role_key: "viewer",
        first_name: "Viewer",
        last_name: "User"
      })
      .eq("id", userId);
      
    if (profileError) throw profileError;
    
    // Set default permissions (no permissions for viewer)
    const tables = ['product', 'pricehist'];
    
    for (const table of tables) {
      const { error: permError } = await supabase
        .from("user_permissions")
        .insert({
          user_id: userId,
          table_name: table,
          can_add: false,
          can_edit: false,
          can_delete: false
        });
        
      if (permError) throw permError;
    }
    
    toast.success("View-only user created successfully");
    return { success: true, viewerEmail: email, viewerPassword: password };
  } catch (error) {
    console.error("Error creating view-only user:", error);
    toast.error("Failed to create view-only user");
    return { success: false, error };
  }
}

export async function seedReferenceUsers() {
  try {
    let createdCount = 0;
    
    for (const user of REFERENCE_USERS) {
      // Skip creation of admin user since it should already exist
      if (user.email === "doloritolawrence@gmail.com") continue;
      
      const randomId = Math.random().toString(36).substring(2, 8);
      const password = `User${randomId}!`;
      
      // Create user in auth system
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: user.first_name,
          last_name: user.last_name
        }
      });
      
      if (authError) {
        console.error(`Error creating user ${user.email}:`, authError);
        continue; // Skip to next user if this one fails
      }
      
      const userId = authData.user.id;
      
      // Set user role
      await supabase
        .from("profiles")
        .update({ 
          role: "user", 
          role_key: "user",
          first_name: user.first_name,
          last_name: user.last_name
        })
        .eq("id", userId);
      
      // Set default permissions
      const tables = ['product', 'pricehist'];
      
      for (const table of tables) {
        await supabase
          .from("user_permissions")
          .insert({
            user_id: userId,
            table_name: table,
            can_add: table === 'product', // Can add only products
            can_edit: table === 'product', // Can edit only products
            can_delete: false // No deletion permissions
          });
      }
      
      createdCount++;
    }
    
    if (createdCount > 0) {
      toast.success(`Successfully created ${createdCount} reference users`);
    } else {
      toast.info("No new reference users were created");
    }
    
    return { success: true, count: createdCount };
  } catch (error) {
    console.error("Error seeding reference users:", error);
    toast.error("Failed to seed reference users");
    return { success: false, error };
  }
}
