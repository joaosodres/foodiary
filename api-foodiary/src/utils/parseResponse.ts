import { HttpResponse } from "../types/Http";

export function parseResponse(response: HttpResponse): {
  statusCode: number;
  body: string | undefined;
} {
  return {
    statusCode: response.statusCode,
    body: response.body ? JSON.stringify(response.body) : undefined,
  };
}
