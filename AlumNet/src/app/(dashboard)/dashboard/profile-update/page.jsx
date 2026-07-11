import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/authOptions';
import ProfileForm from '@/components/forms/profile-form/ProfileForm';

const Profile_Update = async () => {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="w-full">
      <ProfileForm />
    </div>
  );
};

export default Profile_Update;