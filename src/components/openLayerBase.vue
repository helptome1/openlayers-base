<template>
  <div id="map" ref="map"></div>
  <button @click="leftMove">左移</button>
</template>

<script>
import "ol/ol.css";
import VectorSource from "ol/source/Vector";
import { Tile as TileLayer, Heatmap as HeatmapLayer, Vector as VectorLayer} from "ol/layer";
// import XYZ from "ol/source/XYZ";
import { OSM, XYZ, Vector } from "ol/source";
import { Map as olMap, View, Feature } from "ol";
import { Style } from "ol/style";
import { Point } from "ol/geom";
import { defaults as defaultControls } from "ol/control";
import { fromLonLat, transform } from "ol/proj";
import Text from "ol/style/Text";
import Icon from "ol/style/Icon";
// import ol from "ol";

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
      var position = transform([104.06667, 30.66667], "EPSG:4326", "EPSG:3857")
      // 使用ol.Map来创建地图
      this.map = new olMap({
        // 地图图层
        layers: [
          // 创建一个使用Open Street Map地图源的瓦片图层
          // new TileLayer({ source: new OSM({}) }),
          // 使用
          gaodeMapLayer,
        ],
        // 设置显示地图的视图
        view: new View({
          // center: fromLonLat([104.065735, 35.659462]), // 定义地图显示中心于经度0度，纬度0度处
          // center: [104.06, 30.67],
          center: position,
          // zoom: 4.5, // 并且定义地图显示层级为2
          zoom: 7,
          // 指定投影使用EPSG:4326
          // projection: "EPSG:4326",
          // minZoom: 4.5,
          // maxZoom: 19,
        }),
        target: "map",
      });
      /**
       * 创建一个活动图标需要的feature，并设置位置。
       */
      const activityLayer = new VectorLayer({
        source: new Vector(),
      });

      // 创建一个活动图标需要的Feature，并设置位置
      var activity = new Feature({
        geometry: new Point([104.06667, 30.66667]),
      });
      // 设置Feature的样式，
      activity.setStyle(
        new Style({
          image: new Icon({
            src: "../../public/image/favicon.png",
            anchor: [0, 1],
            scale: 1,
          }),
        })
      );
      activityLayer.getSource().addFeature(activity);
      this.map.addLayer(activityLayer)
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
