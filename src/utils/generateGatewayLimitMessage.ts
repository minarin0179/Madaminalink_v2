export const generateGatewayLimitMessage = (seconds: number): string => {
    return `コマンドの実行が早すぎます。${seconds}秒後に再度お試しください。`;
};
