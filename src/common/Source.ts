import { OSM, Vector, XYZ } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'

// osm
const OSMSource = new OSM()

// GoogleMap
const googleSource = XYZSource(
  'http://gac-geo.googlecnapps.cn/maps/vt?lyrs=s,h&hl=zh-CN&gl=CN&x={x}&y={y}&z={z}&src=app&scale=2'
)

// xyz
function XYZSource(URL: string, projection = 'EPSG:3857') {
  let source = new XYZ({
    url: URL,
    projection: projection,
    wrapX: true
  })
  return source
}

// vectorSource
// function VectorSource(url: string) {
//   console.log("url", url)
//   const vSource = new Vector({
//     url: url,
//     format: new GeoJSON(),
//   })
//   return vSource
// }

function VectorSourceCustom(src: any) {
  return new Vector({
    features: new GeoJSON().readFeatures(src, {
      //readFeature可以重新设置坐标系
      dataProjection: 'EPSG:4326', // 设定JSON数据使用的坐标系
      featureProjection: 'EPSG:3857' // 设定当前地图使用的feature的坐标系
    })
  })
}

export { OSMSource, googleSource, VectorSourceCustom }
