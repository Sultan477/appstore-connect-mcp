import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  BetaTestersGetCollectionData,
  BetaTestersGetCollectionResponse,
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
    .describe("Maximum number of beta testers to return (default 100, max 200)"),
  "filter.apps": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by app ID(s)"),
  "filter.betaGroups": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by beta group ID(s)"),
  "filter.email": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by email(s)"),
  "filter.firstName": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by first name(s)"),
  "filter.lastName": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by last name(s)"),
  "filter.id": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by beta tester ID(s)"),
};
export const metadata: ToolMetadata = {
  name: "list-beta-testers",
  description: "Get a list of beta testers (optionally filter by app or beta group)",
  annotations: {
    title: "List beta testers",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function listBetaTestersTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const query: NonNullable<BetaTestersGetCollectionData["query"]> = {
    limit: args.limit,
    ...(toArray(args["filter.apps"])?.length && {
      "filter[apps]": toArray(args["filter.apps"])!,
    }),
    ...(toArray(args["filter.betaGroups"])?.length && {
      "filter[betaGroups]": toArray(args["filter.betaGroups"])!,
    }),
    ...(toArray(args["filter.email"])?.length && {
      "filter[email]": toArray(args["filter.email"])!,
    }),
    ...(toArray(args["filter.firstName"])?.length && {
      "filter[firstName]": toArray(args["filter.firstName"])!,
    }),
    ...(toArray(args["filter.lastName"])?.length && {
      "filter[lastName]": toArray(args["filter.lastName"])!,
    }),
    ...(toArray(args["filter.id"])?.length && {
      "filter[id]": toArray(args["filter.id"])!,
    }),
  };
  const result = await client.api.BetaTesters.betaTestersGetCollection({
    query,
  });
  const data = unwrapApiResult<BetaTestersGetCollectionResponse>(result);
  return JSON.stringify(data, null, 2);
}
