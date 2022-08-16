<template>
  <div id="app">
    <!-- <h1>Hello App!</h1> -->
    <!-- 路由出口 -->
    <!-- <ul> -->
      <!--使用 router-link 组件进行导航 -->
      <!--通过传递 `to` 来指定链接 -->
      <!--`<router-link>` 将呈现一个带有正确 `href` 属性的 `<a>` 标签-->
      <!-- <router-link to="/hello">Go to helloWorld</router-link>----
      <router-link to="/first">Go to firstApps</router-link>----
      <router-link to="/learn">Go to learn</router-link>------>


      <!-- <router-link to="/base">Go to Base</router-link>---- 
      <router-link to="/openHot">OpenLayersHotMap</router-link>----
      <router-link to="/OlBase">OLBase</router-link>----
      <router-link to="/OlVector">OlVector</router-link>----
      <router-link to="/OLWms">OLWms</router-link>----
      <router-link to="/OLOms">OLoms</router-link>----
      <router-link to="/OLImage">OLImage</router-link>----
      <router-link to="/OLWMTS">OLWMTS</router-link>----
      <router-link to="/Baidu">BaiduMap</router-link>----
      <router-link to="/LocalTile">LocalTile</router-link>----
      <router-link to="/MapAdj">MapAdj</router-link>----
      <router-link to="/show">OLSHOW</router-link>---- -->
      
      <!-- <router-link to="/Tencent">腾讯地图</router-link>---- -->
    <!-- </ul> -->
    <!-- 路由匹配到的组件将渲染在这里 -->
    <router-view></router-view>
  </div>
</template>

<script setup></script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
html,
body,
#cesiumContainer {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
