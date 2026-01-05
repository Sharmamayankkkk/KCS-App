'use client';

import { useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Trash2, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DeleteAccountPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [step, setStep] = useState<'warning' | 'confirm' | 'processing' | 'success'>('warning');
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (confirmText.toLowerCase() !== 'delete my account') {
      setError('Please type "DELETE MY ACCOUNT" exactly as shown to confirm.');
      return;
    }

    setIsDeleting(true);
    setStep('processing');
    setError('');

    try {
      // Delete user account via Clerk
      if (user) {
        await user.delete();
      }

      // Sign out and redirect
      setStep('success');
      
      setTimeout(() => {
        signOut();
        router.push('/');
      }, 3000);
    } catch (err: any) {
      console.error('Error deleting account:', err);
      setError(err.message || 'Failed to delete account. Please contact support.');
      setIsDeleting(false);
      setStep('confirm');
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <AlertTriangle className="mx-auto size-12 text-amber-500" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Sign In Required</h2>
          <p className="mt-2 text-gray-600">
            You must be signed in to delete your account.
          </p>
          <Button
            onClick={() => router.push('/sign-in')}
            className="mt-6"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-red-200 bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-red-100">
            <Trash2 className="size-8 text-red-600" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Delete Account</h1>
          <p className="mt-2 text-gray-600">
            Permanently delete your KCS Meet account and all associated data
          </p>
        </div>

        {/* Warning Step */}
        {step === 'warning' && (
          <div className="mt-8 space-y-6">
            <div className="rounded-lg bg-red-50 p-6">
              <div className="flex">
                <AlertTriangle className="size-6 shrink-0 text-red-600" />
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-red-900">
                    Warning: This action cannot be undone
                  </h3>
                  <div className="mt-3 space-y-2 text-sm text-red-800">
                    <p className="font-semibold">When you delete your account, the following will happen:</p>
                    <ul className="ml-5 list-disc space-y-1">
                      <li>Your profile information (name, email, photo) will be permanently deleted</li>
                      <li>Your meeting history will be anonymized</li>
                      <li>Your chat messages will be deleted</li>
                      <li>Your poll responses will be deleted</li>
                      <li>You will lose access to all recordings</li>
                      <li>You will no longer be able to sign in to your account</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
              <div className="flex">
                <AlertTriangle className="size-6 shrink-0 text-amber-600" />
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-amber-900">
                    Data Retained for Legal Compliance
                  </h3>
                  <div className="mt-2 space-y-2 text-sm text-amber-800">
                    <p>The following data will be retained for legal and tax compliance:</p>
                    <ul className="ml-5 list-disc space-y-1">
                      <li>Payment transaction records (7 years as per Indian Income Tax Act)</li>
                      <li>Anonymized analytics data for service improvement</li>
                      <li>Backup copies (automatically deleted within 90 days)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
              <h3 className="font-semibold text-blue-900">
                Alternative: Partial Data Deletion
              </h3>
              <p className="mt-2 text-sm text-blue-800">
                If you only want to delete specific data (like chat messages or meeting history) 
                without deleting your entire account, you can use our{' '}
                <a 
                  href="/account/delete-data" 
                  className="font-semibold underline hover:text-blue-900"
                >
                  Partial Data Deletion
                </a>{' '}
                feature instead.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setStep('confirm')}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Continue to Delete
              </Button>
            </div>
          </div>
        )}

        {/* Confirmation Step */}
        {step === 'confirm' && (
          <div className="mt-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Final Confirmation Required
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                To confirm account deletion, please type{' '}
                <span className="font-mono font-bold text-red-600">DELETE MY ACCOUNT</span>{' '}
                in the box below:
              </p>
            </div>

            <div>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE MY ACCOUNT"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={isDeleting}
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-gray-700">
                <strong>Current Account:</strong> {user.emailAddresses[0]?.emailAddress}
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                onClick={() => {
                  setStep('warning');
                  setConfirmText('');
                  setError('');
                }}
                variant="outline"
                className="flex-1"
                disabled={isDeleting}
              >
                Back
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting || confirmText.toLowerCase() !== 'delete my account'}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 size-4" />
                    Delete My Account Permanently
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <div className="mt-8 text-center">
            <Loader2 className="mx-auto size-16 animate-spin text-red-600" />
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              Deleting Your Account...
            </h3>
            <p className="mt-2 text-gray-600">
              Please wait while we process your request. This may take a few moments.
            </p>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="mt-8 text-center">
            <CheckCircle className="mx-auto size-16 text-green-600" />
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              Account Deleted Successfully
            </h3>
            <p className="mt-2 text-gray-600">
              Your account has been permanently deleted. You will be signed out and redirected to the homepage.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Thank you for being part of the KCS Meet community. 🙏
            </p>
          </div>
        )}
      </div>

      {/* Support Contact */}
      {step !== 'success' && (
        <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
          <h3 className="font-semibold text-gray-900">Need Help?</h3>
          <p className="mt-2 text-sm text-gray-600">
            If you&apos;re experiencing issues or have questions about account deletion,
            please contact our support team:
          </p>
          <p className="mt-2 text-sm">
            <a 
              href="mailto:divineconnectionkcs@gmail.com"
              className="font-semibold text-[#B91C1C] hover:underline"
            >
              divineconnectionkcs@gmail.com
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
