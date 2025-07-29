import { eq } from "drizzle-orm";
import { db } from "../db";
import { usersTable } from "../db/schema";
import { ProtectedHttpRequest, HttpResponse } from "../types/Http";
import { ok, unauthorized } from "../utils/http";

export class MeController {
  static async handle({ userId }: ProtectedHttpRequest): Promise<HttpResponse> {
    const user = await db.query.usersTable.findFirst({
      columns: {
        id: true,
        name: true,
        email: true,
        calories: true,
        proteins: true,
        carbs: true,
        fats: true,
      },
      where: eq(usersTable.id, userId),
    });

    if (!user) {
      return unauthorized({error: 'User not found'});
    }

    return ok({ user });
  }
}
