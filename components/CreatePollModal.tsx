import React, { useState } from "react";
import ReactDOM from "react-dom";
import { PlusCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface CreatePollModalProps {
  onClose: () => void;
  userId: string;
  callId: string;
}

const CreatePollModal: React.FC<CreatePollModalProps> = ({ onClose, userId, callId }) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addOption = () => {
    if (options.length < 5) {
      setOptions([...options, ""]);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    const filteredOptions = options.filter((opt) => opt.trim() !== "");
    if (!question.trim()) {
      setError("Question cannot be empty.");
      setLoading(false);
      return;
    }
    if (filteredOptions.length < 2) {
      setError("At least two options are required.");
      setLoading(false);
      return;
    }

    const pollData = {
      question,
      options: filteredOptions,
      created_by: userId,
      call_id: callId,
    };

    const { error } = await supabase.from("polls").insert([pollData]);

    if (error) {
      setError("Failed to create poll. Try again.");
    } else {
      setTimeout(() => {
        onClose();
      }, 100);
    }
    setLoading(false);
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[101]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
        <h2 className="text-lg font-bold mb-4">Create Poll</h2>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <input
          type="text"
          placeholder="Enter question"
          className="w-full p-2 border rounded mb-2 text-black"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        {options.map((option, index) => (
          <input
            key={index}
            type="text"
            placeholder={`Option ${index + 1}`}
            className="w-full p-2 border rounded mb-2 text-black"
            value={option}
            onChange={(e) => updateOption(index, e.target.value)}
          />
        ))}

        <button
          onClick={addOption}
          className={`flex items-center text-blue-500 text-black mt-2 ${
            options.length >= 5 ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={options.length >= 5}
        >
          <PlusCircle size={20} className="mr-1" />
          Add Option
        </button>

        <div className="flex justify-end mt-4">
          <button className="p-2 bg-red-500 text-white rounded mr-2" onClick={onClose}>
            Close
          </button>
          <button
            className="p-2 bg-blue-500 text-white rounded"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Poll"}
          </button>
        </div>
      </div>
    </div>,
    document.body // Attach modal directly to body
  );
};

export default CreatePollModal;
