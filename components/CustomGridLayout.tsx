import React from "react";
import { useCallStateHooks, ParticipantView } from "@stream-io/video-react-sdk";
import { CustomParticipantViewUI } from "./CustomParticipantViewUI"; // ✅ 1. Import your custom component

const CustomGridLayout = () => {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();

  return (
    <div
      className="grid size-full gap-4 p-4"
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(250px, 1fr))`,
        gridAutoRows: "minmax(150px, 1fr)",
      }}
    >
      {participants.map((participant) => (
        <div
          key={participant.sessionId}
          className="flex aspect-video overflow-hidden rounded-lg bg-black shadow-md"
        >
          {/* ✅ 2. Pass your custom component as a prop */}
          <ParticipantView
            participant={participant}
            ParticipantViewUI={CustomParticipantViewUI}
          />
        </div>
      ))}
    </div>
  );
};

export default CustomGridLayout;
