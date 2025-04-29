"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, PlusCircle, Trash2, X } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

interface CreatePollModalProps {
  callId: string
  onClose: () => void
  onSuccess: (pollId: string) => void
}

export const CreatePollModal = ({ callId, onClose, onSuccess }: CreatePollModalProps) => {
  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState(["", ""]) // Start with 2 empty options
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [duration, setDuration] = useState(60) // Default 60 seconds

  const handleAddOption = () => {
    if (options.length < 5) {
      setOptions([...options, ""])
    }
  }

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = [...options]
      newOptions.splice(index, 1)
      setOptions(newOptions)
    }
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = async () => {
    // Validate
    if (question.trim() === "") {
      setError("Please enter a question")
      return
    }

    const validOptions = options.filter((opt) => opt.trim() !== "")
    if (validOptions.length < 2) {
      setError("Please provide at least 2 options")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Insert poll into database
      const { data, error: pollError } = await supabase
        .from("polls")
        .insert([
          {
            call_id: callId,
            question: question.trim(),
            duration_seconds: duration,
            end_time: new Date(Date.now() + duration * 1000).toISOString(),
            is_active: true,
          },
        ])
        .select()
        .single()

      if (pollError) throw pollError

      // Insert poll options
      const pollId = data.id
      const optionInserts = validOptions.map((option, index) => ({
        poll_id: pollId,
        text: option.trim(),
        position: index + 1,
      }))

      const { error: optionsError } = await supabase.from("poll_options").insert(optionInserts)

      if (optionsError) throw optionsError

      // Success
      onSuccess(pollId)
    } catch (err: any) {
      console.error("Error creating poll:", err)
      setError(err.message || "Failed to create poll")
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full p-6 rounded-lg bg-[#243341] max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition"
          disabled={loading}
        >
          <X size={20} />
        </button>

        <h3 className="mb-6 text-xl font-bold text-white">Create New Poll</h3>

        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-white">Question</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full p-3 text-white rounded-lg bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ask your question..."
            disabled={loading}
          />
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-white">Options (min 2, max 5)</label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddOption}
              disabled={options.length >= 5 || loading}
              className="h-8 text-xs"
            >
              <PlusCircle size={14} className="mr-1" /> Add
            </Button>
          </div>

          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-1 p-2 text-white rounded-lg bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Option ${index + 1}`}
                  disabled={loading}
                />
                {options.length > 2 && (
                  <button
                    onClick={() => handleRemoveOption(index)}
                    className="p-2 text-gray-400 hover:text-red-400 transition"
                    disabled={loading}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-white">Duration: {duration} seconds</label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full p-2 text-white rounded-lg bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            <option value={30}>30 seconds</option>
            <option value={60}>1 minute</option>
            <option value={120}>2 minutes</option>
            <option value={300}>5 minutes</option>
            <option value={600}>10 minutes</option>
          </select>
        </div>

        {error && <div className="p-3 mb-4 rounded-lg bg-red-500/20 text-red-200">{error}</div>}

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" /> Creating...
              </>
            ) : (
              "Create Poll"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
