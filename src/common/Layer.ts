import BaseLayer from 'ol/layer/Base'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { OSMSource, googleSource, VectorSource } from './Source'

import TileSource from 'ol/source/Tile'
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'
import Fill from 'ol/style/Fill'

// TileLayer
function createTileLayer(source: TileSource, zIndex) {
  return new TileLayer({
    source: source,
    zIndex: zIndex
  })
}

// VectorLayer
function createVectorLayer(VectorName = 'geojson', url: string, strokeColor = '', fillColor = '', zIndex = 1) {
  const layer = new VectorLayer({
    className: VectorName,
    source: VectorSource(url),
    opacity: 1,
    zIndex: zIndex,
    style: VectorStyle(VectorName, strokeColor, fillColor)
  })
  return layer
}
// VectorStyle
function VectorStyle(VectorName: string, strokeColor: string, fillColor: string) {
  return function (feature, state) {
    if (VectorName === 'province') {
      return StrokeStyle(strokeColor)
    } else {
      return StrokeStyle(strokeColor).concat(fillStyle(fillColor))
    }
  }
}

const StrokeStyle = function (strokeColor: string) {
  return [
    new Style({
      stroke: new Stroke({
        color: strokeColor,
        width: 2
      })
    })
  ]
}

const fillStyle = function (fillColor: string): Style[] {
  return [
    new Style({
      fill: new Fill({
        color: fillColor
      })
    })
  ]
}

// OSM
const OSMLayer: BaseLayer = createTileLayer(OSMSource, 1)

// googleLayer
const googleLayer: BaseLayer = createTileLayer(googleSource, 1)

// provinceLayer
const provinceLayer = createVectorLayer('province', '/show/sichuan.geojson', 'yellow', '', 2)

let layerList: BaseLayer[] = [googleLayer, provinceLayer]

export { layerList, createVectorLayer }
