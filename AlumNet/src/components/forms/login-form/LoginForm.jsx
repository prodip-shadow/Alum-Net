'use client';
import React, { useState } from 'react';
import Link from 'next/link'; // Next.js এর Link ইমপোর্ট করা হলো
import { FaGoogle, FaRegEye, FaRegEyeSlash, FaArrowLeft } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const togglePassword = () => {
    setShowPassword((show) => !show);
  };

  const { register, handleSubmit } = useForm();
  const onSubmit = async (data) => {
    setError('');
    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password');
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-8 shadow-xl relative">
      {/* Back to Home Button */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium opacity-60 hover:opacity-100 transition-opacity text-base-content group"
        >
          <FaArrowLeft className="transition-transform group-hover:-translate-x-1" />
          Back to home
        </Link>
      </div>

      {/* Header Section */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-base-content">
          Welcome back
        </h1>
        <p className="mt-2 text-sm opacity-70">
          Enter your credentials to access your account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Input */}
        <div className="form-control w-full">
          <label className="label py-1.5 px-0">
            <span className="text-xs font-medium tracking-wide opacity-80 uppercase">
              Email Address
            </span>
          </label>
          <input
            type="email"
            placeholder="name@example.com"
            {...register('email')}
            className="input input-bordered w-full rounded-lg bg-base-100 text-sm focus:input-primary transition-all duration-200"
            required
          />
        </div>

        {/* Password Input */}
        <div className="form-control w-full">
          <div className="flex items-center justify-between py-1.5">
            <label className="label p-0">
              <span className="text-xs font-medium tracking-wide opacity-80 uppercase">
                Password
              </span>
            </label>
            <a
              href="#"
              className="text-xs font-medium opacity-60 hover:opacity-100 hover:underline transition-all"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative w-full">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              className="input input-bordered w-full rounded-lg bg-base-100 text-sm focus:input-primary transition-all duration-200 pr-12"
              required
            />
            <button
              type="button"
              onClick={togglePassword}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-base-content opacity-60 hover:opacity-100 transition-opacity"
            >
              {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-xs font-semibold text-center bg-red-100 dark:bg-red-950/30 p-2.5 rounded-lg">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-neutral w-full rounded-lg text-sm font-medium transition-colors duration-200 mt-2"
        >
          Sign In
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-base-300"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-base-100 px-2 opacity-50">Or continue with</span>
        </div>
      </div>

      {/* Social Login (Google) */}
      <button
        type="button"
        onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
        className="btn btn-outline w-full rounded-lg text-sm font-medium gap-2 normal-case border-base-300 hover:bg-base-200 hover:text-base-content bg-transparent"
      >
        <FaGoogle className="text-[18px]" />
        Google
      </button>

      {/* Footer Text */}
      <p className="mt-6 text-center text-xs opacity-70">
        Don&lsquo;t have an account?{' '}
        <Link
          href="/sign-up"
          className="font-medium link link-hover text-base-content"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
