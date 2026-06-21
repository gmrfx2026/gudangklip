import { User, Campaign, Submission, Payout, SocialAccount, Notification } from "@prisma/client";

export type SafeUser = Omit<User, "passwordHash">;
export type CampaignWithBrand = Campaign & { brand: Pick<User, "id" | "name" | "image">; _count?: { participants: number; submissions: number } };
export type SubmissionWithRelations = Submission & { creator: Pick<User, "id" | "name" | "image">; campaign: Pick<Campaign, "id" | "title" | "cpmRate">; viewLogs: { views: number }[] };
export type PayoutWithCreator = Payout & { creator: Pick<User, "id" | "name" | "email"> };
