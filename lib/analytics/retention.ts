export const RETENTION_DAYS = 90;

interface Db { visitSession: { deleteMany(args: { where: { lastSeenAt: { lt: Date } } }): Promise<{ count: number }> } }

/** Deletes visits last seen more than RETENTION_DAYS ago. Page views and events go with them (cascade). Nothing else is touched. */
export async function deleteExpired(db: Db, now: Date = new Date()): Promise<{ sessions: number }> {
  const cutoff = new Date(now.getTime() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const { count } = await db.visitSession.deleteMany({ where: { lastSeenAt: { lt: cutoff } } });
  return { sessions: count };
}
