import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import type {
  ProfilesGetCollectionData,
  ProfilesGetCollectionResponse,
} from "@rage-against-the-pixel/app-store-connect-api";
import { getClient } from "../lib/client.ts";
import { unwrapApiResult } from "../lib/api-error.ts";
import { toArray } from "../lib/query.ts";

const profileTypeEnum = z.enum([
  "IOS_APP_DEVELOPMENT",
  "IOS_APP_STORE",
  "IOS_APP_ADHOC",
  "IOS_APP_INHOUSE",
  "MAC_APP_DEVELOPMENT",
  "MAC_APP_STORE",
  "MAC_APP_DIRECT",
  "TVOS_APP_DEVELOPMENT",
  "TVOS_APP_STORE",
  "TVOS_APP_ADHOC",
  "TVOS_APP_INHOUSE",
  "MAC_CATALYST_APP_DEVELOPMENT",
  "MAC_CATALYST_APP_STORE",
  "MAC_CATALYST_APP_DIRECT",
]);
const profileStateEnum = z.enum(["ACTIVE", "INVALID"]);

export const schema = {
  limit: z
    .number()
    .min(1)
    .max(200)
    .default(100)
    .describe("Maximum number of profiles to return (default 100, max 200)"),
  "filter.name": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by profile name(s)"),
  "filter.profileType": z
    .union([profileTypeEnum, z.array(profileTypeEnum)])
    .optional()
    .describe("Filter by profile type(s)"),
  "filter.profileState": z
    .union([profileStateEnum, z.array(profileStateEnum)])
    .optional()
    .describe("Filter by profile state(s)"),
  "filter.id": z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Filter by profile ID(s)"),
};
export const metadata: ToolMetadata = {
  name: "list-profiles",
  description: "Get a list of provisioning profiles in your team",
  annotations: {
    title: "List profiles",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
};

export default async function listProfilesTool(
  args: InferSchema<typeof schema>
) {
  const client = getClient();
  const query: NonNullable<ProfilesGetCollectionData["query"]> = {
    limit: args.limit,
    ...(toArray(args["filter.name"])?.length && {
      "filter[name]": toArray(args["filter.name"])!,
    }),
    ...(toArray(args["filter.profileType"])?.length && {
      "filter[profileType]": toArray(args["filter.profileType"])!,
    }),
    ...(toArray(args["filter.profileState"])?.length && {
      "filter[profileState]": toArray(args["filter.profileState"])!,
    }),
    ...(toArray(args["filter.id"])?.length && {
      "filter[id]": toArray(args["filter.id"])!,
    }),
  };
  const result = await client.api.Profiles.profilesGetCollection({ query });
  const data = unwrapApiResult<ProfilesGetCollectionResponse>(result);
  return JSON.stringify(data, null, 2);
}
