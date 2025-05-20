import React from "react"
import { useCallStateHooks } from "@stream-io/video-react-sdk"
import { ParticipantView } from "@stream-io/video-react-sdk"

const CustomGridLayout = () => {
  const { useParticipants } = useCallStateHooks()
  const participants = useParticipants()

  return (
    <div className="grid w-full h-full gap-4 p-4"
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(250px, 1fr))`,
        gridAutoRows: "minmax(150px, 1fr)",
      }}
    >
      {participants.map((participant) => (
        <div
          key={participant.sessionId}
          className="rounded-lg bg-black overflow-hidden shadow-md aspect-video flex"
        >
          <ParticipantView participant={participant} />
        </div>
      ))}
    </div>
  )
}

export default CustomGridLayout
