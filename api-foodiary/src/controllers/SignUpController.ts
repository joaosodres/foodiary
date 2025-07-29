import z from "zod";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";

import { HttpRequest, HttpResponse } from "../types/Http";
import { badRequest, conflict, ok } from "../utils/http";
import { db } from "../db";
import { usersTable } from "../db/schema";
import { generateAccessToken } from "../libs/jwt";
import { calculateGoals } from "../libs/goalCalculator";

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

    const goals = calculateGoals({
      weight: rest.weight,
      height: rest.height,
      gender: rest.gender,
      birthDate: new Date(rest.birthDate),
      activityLevel: rest.activityLevel,
      goal: rest.goal,
    });

    const hashedPassword = await hash(account.password, 8);

    const [user] = await db
    .insert(usersTable)
    .values({
      ...rest,
      ...account,
      ...goals,
      password: hashedPassword
    })
    .returning({
      id: usersTable.id,
    });

    const accessToken = generateAccessToken(user.id);

    return ok({accessToken});
  }
}
