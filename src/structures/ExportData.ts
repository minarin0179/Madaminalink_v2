import {
    ActionRow,
    Attachment,
    ChannelType,
    Collection,
    Embed,
    MessageReaction,
    PermissionOverwrites,
    PermissionsBitField,
    Snowflake,
} from "discord.js";

export type ExportData = {
    categoryData: CategoryData;
    channelDatas: ChannelData[];
    fileDatas: Attachment[];
    roleDatas: RoleData[];
    everyoneRoleID: Snowflake;
    reuseRoles: boolean;
};

export type CategoryData = {
    name: string;
    permissionOverwrites: Collection<Snowflake, PermissionOverwrites>;
};

export type ChannelData = {
    id: Snowflake;
    name: string;
    type: number;
    nsfw: boolean;
    rateLimitPerUser: number;
    permissionOverwrites: Collection<Snowflake, PermissionOverwrites>;
    messages: MessageData[];
};

export type MessageData = {
    content: string;
    files: string[];
    embeds: Embed[];
    components: ActionRow<any>[];
    reactions: Collection<string | Snowflake, MessageReaction>;
};

export type RoleData = {
    id: Snowflake;
    name: string;
    color: number;
    hoist: boolean;
    permissions: PermissionsBitField;
    mentionable: boolean;
    icon: string | null;
};

const example = {
    category: {
        name: "",
        type: ChannelType.GuildCategory,
        position: 0,
        permissionoverwrites: [],
    },
    channels: [
        {
            name: "",
            type: "",
            nsfw: false,
            rateLimitPerUser: 0,
            permissionOverwrites: [],
            parent: "",
            position: 0,
            messages: [
                {
                    content: "",
                    attachments: [],
                    embeds: [],
                    components: [],
                    reactions: [],
                },
            ],
        },
    ],
    files: [
        {
            name: "",
            url: "",
        },
    ],
};
