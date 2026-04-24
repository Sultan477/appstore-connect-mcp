import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  NominationsGetCollectionData,
  NominationsGetCollectionResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";
import { toArray } from "../lib/query.ts";

const stateEnum = z.enum(["DRAFT", "SUBMITTED", "ARCHIVED"]);
const typeEnum = z.enum(["APP_LAUNCH", "APP_ENHANCEMENTS", "NEW_CONTENT"]);

export const schema = {
  "filter.state": z
    .union([stateEnum, z.array(stateEnum)])
    .describe("Filter by nomination state(s) (required)"),
  limit: z
    .number()
    .min(1)
    .max(200)
    .default(100)
    .describe(
      "Maximum number of nominations to return (default 100, max 200)"
    ),
  "filter.relatedApps": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by related app ID(s)"),
  "filter.type": z
    .union([typeEnum, z.array(typeEnum)])
    .optional()
    .describe("Filter by nomination type(s)"),
};
export const metadata: ToolMetadata = {
  name: "list-nominations",
  description:
    "List App Store nominations (e.g. custom product pages, in-app events)",
  annotations: {
    title: "List nominations",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function listNominationsTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const query: NonNullable<NominationsGetCollectionData["query"]> = {
    "filter[state]": toArray(args["filter.state"])!,
    limit: args.limit,
    ...(toArray(args["filter.relatedApps"])?.length && {
      "filter[relatedApps]": toArray(args["filter.relatedApps"])!,
    }),
    ...(toArray(args["filter.type"])?.length && {
      "filter[type]": toArray(args["filter.type"])!,
    }),
  };
  const result =
    await client.api.Nominations.nominationsGetCollection({ query });
  const data = unwrapApiResult<NominationsGetCollectionResponse>(result);
  return JSON.stringify(data, null, 2);
}
