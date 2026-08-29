import path from "node:path";

export default {
  resolve: {
    alias: {
      "@": path.resolve("./src"),
      "@components": path.resolve("./src/components"),
      "@layouts": path.resolve("./src/layouts"),
      "@lib": path.resolve("./src/lib"),
      "@styles": path.resolve("./src/styles"),
      "@assets": path.resolve("./src/assets"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts", "tests/unit/**/*.test.ts"],
    clearMocks: true,
    restoreMocks: true,
  },
};
