// test-dashboard.js
// Test file for dashboard highlighting functionality
function testDashboard() {
  const config = {
    name: "test",
    settings: {
      enabled: true,
      features: ["highlighting", "dashboard"],
    },
  };

  if (config.settings.enabled) {
    console.log("Dashboard test active");
    return {
      status: "success",
      data: config,
    };
  }

  return null;
}

// Test nested objects
const nested = {
  level1: {
    level2: {
      level3: {
        value: "deep nesting test",
      },
    },
  },
};

// Test arrays
const testArray = [
  { id: 1, name: "item1" },
  { id: 2, name: "item2" },
  { id: 3, name: "item3" },
];

module.exports = { testDashboard, nested, testArray };
