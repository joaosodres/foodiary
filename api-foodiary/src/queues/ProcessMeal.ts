import { eq } from "drizzle-orm";
import { db } from "../db";
import { mealsTable } from "../db/schema";

export class ProcessMeal {
  static async process({fileKey}: {fileKey: string}) {
    const meal = await db.query.mealsTable.findFirst({
      where: eq(mealsTable.inputFileKey, fileKey),
    });

    if (!meal) {
      throw new Error('Meal not found.');
    }

    if (meal.status === 'failed' || meal.status === 'success') {
      return;
    }
    await db
      .update(mealsTable)
      .set({ status: 'processing' })
      .where(eq(mealsTable.id, meal.id));

    try {
      /* CHAMAREMOS A IA PARA PROCESSAR A REFEICAO */
      await db.update(mealsTable)
      .set({status: 'success', name:'Café', icon: '🥐'})
      .where(eq(mealsTable.id, meal.id));
    } catch (error) {
      await db.update(mealsTable)
      .set({status: 'failed'})
      .where(eq(mealsTable.id, meal.id));
    }
  }
}
