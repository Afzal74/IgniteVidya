// Alternative simple fix - add this retry logic to your student signup

const createStudentProfileWithRetry = async (supabase, profileData, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { error } = await supabase
        .from("student_profiles")
        .insert(profileData);
      
      if (!error) {
        return { success: true };
      }
      
      // If schema cache error, wait and retry
      if (error.message?.includes('schema cache') || error.message?.includes('first_name')) {
        if (attempt < maxRetries) {
          console.log(`Schema cache error, retrying... (${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
          continue;
        }
      }
      
      return { error };
    } catch (err) {
      if (attempt === maxRetries) {
        return { error: err };
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

// Usage in your signup code:
// const result = await createStudentProfileWithRetry(supabase, profileData);
// if (result.error) throw new Error(result.error.message);