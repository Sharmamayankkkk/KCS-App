import MeetingTypeList from '@/components/MeetingTypeList';

const Home = () => {
  const now = new Date();

  // Correctly detect user's actual timezone
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Format time correctly using user's timezone
  const time = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true, // Ensures AM/PM format
    timeZone: userTimeZone // Apply detected timezone
  });

  // Format date correctly using user's timezone
  const date = new Intl.DateTimeFormat('en-US', { 
    dateStyle: 'full',
    timeZone: userTimeZone // Apply detected timezone
  }).format(now);

  return (
    <section className="flex size-full flex-col gap-5 text-white">
      <div className="h-[303px] w-full rounded-[20px] bg-hero bg-cover">
        <div className="flex h-full flex-col justify-between max-md:px-5 max-md:py-8 lg:p-11">
          <h2 className="glassmorphism max-w-[273px] rounded py-2 text-center text-base font-normal">
            Upcoming Meeting at: 03:30 PM
          </h2>
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold lg:text-7xl">{time}</h1>
            <p className="text-lg font-medium text-sky-1 lg:text-2xl">{date}</p>
            <p className="text-sm text-gray-400">Time Zone: {userTimeZone}</p> 
          </div>
        </div>
      </div>

      <MeetingTypeList />
    </section>
  );
};

export default Home;
