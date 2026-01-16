declare module 'coordtransform' {
  /**
   * 将 WGS84 坐标转换为 GCJ02 坐标 (火星坐标)
   * @param lng 经度 (longitude)
   * @param lat 纬度 (latitude)
   * @returns [lng, lat] GCJ02 坐标
   */
  function wgs84togcj02(lng: number, lat: number): [number, number];

  /**
   * 将 GCJ02 坐标 (火星坐标) 转换为 WGS84 坐标
   * @param lng 经度 (longitude)
   * @param lat 纬度 (latitude)
   * @returns [lng, lat] WGS84 坐标
   */
  function gcj02towgs84(lng: number, lat: number): [number, number];

  /**
   * 将 GCJ02 坐标 (火星坐标) 转换为 BD09 坐标 (百度坐标)
   * @param lng 经度 (longitude)
   * @param lat 纬度 (latitude)
   * @returns [lng, lat] BD09 坐标
   */
  function gcj02tobd09(lng: number, lat: number): [number, number];

  /**
   * 将 BD09 坐标 (百度坐标) 转换为 GCJ02 坐标 (火星坐标)
   * @param lng 经度 (longitude)
   * @param lat 纬度 (latitude)
   * @returns [lng, lat] GCJ02 坐标
   */
  function bd09togcj02(lng: number, lat: number): [number, number];

  /**
   * 将 WGS84 坐标转换为 BD09 坐标 (百度坐标)
   * @param lng 经度 (longitude)
   * @param lat 纬度 (latitude)
   * @returns [lng, lat] BD09 坐标
   */
  function wgs84tobd09(lng: number, lat: number): [number, number];

  /**
   * 将 BD09 坐标 (百度坐标) 转换为 WGS84 坐标
   * @param lng 经度 (longitude)
   * @param lat 纬度 (latitude)
   * @returns [lng, lat] WGS84 坐标
   */
  function bd09towgs84(lng: number, lat: number): [number, number];

  // If coordtransform exports a default, you might add:
  export default {
    wgs84togcj02,
    gcj02towgs84,
    gcj02tobd09,
    bd09togcj02,
    wgs84tobd09,
  };
}
