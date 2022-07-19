<template>
  <div id="cesiumContainer"></div>
</template>

<script setup>
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import cesiumJs from "./js/01.cameraSystem";
import { onMounted } from "vue";
onMounted(() => {
  Cesium.Ion.defaultAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2ZWIxNTVhZS02ZDM1LTRjODctYmE5MS1kZDAzNGQ0ZDQ5N2IiLCJpZCI6MTAxNTU5LCJpYXQiOjE2NTgxMjc3MDN9.svuaN7n3buamF1JeGEG4uJnox_2SCqa62bu_kD9yXxg";

  /**
   * 1.Viewer, 展示三维内容的主要窗口。三维地球的视窗，基础控件。
   */
  const viewer = new Cesium.Viewer("cesiumContainer", {
    terrainProvider: Cesium.createWorldTerrain(),
    animation: false,
    timeline: false,
    infoBox: false,
  });

  // cesiumJs(viewer, Cesium);
  const position = Cesium.cartesian3.fromDegrees(116.39, 39.91, 400);
  viewer.camera.setView({
    destination: position, //设定相机的目的地
    // 用于设置相机是口的方向。
    orientation: {
      heading: Cesium.Math.toRadians(0), //数值为0 代表正北方向；相当于沿着Y轴旋转。
      pitch: Cesium.toRadians(-90), // 即沿着X轴进行旋转
      roll: 0, //沿着z轴旋转。
    },
  });

  /**
   * 2. Sence是所有3D图形对象的容器。viewer内部隐士创建的
   */
  // viewer.scene.globe.show = false //隐藏地球。
  // const osmBuildings = viewer.scene.primitives.add(Cesium.createOsmBuildings());
  /**
   * 3. entity用来添加模型，修改模型位置等等。
   */
  // const entity = viewer.entities.add({
  //   position: Cesium.Cartesian3.fromDegrees(116.39,39.91,400),
  //   point: { pixelSize: 100, color: Cesium.Color.RED}
  // })
  // viewer.trackedEntity = entity

  /**
   * 4. DataSourceCollection主要用于加载数据，例如：GeoJson,KML,Czml
   */
});
</script>

<style></style>
