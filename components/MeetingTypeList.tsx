'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import HomeCard from './HomeCard';
import MeetingModal from './MeetingModal';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useUser } from '@clerk/nextjs';
import { useToast } from './ui/use-toast';
import { Textarea } from './ui/textarea';
import ReactDatePicker from 'react-datepicker';
import { Input } from './ui/input';
import { PlusSquare, LogIn, Calendar, Video, CheckSquare, Copy, Share2, MessageCircle, Send, Facebook, ClipboardCheck } from 'lucide-react';
import { isUserAdmin } from '@/lib/utils';

const MeetingTypeList = () => {
  const router = useRouter();
  const [meetingState, setMeetingState] = useState<
    'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | 'isInstantMeetingCreated' | undefined
  >(undefined);
  const { user } = useUser();
  const client = useStreamVideoClient();
  const [values, setValues] = useState({
    dateTime: new Date(),
    description: '',
    link: '',
    title: '',
  });
  const [callDetail, setCallDetail] = useState<Call>();
  const { toast } = useToast();

  const isAdmin = useMemo(() => {
    const userEmail = user?.emailAddresses?.[0]?.emailAddress || '';
    return isUserAdmin(userEmail);
  }, [user]);

  const createMeeting = async () => {
    if (!client || !user) return;
    
    // Check if user is admin before creating meeting
    if (!isAdmin) {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can create meetings.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      if (!values.title && (meetingState === 'isInstantMeeting' || meetingState === 'isScheduleMeeting')) {
        toast({
          title: 'Please add a meeting title',
        });
        return;
      }
      if (!values.dateTime && meetingState === 'isScheduleMeeting') {
        toast({
          title: 'Please select a date and time',
        });
        return;
      }
      const id = Math.random().toString(36).substring(2, 11);
      const call = client.call('default', id);
      if (!call) throw new Error('Failed to create meeting');
      
      const startsAt = values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || '';
      
      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            title: values.title,
            description,
          },
        },
      });
      
      setCallDetail(call);

      // Save meeting metadata to the database
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          call_id: call.id,
          title: values.title,
          description: values.description,
          start_time: startsAt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save meeting metadata');
      }
      
      if (meetingState === 'isInstantMeeting') {
        // Show invite modal instead of navigating immediately
        setMeetingState('isInstantMeetingCreated');
      }
      
      toast({
        title: 'Meeting Created',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Failed to create Meeting',
      });
    }
  };

  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetail?.id}`;

  const shareMessage = `Hare Krishna 🙏🏻
Jaya Srila Prabhupada 🙏🏻
Jaya H.G. Gauranga Sundar Das Gurudev 🙏🏻

${values.title || 'Join our meeting'}
${values.description}

Join the meet here:
${meetingLink}

