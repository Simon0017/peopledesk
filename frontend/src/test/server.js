import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// Intercepts real HTTP requests made by Axios in Node. The app code doesn't know it's being tested.
export const server = setupServer(...handlers);
