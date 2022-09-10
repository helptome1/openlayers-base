import { Map, View } from 'ol'
import BaseLayer from 'ol/layer/Base'
import { MapOptions } from 'ol/Map'
import Select from 'ol/interaction/Select'
import { pointerMove } from 'ol/events/condition'
import Style from 'ol/style/Style'

import Stroke from 'ol/style/Stroke'
import Fill from 'ol/style/Fill'
import Text from 'ol/style/Text'

export function createMap(view: View, layers: BaseLayer[], options?: MapOptions) {
  return new Map({
    target: 'map',
    view: view,
    layers: layers,
    ...options
  })
}

// interaction
export function addInteraction() {
  const selectInteraction = new Select({
    condition: pointerMove,
    style: function (feature, res) {
      console.log('feature', feature, 'res', res)
      const name = feature.get('name')
      return [
        new Style({
          fill: new Fill({
            color: 'rgba(255,92,92, 0.2)'
          }),
          stroke: new Stroke({
            color: 'rgba(255,92,92, 1)',
            // lineDash: [5],
            width: 4
          }),
          text: new Text({
            text: name,
            font: '12px',
            fill: new Fill({
              color: 'white'
            })
          })
        })
      ]
    }
  })
  return selectInteraction
}
