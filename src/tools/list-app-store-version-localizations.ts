import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type { AppStoreVersionsAppStoreVersionLocalizationsGetToManyRelatedData } from "@rage-against-the-pixel/app-store-connect-api";
import type { AppStoreVersionLocalizationsResponse } from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";
import { toArray } from "../lib/query.ts";

export const schema = {
  appStoreVersionId: z
    .string()
    .describe("App Store Connect app store version ID (required)"),
  limit: z
    .number()
    .min(1)
    .max(200)
    .default(100)
    .describe(
      "Maximum number of localizations to return (default 100, max 200)"
    ),
  "filter.locale": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by locale(s) (e.g. en-US)"),
};
export const metadata: ToolMetadata = {
  name: "list-app-store-version-localizations",
  description:
    "List localizations for a specific App Store version (metadata per locale)",
  annotations: {
    title: "List app store version localizations",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function listAppStoreVersionLocalizationsTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const opts: Pick<
    AppStoreVersionsAppStoreVersionLocalizationsGetToManyRelatedData,
    "path" | "query"
  > = {
    path: { id: args.appStoreVersionId },
    query: {
      limit: args.limit,
      ...(toArray(args["filter.locale"])?.length && {
        "filter[locale]": toArray(args["filter.locale"])!,
      }),
    },
  };
  const result =
    await client.api.AppStoreVersions.appStoreVersionsAppStoreVersionLocalizationsGetToManyRelated(
      opts
    );
  const data = unwrapApiResult<AppStoreVersionLocalizationsResponse>(result);
  return JSON.stringify(data, null, 2);
}
