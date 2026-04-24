import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  UserInvitationsGetCollectionData,
  UserInvitationsGetCollectionResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";
import { toArray } from "../lib/query.ts";

const roleEnum = z.enum([
  "ADMIN",
  "FINANCE",
  "ACCOUNT_HOLDER",
  "SALES",
  "MARKETING",
  "APP_MANAGER",
  "DEVELOPER",
  "ACCESS_TO_REPORTS",
  "CUSTOMER_SUPPORT",
  "CREATE_APPS",
  "CLOUD_MANAGED_DEVELOPER_ID",
  "CLOUD_MANAGED_APP_DISTRIBUTION",
  "GENERATE_INDIVIDUAL_KEYS",
]);

export const schema = {
  limit: z
    .number()
    .min(1)
    .max(200)
    .default(100)
    .describe(
      "Maximum number of user invitations to return (default 100, max 200)"
    ),
  "filter.email": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by invite email(s)"),
  "filter.roles": z
    .union([roleEnum, z.array(roleEnum)])
    .optional()
    .describe("Filter by role(s)"),
  "filter.visibleApps": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by visible app ID(s)"),
};
export const metadata: ToolMetadata = {
  name: "list-user-invitations",
  description: "Get a list of pending user invitations to your team",
  annotations: {
    title: "List user invitations",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function listUserInvitationsTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const query: NonNullable<UserInvitationsGetCollectionData["query"]> = {
    limit: args.limit,
    ...(toArray(args["filter.email"])?.length && {
      "filter[email]": toArray(args["filter.email"])!,
    }),
    ...(toArray(args["filter.roles"])?.length && {
      "filter[roles]": toArray(args["filter.roles"])!,
    }),
    ...(toArray(args["filter.visibleApps"])?.length && {
      "filter[visibleApps]": toArray(args["filter.visibleApps"])!,
    }),
  };
  const result =
    await client.api.UserInvitations.userInvitationsGetCollection({ query });
  const data = unwrapApiResult<UserInvitationsGetCollectionResponse>(result);
  return JSON.stringify(data, null, 2);
}
