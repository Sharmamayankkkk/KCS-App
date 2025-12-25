import React from "react";

const Loader: React.FC = () => (
  <div
    style={{
      margin: 0,
      background: "#F8FAFC",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      width: "100vw",
    }}
  >
    <div className="loader-container" style={{
      position: "relative",
      width: 300,
      overflow: "hidden",
      maxWidth: "80vw",
    }}>
      <img
        src="/icons/KCS-Logo.png"
        alt="KCS Logo"
        className="loader-img"
        style={{
          width: "100%",
          height: "auto",
          display: "block",
        }}
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
