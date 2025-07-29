import z from "zod";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";

import { HttpRequest, HttpResponse } from "../types/Http";
import { badRequest, conflict, ok } from "../utils/http";
import { db } from "../db";
import { usersTable } from "../db/schema";
import { generateAccessToken } from "../libs/jwt";

const schema = z.object({
  goal: z.enum(["lose", "maintain", "gain"]),
  gender: z.enum(["male", "female"]),
  birthDate: z.iso.date(),
  height: z.number(),
  weight: z.number(),
  activityLevel: z.number().min(1).max(5),
  account: z.object({
    name: z.string().min(1),
    email: z.email(),
    password: z.string().min(8),
  }),
});

export class SignUpController {
  static async handle({ body }: HttpRequest): Promise<HttpResponse> {
    const { success, data, error } = schema.safeParse(body);

    if (!success) {
      return badRequest({errors: error.issues});
    }

    const userAlreadyExists = await db.query.usersTable.findFirst({
      columns: {
        email: true,
      },
      where: eq(usersTable.email, data.account.email),
    });

    if (userAlreadyExists) {
      return conflict({error: 'User already exists'});
    }

    const  {account, ...rest} = data;

    const hashedPassword = await hash(account.password, 8);

    const [user] = await db
    .insert(usersTable)
    .values({
      ...rest,
      ...account,
      password: hashedPassword,
      calories: 0,
      proteins: 0,
      carbs: 0,
      fats: 0,
    })
    .returning({
      id: usersTable.id,
    });

    const accessToken = generateAccessToken(user.id);

    return ok({accessToken});
  }
}
