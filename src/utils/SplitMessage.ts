export const splitMessage = (
    text: string,
    { maxLength = 2000, delimeter = "\n" } = {}
): string[] => {
    if (text.length <= maxLength) return [text];

    const splitText = text
        .split(delimeter)
        .map(t => (t == "" ? delimeter : t))
        .flatMap(t => t.match(new RegExp(`.{1,${maxLength}}`, "g")) || ""); // 文字数で無理やり分割

    const messages: string[] = [];

    let msg = "";
    for (const chunk of splitText) {
        if ((msg + chunk).length > maxLength) {
            messages.push(msg);
            msg = "";
        }
        msg += chunk + delimeter;
    }
    messages.push(msg);

    //""を除外
    return messages.filter(m => m);
};
