export const LimitLength = (str: string, length: number): string => {
    if (str.length > length) return str.slice(0, length - 1) + "…";
    return str;
};
