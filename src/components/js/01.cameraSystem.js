export default function (viewer, Cesium) {
  // 1. Cesium的相机系统，setView
  // 1. 把笛卡尔坐标系转换为世界坐标，也是把经纬度转换为世界坐标
  const position = Cesium.cartesian3.fromDegrees(116.39, 39.91, 400);
  viewer.camera.setView({
    destination: position,//设定相机的目的地
    // 用于设置相机是口的方向。
    orientation: {
      heading: Cesium.Math.toRadians(0),//数值为0 代表正北方向；相当于沿着Y轴旋转。
      pitch: Cesium.toRadians(-90),// 即沿着X轴进行旋转
      roll: 0 //沿着z轴旋转。
    }
  })
}