import React, { Suspense, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { SearchRequestService } from "../services/SearchRequestService";
import { Email } from "./Email";

export const StoryEmail: React.FC = () => {
  const [stories, setStories] = useState<any[]>([]);
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const sr = new SearchRequestService();

  useEffect(() => {
    const [_, _email, _type, sessionId] = location.pathname.split("/");
    const fetchBookmarkEmailData = async () => {
      const data = await sr.getStoryEmail(sessionId);
      console.log(data);
      setStories(data.bookmarkStoryList);
      setTranslations(data.translations);
      setLoading(false);
    };

    fetchBookmarkEmailData();
  }, []);

  return (
    <Suspense fallback={<div></div>}>
      {!loading && (
        <Email
          subject="Stories you've unlocked at the Barnes today!"
          messageHeader={translations["text_3"]["translated_content"]}
          messageText={translations["text_4"]["translated_content"]}
          promoText={translations["text_5"]["translated_content"]}
          promoLinkText={translations["text_6"]["translated_content"]}
          stories={stories}
        />
      )}
    </Suspense>
  );
};
