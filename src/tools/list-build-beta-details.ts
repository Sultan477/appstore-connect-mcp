import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  BuildBetaDetailsGetCollectionData,
  BuildBetaDetailsGetCollectionResponse,
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
    .describe(
      "Maximum number of build beta details to return (default 100, max 200)"
    ),
  "filter.build": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by build ID(s)"),
  "filter.id": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by build beta detail ID(s)"),
};
export const metadata: ToolMetadata = {
  name: "list-build-beta-details",
  description:
    "List build beta details (export compliance, auto-notify, internal/external state) for TestFlight builds",
  annotations: {
    title: "List build beta details",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function listBuildBetaDetailsTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const query: NonNullable<BuildBetaDetailsGetCollectionData["query"]> = {
    limit: args.limit,
    ...(toArray(args["filter.build"])?.length && {
      "filter[build]": toArray(args["filter.build"])!,
    }),
    ...(toArray(args["filter.id"])?.length && {
      "filter[id]": toArray(args["filter.id"])!,
    }),
  };
  const result =
    await client.api.BuildBetaDetails.buildBetaDetailsGetCollection({
      query,
    });
  const data = unwrapApiResult<BuildBetaDetailsGetCollectionResponse>(result);
  return JSON.stringify(data, null, 2);
}
