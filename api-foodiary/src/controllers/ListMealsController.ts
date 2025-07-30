import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "../db";
import { mealsTable, usersTable } from "../db/schema";
import { ProtectedHttpRequest, HttpResponse } from "../types/Http";
import { badRequest, created, ok, unauthorized } from "../utils/http";
import z from "zod";

const schema = z.object({
  date: z.iso.date().transform(dateString => new Date(dateString)),
});

export class ListMealsController {
  static async handle({ userId, queryParams }: ProtectedHttpRequest): Promise<HttpResponse> {
    const { success, data, error } = schema.safeParse(queryParams);

    if (!success) {
      return badRequest({errors: error.issues});
    }

    const endDate = new Date(data.date);
    endDate.setUTCHours(23, 59, 59, 999);

    const meals = await db.query.mealsTable.findMany({
      columns: {
        id: true,
        foods: true,
        createdAt: true,
        icon: true,
        name: true
      },
      where: and(
        eq(mealsTable.userId, userId),
        gte(mealsTable.createdAt, data.date),
        lte(mealsTable.createdAt, endDate),
        eq(mealsTable.status, 'success')
      )
    });

    return ok({meals});
  }
}
