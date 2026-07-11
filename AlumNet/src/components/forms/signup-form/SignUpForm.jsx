'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { FaGoogle, FaRegEye, FaRegEyeSlash, FaArrowLeft } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { postUser } from '@/actions/server/auth';
import { signIn } from 'next-auth/react';

const SignUpForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => {
    setShowPassword((show) => !show);
  };

  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    const result = await postUser(data);
    alert(result.message);
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
          Create an account
        </h1>
        <p className="mt-2 text-sm opacity-70">
          Enter your details below to create your account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* First Name & Last Name (Same Row) */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Name */}
          <div className="form-control w-full">
            <label className="label py-1.5 px-0">
              <span className="text-xs font-medium tracking-wide opacity-80 uppercase">
                 Name
              </span>
            </label>
            <input
              type="text"
              placeholder="Doe"
              {...register('name')}
              className="input input-bordered w-full rounded-lg bg-base-100 text-sm focus:input-primary transition-all duration-200"
              required
            />
          </div>
        </div>

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

        {/* Image Link Input */}
        <div className="form-control w-full">
          <label className="label py-1.5 px-0">
            <span className="text-xs font-medium tracking-wide opacity-80 uppercase">
              Image URL
            </span>
          </label>
          <input
            type="url"
            placeholder="https://example.com/avatar.jpg"
            {...register('image')}
            className="input input-bordered w-full rounded-lg bg-base-100 text-sm focus:input-primary transition-all duration-200"
          />
        </div>

        {/* Password Input */}
        <div className="form-control w-full">
          <label className="label py-1.5 px-0">
            <span className="text-xs font-medium tracking-wide opacity-80 uppercase">
              Password
            </span>
          </label>
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

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-neutral w-full rounded-lg text-sm font-medium transition-colors duration-200 mt-2"
        >
          Sign Up
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
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium link link-hover text-base-content"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default SignUpForm;
