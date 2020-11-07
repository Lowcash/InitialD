export default class Common {
    static delay(milliseconds: number, count: number): Promise<number> {
        return new Promise<number>(resolve => {
            setTimeout(() => {
                resolve(count);
            }, milliseconds);
        });
    }

    static fillZeroPadding(number: number, size: number): string {
        let stringNumber = number.toString();

        while (stringNumber.length < (size || 2)) {
            stringNumber = "0" + stringNumber;
        }

        return stringNumber;
    }
}

export type Range = {
    from: number;
    to: number;
};
