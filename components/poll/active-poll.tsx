"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, X, BarChart2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabaseClient"

interface PollOption {
  id: string
  text: string
  position: number
  vote_count: number
}

interface Poll {
  id: string
  question: string
  end_time: string
  is_active: boolean
  options: PollOption[]
  total_votes: number
}

interface ActivePollProps {
  callId: string
  userId: string
  onClose: () => void
}

export const ActivePoll = ({ callId, userId, onClose }: ActivePollProps) => {
  const [activePoll, setActivePoll] = useState<Poll | null>(null)
  const [userVote, setUserVote] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [timeLeft, setTimeLeft] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch active poll and user vote
  useEffect(() => {
    const fetchActivePoll = async () => {
      setLoading(true)
      setError("")

      try {
        // Get the most recent active poll for this call
        const { data: pollData, error: pollError } = await supabase
          .from("polls")
          .select("*")
          .eq("call_id", callId)
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        if (pollError) {
          if (pollError.code === "PGRST116") {
            // No active polls
            setActivePoll(null)
            setLoading(false)
            return
          }
          throw pollError
        }

        if (!pollData) {
          setActivePoll(null)
          setLoading(false)
          return
        }

        // Get poll options with vote counts
        const { data: optionsData, error: optionsError } = await supabase
          .from("poll_options")
          .select(`
          id, 
          text, 
          position,
          vote_count:poll_votes(count)
        `)
          .eq("poll_id", pollData.id)

        if (optionsError) throw optionsError

        // Process the options to get vote counts
        const processedOptions = optionsData.map((option) => ({
          id: option.id,
          text: option.text,
          position: option.position,
          vote_count: option.vote_count?.length ? option.vote_count[0].count : 0,
        }))

        // Get total votes
        const { count, error: countError } = await supabase
          .from("poll_votes")
          .select("*", { count: "exact", head: true })
          .eq("poll_id", pollData.id)

        if (countError) throw countError

        // Get user's vote
        const { data: userVoteData, error: userVoteError } = await supabase
          .from("poll_votes")
          .select("poll_option_id")
          .eq("poll_id", pollData.id)
          .eq("user_id", userId)
          .maybeSingle()

        if (userVoteError) throw userVoteError

        setActivePoll({
          ...pollData,
          options: processedOptions,
          total_votes: count || 0,
        })

        if (userVoteData) {
          setUserVote(userVoteData.poll_option_id)
          setShowResults(true)
        } else {
          setUserVote(null)
          setShowResults(false)
        }
      } catch (err: any) {
        console.error("Error fetching poll:", err)
        setError("Failed to load the active poll")
      } finally {
        setLoading(false)
      }
    }

    fetchActivePoll()

    // Subscribe to poll updates
    const pollsSubscription = supabase
      .channel(`polls-channel-${callId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "polls", filter: `call_id=eq.${callId}` },
        (payload) => {
          if (payload.new.id === activePoll?.id) {
            setActivePoll((prev) => (prev ? { ...prev, ...payload.new } : null))
          }
        },
      )
      .subscribe()

    // Subscribe to vote updates
    const votesSubscription = supabase
      .channel(`votes-channel-${callId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "poll_votes" }, () => {
        // Refresh the poll data when new votes are cast
        fetchActivePoll()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(pollsSubscription)
      supabase.removeChannel(votesSubscription)
      if (pollTimerRef.current) clearInterval(pollTimerRef.current)
    }
  }, [callId, userId, activePoll?.id])

  // Calculate and update time left
  useEffect(() => {
    if (!activePoll || !activePoll.end_time) return

    const updateTimeLeft = () => {
      const endTime = new Date(activePoll.end_time).getTime()
      const now = Date.now()
      const diff = Math.max(0, Math.floor((endTime - now) / 1000))

      setTimeLeft(diff)

      if (diff <= 0 && activePoll.is_active) {
        // Poll has ended
        setShowResults(true)
        if (pollTimerRef.current) clearInterval(pollTimerRef.current)
      }
    }

    updateTimeLeft()
    pollTimerRef.current = setInterval(updateTimeLeft, 1000)

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current)
    }
  }, [activePoll])

  // Format time left
  const formatTimeLeft = (seconds: number) => {
    if (seconds <= 0) return "Ended"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Handle voting with improved error handling
  const handleVote = async (optionId: string) => {
    if (userVote || !activePoll) return

    try {
      // Optimistic UI update
      setUserVote(optionId)
      setShowResults(true)

      // Update the UI optimistically
      setActivePoll((prev) => {
        if (!prev) return null

        const updatedOptions = prev.options.map((opt) =>
          opt.id === optionId ? { ...opt, vote_count: opt.vote_count + 1 } : opt,
        )

        return {
          ...prev,
          options: updatedOptions,
          total_votes: prev.total_votes + 1,
        }
      })

      const { error } = await supabase.from("poll_votes").insert([
        {
          poll_id: activePoll.id,
          poll_option_id: optionId,
          user_id: userId,
        },
      ])

      if (error) {
        // Revert optimistic update on error
        setUserVote(null)
        setShowResults(false)
        throw error
      }
    } catch (err: any) {
      console.error("Error submitting vote:", err)
      setError("Failed to submit your vote. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-4">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
        <p className="text-gray-300">Loading poll...</p>
      </div>
    )
  }

  if (!activePoll) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-4">
        <div className="text-center mb-4">
          <BarChart2 size={40} className="mx-auto mb-2 text-gray-400" />
          <h3 className="text-white text-lg font-medium">No Active Polls</h3>
          <p className="text-gray-400 text-sm">There are no active polls at this time.</p>
        </div>
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#19232d]/95 backdrop-blur-md rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <BarChart2 className="text-blue-400 mr-2" size={20} />
          <h3 className="text-lg font-semibold text-white">Live Poll</h3>
        </div>
        <button className="text-white hover:text-gray-300 transition" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center text-gray-300 text-sm">
            <Clock size={14} className="mr-1" />
            {formatTimeLeft(timeLeft)}
          </div>
          {showResults && (
            <div className="text-gray-300 text-sm">
              {activePoll.total_votes} {activePoll.total_votes === 1 ? "vote" : "votes"}
            </div>
          )}
        </div>

        <h4 className="text-lg font-medium text-white mb-4">{activePoll.question}</h4>

        <div className="space-y-3">
          {activePoll.options.map((option) => {
            const percentage =
              activePoll.total_votes > 0 ? Math.round((option.vote_count / activePoll.total_votes) * 100) : 0

            return (
              <div key={option.id} className="w-full">
                {showResults ? (
                  <div className="mb-1 flex items-center justify-between">
                    <div className="text-white text-sm">{option.text}</div>
                    <div className="text-white text-sm font-semibold">{percentage}%</div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleVote(option.id)}
                    className="w-full text-left text-white text-sm bg-gray-700/70 hover:bg-gray-600/70 p-3 rounded-md mb-1 transition"
                  >
                    {option.text}
                  </button>
                )}

                {showResults && (
                  <div className="w-full h-8 bg-gray-700/50 rounded-md overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5 }}
                      className={`absolute top-0 left-0 h-full ${
                        userVote === option.id ? "bg-blue-500" : "bg-gray-600"
                      }`}
                    />

                    {userVote === option.id && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <CheckCircle2 size={16} className="text-white" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-auto">
        {!showResults && !userVote ? (
          <p className="text-center text-gray-400 text-sm">Select an option to vote</p>
        ) : !activePoll.is_active || timeLeft <= 0 ? (
          <p className="text-center text-gray-400 text-sm">This poll has ended</p>
        ) : (
          <Button variant="outline" size="sm" className="w-full" onClick={() => setShowResults(!showResults)}>
            {showResults ? "Hide Results" : "Show Results"}
          </Button>
        )}
      </div>

      {error && <div className="mt-4 p-3 rounded-lg bg-red-500/20 text-red-200 text-sm">{error}</div>}
    </div>
  )
}
