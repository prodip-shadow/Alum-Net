'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { FaArrowLeft, FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { updateProfile, sendForgotPasswordCode, resetPasswordWithCode } from '@/actions/server/profile';

const ProfileForm = () => {
  const { data: session, update: updateSession } = useSession();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showResetNewPassword, setShowResetNewPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  
  const [message, setMessage] = useState({ type: '', text: '' });
  const [modalMessage, setModalMessage] = useState({ type: '', text: '' });
  const [resetToken, setResetToken] = useState('');
  
  const resetModalRef = useRef(null);
  const isGoogleUser = session?.user?.provider === 'google';

  const { register, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: {
      name: '',
      email: '',
      image: '',
      currentPassword: '',
      newPassword: ''
    }
  });

  // For modal reset password form
  const { register: registerReset, handleSubmit: handleResetSubmit, reset: resetResetForm } = useForm({
    defaultValues: {
      code: '',
      newPassword: ''
    }
  });

  const watchedImage = watch('image');

  // Prepopulate form when session details are available
  useEffect(() => {
    if (session?.user) {
      reset({
        name: session.user.name || '',
        email: session.user.email || '',
        image: session.user.image || '',
        currentPassword: '',
        newPassword: ''
      });
    }
  }, [session, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    const payload = {
      name: data.name,
      image: data.image,
    };
    if (!isGoogleUser) {
      payload.email = data.email;
      payload.currentPassword = data.currentPassword;
      payload.newPassword = data.newPassword;
    }
    
    try {
      const result = await updateProfile(payload);
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        // Update client-side NextAuth session
        await updateSession({
          name: payload.name,
          email: !isGoogleUser ? payload.email : (session?.user?.email || ''),
          image: payload.image
        });
        
        // Reset password fields
        setValue('currentPassword', '');
        setValue('newPassword', '');
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const result = await sendForgotPasswordCode();
      if (result.success) {
        setResetToken(result.resetToken);
        setMessage({ type: 'success', text: result.message });
        resetResetForm();
        setModalMessage({ type: '', text: '' });
        resetModalRef.current?.showModal();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to send verification code' });
    } finally {
      setForgotLoading(false);
    }
  };

  const onResetSubmit = async (data) => {
    setResetLoading(true);
    setModalMessage({ type: '', text: '' });
    
    try {
      const result = await resetPasswordWithCode({
        code: data.code,
        newPassword: data.newPassword,
        resetToken
      });
      if (result.success) {
        setModalMessage({ type: 'success', text: result.message });
        setTimeout(() => {
          resetModalRef.current?.close();
          setMessage({ type: 'success', text: 'Password reset successfully' });
        }, 1500);
      } else {
        setModalMessage({ type: 'error', text: result.message });
      }
    } catch (err) {
      setModalMessage({ type: 'error', text: err.message || 'Failed to reset password' });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="hero">
      <div className="hero-content flex-col lg:flex-row-reverse gap-12 w-full max-w-5xl">
        {/* Left column: Info and Live Preview */}
        <div className="text-center lg:text-left lg:w-1/2 flex flex-col items-center lg:items-start">
          <h1 className="text-4xl lg:text-5xl font-black text-base-content tracking-tight">
            Update Profile
          </h1>
          <p className="py-6 text-base-content/75 max-w-md">
            Keep your credentials and profile details secure. Fill out the form to edit your name, email address, profile picture URL, or update your security credentials.
          </p>

          {/* Profile Picture Live Preview Card */}
          <div className="card bg-base-100 shadow-xl border border-base-300 w-full max-w-sm mt-4 p-6 flex flex-col items-center">
            
            <div className="avatar mb-4">
              <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden bg-base-300 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={watchedImage || 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp'}
                  alt="Avatar Preview"
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.target.src = 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp';
                  }}
                />
              </div>
            </div>
            <div className="text-center">
              <p className="font-bold text-lg text-base-content truncate max-w-[280px]">
                {watch('name') || 'Your Name'}
              </p>
              <p className="text-sm opacity-60 truncate max-w-[280px]">
                {watch('email') || 'your.email@example.com'}
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Edit Form Card */}
        <div className="card bg-base-100 w-full max-w-md shrink-0 shadow-2xl border border-base-300 lg:w-1/2">
          <div className="card-body p-6 sm:p-8">
            <div className="mb-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-xs font-semibold opacity-60 hover:opacity-100 transition-opacity text-base-content group"
              >
                <FaArrowLeft className="transition-transform group-hover:-translate-x-1" />
                Back to dashboard
              </Link>
            </div>

            {message.text && (
              <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} text-sm mb-6 rounded-lg`}>
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <fieldset className="fieldset gap-4">
                {/* Name */}
                <div className="form-control w-full">
                  <label className="label py-1 px-0">
                    <span className="text-xs font-bold tracking-wide opacity-70 uppercase">Full Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter name"
                    className="input input-bordered w-full rounded-lg bg-base-100 focus:input-primary transition-all text-sm"
                    {...register('name', { required: 'Name is required' })}
                  />
                </div>

                {/* Email (only for credentials provider) */}
                {!isGoogleUser && (
                  <div className="form-control w-full">
                    <label className="label py-1 px-0">
                      <span className="text-xs font-bold tracking-wide opacity-70 uppercase">Email Address</span>
                    </label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      className="input input-bordered w-full rounded-lg bg-base-100 focus:input-primary transition-all text-sm"
                      {...register('email', { required: 'Email is required' })}
                    />
                  </div>
                )}

                {/* Profile Picture URL */}
                <div className="form-control w-full">
                  <label className="label py-1 px-0">
                    <span className="text-xs font-bold tracking-wide opacity-70 uppercase">Profile Picture URL</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    className="input input-bordered w-full rounded-lg bg-base-100 focus:input-primary transition-all text-sm"
                    {...register('image')}
                  />
                </div>

                {!isGoogleUser && (
                  <>
                    <div className="divider my-2 opacity-50">Security</div>

                    {/* Current Password */}
                    <div className="form-control w-full">
                      <label className="label py-1 px-0">
                        <span className="text-xs font-bold tracking-wide opacity-70 uppercase">Current Password</span>
                      </label>
                      <div className="relative w-full">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="input input-bordered w-full rounded-lg bg-base-100 focus:input-primary transition-all text-sm pr-10"
                          {...register('currentPassword')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 opacity-60 hover:opacity-100"
                        >
                          {showCurrentPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="form-control w-full">
                      <div className="flex items-center justify-between py-1">
                        <label className="label p-0">
                          <span className="text-xs font-bold tracking-wide opacity-70 uppercase">New Password</span>
                        </label>
                        <button
                          onClick={handleForgotPassword}
                          disabled={forgotLoading}
                          className="text-xs font-bold link link-hover text-primary disabled:opacity-50"
                          type="button"
                        >
                          {forgotLoading ? 'Sending code...' : 'Forgot password?'}
                        </button>
                      </div>
                      <div className="relative w-full">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="input input-bordered w-full rounded-lg bg-base-100 focus:input-primary transition-all text-sm pr-10"
                          {...register('newPassword')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 opacity-60 hover:opacity-100"
                        >
                          {showNewPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Save Changes Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-neutral w-full rounded-lg text-sm font-semibold transition-colors mt-4"
                >
                  {loading && <span className="loading loading-spinner loading-xs"></span>}
                  Save Changes
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>

      {/* Forgot Password Verification Modal */}
      <dialog ref={resetModalRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-base-100 border border-base-300 rounded-2xl p-6 sm:p-8">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4">✕</button>
          </form>
          
          <h3 className="font-extrabold text-xl text-base-content mb-2">Reset Password</h3>
          <p className="text-xs opacity-75 mb-6">
            We sent a 6-digit verification code to the email address connected to your account. Enter it below along with your new password to verify and reset.
          </p>

          {modalMessage.text && (
            <div className={`alert ${modalMessage.type === 'success' ? 'alert-success' : 'alert-error'} text-sm mb-4 rounded-lg`}>
              <span>{modalMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleResetSubmit(onResetSubmit)} className="space-y-4">
            {/* 6-Digit Code */}
            <div className="form-control w-full">
              <label className="label py-1 px-0">
                <span className="text-xs font-bold tracking-wide opacity-70 uppercase">6-Digit Verification Code</span>
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                className="input input-bordered w-full rounded-lg bg-base-100 focus:input-primary transition-all text-center tracking-widest text-lg font-bold"
                {...registerReset('code', { required: 'Verification code is required' })}
              />
            </div>

            {/* New Password */}
            <div className="form-control w-full">
              <label className="label py-1 px-0">
                <span className="text-xs font-bold tracking-wide opacity-70 uppercase">New Password</span>
              </label>
              <div className="relative w-full">
                <input
                  type={showResetNewPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input input-bordered w-full rounded-lg bg-base-100 focus:input-primary transition-all text-sm pr-10"
                  {...registerReset('newPassword', { required: 'New password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowResetNewPassword(!showResetNewPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 opacity-60 hover:opacity-100"
                >
                  {showResetNewPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={resetLoading}
              className="btn btn-primary w-full rounded-lg text-sm font-semibold transition-colors mt-6"
            >
              {resetLoading && <span className="loading loading-spinner loading-xs"></span>}
              Confirm & Reset Password
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default ProfileForm;
