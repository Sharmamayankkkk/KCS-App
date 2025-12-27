'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  Trash2,
  MessageSquare,
  BarChart3,
  Video,
  CheckCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type DataType = 'chat' | 'polls' | 'meetings' | 'recordings';

interface DataTypeInfo {
  id: DataType;
  icon: any;
  title: string;
  description: string;
  warning: string;
}

const dataTypes: DataTypeInfo[] = [
  {
    id: 'chat',
    icon: MessageSquare,
    title: 'Chat Messages',
    description: 'Delete all your chat messages from meetings',
    warning: 'Your chat messages will be permanently deleted from all meetings. This cannot be undone.',
  },
  {
    id: 'polls',
    icon: BarChart3,
    title: 'Poll Responses',
    description: 'Delete your voting history and poll responses',
    warning: 'Your poll votes and responses will be deleted. Poll creators will see anonymous votes instead.',
  },
  {
    id: 'meetings',
    icon: Video,
    title: 'Meeting History',
    description: 'Delete your meeting participation history',
    warning: 'Your meeting history will be deleted. You will no longer see past meetings in your dashboard.',
  },
  {
    id: 'recordings',
    icon: Video,
    title: 'Recordings Access',
    description: 'Remove your access to meeting recordings',
    warning: 'You will lose access to all meeting recordings. Recordings you created may still exist if shared with others.',
  },
];

export default function DeleteDataPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [selectedTypes, setSelectedTypes] = useState<Set<DataType>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletedTypes, setDeletedTypes] = useState<Set<DataType>>(new Set());
  const [error, setError] = useState('');

  const toggleDataType = (type: DataType) => {
    const newSelected = new Set(selectedTypes);
    if (newSelected.has(type)) {
      newSelected.delete(type);
    } else {
      newSelected.add(type);
    }
    setSelectedTypes(newSelected);
  };

  const handleDelete = async () => {
    if (selectedTypes.size === 0) {
      setError('Please select at least one data type to delete.');
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      // Call API to delete selected data types
      const response = await fetch('/api/delete-user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          dataTypes: Array.from(selectedTypes),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete data');
      }

      // Mark as deleted
      setDeletedTypes(new Set(selectedTypes));
      setSelectedTypes(new Set());
      
      // Show success message
      setTimeout(() => {
        setDeletedTypes(new Set());
      }, 5000);
    } catch (err: any) {
      console.error('Error deleting data:', err);
      setError(err.message || 'Failed to delete data. Please try again or contact support.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Sign In Required</h2>
          <p className="mt-2 text-gray-600">
            You must be signed in to manage your data.
          </p>
          <Button onClick={() => router.push('/sign-in')} className="mt-6">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <Trash2 className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          Partial Data Deletion
        </h1>
        <p className="mt-2 text-gray-600">
          Select specific data types you want to delete from your account
        </p>
      </div>

      {/* Info Banner */}
      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
        <div className="flex">
          <AlertCircle className="h-6 w-6 flex-shrink-0 text-blue-600" />
          <div className="ml-3">
            <h3 className="text-sm font-semibold text-blue-900">
              Keep Your Account, Delete Specific Data
            </h3>
            <p className="mt-1 text-sm text-blue-800">
              This option allows you to delete specific types of data without closing your account.
              You can continue using KCS Meet after deletion. If you want to permanently delete
              your entire account,{' '}
              <a
                href="/account/delete"
                className="font-semibold underline hover:text-blue-900"
              >
                click here
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {deletedTypes.size > 0 && (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-6">
          <div className="flex">
            <CheckCircle className="h-6 w-6 flex-shrink-0 text-green-600" />
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-green-900">
                Data Deleted Successfully
              </h3>
              <p className="mt-1 text-sm text-green-800">
                Your selected data has been permanently deleted. Changes may take a few minutes to reflect across all services.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6">
          <div className="flex">
            <AlertCircle className="h-6 w-6 flex-shrink-0 text-red-600" />
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-red-900">Error</h3>
              <p className="mt-1 text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Data Types Grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {dataTypes.map((dataType) => {
          const Icon = dataType.icon;
          const isSelected = selectedTypes.has(dataType.id);

          return (
            <div
              key={dataType.id}
              onClick={() => toggleDataType(dataType.id)}
              className={`cursor-pointer rounded-lg border-2 p-6 transition-all ${
                isSelected
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start">
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                    isSelected ? 'bg-red-100' : 'bg-gray-100'
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 ${isSelected ? 'text-red-600' : 'text-gray-600'}`}
                  />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{dataType.title}</h3>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleDataType(dataType.id)}
                      className="h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{dataType.description}</p>
                  {isSelected && (
                    <p className="mt-2 text-xs text-red-600">⚠️ {dataType.warning}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Important Notes */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h3 className="font-semibold text-gray-900">Important Notes:</h3>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          <li className="flex">
            <span className="mr-2">•</span>
            <span>Deleted data cannot be recovered. Please review your selections carefully.</span>
          </li>
          <li className="flex">
            <span className="mr-2">•</span>
            <span>
              Some data may be retained for legal compliance (e.g., payment records for 7 years).
            </span>
          </li>
          <li className="flex">
            <span className="mr-2">•</span>
            <span>Changes may take up to 24 hours to fully process across all systems.</span>
          </li>
          <li className="flex">
            <span className="mr-2">•</span>
            <span>Backup copies will be automatically deleted within 90 days.</span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="flex-1"
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          disabled={isDeleting || selectedTypes.size === 0}
          className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50"
        >
          {isDeleting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected Data ({selectedTypes.size})
            </>
          )}
        </Button>
      </div>

      {/* Support Contact */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
        <h3 className="font-semibold text-gray-900">Need Help?</h3>
        <p className="mt-2 text-sm text-gray-600">
          If you have questions about data deletion or need assistance, please contact our
          support team:
        </p>
        <p className="mt-2 text-sm">
          <a
            href="mailto:divineconnectionkcs@gmail.com"
            className="font-semibold text-[#B91C1C] hover:underline"
          >
            divineconnectionkcs@gmail.com
          </a>
        </p>
        <p className="mt-4 text-xs text-gray-500">
          Processing time: Within 7 business days
        </p>
      </div>
    </div>
  );
}
