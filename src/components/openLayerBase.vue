<template>
  <div id="map" ref="map"></div>
  <button @click="leftMove">左移</button>
</template>

<script>
import "ol/ol.css";
import VectorSource from "ol/source/Vector";
import {
  Tile as TileLayer,
  Heatmap as HeatmapLayer,
  Vector as VectorLayer,
} from "ol/layer";
// import XYZ from "ol/source/XYZ";
import { OSM, XYZ, Vector } from "ol/source";
import { Map as olMap, View, Feature } from "ol";
import { Style } from "ol/style";
import { Point } from "ol/geom";
import { defaults as defaultControls } from "ol/control";
import {
  get as getProjection,
  fromLonLat,
  transform,
  addProjection,
  addCoordinateTransforms,
} from "ol/proj";
import Projection from "ol/proj/Projection";
import Text from "ol/style/Text";
import Icon from "ol/style/Icon";

// 引入高德坐标变换
import projzh from "./js/gaodeTranslate";

// 导入公共模块
import {
  addTdtWmtsLayer,
  addWmtsLayer,
  addOSMLayer,
  addXYZLayer,
  addWMSLayer,
  gaodeTranslate,
  changeTheme,
  addLayerToMap
} from "./js/commonApi";

// import ol from "ol";

export default {
  data() {
    return {
      map: null,
      gcjMecator: null,
    };
  },
  methods: {
    // 高德地图坐标系转换函数,
    // gaodeTranslate() {
    //   // 规定gcj-02的范围
    //   const gcj02Extent = [
    //     -20037508.342789244, -20037508.342789244, 20037508.342789244,
    //     20037508.342789244,
    //   ];
    //   // 注册一个gcj-02的投影
    //   const gcjMecator = new Projection({
    //     code: "GCJ-02",
    //     extent: gcj02Extent,
    //     units: "m",
    //   });
    //   addProjection(gcjMecator);
    //   // 注册坐标变换的函数,主要是为了在4326和3857坐标系和新建的gcjMecator坐标系之间建立一种坐标转换关系，
    //   // 当我们用传统的wgs84坐标时，系统自动映射到gcjMecator坐标系
    //   addCoordinateTransforms(
    //     "EPSG:4326",
    //     gcjMecator,
    //     projzh.ll2gmerc,
    //     projzh.gmerc2ll
    //   );
    //   addCoordinateTransforms(
    //     "EPSG:3857",
    //     gcjMecator,
    //     projzh.smerc2gmerc,
    //     projzh.gmerc2smerc
    //   );
    // },
    /**
     * 初始化地图
     */
    initMap() {
      gaodeTranslate();
      // 高德地图层
      // var gaodeMapLayer = new TileLayer({
      //   source: new XYZ({
      //     projection: "GCJ-02",
      //     url: "http://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=2&style=6",
      //     wrapX: true,
      //   }),
      // });

      var position = transform([108.9421, 34.2244], "EPSG:4326", "EPSG:3857");
      // 使用ol.Map来创建地图
      this.map = new olMap({
        // 地图图层
        layers: [
          // 创建一个使用Open Street Map地图源的瓦片图层
          // new TileLayer({ source: new OSM({}) }),
          // 使用
          // gaodeMapLayer,
        ],
        // 设置显示地图的视图
        view: new View({
          center: fromLonLat([108.9421, 34.2244]), // 定义地图显示中心于经度0度，纬度0度处
          // center: position,
          zoom: 14,
          // 指定投影使用EPSG:4326
          // projection: "EPSG:3857",
          // projection: "EPSG:4326",
        }),
        target: "map",
      });

      var gaodeMapLayer = addXYZLayer(
        this.map,
        "http://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7",
        "GCJ-02"
      );
      addLayerToMap(this.map, gaodeMapLayer)
      this.addPoint()
      // changeTheme(this.map, gaodeMapLayer)
    },
    addPoint() {
      /**
       * 创建一个活动图标需要的feature，并设置位置。
       */
      const activityLayer = new VectorLayer({
        source: new Vector(),
      });

      // 创建一个活动图标需要的Feature，并设置位置
      var activity = new Feature({
        geometry: new Point(
          // transform([108.9421, 34.2244], "EPSG:4326", "EPSG:3857")
          transform([108.9421, 34.2244], "EPSG:4326", "GCJ-02")
        ),
      });
      // 设置Feature的样式，
      activity.setStyle(
        new Style({
          image: new Icon({
            src: "../../public/image/blueIcon.png",
            anchor: [0.5, 60],
            anchorOrigin: "top-right",
            anchorXUnits: "fraction",
            anchorYUnits: "pixels",
            offsetOrigin: "top-right",
            // scale: 1,
          }),
        })
      );
      activityLayer.getSource().addFeature(activity);
      this.map.addLayer(activityLayer);
    },
    addXYZLayer(map, url) {
      let source = new XYZ({
        url: url,
        wrapX: true,
        crossOrigin: "anonymous",
      });
      let layer = new TileLayer({
        source: source,
      });
      map.addLayer(layer);
      return layer;
    },
    leftMove() {
      const view = this.map.getView();
      const center = view.getCenter();
      console.log(center);
      center[0] -= 50000;
      view.setCenter(center);
      this.map.render();
    },
  },
  mounted() {
    this.initMap(); //初始化地图
  },
};
</script>
<style lang="less" scoped>
#map {
  width: 100%;
  height: 800px;
}
</style>
