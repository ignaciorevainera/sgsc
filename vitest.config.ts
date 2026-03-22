export default {
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts", "tests/unit/**/*.test.ts"],
    clearMocks: true,
    restoreMocks: true,
  },
};
