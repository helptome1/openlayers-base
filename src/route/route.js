import { createRouter, createWebHistory } from "vue-router";
// import FirstCesiumApp from '../components/FirstCesiumApp.vue'

// 1. 定义路由组件.
// 也可以从其他文件导入


// 2. 定义一些路由
// 每个路由都需要映射到一个组件。
// 我们后面再讨论嵌套路由。
const routes = [
  // { path: '/', component: ()=> import('../components/OLShow.vue') },
  { path: '/', component: ()=> import('../views/openlayersShow/OLShow.vue') },

  { path: '/openHot', component: () => import("../components/openLayersHot.vue")},
  { path: '/OlBase', component: () => import("../components/openLayerBase.vue")},
  { path: '/OlVector', component: () => import("../components/OLVectorMap.vue")},
  { path: '/OLWms', component: () => import("../components/OLWms.vue")},
  { path: '/OLImage', component: () => import("../components/OLImage.vue")},
  { path: '/OLWMTS', component: () => import("../components/OLMapWMTS.vue")},
  { path: '/Baidu', component: () => import("../components/OLMapBaidu.vue")},
  { path: '/LocalTile', component: () => import("../components/OLLocalTile.vue")},
  { path: '/OLOms', component: () => import("../components/OLMapOSM.vue")},
  { path: '/Tencent', component: () => import("../components/OLTencentMap.vue")},
  { path: '/MapAdj', component: () => import("../components/OLMapsAdj.vue")},
  { path: '/show', component: () => import("../components/OLShow-demo.vue")},
  { path: '/draw', component: () => import("../components/OLDrawGps.vue")},
]
// 3. 创建路由实例并传递 `routes` 配置
// 你可以在这里输入更多的配置，但我们在这里
// 暂时保持简单
const router = createRouter({
  // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
  history: createWebHistory(),
  routes, // `routes: routes` 的缩写
})

export default router;