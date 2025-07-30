import { eq } from "drizzle-orm";
import { db } from "../db";
import { mealsTable, usersTable } from "../db/schema";
import { ProtectedHttpRequest, HttpResponse } from "../types/Http";
import { badRequest, created, ok, unauthorized } from "../utils/http";
import z from "zod";

const schema = z.object({
  fileType: z.enum(["audio/m4a", "image/jpeg"]),
});

export class CreateMealController {
  static async handle({ userId, body }: ProtectedHttpRequest): Promise<HttpResponse> {
    const { success, data, error } = schema.safeParse(body);

    if (!success) {
      return badRequest({errors: error.issues});
    }

    const [meal] = await db
    .insert(mealsTable)
    .values({
      userId,
      inputFileKey: 'input_file_key',
      inputType: data.fileType === 'audio/m4a' ? 'audio' : 'picture',
      status: 'uploading',
      icon: '',
      name: '',
      foods: []
    })
    .returning({id: mealsTable.id});

    return created({ mealId: meal.id });
  }
}
