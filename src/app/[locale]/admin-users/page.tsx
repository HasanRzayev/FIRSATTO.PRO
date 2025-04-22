"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client'; 
import { useRouter } from 'next/navigation';

 
const supabase = createClient(); 
type UserProfile = {
  id: string;
  full_name: string;
  is_expert: boolean;
};

export default function AdminUsers() {
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]); 
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
 
    const fetchUsers = async () => {
      setIsLoading(true);

      const { data, error } = await supabase.from('user_profiles').select('*');

      if (error) {
        alert('Error fetching user profiles.');
      } else {
        setUserProfiles(data); 
      }

      setIsLoading(false);
    };

    fetchUsers();
  }, []);

 
  const deleteUser = async (id: string) => {
    const { error } = await supabase.from('user_profiles').delete().eq('id', id);
    if (error) {
      alert('Error deleting user profile.');
    } else {
      setUserProfiles(userProfiles.filter((profile) => profile.id !== id));
    }
  };

 
  const updateUser = async (id: string, isExpert: boolean) => {
    const { error } = await supabase
      .from('user_profiles')
      .update({ is_expert: !isExpert }) 
      .eq('id', id);

    if (error) {
      alert('Error updating user profile.');
    } else {
      setUserProfiles(
        userProfiles.map((profile) =>
          profile.id === id ? { ...profile, is_expert: !isExpert } : profile
        )
      );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Admin Users</h1>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="p-4 text-left">Full Name</th>
              <th className="p-4 text-left">Expert</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {userProfiles.map((profile) => (
              <tr key={profile.id}>
                <td className="p-4">{profile.full_name}</td>
                <td className="p-4">{profile.is_expert ? 'Yes' : 'No'}</td>
                <td className="p-4">
                  <button
                    onClick={() => updateUser(profile.id, profile.is_expert)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-md mr-2"
                  >
                    {profile.is_expert ? 'Remove Expert' : 'Set as Expert'}
                  </button>
                  <button
                    onClick={() => deleteUser(profile.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-md"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
