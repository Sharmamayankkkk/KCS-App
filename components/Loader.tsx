import React from "react";

const Loader: React.FC = () => (
  <div className="m-0 bg-background flex justify-center items-center h-screen w-screen">
    <div className="loader-container relative w-[300px] overflow-hidden max-w-[80vw]">
      <img
        src="/icons/KCS-Logo.png"
        alt="KCS Logo"
        className="loader-img w-full h-auto block"
      />
      <div className="shine" />
      <style jsx>{`
        .shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            120deg,
            transparent 0%,
            rgba(255, 255, 255, 0.3) 50%,
            transparent 100%
          );
          animation: shineAnim 2s linear infinite;
          z-index: 2;
        }
        @keyframes shineAnim {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </div>
  </div>
);

export default Loader;
