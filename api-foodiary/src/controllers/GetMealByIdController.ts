import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "../db";
import { mealsTable, usersTable } from "../db/schema";
import { ProtectedHttpRequest, HttpResponse } from "../types/Http";
import { badRequest, created, ok, unauthorized } from "../utils/http";
import z from "zod";

const schema = z.object({
  mealId: z.uuid(),
});

export class GetMealByIdController {
  static async handle({ userId, params }: ProtectedHttpRequest): Promise<HttpResponse> {
    const { success, data, error } = schema.safeParse(params);

    if (!success) {
      return badRequest({errors: error.issues});
    }

    const meals = await db.query.mealsTable.findFirst({
      columns: {
        id: true,
        foods: true,
        createdAt: true,
        icon: true,
        name: true,
        status: true,
      },
      where: and(
        eq(mealsTable.id, data.mealId),
        eq(mealsTable.userId, userId)
      )
    });

    return ok({meals});
  }
}
