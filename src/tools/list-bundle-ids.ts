import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  BundleIdsGetCollectionData,
  BundleIdsGetCollectionResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";
import { toArray } from "../lib/query.ts";

const platformEnum = z.enum(["IOS", "MAC_OS", "UNIVERSAL"]);

export const schema = {
  limit: z
    .number()
    .min(1)
    .max(200)
    .default(100)
    .describe("Maximum number of bundle IDs to return (default 100, max 200)"),
  "filter.identifier": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by bundle identifier(s)"),
  "filter.platform": z
    .union([platformEnum, z.array(platformEnum)])
    .optional()
    .describe("Filter by platform(s)"),
  "filter.name": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by name(s)"),
  "filter.id": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by bundle ID(s)"),
};
export const metadata: ToolMetadata = {
  name: "list-bundle-ids",
  description: "Get a list of bundle IDs registered in your team",
  annotations: {
    title: "List bundle IDs",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function listBundleIdsTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const query: NonNullable<BundleIdsGetCollectionData["query"]> = {
    limit: args.limit,
    ...(toArray(args["filter.identifier"])?.length && {
      "filter[identifier]": toArray(args["filter.identifier"])!,
    }),
    ...(toArray(args["filter.platform"])?.length && {
      "filter[platform]": toArray(args["filter.platform"])!,
    }),
    ...(toArray(args["filter.name"])?.length && {
      "filter[name]": toArray(args["filter.name"])!,
    }),
    ...(toArray(args["filter.id"])?.length && {
      "filter[id]": toArray(args["filter.id"])!,
    }),
  };
  const result = await client.api.BundleIds.bundleIdsGetCollection({
    query,
  });
  const data = unwrapApiResult<BundleIdsGetCollectionResponse>(result);
  return JSON.stringify(data, null, 2);
}
