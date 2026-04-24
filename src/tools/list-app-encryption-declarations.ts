import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  AppEncryptionDeclarationsGetCollectionData,
  AppEncryptionDeclarationsGetCollectionResponse,
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
      "Maximum number of app encryption declarations to return (default 100, max 200)"
    ),
  "filter.app": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by app ID(s)"),
  "filter.builds": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by build ID(s)"),
  "filter.platform": z
    .union([platformEnum, z.array(platformEnum)])
    .optional()
    .describe("Filter by platform(s)"),
};
export const metadata: ToolMetadata = {
  name: "list-app-encryption-declarations",
  description:
    "List app encryption declarations (export compliance, encryption usage)",
  annotations: {
    title: "List app encryption declarations",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function listAppEncryptionDeclarationsTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const query: NonNullable<AppEncryptionDeclarationsGetCollectionData["query"]> =
    {
      limit: args.limit,
      ...(toArray(args["filter.app"])?.length && {
        "filter[app]": toArray(args["filter.app"])!,
      }),
      ...(toArray(args["filter.builds"])?.length && {
        "filter[builds]": toArray(args["filter.builds"])!,
      }),
      ...(toArray(args["filter.platform"])?.length && {
        "filter[platform]": toArray(args["filter.platform"])!,
      }),
    };
  const result =
    await client.api.AppEncryptionDeclarations.appEncryptionDeclarationsGetCollection(
      { query }
    );
  const data = unwrapApiResult<AppEncryptionDeclarationsGetCollectionResponse>(
    result
  );
  return JSON.stringify(data, null, 2);
}
