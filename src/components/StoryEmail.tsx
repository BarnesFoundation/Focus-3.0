import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const StoryEmail: React.FC = () => {
  const location = useLocation();

  // Get session id from path on page load
  useEffect(() => {
    const [_, _email, type, sessionId] = location.pathname.split("/");
  }, []);

  return <div>Story Email</div>;
};
