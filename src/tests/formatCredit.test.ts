import { describe, it, expect } from "vitest";
import { formatCredit } from "@/domain/util";

const cases: Array<[number, number]> = [
    // ties (banker's rounding)
    [1.245, 1.24],
    [1.255, 1.26],
    [2.665, 2.66],
    [2.675, 2.68],
    [0.005, 0.0],
    [0.015, 0.02],

    // non-ties
    [1.234, 1.23],
    [1.236, 1.24],
    [9.999, 10.0],

    // negatives
    [-1.245, -1.24],
    [-1.255, -1.26],
    [-2.675, -2.68],
    [-0.005, -0.0],

    // float traps
    [1.005, 1.0],
];

describe("formatCredit", () => {
    it.each(cases)("formatCredit(%f) -> %f", (input, expected) => {
        const out = formatCredit(input);
        // Compare as fixed string to avoid -0 display and float noise
        expect(out).toBe(expected.toFixed(2));
    });
});
