import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  BetaAppLocalizationsGetCollectionData,
  BetaAppLocalizationsGetCollectionResponse,
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
      "Maximum number of beta app localizations to return (default 100, max 200)"
    ),
  "filter.app": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by app ID(s)"),
  "filter.locale": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by locale(s) (e.g. en-US)"),
  "filter.id": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by beta app localization ID(s)"),
};
export const metadata: ToolMetadata = {
  name: "list-beta-app-localizations",
  description:
    "List TestFlight (beta) app localizations (feedback email, marketing URL, description per locale)",
  annotations: {
    title: "List beta app localizations",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function listBetaAppLocalizationsTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const query: NonNullable<BetaAppLocalizationsGetCollectionData["query"]> = {
    limit: args.limit,
    ...(toArray(args["filter.app"])?.length && {
      "filter[app]": toArray(args["filter.app"])!,
    }),
    ...(toArray(args["filter.locale"])?.length && {
      "filter[locale]": toArray(args["filter.locale"])!,
    }),
    ...(toArray(args["filter.id"])?.length && {
      "filter[id]": toArray(args["filter.id"])!,
    }),
  };
  const result =
    await client.api.BetaAppLocalizations.betaAppLocalizationsGetCollection({
      query,
    });
  const data = unwrapApiResult<BetaAppLocalizationsGetCollectionResponse>(result);
  return JSON.stringify(data, null, 2);
}
