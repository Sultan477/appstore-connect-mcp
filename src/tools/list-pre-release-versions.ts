import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  PreReleaseVersionsGetCollectionData,
  PreReleaseVersionsGetCollectionResponse,
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
      "Maximum number of pre-release versions to return (default 100, max 200)"
    ),
  "filter.app": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by app ID(s)"),
  "filter.platform": z
    .union([platformEnum, z.array(platformEnum)])
    .optional()
    .describe("Filter by platform(s)"),
  "filter.version": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by version string(s)"),
  "filter.id": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by pre-release version ID(s)"),
};
export const metadata: ToolMetadata = {
  name: "list-pre-release-versions",
  description:
    "List pre-release versions (TestFlight) for an app or across apps",
  annotations: {
    title: "List pre-release versions",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function listPreReleaseVersionsTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const query: NonNullable<
    PreReleaseVersionsGetCollectionData["query"]
  > = {
    limit: args.limit,
    ...(toArray(args["filter.app"])?.length && {
      "filter[app]": toArray(args["filter.app"])!,
    }),
    ...(toArray(args["filter.platform"])?.length && {
      "filter[platform]": toArray(args["filter.platform"])!,
    }),
    ...(toArray(args["filter.version"])?.length && {
      "filter[version]": toArray(args["filter.version"])!,
    }),
    ...(toArray(args["filter.id"])?.length && {
      "filter[id]": toArray(args["filter.id"])!,
    }),
  };
  const result =
    await client.api.PreReleaseVersions.preReleaseVersionsGetCollection({
      query,
    });
  const data = unwrapApiResult<PreReleaseVersionsGetCollectionResponse>(result);
  return JSON.stringify(data, null, 2);
}
