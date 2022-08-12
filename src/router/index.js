import { createRouter, createWebHistory } from "vue-router";

const Home = () => import("../views/Home"); //懒加载
const About = () => import("../views/About"); //懒加载

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/home", //hash
      component: Home,
    },
    {
      path: "/about",
      component: About,
    },
  ],
});
