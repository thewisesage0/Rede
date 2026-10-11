import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Start fetching a page's code (and its loader data) the moment someone
    // hovers or focuses its link, so the click itself feels instant.
    defaultPreload: "intent",
  });

  return router;
};
