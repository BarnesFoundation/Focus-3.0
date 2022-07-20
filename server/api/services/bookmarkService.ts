import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default class BookmarkService {
  public static async subscribeUserNewsletter(emailToSubscribe: string) {
    const now = new Date(Date.now()).toISOString();

    const currentSubscription = await prisma.subscriptions.upsert({
      where: { email: emailToSubscribe },
      update: {},
      create: {
        email: emailToSubscribe,
        created_at: now,
        updated_at: now,
      },
    });

    // TODO - Implement the SubscribeToNewsletter job
    // SubscribeToNewsletterJob.perform_later(subscription.id);
  }
}
