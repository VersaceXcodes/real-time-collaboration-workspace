declare const _default: {
    preset: string;
    testEnvironment: string;
    extensionsToTreatAsEsm: string[];
    transform: {
        '^.+\\.ts$': (string | {
            useESM: boolean;
        })[];
    };
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': string;
    };
    testMatch: string[];
};
export default _default;
//# sourceMappingURL=jest.config.d.ts.map