import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  AppsGetCollectionData,
  AppsGetCollectionResponse,
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
    .describe("Maximum number of apps to return (default 100, max 200)"),
  "filter.bundleId": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by bundle identifier(s)"),
  "filter.name": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by app name(s)"),
  "filter.sku": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by SKU(s)"),
  "filter.id": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by app ID(s)"),
};

export const metadata: ToolMetadata = {
  name: "list-apps",
  description: "Get a list of all apps in App Store Connect",
  annotations: {
    title: "List apps",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function listAppsTool(args: InferSchema<typeof schema>) {
  const client = getClient();
  const query: NonNullable<AppsGetCollectionData["query"]> = {
    limit: args.limit,
    ...(toArray(args["filter.bundleId"])?.length && {
      "filter[bundleId]": toArray(args["filter.bundleId"])!,
    }),
    ...(toArray(args["filter.name"])?.length && {
      "filter[name]": toArray(args["filter.name"])!,
    }),
    ...(toArray(args["filter.sku"])?.length && {
      "filter[sku]": toArray(args["filter.sku"])!,
    }),
    ...(toArray(args["filter.id"])?.length && {
      "filter[id]": toArray(args["filter.id"])!,
    }),
  };
  const result = await client.api.Apps.appsGetCollection({ query });
  const data = unwrapApiResult<AppsGetCollectionResponse>(result);
  return JSON.stringify(data, null, 2);
}
