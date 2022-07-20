<template>
  <div id="map" ref="map"></div>
  <button @click="leftMove">左移</button>
</template>

<script>
import "ol/ol.css";
import {
  Tile as TileLayer,
  Heatmap as HeatmapLayer,
  Vector as VectorLayer,
} from "ol/layer";
// import XYZ from "ol/source/XYZ";
import { OSM, XYZ, Vector as VectorSource } from "ol/source";
import { Map as olMap, View, Feature } from "ol";
import { Point } from "ol/geom";
import { defaults as defaultControls } from "ol/control";
import { fromLonLat, transform } from "ol/proj";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Text, Icon, Stroke } from "ol/style";
// import ol from "ol";

// 导入axios
import axios from "axios";

/**
 * 矢量图
 */

export default {
  data() {
    return {
      map: null,
    };
  },
  methods: {
    /**
     * 初始化地图
     */
    initMap() {
      // 高德地图层
      var gaodeMapLayer = new TileLayer({
        source: new XYZ({
          url: "http://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7",
        }),
      });

      /**
       * 矢量图层
       */
      // 再加载一个geojson的矢量地图
      var sampleVectorLayer = new VectorLayer({
        // source数据源
        source: new VectorSource({
          url: "../../public/json/line-samples.geojson", // 地图来源
          format: new GeoJSON(), // 解析矢量地图的格式化类
        }),
        // 设置描边样式, 如果feature上有样式，则使用feature上的样式。
        style: new Style({
          stroke: new Stroke({
            color: "red",
            size: 1.25,
          }),
        }),
      });

      // 位置转换后的地理坐标
      var position = fromLonLat([-72.980624870461128, 48.161307640513321]);
      // 使用ol.Map来创建地图
      this.map = new olMap({
        // 地图图层
        layers: [
          // 创建一个使用Open Street Map地图源的瓦片图层
          new TileLayer({ source: new OSM({}) }),
          // 再创建一个矢量图层
          sampleVectorLayer,
        ],
        // 设置显示地图的视图
        view: new View({
          center: position,
          zoom: 8,
          // projection: "EPSG:4326",
        }),
        target: "map",
      });
    },
    leftMove() {
      const view = this.map.getView();
      const center = view.getCenter();
      console.log(center);
      center[0] -= 50000;
      view.setCenter(center);
      this.map.render();
    },
    // 异步加载矢量地图数据
    addGeoJSON(src) {
      var layer = new VectorLayer({
        source: new VectorSource({
          features: new GeoJSON().readFeatures(src, {
            // 用readFeatures方法可以自定义坐标系
            dataProjection: "EPSG:4326", // 设定JSON数据使用的坐标系
            featureProjection: "EPSG:3857", // 设定当前地图使用的feature的坐标系
          }),
        }),
      });
      this.map.addLayer(layer);
    },
    // 使用axios获取数据
    getGeoJson() {
      axios.get("../../public/json/line-samples.geojson").then((res) => {
        this.addGeoJSON(res.data);
      });
    },
  },
  mounted() {
    this.initMap(); //初始化地图
    // this.getGeoJson()
  },
};
</script>
<style lang="less" scoped>
#map {
  width: 100%;
  height: 800px;
}
</style>
