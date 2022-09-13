export const arraySplit = <T = object>(array: T[], n: number): T[][] => {
    return array.reduce((acc: T[][], _, i: number) => (i % n ? acc : [...acc, ...[array.slice(i, i + n)]]), []);
}