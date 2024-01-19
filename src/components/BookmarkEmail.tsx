import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { SearchRequestService } from "../services/SearchRequestService";

export const BookmarkEmail: React.FC = () => {
  const [bookmarks, setBookmarks] = useState();
  const location = useLocation();

  useEffect(() => {
    const [_, _email, _type, sessionId] = location.pathname.split("/");
    const fetchBookmarkEmailData = async () => {
      const data = await SearchRequestService.getBookmarkEmail(sessionId);
      console.log(data)
      setBookmarks(data);
    };

    fetchBookmarkEmailData();
  }, []);

  return <div>Bookmark Email</div>;
};
