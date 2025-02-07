export namespace MyConstants {
    export const mebi = 1 << 20;
    export const maxFileSizeMB = 10;
    export const maxFileSize = maxFileSizeMB * mebi;
    export const color = {
        embed_background: 0x2c2d31,
    }
    export const maxPollChoices = 23; //pollの選択肢の最大数
    export const maxPollchoiceLength = 50; //pollでの選択肢の最大文字数
    export const maxCharVoters = 50; //キャラ選択の最大投票数
    export const maxVoteVoters = 25; //犯人投票の最大投票数
    export const maxNicknameLength = 32; //ニックネームの最大文字数
}
