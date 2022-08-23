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

// 添加多个图层
function VectorSource(url: string) {
  return new Vector({
    url: url,
    format: new GeoJSON()
  })
}

export { OSMSource, googleSource, VectorSource }
