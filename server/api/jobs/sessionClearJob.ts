import { Store } from "../../utils";
import { DatabaseService } from "../services";

const prisma = DatabaseService.instance;

const prune = () =>
  new Promise((resolve, reject) => {
    Store.pruneSessions((err) => {
      if (err) {
        console.log(
          `An error occurred pruning expired sessions from database`,
          err
        );
        reject(err);
      }
      resolve("");
    });
  });

class SessionClearJob {
  public static async main() {
    const expiredSessions = await prisma.user_sessions.findMany({
      where: {
        // Get sessions where the expiration is less than the current time
        // which means the session is expired and can be cleared
        expire: {
          lte: new Date(),
        },
      },
    });

    console.log(
      `SessionClearJob identified ${expiredSessions.length} expired sessions. These will be cleared from the session store.`
    );
    await prune();

    return expiredSessions.length;
  }
}

export default SessionClearJob;
