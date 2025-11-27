export const generateGatewayLimitMessage = (seconds: number): string => {
    const refreshedTimeStamp = Math.ceil(Date.now() / 1000 + seconds);
    return `情報の取得に失敗しました。\n<t:${refreshedTimeStamp}:S> (<t:${refreshedTimeStamp}:R>) 以降に再度実行してください。`;
};
