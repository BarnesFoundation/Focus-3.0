import { PrismaClient } from "@prisma/client";

import { GraphCMSService } from "../services";
import { slugify } from "../utils";

const prisma = new PrismaClient();

class StorySyncJob {
  public static async main() {
    const fetchedStories = await GraphCMSService.fetchAllStories();
    console.log(
      `There are a total of ${fetchedStories.length} stories to persist in the database`
    );

    const now = new Date(Date.now()).toISOString();

    const preparedStories = fetchedStories.map((story) => ({
      title: story.storyTitle,
      slug: slugify(story.storyTitle),
      created_at: now,
      updated_at: now,
      story_uid: story.id,
    }));

    await prisma.$transaction(
      preparedStories.map((story) =>
        prisma.stories.upsert({
          where: { story_uid: story.story_uid },
          update: {
            title: story.title,
            slug: story.slug,
            updated_at: now,
          },
          create: story,
        })
      )
    );

    console.log(
      `Completed saving ${preparedStories.length} stories in the database`
    );
  }
}

export default StorySyncJob;
