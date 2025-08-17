export const rounding = (toRound: number): number => {
    const roundingUp = Math.ceil(toRound / 2.5) * 2.5;
    const roundingDown = Math.floor(toRound / 2.5) * 2.5;

    const diffUp = Math.abs(toRound - roundingUp);
    const diffDown = Math.abs(toRound - roundingDown);

    if (diffUp > diffDown) {
        return roundingDown;
    } else {
        return roundingUp;
    }
};
