export class Common {
    static delay(milliseconds: number, count: number): Promise<number> {
        return new Promise<number>(resolve => {
            setTimeout(() => {
                resolve(count);
            }, milliseconds);
        });
    }
}

export type Range = {
    from: number;
    to: number;
};

export function isRange(obj: Range | any): obj is Range {
    return (obj as Range).from !== undefined && (obj as Range).to !== undefined;
}