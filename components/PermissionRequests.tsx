'use client';

import { useEffect, useState } from 'react';
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Check, Mic, Video, MonitorPlay } from 'lucide-react';

interface PermissionRequest {
  userId: string;
  userName: string;
  permissions: string[];
  timestamp: number;
}

export const PermissionRequests = ({ isAdmin }: { isAdmin: boolean }) => {
  const call = useCall();
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const [requests, setRequests] = useState<PermissionRequest[]>([]);

  useEffect(() => {
    if (!call || !isAdmin) return;

    // Listen for permission requests
    const unsubscribe = call.on('call.permission_request', (event: any) => {
      const request: PermissionRequest = {
        userId: event.user.id,
        userName: event.user.name || 'Unknown User',
        permissions: event.permissions,
        timestamp: Date.now(),
      };
      
      setRequests((prev) => {
        // Avoid duplicates
        const exists = prev.some((r) => r.userId === request.userId);
        if (exists) {
          return prev.map((r) => (r.userId === request.userId ? request : r));
        }
        return [...prev, request];
      });
    });

    return () => {
      unsubscribe();
    };
  }, [call, isAdmin]);

  const handleApprove = async (request: PermissionRequest) => {
    if (!call) return;

    try {
      // Grant permissions to the user
      for (const permission of request.permissions) {
        await call.grantPermissions(request.userId, [permission]);
      }

      // Remove from requests
      setRequests((prev) => prev.filter((r) => r.userId !== request.userId));
    } catch (error) {
      console.error('Failed to approve permission request:', error);
    }
  };

  const handleDeny = async (request: PermissionRequest) => {
    if (!call) return;

    try {
      // Revoke permissions from the user
      for (const permission of request.permissions) {
        await call.revokePermissions(request.userId, [permission]);
      }

      // Remove from requests
      setRequests((prev) => prev.filter((r) => r.userId !== request.userId));
    } catch (error) {
      console.error('Failed to deny permission request:', error);
    }
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'send-audio':
        return <Mic className="size-4" />;
      case 'send-video':
        return <Video className="size-4" />;
      case 'screenshare':
        return <MonitorPlay className="size-4" />;
      default:
        return null;
    }
  };

  const getPermissionLabel = (permission: string) => {
    switch (permission) {
      case 'send-audio':
        return 'Unmute Microphone';
      case 'send-video':
        return 'Enable Camera';
      case 'screenshare':
        return 'Share Screen';
      default:
        return permission;
    }
  };

  if (!isAdmin || requests.length === 0) return null;

  return (
    <div className="fixed top-16 right-2 left-2 sm:left-auto sm:right-4 sm:top-20 z-50 max-w-sm mx-auto sm:mx-0 space-y-2">
      {requests.map((request) => (
        <Card
          key={request.userId}
          className="bg-background/95 border-2 p-3 sm:p-4 shadow-lg backdrop-blur-sm duration-300 animate-in slide-in-from-right"
        >
          <div className="mb-2 sm:mb-3 flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-xs sm:text-sm font-semibold truncate">{request.userName}</h3>
              <p className="text-muted-foreground text-[10px] sm:text-xs">Requesting permissions</p>
            </div>
            <button
              onClick={() => handleDeny(request)}
              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 ml-2"
            >
              <X className="size-3 sm:size-4" />
            </button>
          </div>

          <div className="mb-2 sm:mb-3 space-y-1 sm:space-y-2">
            {request.permissions.map((permission) => (
              <div key={permission} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                {getPermissionIcon(permission)}
                <span className="truncate">{getPermissionLabel(permission)}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-1.5 sm:gap-2">
            <Button
              onClick={() => handleDeny(request)}
              variant="outline"
              size="sm"
              className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
            >
              <X className="mr-0.5 sm:mr-1 size-3 sm:size-4" />
              <span className="hidden xs:inline">Deny</span>
              <span className="xs:hidden">✕</span>
            </Button>
            <Button
              onClick={() => handleApprove(request)}
              size="sm"
              className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
            >
              <Check className="mr-0.5 sm:mr-1 size-3 sm:size-4" />
              <span className="hidden xs:inline">Approve</span>
              <span className="xs:hidden">✓</span>
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};
