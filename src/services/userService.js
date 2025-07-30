import { supabase } from '@/lib/supabase';
import { ATTENDANT_PROFILES } from '@/config/consultants';

const initializeDefaultUsers = async () => {
  try {
    const { data: existingUsers, error: fetchError } = await supabase
      .from('users')
      .select('username')
      .limit(1);

    if (fetchError) {
      console.error('Error fetching users for initialization:', fetchError);
      return;
    }

    if (existingUsers && existingUsers.length > 0) {
      return; 
    }

    const defaultUsers = Object.entries(ATTENDANT_PROFILES).map(([username, profile]) => ({
      username: username.toUpperCase(),
      password: profile.company === 'MN' ? 'multivendas' : 'vendas2025', 
      display_name: profile.display,
      company: profile.company
    }));

    const { error: insertError } = await supabase.from('users').insert(defaultUsers);
    if (insertError) {
      console.error('Error initializing default users:', insertError);
    }
  } catch (error) {
    console.error('Unexpected error during default user initialization:', error);
  }
};

initializeDefaultUsers();

export const getUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }
  return data;
};

export const addUser = async (user) => {
  const newUser = {
    ...user,
    username: user.username.toUpperCase() 
  };
  const { data, error } = await supabase
    .from('users')
    .insert([newUser])
    .select();
  if (error) {
    console.error('Error adding user:', error);
    throw error;
  }
  return data ? data[0] : null;
};

export const updateUser = async (userId, updatedData) => {
  const { data, error } = await supabase
    .from('users')
    .update(updatedData)
    .eq('id', userId)
    .select();
  if (error) {
    console.error('Error updating user:', error);
    throw error;
  }
  return data ? data[0] : null;
};

export const deleteUser = async (userId) => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);
  if (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const verifyCredentials = async (username, password) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username.toUpperCase())
    .single(); 
    
  if (error && error.code !== 'PGRST116') { 
    console.error('Error verifying credentials:', error);
    return null;
  }

  if (data && data.password === password) {
    return data;
  }
  return null;
};

export default {
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  verifyCredentials
};