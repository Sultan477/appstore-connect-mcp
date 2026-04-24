import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  AppsAppStoreVersionsGetToManyRelatedData,
  AppStoreVersionsResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";
import { toArray } from "../lib/query.ts";

const platformEnum = z.enum(["IOS", "MAC_OS", "TV_OS", "VISION_OS"]);
const appVersionStateEnum = z.enum([
  "ACCEPTED",
  "DEVELOPER_REJECTED",
  "IN_REVIEW",
  "INVALID_BINARY",
  "METADATA_REJECTED",
  "PENDING_APPLE_RELEASE",
  "PENDING_DEVELOPER_RELEASE",
  "PREPARE_FOR_SUBMISSION",
  "PROCESSING_FOR_DISTRIBUTION",
  "READY_FOR_DISTRIBUTION",
  "READY_FOR_REVIEW",
  "REJECTED",
  "REPLACED_WITH_NEW_VERSION",
  "WAITING_FOR_EXPORT_COMPLIANCE",
  "WAITING_FOR_REVIEW",
]);

export const schema = {
  appId: z
    .string()
    .describe("App ID (required). List App Store versions for this app."),
  limit: z
    .number()
    .min(1)
    .max(200)
    .default(100)
    .describe("Maximum number of versions to return (default 100, max 200)"),
  "filter.platform": z
    .union([platformEnum, z.array(platformEnum)])
    .optional()
    .describe("Filter by platform(s)"),
  "filter.versionString": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by version string(s)"),
  "filter.appVersionState": z
    .union([appVersionStateEnum, z.array(appVersionStateEnum)])
    .optional()
    .describe("Filter by app version state(s)"),
  "filter.id": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by version ID(s)"),
};
export const metadata: ToolMetadata = {
  name: "list-app-store-versions",
  description: "List App Store versions for an app (by app ID)",
  annotations: {
    title: "List app store versions",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function listAppStoreVersionsTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const query: NonNullable<
    AppsAppStoreVersionsGetToManyRelatedData["query"]
  > = {
    limit: args.limit,
    ...(toArray(args["filter.platform"])?.length && {
      "filter[platform]": toArray(args["filter.platform"])!,
    }),
    ...(toArray(args["filter.versionString"])?.length && {
      "filter[versionString]": toArray(args["filter.versionString"])!,
    }),
    ...(toArray(args["filter.appVersionState"])?.length && {
      "filter[appVersionState]": toArray(args["filter.appVersionState"])!,
    }),
    ...(toArray(args["filter.id"])?.length && {
      "filter[id]": toArray(args["filter.id"])!,
    }),
  };
  const result =
    await client.api.Apps.appsAppStoreVersionsGetToManyRelated({
      path: { id: args.appId },
      query,
    });
  const data = unwrapApiResult<AppStoreVersionsResponse>(result);
  return JSON.stringify(data, null, 2);
}
