"use client"

import { useState, useEffect } from "react"
import { BarChart2, PlusCircle, ArrowRight, Clock, X } from "lucide-react"
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

        const activePolls = data?.filter((poll) => poll.is_active) || []
        if (activePolls.length > 0) {
          setActivePollId(activePolls[0].id)
        }
      } catch (err) {
        console.error("Error fetching polls:", err)
      }
    }

    fetchPolls()

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
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-700/50 bg-dark-1/95 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700/50 bg-dark-1/60 p-4">
        <div className="flex items-center gap-2">
          <BarChart2 className="text-blue-400" size={20} />
          <h3 className="text-lg font-semibold text-white">Polls</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button 
              size="sm" 
              onClick={() => setShowCreateModal(true)} 
              className="h-8 border-blue-500 bg-blue-600 px-3 hover:bg-blue-700"
            >
              <PlusCircle size={14} className="mr-1" /> 
              <span className="hidden sm:inline">Create Poll</span>
              <span className="sm:hidden">New</span>
            </Button>
          )}
          
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-700/50 hover:text-red-400"
            aria-label="Close polls panel"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Active Polls Section */}
        {polls.filter((poll) => poll.is_active).length > 0 && (
          <div className="border-b border-gray-700/30 p-4">
            <h4 className="mb-3 flex items-center font-medium text-white">
              <Clock size={14} className="mr-2 text-green-500" /> 
              Active Poll{polls.filter((poll) => poll.is_active).length > 1 ? "s" : ""}
            </h4>

            <div className="space-y-2">
              {polls
                .filter((poll) => poll.is_active)
                .map((poll) => (
                  <div
                    key={poll.id}
                    className="group cursor-pointer rounded-lg border border-blue-800/50 bg-blue-900/20 p-3 transition-all duration-200 hover:bg-blue-900/30"
                    onClick={() => {
                      setActivePollId(poll.id)
                      setShowPollDetails(true)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="line-clamp-2 flex-1 pr-2 font-medium text-white">{poll.question}</h5>
                      <ArrowRight size={16} className="text-blue-400 transition-transform group-hover:translate-x-1" />
                    </div>
                    <div className="mt-1 text-xs text-gray-400">Created {formatDate(poll.created_at)}</div>

                    {isAdmin && (
                      <div className="mt-2 flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-7 px-2 text-xs"
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
          </div>
        )}

        {/* Past Polls Section */}
        <div className="flex-1 overflow-y-auto p-4">
          <h4 className="mb-3 font-medium text-white">Past Polls</h4>

          {polls.filter((poll) => !poll.is_active).length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">
              <BarChart2 size={48} className="mx-auto mb-3 text-gray-600" />
              <p>No previous polls</p>
              {isAdmin && (
                <p className="mt-1 text-xs">Create your first poll to engage participants</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {polls
                .filter((poll) => !poll.is_active)
                .map((poll) => (
                  <div
                    key={poll.id}
                    className="group cursor-pointer rounded-lg border border-gray-700/30 bg-gray-800/50 p-3 transition-all duration-200 hover:bg-gray-700/50"
                    onClick={() => {
                      setActivePollId(poll.id)
                      setShowPollDetails(true)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="line-clamp-2 flex-1 pr-2 font-medium text-white">{poll.question}</h5>
                      <ArrowRight size={14} className="text-gray-500 transition-transform group-hover:translate-x-1" />
                    </div>
                    <div className="mt-1 text-xs text-gray-400">Ended {formatDate(poll.end_time)}</div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Poll Modal */}
      {showCreateModal && (
        <CreatePollModal 
          callId={callId} 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={handlePollCreated} 
        />
      )}
    </div>
  )
}
