import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  BetaAppReviewSubmissionsGetCollectionData,
  BetaAppReviewSubmissionsGetCollectionResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";
import { toArray } from "../lib/query.ts";

const betaReviewStateEnum = z.enum([
  "WAITING_FOR_REVIEW",
  "IN_REVIEW",
  "REJECTED",
  "APPROVED",
]);

export const schema = {
  "filter.build": z
    .union([z.string(), z.array(z.string())])
    .describe(
      "Build ID(s) (required). Beta app review submissions for this build."
    ),
  limit: z
    .number()
    .min(1)
    .max(200)
    .default(100)
    .describe(
      "Maximum number of beta app review submissions to return (default 100, max 200)"
    ),
  "filter.betaReviewState": z
    .union([betaReviewStateEnum, z.array(betaReviewStateEnum)])
    .optional()
    .describe("Filter by beta review state(s)"),
};
export const metadata: ToolMetadata = {
  name: "list-beta-app-review-submissions",
  description:
    "List TestFlight (beta) app review submissions for a build",
  annotations: {
    title: "List beta app review submissions",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function listBetaAppReviewSubmissionsTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const query: NonNullable<BetaAppReviewSubmissionsGetCollectionData["query"]> =
    {
      "filter[build]": toArray(args["filter.build"])!,
      limit: args.limit,
      ...(toArray(args["filter.betaReviewState"])?.length && {
        "filter[betaReviewState]": toArray(args["filter.betaReviewState"])!,
      }),
    };
  const result =
    await client.api.BetaAppReviewSubmissions.betaAppReviewSubmissionsGetCollection(
      { query }
    );
  const data = unwrapApiResult<BetaAppReviewSubmissionsGetCollectionResponse>(
    result
  );
  return JSON.stringify(data, null, 2);
}
