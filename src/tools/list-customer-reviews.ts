import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  AppStoreVersionsCustomerReviewsGetToManyRelatedData,
  AppStoreVersionsCustomerReviewsGetToManyRelatedResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";

const sortEnum = z.enum([
  "rating",
  "-rating",
  "createdDate",
  "-createdDate",
]);

export const schema = {
  appStoreVersionId: z
    .string()
    .describe(
      "App Store version ID (from list-app-store-versions or get-app with include appStoreVersions)"
    ),
  limit: z
    .number()
    .min(1)
    .max(200)
    .default(50)
    .describe("Maximum number of reviews to return (default 50, max 200)"),
  "filter.rating": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by rating(s), e.g. 1, 2, 3, 4, 5"),
  "exists.publishedResponse": z
    .boolean()
    .optional()
    .describe("Filter by whether a developer response exists"),
  sort: z
    .union([sortEnum, z.array(sortEnum)])
    .optional()
    .describe("Sort by rating or createdDate (prefix - for descending)"),
};

export const metadata: ToolMetadata = {
  name: "list-customer-reviews",
  description:
    "List App Store customer reviews for an app store version (rating, title, body, response)",
  annotations: {
    title: "List customer reviews",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function listCustomerReviewsTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const query: NonNullable<
    AppStoreVersionsCustomerReviewsGetToManyRelatedData["query"]
  > = {
    limit: args.limit,
    ...(args["filter.rating"] !== undefined && {
      "filter[rating]": Array.isArray(args["filter.rating"])
        ? args["filter.rating"]
        : [args["filter.rating"]!],
    }),
    ...(args["exists.publishedResponse"] !== undefined && {
      "exists[publishedResponse]": args["exists.publishedResponse"],
    }),
    ...(args.sort !== undefined && {
      sort: Array.isArray(args.sort) ? args.sort : [args.sort],
    }),
  };
  const result =
    await client.api.AppStoreVersions.appStoreVersionsCustomerReviewsGetToManyRelated(
      {
        path: { id: args.appStoreVersionId },
        query,
      }
    );
  const data =
    unwrapApiResult<AppStoreVersionsCustomerReviewsGetToManyRelatedResponse>(
      result
    );
  return JSON.stringify(data, null, 2);
}
