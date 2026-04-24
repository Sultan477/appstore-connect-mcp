import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  ReviewSubmissionsGetCollectionData,
  ReviewSubmissionsGetCollectionResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";
import { toArray } from "../lib/query.ts";

const platformEnum = z.enum(["IOS", "MAC_OS", "TV_OS", "VISION_OS"]);
const stateEnum = z.enum([
  "READY_FOR_REVIEW",
  "WAITING_FOR_REVIEW",
  "IN_REVIEW",
  "UNRESOLVED_ISSUES",
  "CANCELING",
  "COMPLETING",
  "COMPLETE",
]);

export const schema = {
  "filter.app": z
    .union([z.string(), z.array(z.string())])
    .describe("App ID(s) (required). Submission history for this app."),
  limit: z
    .number()
    .min(1)
    .max(200)
    .default(100)
    .describe(
      'Maximum number of review submissions to return (default 100, max 200)'
    ),
  "filter.platform": z
    .union([platformEnum, z.array(platformEnum)])
    .optional()
    .describe("Filter by platform(s)"),
  "filter.state": z
    .union([stateEnum, z.array(stateEnum)])
    .optional()
    .describe("Filter by submission state(s)"),
};

const RESOLUTION_CENTER_NOTICE = {
  notice:
    "The rejection reason text (Guideline, what to fix) is NOT in the API.",
  whereToView:
    "App Store Connect → App → Version → Resolution Center (or 'Unresolved issues') in the browser.",
};

export const metadata: ToolMetadata = {
  name: "list-review-submissions",
  description:
    "List App Store review submissions for an app (submission history). Filter by state (e.g. UNRESOLVED_ISSUES for rejected). Note: the actual rejection message is only visible in App Store Connect → Version → Resolution Center, not in the API.",
  annotations: {
    title: "List review submissions",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function listReviewSubmissionsTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const query: NonNullable<ReviewSubmissionsGetCollectionData["query"]> = {
    "filter[app]": toArray(args["filter.app"])!,
    limit: args.limit,
    ...(toArray(args["filter.platform"])?.length && {
      "filter[platform]": toArray(args["filter.platform"])!,
    }),
    ...(toArray(args["filter.state"])?.length && {
      "filter[state]": toArray(args["filter.state"])!,
    }),
  };
  const result =
    await client.api.ReviewSubmissions.reviewSubmissionsGetCollection({
      query,
    });
  const data = unwrapApiResult<ReviewSubmissionsGetCollectionResponse>(result);
  return JSON.stringify(
    { ...data, resolutionCenter: RESOLUTION_CENTER_NOTICE },
    null,
    2
  );
}
