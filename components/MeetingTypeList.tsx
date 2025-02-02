'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HomeCard from './HomeCard';
import MeetingModal from './MeetingModal';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useUser } from '@clerk/nextjs';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import Loader from './Loader';
import { toast } from './ui/use-toast';
import crypto from 'crypto';

// Load admin emails from environment variable
const ADMIN_EMAILS = process.env.NEXT_PUBLIC_ADMIN_EMAILS
  ? process.env.NEXT_PUBLIC_ADMIN_EMAILS.split(',').map(email => email.trim().toLowerCase())
  : [];

const isAdmin = (email: string): boolean => {
  console.log("Checking admin status for:", email);
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
};

const initialValues = {
  dateTime: new Date(),
  description: '',
  link: '',
};

const MeetingTypeList = () => {
  const router = useRouter();
  const [meetingState, setMeetingState] = useState<'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined>(undefined);
  const [values, setValues] = useState(initialValues);
  const [callDetail, setCallDetail] = useState<Call | null>(null);
  const client = useStreamVideoClient();
  const { user } = useUser();
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Get user email
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const email = user.primaryEmailAddress?.emailAddress || user.emailAddresses[0]?.emailAddress || null;
      setUserEmail(email ? email.trim().toLowerCase() : null);
      console.log('User Email:', email); // Debugging
    }
  }, [user]);

  const createMeeting = async () => {
    console.log("Starting meeting creation...");

    if (!client) {
      console.error("Stream Video Client not initialized.");
      toast({ title: 'Error', description: 'Stream Video Client is not initialized' });
      return;
    }

    if (!user) {
      console.error("User not authenticated.");
      toast({ title: 'Error', description: 'User not authenticated' });
      return;
    }

    if (!userEmail) {
      console.error("User email is missing.");
      toast({ title: 'Error', description: 'Failed to retrieve user email' });
      return;
    }

    if (!isAdmin(userEmail)) {
      console.warn("User is not an admin:", userEmail);
      toast({ title: 'Permission Denied', description: 'Only admins can create meetings.' });
      return;
    }

    if (!values.dateTime) {
      toast({ title: 'Error', description: 'Please select a date and time' });
      return;
    }

    try {
      console.log("Creating meeting...");

      const id = crypto.randomUUID();
      const call = client.call('default', id);
      if (!call) {
        throw new Error('Failed to create meeting');
      }

      const startsAt = values.dateTime.toISOString();
      const description = values.description || 'Instant Meeting';

      console.log("Sending meeting creation request...");

      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description,
            created_in_timezone: userTimezone,
          },
        },
      });

      console.log("Meeting created successfully:", call.id);
      setCallDetail(call);
      toast({ title: 'Meeting Created' });

      if (!values.description) {
        router.push(`/meeting/${call.id}`);
      }
    } catch (error) {
      console.error('Meeting creation error:', error);
      toast({ title: 'Failed to create Meeting', description: error instanceof Error ? error.message : 'An unknown error occurred' });
    }
  };

  if (!client || !user) return <Loader />;

  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetail?.id}`;

  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      <HomeCard img="/icons/add-meeting.svg" title="New Meeting" description="Start an instant meeting" handleClick={() => setMeetingState('isInstantMeeting')} />
      <HomeCard img="/icons/join-meeting.svg" title="Join Meeting" description="via invitation link" className="bg-blue-1" handleClick={() => setMeetingState('isJoiningMeeting')} />
      <HomeCard img="/icons/schedule.svg" title="Schedule Meeting" description="Plan your meeting" className="bg-purple-1" handleClick={() => setMeetingState('isScheduleMeeting')} />
      <HomeCard img="/icons/recordings.svg" title="View Recordings" description="Meeting Recordings" className="bg-yellow-1" handleClick={() => router.push('/recordings')} />

      {!callDetail ? (
        <MeetingModal isOpen={meetingState === 'isScheduleMeeting'} onClose={() => setMeetingState(undefined)} title="Create Meeting" handleClick={createMeeting}>
          <div className="flex flex-col gap-2.5">
            <label className="text-base font-normal leading-[22.4px] text-sky-2">Add a description</label>
            <Textarea className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0" onChange={(e) => setValues({ ...values, description: e.target.value })} />
          </div>
          <div className="flex w-full flex-col gap-2.5">
            <label className="text-base font-normal leading-[22.4px] text-sky-2">Select Date and Time ({userTimezone})</label>
            <ReactDatePicker
              selected={values.dateTime}
              onChange={(date) => setValues({ ...values, dateTime: date! })}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="time"
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full rounded bg-dark-3 p-2 focus:outline-none"
            />
          </div>
        </MeetingModal>
      ) : (
        <MeetingModal
          isOpen={meetingState === 'isScheduleMeeting'}
          onClose={() => setMeetingState(undefined)}
          title="Meeting Created"
          handleClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast({ title: 'Link Copied' });
          }}
          image={'/icons/checked.svg'}
          buttonIcon="/icons/copy.svg"
          className="text-center"
          buttonText="Copy Meeting Link"
        />
      )}

      <MeetingModal isOpen={meetingState === 'isJoiningMeeting'} onClose={() => setMeetingState(undefined)} title="Type the link here" className="text-center" buttonText="Join Meeting" handleClick={() => router.push(values.link)}>
        <Input placeholder="Meeting link" onChange={(e) => setValues({ ...values, link: e.target.value })} className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0" />
      </MeetingModal>

      <MeetingModal isOpen={meetingState === 'isInstantMeeting'} onClose={() => setMeetingState(undefined)} title="Start an Instant Meeting" className="text-center" buttonText="Start Meeting" handleClick={createMeeting} />
    </section>
  );
};

export default MeetingTypeList;