Hare Krishna, Hare Krishna,
Krishna Krishna, Hare Hare,
Hare Ram, Hare Ram,
Rama Rama, Hare Hare`;

  const handleShare = async () => {
    const encodedMessage = encodeURIComponent(shareMessage);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meeting Invitation',
          text: shareMessage,
        });
        toast({ title: 'Shared successfully' });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      navigator.clipboard.writeText(shareMessage);
      toast({ 
        title: 'Message Copied!',
        description: 'You can now paste it in WhatsApp, Telegram, or any app'
      });
    }
  };

  const shareToWhatsApp = () => {
    const encodedMessage = encodeURIComponent(shareMessage);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const shareToTelegram = () => {
    const encodedMessage = encodeURIComponent(shareMessage);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(meetingLink)}&text=${encodedMessage}`, '_blank');
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(meetingLink)}&quote=${encodeURIComponent(shareMessage)}`, '_blank');
  };

  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {isAdmin && (
        <HomeCard
          icon={PlusSquare}
          title="New Meeting"
          description="Start an instant meeting"
          handleClick={() => setMeetingState('isInstantMeeting')}
        />
      )}
      <HomeCard
        icon={LogIn}
        title="Join Meeting"
        description="via invitation link"
        handleClick={() => setMeetingState('isJoiningMeeting')}
      />
      {isAdmin && (
        <HomeCard
          icon={Calendar}
          title="Schedule Meeting"
          description="Plan your meeting"
          handleClick={() => setMeetingState('isScheduleMeeting')}
        />
      )}
      <HomeCard
        icon={Video}
        title="View Recordings"
        description="Meeting Recordings"
        handleClick={() => router.push('/recordings')}
      />
      {isAdmin && (
        <HomeCard
          icon={ClipboardCheck}
          title="Attendance"
          description="Track meeting attendance"
          handleClick={() => router.push('/attendance')}
        />
      )}

      {!callDetail ? (
        <MeetingModal
          isOpen={meetingState === 'isScheduleMeeting'}
          onClose={() => setMeetingState(undefined)}
          title="Create Meeting"
          handleClick={createMeeting}
        >
          <div className="flex flex-col gap-2.5">
            <label className="text-base font-normal leading-[22.4px] text-[#0F172A]">
              Add a Title
            </label>
            <Input
              className="border border-[#E2E8F0] focus-visible:ring-1 focus-visible:ring-[#B91C1C] focus-visible:ring-offset-0 bg-[#F8FAFC] text-[#0F172A]"
              onChange={(e) =>
                setValues({ ...values, title: e.target.value })
              }
            />
            <label className="text-base font-normal leading-[22.4px] text-[#0F172A]">
              Add a description
            </label>
            <Textarea
              className="border border-[#E2E8F0] focus-visible:ring-1 focus-visible:ring-[#B91C1C] focus-visible:ring-offset-0 bg-[#F8FAFC] text-[#0F172A]"
              onChange={(e) =>
                setValues({ ...values, description: e.target.value })
              }
            />
          </div>
          <div className="flex w-full flex-col gap-2.5">
            <label className="text-base font-normal leading-[22.4px] text-[#0F172A]">
              Select Date and Time
            </label>
            <ReactDatePicker
              selected={values.dateTime}
              onChange={(date) => setValues({ ...values, dateTime: date! })}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="time"
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full rounded border border-[#E2E8F0] bg-[#F8FAFC] p-2 text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#B91C1C]"
            />
          </div>
        </MeetingModal>
      ) : (
        <MeetingModal
          isOpen={meetingState === 'isScheduleMeeting'}
          onClose={() => {
            setMeetingState(undefined);
            setCallDetail(undefined);
          }}
          title="Meeting Created"
          className="text-center"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center">
              <CheckSquare className="h-16 w-16 text-[#B91C1C]" />
            </div>
            
            <p className="text-sm text-[#64748B]">
              Your meeting has been scheduled successfully!
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(meetingLink);
                  toast({ title: 'Link Copied' });
                }}
                className="flex items-center justify-center gap-2 rounded-lg px-4 py-3 transition bg-[#B91C1C] text-white hover:bg-[#991B1B]"
              >
                <Copy className="h-5 w-5" />
                Copy Meeting Link
              </button>

              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 rounded-lg px-4 py-3 transition bg-[#64748B] text-white hover:bg-[#475569]"
              >
                <Share2 className="h-5 w-5" />
                Share Meeting
              </button>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={shareToWhatsApp}
                  className="flex flex-col items-center justify-center gap-1 rounded-lg bg-[#25D366] px-3 py-2 text-white hover:bg-[#20BA5A] transition"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-xs">WhatsApp</span>
                </button>
                
                <button
                  onClick={shareToTelegram}
                  className="flex flex-col items-center justify-center gap-1 rounded-lg bg-[#0088cc] px-3 py-2 text-white hover:bg-[#0077b5] transition"
                >
                  <Send className="h-5 w-5" />
                  <span className="text-xs">Telegram</span>
                </button>
                
                <button
                  onClick={shareToFacebook}
                  className="flex flex-col items-center justify-center gap-1 rounded-lg bg-[#1877F2] px-3 py-2 text-white hover:bg-[#166FE5] transition"
                >
                  <Facebook className="h-5 w-5" />
                  <span className="text-xs">Facebook</span>
                </button>
              </div>
            </div>
          </div>
        </MeetingModal>
      )}
      
      <MeetingModal
        isOpen={meetingState === 'isInstantMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Start an Instant Meeting"
        buttonText="Start Meeting"
        handleClick={createMeeting}
      >
        <div className="flex flex-col gap-2.5">
          <label className="text-base font-normal leading-[22.4px] text-[#0F172A]">
            Meeting Title
          </label>
          <Input
            placeholder="Enter meeting title"
            className="border border-[#E2E8F0] focus-visible:ring-1 focus-visible:ring-[#B91C1C] focus-visible:ring-offset-0 bg-[#F8FAFC] text-[#0F172A]"
            onChange={(e) => setValues({ ...values, title: e.target.value })}
          />
          <label className="text-base font-normal leading-[22.4px] text-[#0F172A]">
            Add a description
          </label>
          <Textarea
            className="border border-[#E2E8F0] focus-visible:ring-1 focus-visible:ring-[#B91C1C] focus-visible:ring-offset-0 bg-[#F8FAFC] text-[#0F172A]"
            onChange={(e) =>
              setValues({ ...values, description: e.target.value })
            }
          />
        </div>
      </MeetingModal>
      
      {/* Instant Meeting Created - Show Invite Modal */}
      <MeetingModal
        isOpen={meetingState === 'isInstantMeetingCreated'}
        onClose={() => {
          setMeetingState(undefined);
          setCallDetail(undefined);
        }}
        title="Instant Meeting Created"
        className="text-center"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-center">
            <CheckSquare className="h-16 w-16 text-[#B91C1C]" />
          </div>
          
          <p className="text-sm text-[#64748B]">
            Your instant meeting is ready! Share the link or join now.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                router.push(`/meeting/${callDetail?.id}`);
              }}
              className="flex items-center justify-center gap-2 rounded-lg px-4 py-3 transition bg-[#B91C1C] text-white hover:bg-[#991B1B]"
            >
              <Video className="h-5 w-5" />
              Join Meeting Now
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(meetingLink);
                toast({ title: 'Link Copied' });
              }}
              className="flex items-center justify-center gap-2 rounded-lg px-4 py-3 transition bg-[#64748B] text-white hover:bg-[#475569]"
            >
              <Copy className="h-5 w-5" />
              Copy Meeting Link
            </button>

            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 rounded-lg px-4 py-3 transition bg-[#64748B] text-white hover:bg-[#475569]"
            >
              <Share2 className="h-5 w-5" />
              Share Meeting
            </button>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={shareToWhatsApp}
                className="flex flex-col items-center justify-center gap-1 rounded-lg bg-[#25D366] px-3 py-2 text-white hover:bg-[#20BA5A] transition"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-xs">WhatsApp</span>
              </button>
              
              <button
                onClick={shareToTelegram}
                className="flex flex-col items-center justify-center gap-1 rounded-lg bg-[#0088cc] px-3 py-2 text-white hover:bg-[#0077b5] transition"
              >
                <Send className="h-5 w-5" />
                <span className="text-xs">Telegram</span>
              </button>
              
              <button
                onClick={shareToFacebook}
                className="flex flex-col items-center justify-center gap-1 rounded-lg bg-[#1877F2] px-3 py-2 text-white hover:bg-[#166FE5] transition"
              >
                <Facebook className="h-5 w-5" />
                <span className="text-xs">Facebook</span>
              </button>
            </div>
          </div>
        </div>
      </MeetingModal>
      
      <MeetingModal
        isOpen={meetingState === 'isJoiningMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Type the link here"
        buttonText="Join Meeting"
        handleClick={() => router.push(values.link)}
      >
        <Input
          placeholder="Meeting link"
          className="border border-[#E2E8F0] focus-visible:ring-1 focus-visible:ring-[#B91C1C] focus-visible:ring-offset-0 bg-[#F8FAFC] text-[#0F172A]"
          onChange={(e) => setValues({ ...values, link: e.target.value })}
        />
      </MeetingModal>
    </section>
  );
};

export default MeetingTypeList;