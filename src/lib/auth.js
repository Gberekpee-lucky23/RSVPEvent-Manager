// lib/auth.js or services/auth.js
import { supabase } from "./supabase"  // adjust the path based on your project structure

// SIGNUP FUNCTION
export const registerUser = async (email, password, fullName) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return { success: false, error };
    }

    return { success: true, user: data.user };
  } catch (err) {
    return { success: false, error: err };
  }
};

// LOGIN FUNCTION
export const loginUser = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error };
    }

    return { success: true, user: data.user };
  } catch (err) {
    return { success: false, error: err };
  }
};
