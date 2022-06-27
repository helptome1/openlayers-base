<template>
  <div id="cesiumContainer"></div> 
</template>

<script setup>
import * as Cesium from "cesium";
import { onMounted } from "vue";
onMounted(() => {
  // const viewer = new Cesium.Viewer('cesiumContainer');
  var custom = new Cesium.ArcGisMapServerImageryProvider({
    url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer",
  });

  const viewer = new Cesium.Viewer("cesiumContainer", {
    // 不创建baseLayerPicker小部件
    baseLayerPicker: false,
    // 设置推向提供的程序
    imageryProvider: custom,
    // 设置cesium的世界地形
    terrainProvider: Cesium.createWorldTerrain({
      requestWaterMask: true,
      requestVertexNormals: true,
    }),
  });
  // 设置相机位置。
  // viewer.camera.setView({
  //   destination: Cesium.Cartesian3.fromDegrees(113.318977, 23.114115, 2000),
  //   // 方向、俯视角、仰视角度
  //   orientation: {
  //     heading: Cesium.Math.toRadians(90.0), // east, default value is 0.0 (north)
  //     pitch: Cesium.Math.toRadians(-90), // default value (looking down)
  //     roll: 0.0, // default value
  //   },
  // });
  viewer.camera.setView({
    destination: new Cesium.Cartesian3(1332761, -4662399, 4137888),
    orientation: {
      heading: 0.6,
      pitch: -0.66,
    },
  });
  // 设置建筑物的模型
  var city = viewer.scene.primitives.add(
    new Cesium.Cesium3DTileset({ url: Cesium.IonResource.fromAssetId(3839) })
  );
  // 定义3d样式
  var heightStyle = new Cesium.Cesium3DTileStyle({
    color: {
      // 条件判断具体的颜色
      conditions: [
        ["${height} >= 300", "rgba(45, 0, 75,0.5)"],
        ["${height} >= 200", "rgba(102, 71, 151,1)"],
        ["${height} >= 100", "rgba(170,162, 104,1)"],
        ["${height} >= 50", "rgba(224, 226, 238,0.5)"],
        ["${height} >= 25", "rgba(252, 230, 200,1)"],
        ["${height} >= 10", "rgba(248, 176, 87,1)"],
        ["${height} >= 5", "rgba(198, 106, 11,1)"],
        ["true", "rgb(127, 59, 8)"],
      ],
    },
  });
  // 把样式设置为样子
  city.style = heightStyle;
  // GeoJson文件的加载
  var neighborHoodsPromise = Cesium.GeoJsonDataSource.load(
    "/assets/SampleData/sampleNeighborhoods.geojson"
  );
  var neighborhoods;
  neighborHoodsPromise.then((dataSource) => {
    // 将数据添加到查看器
    viewer.dataSources.add(dataSource);
    neighborhoods = dataSource.entities;
    // 把地形放到地图的表面
    var neighborHoodsEntities = dataSource.entities.values;
    for (var i = 0; i < neighborHoodsEntities.length; i++) {
      var entity = neighborHoodsEntities[i];
      // 判断是否定义的多边形是否存在。
      if (Cesium.defined(entity.polygon)) {
        entity.name = entity.properties.neighborhood;
        entity.polygon.material = Cesium.color.fromRandom({
          red: 0.1,
          maximumGreen: 0.5,
          minimumBlue: 0.5,
          alpha: 0.6
        });

        entity.polygon.classificationType = Cesium.classificationType.TERRAIN;
        // 设置多边形的位置
        var polyPositions = entity.polygon.hierarchy.getValue(
          Cesium.JulianDate.now()
        ).positions;
        var polyCenter = Cesium.BoundingSphere.fromPoints(polyPositions).center;
        // 地形的表面
        polyCenter = Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(polyCenter);
        entity.position = polyCenter;

        // 生成标签
        entity.label = {
          text: entity.name,
          showBackground: true,
          scale: 0.6,
          horizontalOrigin: Cesium.horizontalOrigin.CENTER,
          verticalOrigin: cesium.verticalOrigin.BOTTOM,
          distanceDisplayCondition: new Cesium.distanceDisplayCondition(
            10,
            5000
          ),
          // 禁用标签
          disableDepthTestDistance: 100,
        };
      }
    }
  });
});
</script>


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
