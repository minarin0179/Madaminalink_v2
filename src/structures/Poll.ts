import { Schema, model, connect } from 'mongoose';

export interface Choice {
    label: string;
    roleId?: string;
}

interface Poll {
    type: "vote" | "char"
    ownerId: string;
    choices: Choice[];
    voters: Map<string, number>; // Map<userID, choiceIndex>
}


const pollSchema = new Schema<Poll>({
    type: String,
    ownerId: String,
    choices: Array,
    voters: Map,
});

export const PollModel = model<Poll>('Poll', pollSchema);

connect('mongodb://mongodb:27017/poll');
