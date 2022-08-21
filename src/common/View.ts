import { View } from 'ol'
import { transform } from 'ol/proj'
import { ViewOptions } from 'ol/View'

function viewOptions(options?: ViewOptions) {
  return new View({
    center: transform([102.529257, 30.174407], 'EPSG:4326', 'EPSG:3857'),
    projection: 'EPSG:3857',
    zoom: 7,
    maxZoom: 19,
    minZoom: 2,
    constrainResolution: true,
    ...options
  })
}

export { viewOptions }
