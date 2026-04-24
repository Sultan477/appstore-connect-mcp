import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  BetaAppReviewDetailsGetCollectionData,
  BetaAppReviewDetailsGetCollectionResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";
import { toArray } from "../lib/query.ts";

export const schema = {
  "filter.app": z
    .union([z.string(), z.array(z.string())])
    .describe("App ID(s) (required). Beta app review details for this app."),
  limit: z
    .number()
    .min(1)
    .max(200)
    .default(100)
    .describe(
      "Maximum number of beta app review details to return (default 100, max 200)"
    ),
  "filter.id": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by beta app review detail ID(s)"),
};
export const metadata: ToolMetadata = {
  name: "list-beta-app-review-details",
  description:
    "List TestFlight (beta) app review details for an app (contact info, demo account, notes)",
  annotations: {
    title: "List beta app review details",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function listBetaAppReviewDetailsTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const query: NonNullable<BetaAppReviewDetailsGetCollectionData["query"]> = {
    "filter[app]": toArray(args["filter.app"])!,
    limit: args.limit,
    ...(toArray(args["filter.id"])?.length && {
      "filter[id]": toArray(args["filter.id"])!,
    }),
  };
  const result =
    await client.api.BetaAppReviewDetails.betaAppReviewDetailsGetCollection({
      query,
    });
  const data = unwrapApiResult<BetaAppReviewDetailsGetCollectionResponse>(
    result
  );
  return JSON.stringify(data, null, 2);
}
