import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  BetaGroupsGetCollectionData,
  BetaGroupsGetCollectionResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";
import { toArray } from "../lib/query.ts";

export const schema = {
  limit: z
    .number()
    .min(1)
    .max(200)
    .default(100)
    .describe("Maximum number of groups to return (default 100, max 200)"),
  "filter.app": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by app ID(s)"),
  "filter.name": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by group name(s)"),
  "filter.id": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by beta group ID(s)"),
};
export const metadata: ToolMetadata = {
  name: "list-beta-groups",
  description: "Get a list of all beta groups (internal and external)",
  annotations: {
    title: "List beta groups",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function listBetaGroupsTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const query: NonNullable<BetaGroupsGetCollectionData["query"]> = {
    limit: args.limit,
    ...(toArray(args["filter.app"])?.length && {
      "filter[app]": toArray(args["filter.app"])!,
    }),
    ...(toArray(args["filter.name"])?.length && {
      "filter[name]": toArray(args["filter.name"])!,
    }),
    ...(toArray(args["filter.id"])?.length && {
      "filter[id]": toArray(args["filter.id"])!,
    }),
  };
  const result = await client.api.BetaGroups.betaGroupsGetCollection({
    query,
  });
  const data = unwrapApiResult<BetaGroupsGetCollectionResponse>(result);
  return JSON.stringify(data, null, 2);
}
