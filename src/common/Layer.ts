import BaseLayer from 'ol/layer/Base'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { OSMSource, googleSource } from './Source'
import TileSource from 'ol/source/Tile'
import VectorSource from 'ol/source/Vector'
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'

// TileLayer
function createTileLayer(source: TileSource) {
  return new TileLayer({
    source: source
  })
}
// VectorLayer
function createVectorLayer(VectorName = 'geojson', source: VectorSource, zIndex = 1, strokeColor = '', fillColor = '') {
  const layer = new VectorLayer({
    className: VectorName,
    source: source,
    opacity: 1,
    zIndex: zIndex,
    style: VectorStyle(strokeColor, fillColor)
  })
  return layer
}

const StrokeStyle = function (strokeColor) {
  return new Style({
    stroke: new Stroke({
      color: strokeColor,
      width: 2
    })
  })
}
// VectorStyle
function VectorStyle(strokeColor: string, fillColor: string) {
  return function (feature, state) {}
}

// OSM
const OSMLayer: BaseLayer = createTileLayer(OSMSource)

// googleLayer
const googleLayer: BaseLayer = createTileLayer(googleSource)

let layerList: BaseLayer[] = [googleLayer]

export { layerList }
