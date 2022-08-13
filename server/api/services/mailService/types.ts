export const BookmarkEmail = "BookmarkEmail" as const;
export const StoryEmail = "StoryEmail" as const;
export const TestEmail = "TestEmail" as const;

export const Templates = {
  BookmarkEmail,
  StoryEmail,
  TestEmail,
};

export type TemplatesType = keyof typeof Templates;
