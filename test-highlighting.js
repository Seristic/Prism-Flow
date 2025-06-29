// test-highlighting.js
// Test file for PrismFlow Dashboard functionality
// Open this file and use the PrismFlow Dashboard to test highlighting

function outerFunction() {
  const data = {
    users: [
      {
        name: "John",
        details: {
          age: 30,
          preferences: {
            theme: "dark",
            notifications: {
              email: true,
              push: false,
              settings: {
                frequency: "daily",
                categories: ["updates", "security"],
              },
            },
          },
        },
      },
    ],
    config: {
      version: "1.0.0",
      features: {
        highlighting: true,
        dashboard: {
          enabled: true,
          position: "right",
          shortcuts: {
            refresh: "Ctrl+R",
            clear: "Ctrl+Shift+C",
          },
        },
      },
    },
  };

  if (data.users.length > 0) {
    for (const user of data.users) {
      if (user.details.preferences.notifications.email) {
        console.log(`Sending email to ${user.name}`);

        // Nested function example
        function processNotification() {
          const settings = user.details.preferences.notifications.settings;
          if (settings.frequency === "daily") {
            return {
              status: "scheduled",
              time: new Date(),
              categories: settings.categories.map((cat) => ({
                name: cat,
                enabled: true,
              })),
            };
          }
        }

        processNotification();
      }
    }
  }
}

// Export example
export const utilityFunction = () => {
  return {
    helper: {
      format: (data) => {
        return {
          processed: true,
          result: data,
        };
      },
    },
  };
};

outerFunction();
