import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  ActorsGetCollectionData,
  ActorsGetCollectionResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";
import { toArray } from "../lib/query.ts";

export const schema = {
  "filter.id": z
    .union([z.string(), z.array(z.string())])
    .describe("Actor ID(s) to fetch (required). Get IDs from submission/version responses."),
  limit: z.number().min(1).max(200).default(50).optional(),
};

export const metadata: ToolMetadata = {
  name: "list-actors",
  description:
    "List actors (users or API keys) by ID(s). Use when you have actor IDs from review submissions or version history.",
  annotations: {
    title: "List actors",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function listActorsTool(args: InferSchema<typeof schema>) {
  const client = getClient();
  const ids = toArray(args["filter.id"]);
  if (!ids?.length) throw new Error("At least one filter[id] is required");
  const query: NonNullable<ActorsGetCollectionData["query"]> = {
    "filter[id]": ids,
    limit: args.limit ?? 50,
  };
  const result = await client.api.Actors.actorsGetCollection({ query });
  const data = unwrapApiResult<ActorsGetCollectionResponse>(result);
  return JSON.stringify(data, null, 2);
}
