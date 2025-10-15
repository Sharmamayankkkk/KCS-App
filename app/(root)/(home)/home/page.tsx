import MeetingTypeList from '@/components/MeetingTypeList';

const Home = () => {
  return (
    <section className="flex size-full flex-col gap-10">
      <div className="h-[303px] w-full rounded-[20px] bg-cover bg-no-repeat" style={{ backgroundColor: '#292F36' }}>
        <div className="flex h-full flex-col justify-between max-md:px-5 max-md:py-8 lg:p-11">
          <h2 className="max-w-[270px] rounded py-2 text-center text-base font-normal" style={{ backgroundColor: '#A41F13', color: '#FAF5F1' }}>
            Upcoming Meeting at 12:30 PM
          </h2>
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold lg:text-7xl" style={{ color: '#FAF5F1' }}>
              {new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </h1>
            <p className="text-lg font-medium lg:text-2xl" style={{ color: '#E0DBD8' }}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      <MeetingTypeList />
    </section>
  );
};

export default Home;
