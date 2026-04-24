import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  AppsSubscriptionGroupsGetToManyRelatedData,
  AppsSubscriptionGroupsGetToManyRelatedResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";
import { toArray } from "../lib/query.ts";

export const schema = {
  appId: z
    .string()
    .describe("App ID. List subscription groups for this app."),
  limit: z
    .number()
    .min(1)
    .max(200)
    .default(50)
    .describe("Maximum number of groups to return (default 50, max 200)"),
  "filter.referenceName": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by reference name(s), e.g. Premium"),
};

export const metadata: ToolMetadata = {
  name: "list-subscription-groups",
  description:
    "List subscription groups for an app. Use the returned group IDs with list-subscription-group-subscriptions or create-subscription.",
  annotations: {
    title: "List subscription groups",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function listSubscriptionGroupsTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const query: NonNullable<
    AppsSubscriptionGroupsGetToManyRelatedData["query"]
  > = {
    limit: args.limit,
    ...(toArray(args["filter.referenceName"])?.length && {
      "filter[referenceName]": toArray(args["filter.referenceName"])!,
    }),
  };
  const result =
    await client.api.Apps.appsSubscriptionGroupsGetToManyRelated({
      path: { id: args.appId },
      query,
    } as AppsSubscriptionGroupsGetToManyRelatedData);
  const data =
    unwrapApiResult<AppsSubscriptionGroupsGetToManyRelatedResponse>(result);
  return JSON.stringify(data, null, 2);
}
