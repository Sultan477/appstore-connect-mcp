import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  AppCategoriesGetCollectionData,
  AppCategoriesGetCollectionResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";
import { toArray } from "../lib/query.ts";

const platformEnum = z.enum(["IOS", "MAC_OS", "TV_OS", "VISION_OS"]);

export const schema = {
  limit: z
    .number()
    .min(1)
    .max(200)
    .default(100)
    .describe(
      "Maximum number of app categories to return (default 100, max 200)"
    ),
  "filter.platforms": z
    .union([platformEnum, z.array(platformEnum)])
    .optional()
    .describe("Filter by platform(s)"),
  "exists.parent": z
    .boolean()
    .optional()
    .describe(
      "Filter by existence of parent category (true = subcategories only)"
    ),
};
export const metadata: ToolMetadata = {
  name: "list-app-categories",
  description: "List App Store categories (reference for app metadata)",
  annotations: {
    title: "List app categories",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function listAppCategoriesTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const query: NonNullable<AppCategoriesGetCollectionData["query"]> = {
    limit: args.limit,
    ...(toArray(args["filter.platforms"])?.length && {
      "filter[platforms]": toArray(args["filter.platforms"])!,
    }),
    ...(args["exists.parent"] !== undefined && {
      "exists[parent]": args["exists.parent"],
    }),
  };
  const result =
    await client.api.AppCategories.appCategoriesGetCollection({ query });
  const data = unwrapApiResult<AppCategoriesGetCollectionResponse>(result);
  return JSON.stringify(data, null, 2);
}
