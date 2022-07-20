<template>
  <div id="map" ref="map"></div>
  <!-- <button @click="leftMove">左移</button> -->
  <div>
    显示/隐藏：
    <input type="checkbox" checked="checked" @change="checkOsm($event)" />底图
    <input type="checkbox" checked="checked" @change="checkCircle($event)" />圆
    <input type="checkbox" checked="checked" @change="checkPoint($event)" />点
  </div>
  <div>
    图层顺序：
    <input name="seq" type="radio" value="" @change="upOsm($event);" />底图最上
    <input name="seq" type="radio" value="" checked="checked" @change="upCircle($event);" />圆最上
    <input name="seq" type="radio" value="" @change="upPoint($event);" />点最上
  </div>
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
import { Point, Circle } from "ol/geom";
import { defaults as defaultControls } from "ol/control";
import { fromLonLat, transform } from "ol/proj";
import GeoJSON from "ol/format/GeoJSON";
import {
  Style,
  Text,
  Icon,
  Fill,
  Stroke,
  Image as ImageStyle,
  Circle as CircleStyle,
} from "ol/style";
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
      osmLayer: null,
      pointLayer: null,
      circleLayer: null,
      x: 0,
      y: 0,
    };
  },
  methods: {
    /**
     * 创建多个图层
     */
    createLayer() {
      // 1.地图图层
      // 创建一个使用Open Street Map地图源的瓦片图层
      this.osmLayer = new TileLayer({
        source: new OSM(),
      });

      // 2. 点图层
      this.pointLayer = new VectorLayer({
        source: new VectorSource(),
      });

      // 3. 圆的图层
      this.circleLayer = new VectorLayer({
        source: new VectorSource(),
      });
      this.addCircle();

      for (let i = 0; i < 10; i++) {
        this.addPoint();
      }
    },
    // 添加点
    addPoint() {
      var point = new Feature({
        geometry: new Point([this.x, this.y]),
      });
      point.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 1,
            fill: new Fill({
              color: "red",
            }),
            stroke: new Stroke({
              color: "red",
              size: 50,
            }),
          }),
        })
      );
      this.pointLayer.getSource().addFeature(point);
      this.x += 100000;
      this.y += 5000;
    },
    // 添加圆
    addCircle() {
      var circle = new Feature({
        geometry: new Point([this.x, this.y]),
      })
      circle.setStyle(new Style({
        image: new CircleStyle({
          stroke: new Stroke({
            color: "red",
            width: 1
          }),
          radius: 10,
        }),
      }))
      this.circleLayer.getSource().addFeature(circle);
    },
    /**
     * 初始化地图
     */
    initMap() {
      this.createLayer();

      // 使用ol.Map来创建地图
      this.map = new olMap({
        // 地图图层
        layers: [this.osmLayer, this.pointLayer, this.circleLayer],
        // 设置显示地图的视图
        view: new View({
          center: [0, 0],
          zoom: 2,
        }),
        target: "map",
      });
    },

    // checkOsm点击
    checkOsm(el) {
      this.osmLayer.setVisible(el.target.checked);
    },
    checkCircle(el) {
      this.circleLayer.setVisible(el.target.checked);
    },
    checkPoint(el) {
      this.pointLayer.setVisible(el.target.checked);
    },
    upOsm(el) {
      if (el.target.checked) {
        this.osmLayer.setZIndex(3)
        this.circleLayer.setZIndex(this.circleLayer.getZIndex() - 1)
        this.pointLayer.setZIndex(this.pointLayer.getZIndex() - 1)
      }
    },
    upCircle(el) {
      if (el.target.checked) {
        this.circleLayer.setZIndex(3)
        this.osmLayer.setZIndex(this.osmLayer.getZIndex() - 1)
        this.pointLayer.setZIndex(this.pointLayer.getZIndex() - 1)
      }
    },
    upPoint(el) {
      if (el.target.checked) {
        this.pointLayer.setZIndex(3)
        this.circleLayer.setZIndex(this.circleLayer.getZIndex() - 1)
        this.osmLayer.setZIndex(this.osmLayer.getZIndex() - 1)
      }
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
