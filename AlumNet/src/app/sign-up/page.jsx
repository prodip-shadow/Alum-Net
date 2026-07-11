import SignUpForm from '@/components/forms/signup-form/SignUpForm';
import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/authOptions';

const SignUpPage = async () => {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center  px-4 antialiased">
      <div className="w-full max-w-md">
        <SignUpForm/>
      </div>
    </div>
  );
};

export default SignUpPage;