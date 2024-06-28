import { Schema, model, connect } from "mongoose";

export interface Choice {
    label: string;
    roleId?: string;
}

export interface PollOptions {
    type: string; // "char" | "vote"
    ownerId: string;
    choices: Choice[];
    voters: Map<string, number>; // Map<userID, choiceIndex>
}

const pollSchema = new Schema<PollOptions>({
    type: String,
    ownerId: String,
    choices: Array,
    voters: Map,
});

export const PollModel = model<PollOptions>("Poll", pollSchema);

connect("mongodb://mongodb:27017/poll");
