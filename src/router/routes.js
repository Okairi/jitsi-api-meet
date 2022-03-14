const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("pages/Zone.vue"),
  },
  {
    path: "/meet",
    name: "meet",
    component: () => import("pages/Index.vue"),
    props: (route) => ({ query: route.query.room }),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/Error404.vue"),
  },
];

export default routes;
