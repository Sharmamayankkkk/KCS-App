"use client"

import { useState, useEffect } from "react"
import { BarChart2, PlusCircle, ArrowRight, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreatePollModal } from "./create-poll-modal"
import { ActivePoll } from "./active-poll"
import { supabase } from "@/lib/supabaseClient"

interface Poll {
  id: string
  question: string
  end_time: string
  is_active: boolean
  created_at: string
}

interface PollsManagerProps {
  callId: string
  userId: string
  isAdmin: boolean
  onClose: () => void
}

export const PollsManager = ({ callId, userId, isAdmin, onClose }: PollsManagerProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [polls, setPolls] = useState<Poll[]>([])
  const [activePollId, setActivePollId] = useState<string | null>(null)
  const [showPollDetails, setShowPollDetails] = useState(false)

  // Fetch polls
  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const { data, error } = await supabase
          .from("polls")
          .select("*")
          .eq("call_id", callId)
          .order("created_at", { ascending: false })

        if (error) throw error

        setPolls(data || [])

        // Find the active poll
        const activePolls = data?.filter((poll) => poll.is_active) || []
        if (activePolls.length > 0) {
          setActivePollId(activePolls[0].id)
        }
      } catch (err) {
        console.error("Error fetching polls:", err)
      }
    }

    fetchPolls()

    // Subscribe to poll changes
    const subscription = supabase
      .channel(`polls-channel-${callId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "polls", filter: `call_id=eq.${callId}` }, () => {
        fetchPolls()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [callId])

  const handlePollCreated = (pollId: string) => {
    setShowCreateModal(false)
    setActivePollId(pollId)
    setShowPollDetails(true)
  }

  const handleEndPoll = async (pollId: string) => {
    try {
      const { error } = await supabase.from("polls").update({ is_active: false }).eq("id", pollId)

      if (error) throw error
    } catch (err) {
      console.error("Error ending poll:", err)
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (showPollDetails && activePollId) {
    return <ActivePoll callId={callId} userId={userId} onClose={() => setShowPollDetails(false)} />
  }

  return (
    <div className="flex flex-col h-full bg-[#19232d]/95 backdrop-blur-md rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <BarChart2 className="text-blue-400 mr-2" size={20} />
          <h3 className="text-lg font-semibold text-white">Polls</h3>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={() => setShowCreateModal(true)} className="h-8">
            <PlusCircle size={14} className="mr-1" /> Create Poll
          </Button>
        )}
      </div>

      {polls.filter((poll) => poll.is_active).length > 0 && (
        <div className="mb-4">
          <h4 className="text-white font-medium mb-2 flex items-center">
            <Clock size={14} className="mr-1 text-green-500" /> Active Poll
          </h4>

          {polls
            .filter((poll) => poll.is_active)
            .map((poll) => (
              <div
                key={poll.id}
                className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-3 hover:bg-blue-900/30 transition cursor-pointer"
                onClick={() => {
                  setActivePollId(poll.id)
                  setShowPollDetails(true)
                }}
              >
                <div className="flex items-center justify-between">
                  <h5 className="text-white font-medium">{poll.question}</h5>
                  <ArrowRight size={16} className="text-blue-400" />
                </div>
                <div className="text-gray-400 text-xs mt-1">Created {formatDate(poll.created_at)}</div>

                {isAdmin && (
                  <div className="mt-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEndPoll(poll.id)
                      }}
                    >
                      End Poll
                    </Button>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <h4 className="text-white font-medium mb-2">Past Polls</h4>

        {polls.filter((poll) => !poll.is_active).length === 0 ? (
          <div className="text-gray-400 text-sm text-center py-4">No previous polls</div>
        ) : (
          <div className="space-y-2">
            {polls
              .filter((poll) => !poll.is_active)
              .map((poll) => (
                <div
                  key={poll.id}
                  className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-700/50 transition cursor-pointer"
                  onClick={() => {
                    setActivePollId(poll.id)
                    setShowPollDetails(true)
                  }}
                >
                  <h5 className="text-white font-medium">{poll.question}</h5>
                  <div className="text-gray-400 text-xs mt-1">Ended {formatDate(poll.end_time)}</div>
                </div>
              ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreatePollModal callId={callId} onClose={() => setShowCreateModal(false)} onSuccess={handlePollCreated} />
      )}
    </div>
  )
}
