<template>
  <div class="draw_map">
    <div id="map"></div>
    <div class="control">
      <el-button type="primary" @click="startDraw">开始绘制 </el-button>
      <el-button type="primary" @click="endDraw">结束绘制 </el-button>
    </div>
  </div>
</template>
<script>
// 导入需要的模块
import "ol/ol.css";
import Draw from "ol/interaction/Draw";
import Map from "ol/Map";
import View from "ol/View";
import { OSM, Vector as VectorSource } from "ol/source";
import { fromLonLat, transform } from "ol/proj";

import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { Style, Fill, Stroke, Circle as CircleStyle } from "ol/style";
import GeoJSON from "ol/format/GeoJSON";
export default {
  name: "Home",
  data() {
    return {
      mapData: null,
      DrawVar: null,
      vectorSource: null,
    };
  },
  mounted() {
    this.initMap();
  },
  methods: {
    initMap() {
      // 定义source
      this.vectorSource = new VectorSource();

      // 定义基本的底图的layer
      let baseLayer = new TileLayer({
        source: new OSM(),
      });

      // 定义绘制图形的图层
      let drawLayer = new VectorLayer({
        source: this.vectorSource,
        // 绘制后填充的颜色
        style: new Style({
          fill: new Fill({
            color: "rgba(255, 0, 0, 0.2)",
          }),
          stroke: new Stroke({
            color: "rgba(255, 0, 0, 1)",
            width: 2,
          }),
          image: new CircleStyle({
            radius: 7,
            fill: new Fill({
              color: "rgba(255, 0, 0, 1)",
            }),
          }),
        }),
      });

      // 设置地图的相关属性
      this.mapData = new Map({
        layers: [baseLayer, drawLayer],
        target: "map",
        view: new View({
          center: fromLonLat([108.94681668, 34.26982767]),
          zoom: 5,
        }),
      });
    },
    startDraw() {
      // 设置绘制的draw
      this.DrawVar = new Draw({
        source: this.vectorSource,
        type: "Polygon",
      });
      // 添加绘制
      this.mapData.addInteraction(this.DrawVar);

      // 监听绘制结束事件
      this.DrawVar.on("drawend", (evt) => {
        let featureGeoJson = JSON.parse(
          new GeoJSON().writeFeature(evt.feature)
        );
        console.log(featureGeoJson);
        this.mapData.removeInteraction(this.DrawVar);
      });
    },
    endDraw() {
      this.mapData.removeInteraction(this.DrawVar);
    },
  },
};
</script>

<style scoped>
#map{
  height: 800px;
}
.control {
  position: absolute;
  bottom: 10px;
}
</style>
