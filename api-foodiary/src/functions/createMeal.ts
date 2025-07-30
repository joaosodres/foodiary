import { APIGatewayProxyEventV2 } from "aws-lambda";

import { parseProtectedEvent } from "../utils/parseProtectedEvent";
import { parseResponse } from "../utils/parseResponse";
import { CreateMealController } from "../controllers/CreateMealController";
import { unauthorized } from "../utils/http";

export async function handler(event: APIGatewayProxyEventV2){
  try {
    const request = parseProtectedEvent(event);
    const response = await CreateMealController.handle(request);
    return parseResponse(response);
  } catch (error) {
    return parseResponse(unauthorized({error: 'Invalid access token'}));
  }

}
