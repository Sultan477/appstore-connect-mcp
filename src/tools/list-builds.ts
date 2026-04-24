import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  BuildsGetCollectionData,
  BuildsGetCollectionResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";
import { toArray } from "../lib/query.ts";

const processingStateEnum = z.enum([
  "PROCESSING",
  "FAILED",
  "INVALID",
  "VALID",
]);
const platformEnum = z.enum(["IOS", "MAC_OS", "TV_OS", "VISION_OS"]);

export const schema = {
  "filter.app": z
    .union([z.string(), z.array(z.string())])
    .describe("Filter by app ID(s) (required)"),
  limit: z
    .number()
    .min(1)
    .max(200)
    .default(50)
    .describe("Maximum number of builds to return (default 50, max 200)"),
  "filter.preReleaseVersion": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by pre-release version ID(s)"),
  "filter.version": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by build version string(s)"),
  "filter.processingState": z
    .union([processingStateEnum, z.array(processingStateEnum)])
    .optional()
    .describe("Filter by processing state(s)"),
  "filter.preReleaseVersion.platform": z
    .union([platformEnum, z.array(platformEnum)])
    .optional()
    .describe("Filter by pre-release platform(s)"),
  "filter.id": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by build ID(s)"),
};
export const metadata: ToolMetadata = {
  name: "list-builds",
  description: "List builds for an app (optionally filter by version)",
  annotations: {
    title: "List builds",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function listBuildsTool(args: InferSchema<typeof schema>) {
  const client = getClient();
  const query: NonNullable<BuildsGetCollectionData["query"]> = {
    limit: args.limit,
    "filter[app]": toArray(args["filter.app"])!,
    ...(toArray(args["filter.preReleaseVersion"])?.length && {
      "filter[preReleaseVersion]": toArray(args["filter.preReleaseVersion"])!,
    }),
    ...(toArray(args["filter.version"])?.length && {
      "filter[version]": toArray(args["filter.version"])!,
    }),
    ...(toArray(args["filter.processingState"])?.length && {
      "filter[processingState]": toArray(args["filter.processingState"])!,
    }),
    ...(toArray(args["filter.preReleaseVersion.platform"])?.length && {
      "filter[preReleaseVersion.platform]": toArray(
        args["filter.preReleaseVersion.platform"]
      )!,
    }),
    ...(toArray(args["filter.id"])?.length && {
      "filter[id]": toArray(args["filter.id"])!,
    }),
  };
  const result = await client.api.Builds.buildsGetCollection({ query });
  const data = unwrapApiResult<BuildsGetCollectionResponse>(result);
  return JSON.stringify(data, null, 2);
}
