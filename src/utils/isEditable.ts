import { APIRole, Role } from "discord.js";

export const isEditable = (role: Role | APIRole | null): boolean => {
    if (!role) return true;
    return ('editable' in role) && role.editable
}