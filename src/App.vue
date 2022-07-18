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
  /**
   * 1.加载建筑物的模型
   */
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
  /**
   * 2. 加载GeoJson文件,就是一个图形，需要把它贴到地图的表面。
   */
  var neighborHoodsPromise = Cesium.GeoJsonDataSource.load(
    "/public/assets/SampleData/sampleNeighborhoods.geojson"
  );
  var neighborhoods;
  neighborHoodsPromise.then((dataSource) => {
    // 将数据添加到查看器
    viewer.dataSources.add(dataSource);
    neighborhoods = dataSource.entities;
    console.log("neighborhoods", neighborhoods);
    // 把地形放到地图的表面
    var neighborHoodsEntities = dataSource.entities.values;
    for (var i = 0; i < neighborHoodsEntities.length; i++) {
      var entity = neighborHoodsEntities[i];
      // 判断是否定义的多边形是否存在。
      if (Cesium.defined(entity.polygon)) {
        entity.name = entity.properties.neighborhood;
        // 区域的颜色随机
        entity.polygon.material = Cesium.Color.fromRandom({
          red: 0.1,
          maximumGreen: 0.5,
          minimumBlue: 0.5,
          alpha: 0.6,
        });

        entity.polygon.classificationType = Cesium.ClassificationType.TERRAIN;
        // 设置多边形的位置
        var polyPositions = entity.polygon.hierarchy.getValue(
          Cesium.JulianDate.now()
        ).positions;
        var polyCenter = Cesium.BoundingSphere.fromPoints(polyPositions).center;
        // 放在地图的表面
        polyCenter = Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(polyCenter);
        entity.position = polyCenter;

        // 生成标签
        entity.label = {
          text: entity.name,
          showBackground: true,
          scale: 0.6,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
            10,
            5000
          ),
          // 禁用标签
          disableDepthTestDistance: 100,
        };
      }
    }
  });
  /**
   * kml文件用来地理标识
   */
  var kmlOptions = {
    camera: viewer.scene.camera,
    canvas: viewer.scene.canvas,
    // 如果想把几何特征（多边形，线串和线性环）固定在地面上，则为true。
    clampToGround: true,
  };
  // kml文件是google公司创建的一种地标性文件。
  // 用于记录某一地点，或连接地点的时间、经度、维度、海拔等地理信息数据，供GE等油管软件使用。
  // LOAD geocache points of interest from
  var geocachePromise = Cesium.KmlDataSource.load(
    "/public/assets/SampleData/sampleGeocacheLocations.kml",
    kmlOptions
  );
  // 将 geocache 广告牌实体添加到场景中并为其设置样式
  geocachePromise.then(function (dataSource) {
    // 将新数据作为实体添加到查看器
    viewer.dataSources.add(dataSource);

    // 获取实体数组
    var geocacheEntities = dataSource.entities.values;

    for (var i = 0; i < geocacheEntities.length; i++) {
      var entity = geocacheEntities[i];
      if (Cesium.defined(entity.billboard)) {
        // 调整垂直原点，使图钉位于地形上
        entity.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
        entity.billboard.image = "/public/assets/tagpark.png";
        // 禁用标签以减少混乱
        entity.label = undefined;
        // 添加距离显示条件
        entity.billboard.distanceDisplayCondition =
          new Cesium.DistanceDisplayCondition(10.0, 20000.0);
        // 以度为单位计算纬度和经度
        var cartographicPosition = Cesium.Cartographic.fromCartesian(
          entity.position.getValue(Cesium.JulianDate.now())
        );
        var latitude = Cesium.Math.toDegrees(cartographicPosition.latitude);
        var longitude = Cesium.Math.toDegrees(cartographicPosition.longitude);
        // 修改描述
        var description =
          '<table class="cesium-infoBox-defaultTable cesium-infoBox-defaultTable-lighter"><tbody>' +
          "<tr><th>" +
          "Longitude" +
          "</th><td>" +
          longitude.toFixed(5) +
          "</td></tr>" +
          "<tr><th>" +
          "Latitude" +
          "</th><td>" +
          latitude.toFixed(5) +
          "</td></tr>" +
          "<tr><th>" +
          "实时人流" +
          "</th><td>" +
          Math.floor(Math.random() * 20000) +
          "</td></tr>" +
          "<tr><th>" +
          "安全等级" +
          "</th><td>" +
          Math.floor(Math.random() * 5) +
          "</td></tr>" +
          "</tbody></table>";
        entity.description = description;
      }
    }
  });
  // 从czml文件加载飞行路径
  var dronePromise = Cesium.CzmlDataSource.load('./assets/SampleData/sampleFlight.czml');

  // 无人机实体
  var drone;
  dronePromise.then(function(dataSource){
    viewer.dataSources.add(dataSource);
    drone = dataSource.entities.getById('Aircraft/Aircraft1');
    drone.model = {
      uri:'./assets/SampleData/Models/CesiumDrone.gltf',
      // uri:'./assets/SampleData/Models/ferrari2.gltf',
      minimumPixelSize:128,
      maximumScale:1000,
      silhouetteColor:Cesium.Color.WHITE,
      silhouetteSize:2
    }

    drone.orientation = new Cesium.VelocityOrientationProperty(drone.position);
    drone.viewFrom = new Cesium.Cartesian3(0,-30,30)
    viewer.clock.shouldAnimate = true;
  })

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
