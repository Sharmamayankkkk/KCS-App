import { ReactNode } from "react";

interface StreamThemeProps {
  children: ReactNode;
}

const StreamTheme = ({ children }: StreamThemeProps) => {
  return (
    <div className="stream-theme">
      {children}
    </div>
  );
};

export default StreamTheme;
