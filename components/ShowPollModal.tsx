import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { supabase } from "@/lib/supabaseClient";

interface ShowPollModalProps {
  onClose: () => void;
  pollId: number;
  userData: { id: number };
}

interface Poll {
  id: number;
  question: string;
  options: string[];
}

interface PollVote {
  poll_id: number;
  voter: number;
  selected_option: string;
  vote: number;
}

const ShowPollModal: React.FC<ShowPollModalProps> = ({ onClose, pollId, userData }) => {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [userVote, setUserVote] = useState<PollVote | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalVotes, setTotalVotes] = useState(0);
  const [voteCounts, setVoteCounts] = useState<number[]>([]); // Store votes per option

  useEffect(() => {
    const fetchPollData = async () => {
      setLoading(true);
      try {
        const { data: pollData, error: pollError } = await supabase
          .from("polls")
          .select("*")
          .eq("id", pollId)
          .single();

        if (pollError) throw pollError;
        if (pollData) {
          setPoll({
            ...pollData,
            options: pollData.options ?? [],
          });
        }

        // Fetch user's vote
        const { data: voteData, error: voteError } = await supabase
          .from("poll_votes")
          .select("*")
          .eq("poll_id", pollId)
          .eq("voter", userData.id)
          .single();

        if (voteError) console.warn("Error fetching vote:", voteError);
        if (voteData) {
          setUserVote(voteData);
          setSelectedOption(voteData.vote);
        }

        // Fetch total votes
        const { count, error: countError } = await supabase
          .from("poll_votes")
          .select("*", { count: "exact", head: true })
          .eq("poll_id", pollId);

        if (countError) console.warn("Error fetching total votes:", countError);
        if (count !== null) setTotalVotes(count);

        // Fetch votes per option
        const { data: optionVotes, error: optionVotesError } = await supabase
          .from("poll_votes")
          .select("vote");

        if (optionVotesError) console.warn("Error fetching vote counts:", optionVotesError);

        if (pollData && optionVotes) {
          const voteTally = new Array(pollData.options.length).fill(0);
          optionVotes.forEach(({ vote }) => {
            if (vote !== null && voteTally[vote] !== undefined) {
              voteTally[vote]++;
            }
          });
          setVoteCounts(voteTally);
        }
      } catch (error) {
        console.error("Error fetching poll data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPollData();

    const subscription = supabase
      .channel("polls")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "polls", filter: `id=eq.${pollId}` },
        () => {
          fetchPollData(); // Re-fetch poll data when an update occurs
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [pollId, userData.id]);

  const handleVote = async () => {
    if (selectedOption === null || !poll) return;

    const votePayload = {
      poll_id: poll.id,
      voter: userData.id,
      selected_option: poll.options[selectedOption],
      vote: selectedOption,
    };

    try {
      const { error } = await supabase.from("poll_votes").insert([votePayload]);
      if (error) throw error;

      setUserVote(votePayload);
      setTotalVotes(totalVotes + 1);

      // Update vote count for selected option
      setVoteCounts((prev) => {
        const updatedCounts = [...prev];
        updatedCounts[selectedOption] += 1;
        return updatedCounts;
      });
    } catch (error) {
      console.error("Error submitting vote:", error);
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[101]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
        <h2 className="text-center text-lg font-bold mb-4 text-black">Active Poll</h2>
        <h4 className="text-left text-lg mb-4 text-black">{poll?.question}</h4>

        {/* Poll Options with Vote Count */}
        {poll?.options?.map((option, index) => (
          <label
            key={index}
            className={`flex items-center space-x-2 p-2 border rounded mb-2 cursor-pointer ${
              selectedOption === index ? "bg-gray-200" : ""
            }`}
          >
            <input
              type="radio"
              name="poll"
              value={index}
              disabled={!!userVote} // Disable if already voted
              checked={selectedOption === index}
              onChange={() => setSelectedOption(index)}
              className="accent-blue-500"
            />
            <span className="text-black">{option}</span>
            <span className="ml-auto text-gray-600 text-sm">({voteCounts[index] ?? 0} votes)</span>
          </label>
        ))}

        {/* Show Warning if Already Voted */}
        {userVote && (
          <p className="text-red-500 text-sm mt-2">You have already voted!</p>
        )}

        {/* Display Total Votes */}
        <p className="text-gray-700 text-sm mt-2 text-left">Total Votes: {totalVotes}</p>

        {/* Action Buttons */}
        <div className="flex justify-end mt-4">
          <button className="p-2 bg-red-500 text-white rounded mr-2" onClick={onClose}>
            Close
          </button>
          {!userVote && (
            <button
              className="p-2 bg-blue-500 text-white rounded"
              onClick={handleVote}
              disabled={selectedOption === null}
            >
              Vote
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ShowPollModal;
