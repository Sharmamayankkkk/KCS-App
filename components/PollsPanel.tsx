'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Frown, Loader2, Plus, Send, BarChartHorizontalBig, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';

interface PollOption {
  id: string;
  text: string;
  vote_count: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  is_active: boolean;
  total_votes: number;
}

interface PollsPanelProps {
  callId: string;
  userId: string;
  isAdmin: boolean;
  onClose: () => void;
}

const PollsPanel = ({ callId, userId, isAdmin, onClose }: PollsPanelProps) => {
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [view, setView] = useState<'list' | 'create' | 'active'>('list');
  const [pastPolls, setPastPolls] = useState<Poll[]>([]);

  const fetchPolls = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .select('*')
        .eq('call_id', callId)
        .order('created_at', { ascending: false });

      if (pollError) throw pollError;

      const polls: Poll[] = [];
      let activePollFound: Poll | null = null;
      let userVoteFound: string | null = null;

      for (const poll of pollData) {
        const { data: optionsData, error: optionsError } = await supabase
          .from('poll_options')
          .select('id, text, poll_votes(count)')
          .eq('poll_id', poll.id);

        if (optionsError) throw optionsError;

        let totalVotes = 0;
        const options = optionsData.map((opt: any) => {
          const voteCount = opt.poll_votes[0]?.count || 0;
          totalVotes += voteCount;
          return {
            id: opt.id,
            text: opt.text,
            vote_count: voteCount,
          };
        });

        const pollWithDetails: Poll = { ...poll, options, total_votes: totalVotes };

        if (poll.is_active && !activePollFound) {
          activePollFound = pollWithDetails;
          const { data: userVoteData, error: userVoteError } = await supabase
            .from('poll_votes')
            .select('poll_option_id')
            .eq('poll_id', poll.id)
            .eq('user_id', userId)
            .single();
          
          if (userVoteError && userVoteError.code !== 'PGRST116') throw userVoteError;
          if (userVoteData) {
            userVoteFound = userVoteData.poll_option_id;
          }
        } else {
          polls.push(pollWithDetails);
        }
      }
      
      setActivePoll(activePollFound);
      setPastPolls(polls);
      setUserVote(userVoteFound);
      if (activePollFound) {
        setView('active');
        if(userVoteFound) setShowResults(true)
      } else {
        setView('list');
      }

    } catch (err: any) {
      console.error('Error fetching polls:', err);
      setError('Failed to load polls.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
    const subscription = supabase
      .channel(`polls-panel-${callId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'polls', filter: `call_id=eq.${callId}` }, fetchPolls)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'poll_options', filter: `poll_id=in.(select id from polls where call_id=\'${callId}\')` }, fetchPolls)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'poll_votes', filter: `poll_id=in.(select id from polls where call_id=\'${callId}\')` }, fetchPolls)
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [callId, userId]);
  
  const handleVote = async (optionId: string) => {
    if (userVote || !activePoll) return;
    try {
      setUserVote(optionId);
      setShowResults(true);

      const { error } = await supabase.from('poll_votes').insert([
        { poll_id: activePoll.id, poll_option_id: optionId, user_id: userId },
      ]);
      if (error) throw error;
    } catch (err: any) {
      console.error('Error submitting vote:', err);
      setError('Failed to submit your vote.');
      setUserVote(null); 
      setShowResults(false);
    }
  };

  const handleEndPoll = async (pollId: string) => {
    try {
      const { error } = await supabase.from('polls').update({ is_active: false }).eq('id', pollId);
      if (error) throw error;
      setActivePoll(null);
      setView('list');
    } catch (err: any) {
      console.error('Error ending poll:', err);
      setError('Failed to end the poll.');
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="relative w-full max-w-md h-full max-h-[600px]"
      >
        <Card className="w-full h-full flex flex-col bg-white/80 backdrop-blur-lg border-gray-200/50 shadow-2xl rounded-2xl">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className='flex items-center gap-2'>
                <BarChartHorizontalBig className="text-gray-700" />
                <CardTitle className="text-gray-800">Polls</CardTitle>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-900 transition-colors"><X /></button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto px-6 py-4">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin text-gray-500" size={32} />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {view === 'list' && (
                  <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {isAdmin && (
                      <Button onClick={() => setView('create')} className="w-full mb-4 bg-gray-800 hover:bg-gray-900 text-white">
                        <Plus className="mr-2" /> Create New Poll
                      </Button>
                    )}
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Past Polls</h3>
                    {pastPolls.length > 0 ? (
                      <div className="space-y-3">
                        {pastPolls.map(poll => (
                          <PastPollCard key={poll.id} poll={poll} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 rounded-lg">
                        <Frown className="mx-auto text-gray-400" size={40} />
                        <p className="mt-2 text-gray-500">No past polls to show.</p>
                      </div>
                    )}
                  </motion.div>
                )}
                {view === 'active' && activePoll && (
                   <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                     <ActivePollView 
                       poll={activePoll} 
                       userVote={userVote}
                       onVote={handleVote}
                       showResults={showResults}
                       isAdmin={isAdmin}
                       onEndPoll={handleEndPoll}
                     />
                   </motion.div>
                )}
                {view === 'create' && isAdmin && (
                   <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                     <CreatePollForm 
                        callId={callId}
                        onCreated={() => {
                          fetchPolls();
                          setView('active');
                        }}
                        onCancel={() => setView('list')}
                     />
                   </motion.div>
                )}
              </AnimatePresence>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

const CreatePollForm = ({ callId, onCreated, onCancel }: { callId: string, onCreated: () => void, onCancel: () => void }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addOption = () => options.length < 5 && setOptions([...options, '']);
  const removeOption = (index: number) => options.length > 2 && setOptions(options.filter((_, i) => i !== index));
  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async () => {
    if (!question.trim()) {
      setError('Question cannot be empty.');
      return;
    }
    const filledOptions = options.filter(o => o.trim());
    if (filledOptions.length < 2) {
      setError('You need at least two options.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const { data: pollData, error: pollError } = await supabase.from('polls').insert({
        call_id: callId,
        question: question.trim(),
        duration_seconds: duration,
        end_time: new Date(Date.now() + duration * 1000).toISOString(),
        is_active: true,
      }).select().single();

      if (pollError) throw pollError;

      const optionInserts = filledOptions.map((text, i) => ({
        poll_id: pollData.id,
        text: text.trim(),
        position: i,
      }));

      const { error: optionsError } = await supabase.from('poll_options').insert(optionInserts);
      if (optionsError) throw optionsError;
      
      onCreated();

    } catch (err: any) {
      console.error('Error creating poll:', err);
      setError('Could not create the poll.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800">Create a New Poll</h3>
      <Input
        placeholder="Poll Question"
        value={question}
        onChange={e => setQuestion(e.target.value)}
        className="bg-white/70"
      />
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-600">Options</label>
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={e => updateOption(i, e.target.value)}
              className="bg-white/70"
            />
            {options.length > 2 && <button onClick={() => removeOption(i)} className="text-red-500 hover:text-red-700"><X size={18} /></button>}
          </div>
        ))}
        {options.length < 5 && <Button variant='ghost' size='sm' onClick={addOption} className="text-gray-600">Add Option</Button>}
      </div>
      <div>
        <label className="text-sm font-medium text-gray-600">Duration (in seconds)</label>
        <Input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} className="bg-white/70" />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="ghost" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={loading} className="bg-gray-800 hover:bg-gray-900 text-white">
          {loading ? <Loader2 className="animate-spin" /> : <><Send className="mr-2" /> Launch Poll</>}
        </Button>
      </div>
    </div>
  );
};

const ActivePollView = ({ poll, userVote, onVote, showResults, isAdmin, onEndPoll }: { poll: Poll, userVote: string | null, onVote: (optionId: string) => void, showResults: boolean, isAdmin: boolean, onEndPoll: (pollId: string) => void }) => {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-4">{poll.question}</h3>
      <div className="space-y-3">
        {poll.options.map(option => (
          <PollOption
            key={option.id}
            option={option}
            hasVoted={!!userVote}
            isVotedOption={userVote === option.id}
            totalVotes={poll.total_votes}
            showResults={showResults}
            onVote={() => onVote(option.id)}
          />
        ))}
      </div>
      <p className="text-sm text-gray-500 mt-4 text-center">{poll.total_votes} {poll.total_votes === 1 ? 'vote' : 'votes'}</p>
      {isAdmin && poll.is_active && (
        <div className="mt-6 flex justify-center">
          <Button variant="destructive" onClick={() => onEndPoll(poll.id)}>End Poll</Button>
        </div>
      )}
    </div>
  );
};

const PollOption = ({ option, hasVoted, isVotedOption, totalVotes, showResults, onVote }: { option: PollOption, hasVoted: boolean, isVotedOption: boolean, totalVotes: number, showResults: boolean, onVote: () => void }) => {
  const percentage = totalVotes > 0 ? (option.vote_count / totalVotes) * 100 : 0;
  
  if (showResults || hasVoted) {
    return (
      <div className="relative w-full h-12 rounded-lg bg-gray-200/70 overflow-hidden">
        <motion.div
          className={cn("absolute top-0 left-0 h-full", isVotedOption ? 'bg-blue-500' : 'bg-gray-400/80')}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 flex items-center justify-between px-4">
          <span className={cn("font-semibold", isVotedOption ? 'text-white' : 'text-gray-800')}>{option.text}</span>
          <div className="flex items-center gap-2">
            {isVotedOption && <Check size={18} className="text-white" />}
            <span className={cn("font-bold text-sm", isVotedOption ? 'text-white' : 'text-gray-700')}>{percentage.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Button 
      variant='outline' 
      onClick={onVote} 
      className="w-full justify-start p-6 text-lg h-16 bg-white/50 hover:bg-white/90 border-gray-300 hover:border-gray-500"
    >
      {option.text}
    </Button>
  );
};

const PastPollCard = ({ poll }: { poll: Poll }) => {
  return (
    <Card className="bg-white/60 p-4 rounded-lg shadow-md">
      <p className="font-semibold text-gray-800">{poll.question}</p>
      <div className="mt-2 space-y-1">
        {poll.options.map(option => {
          const percentage = poll.total_votes > 0 ? (option.vote_count / poll.total_votes) * 100 : 0;
          return (
            <div key={option.id} className="text-sm text-gray-600 flex justify-between">
              <span>{option.text}</span>
              <span className="font-medium">{percentage.toFixed(0)}%</span>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-gray-500 mt-2">{poll.total_votes} total votes</p>
    </Card>
  )
}

export default PollsPanel;
''