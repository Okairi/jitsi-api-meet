const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("pages/Lobby.vue"),
  },
  {
    path: "/meet",
    name: "meet",
    component: () => import("pages/Index.vue"),
    props: (route) => ({ query: route.query.room }),
  },
  {
    path: "/end",
    name: "end",
    component: () => import("pages/Finish.vue"),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/Error404.vue"),
  },
];

export default routes;
