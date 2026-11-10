/**
 * Hierarchical keys: invalidating ["employees"] also invalidates
 * ["employees", "list", {...}] and ["employees", "detail", "7"].
 * Detail ids are normalised to strings because useParams() returns strings,
 * and ["employees","detail",7] !== ["employees","detail","7"].
 */
export const queryKeys = {
  employees: {
    all: ["employees"],
    lists: () => [...queryKeys.employees.all, "list"],
    list: (filters) => [...queryKeys.employees.lists(), filters],
    details: () => [...queryKeys.employees.all, "detail"],
    detail: (id) => [...queryKeys.employees.details(), String(id)],
  },
  departments: {
    all: ["departments"],
    list: () => [...queryKeys.departments.all, "list"],
    detail: (id) => [...queryKeys.departments.all, "detail", String(id)],
  },
  leaves: {
    all: ["leaves"],
    list: (filters) => [...queryKeys.leaves.all, "list", filters],
  },
  users: {
    all: ["users"],
    list: () => [...queryKeys.users.all, "list"],
  },
  activities: {
    all: ["activities"],
    list: (filters) => [...queryKeys.activities.all, "list", filters],
  },
  dashboard: {
    all: ["dashboard"],
    stats: () => [...queryKeys.dashboard.all, "stats"],
  },
};
