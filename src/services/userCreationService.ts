import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function createViewOnlyUser() {
  try {
    // Generate a unique username for the view-only user
    const timestamp = new Date().getTime();
    const viewerEmail = `viewer${timestamp}@example.com`;
    const viewerPassword = `Viewer${timestamp}!`;
    
    // 1. First create a user profile
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .insert({
        id: crypto.randomUUID(),
        first_name: "View-Only",
        last_name: "User",
        email: viewerEmail,
        role: "viewer",
        role_key: "viewer",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
      
    if (userError) throw userError;
    
    const newUserId = userData[0].id;
    
    // 2. Create no-permissions for product table
    await supabase
      .from('user_permissions')
      .insert({
        user_id: newUserId,
        table_name: "product",
        can_add: false,
        can_edit: false,
        can_delete: false
      });
    
    // 3. Create no-permissions for pricehist table
    await supabase
      .from('user_permissions')
      .insert({
        user_id: newUserId,
        table_name: "pricehist",
        can_add: false,
        can_edit: false,
        can_delete: false
      });
    
    toast.success(`View-only user created successfully!`, {
      description: `Email: ${viewerEmail} | Password: ${viewerPassword}`,
      duration: 10000
    });
    
    return { viewerEmail, viewerPassword, success: true };
  } catch (error) {
    console.error("Error creating view-only user:", error);
    toast.error("Failed to create view-only user");
    return { success: false, error };
  }
}

export async function seedReferenceUsers() {
  try {
    // Check if we already have some test users
    const { data: existingUsers, error: checkError } = await supabase
      .from('profiles')
      .select('email')
      .in('email', ['testuser1@example.com', 'testuser2@example.com', 'testuser3@example.com']);
      
    if (checkError) throw checkError;
    
    // If we already have these test users, don't add them again
    if (existingUsers && existingUsers.length >= 3) {
      console.log('Reference users already exist');
      return { success: true, message: 'Reference users already exist' };
    }
    
    // Otherwise, create our sample users
    const sampleUsers = [
      {
        id: crypto.randomUUID(),
        first_name: "John",
        last_name: "Doe",
        email: "testuser1@example.com",
        role: "user",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        first_name: "Jane",
        last_name: "Smith",
        email: "testuser2@example.com",
        role: "user",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        first_name: "Alex",
        last_name: "Johnson",
        email: "testuser3@example.com",
        role: "user",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    
    // Insert the sample users
    const { error: insertError } = await supabase
      .from('profiles')
      .insert(sampleUsers);
      
    if (insertError) throw insertError;
    
    toast.success("Reference users added successfully");
    return { success: true };
  } catch (error) {
    console.error("Error adding reference users:", error);
    toast.error("Failed to add reference users");
    return { success: false, error };
  }
}
