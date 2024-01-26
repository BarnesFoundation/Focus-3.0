import React, { Suspense, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { SearchRequestService } from "../services/SearchRequestService";
import { Email } from "./Email";

export const BookmarkEmail: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const sr = new SearchRequestService();

  useEffect(() => {
    const [_, _email, _type, sessionId] = location.pathname.split("/");
    const fetchBookmarkEmailData = async () => {
      const data = await sr.getBookmarkEmail(sessionId);
      setBookmarks(data.bookmarkArtworkList);
      setTranslations(data.translations);
      setLoading(false);
    };

    fetchBookmarkEmailData();
  }, []);

  return (
    <Suspense fallback={<div></div>}>
      {!loading && (
        <Email
          bookmarks={bookmarks}
          subject="Thank you for visiting the Barnes today!"
          messageHeader={translations["text_1"]["translated_content"]}
          messageText={translations["text_2"]["translated_content"]}
        />
      )}
    </Suspense>
  );
};
