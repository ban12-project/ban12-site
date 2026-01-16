type MapType = 'apple' | 'google' | 'amap' | 'baidu' | 'tencent';

export function generateMapLink(
  type: 'apple',
  params: Partial<AppleMapParams>,
): string;
export function generateMapLink(
  type: 'google',
  params: GoogleMapParams,
): string;
export function generateMapLink(type: 'amap', params: AMapParams): string;
export function generateMapLink(type: 'baidu', params: BaiduMapParams): string;
export function generateMapLink(
  type: 'tencent',
  params: TencentMapParams,
): string;
export function generateMapLink(
  type: MapType,
  params: Record<string, string>,
): string {
  const baseUrl = {
    apple: 'https://maps.apple.com/',
    google: 'https://www.google.com/maps/search/',
    amap: 'https://uri.amap.com/marker',
    baidu: 'https://api.map.baidu.com/marker',
    tencent: 'https://apis.map.qq.com/uri/v1/marker',
  }[type];

  const queryString = new URLSearchParams(params).toString();

  return `${baseUrl}?${queryString}`;
}

/** https://developer.apple.com/library/archive/featuredarticles/iPhoneURLScheme_Reference/MapLinks/MapLinks.html */
type AppleMapParams = {
  /**
   * The map type. If you don’t specify one of the documented values, the current map type is used.
   * m(standard view)
   * k(satellite view)
   * h(hybrid view)
   * r(transit view)
   */
  t: 'm' | 'k' | 'h' | 'r';
  /**
   * The query. This parameter is treated as if its value had been typed into the Maps search field by the user. Note that q=* is not supported
   * The q parameter can also be used as a label if the location is explicitly defined in the ll or address parameters.
   * A URL-encoded string that describes the search object, such as “pizza,” or an address to be geocoded
   */
  q: string;
  /**
   * The address. Using the address parameter simply displays the specified location, it does not perform a search for the location.
   * An address string that geolocation can understand.
   */
  address: string;
  /**
   * A hint used during search. If the sll parameter is missing or its value is incomplete, the value of near is used instead.
   * A comma-separated pair of floating point values that represent latitude and longitude (in that order).
   */
  near: string;
  /**
   * The location around which the map should be centered.
   * The ll parameter can also represent a pin location when you use the q parameter to specify a name.
   * A comma-separated pair of floating point values that represent latitude and longitude (in that order).
   */
  ll: string;
  /**
   * The zoom level. You can use the z parameter only when you also use the ll parameter; in particular, you can’t use z in combination with the spn or sspn parameters.
   * A floating point value between 2 and 21 that defines the area around the center point that should be displayed.
   */
  z: RangeString<2, 21>;
  /**
   * The area around the center point, or span. The center point is specified by the ll parameter.
   * You can’t use the spn parameter in combination with the z parameter.
   * A coordinate span (see [MKCoordinateSpan](https://developer.apple.com/documentation/mapkit/mkcoordinatespan)) denoting a latitudinal delta and a longitudinal delta.
   */
  spn: string;
  /**
   * The source address to be used as the starting point for directions.
   * A complete directions request includes the saddr, daddr, and dirflg parameters, but only the daddr parameter is required. If you don’t specify a value for saddr, the starting point is “here.”
   * An address string that geolocation can understand.
   */
  saddr: string;
  /**
   * The destination address to be used as the destination point for directions.
   * A complete directions request includes the saddr, daddr, and dirflg parameters, but only the daddr parameter is required.
   * An address string that geolocation can understand.
   */
  daddr: string;
  /**
   * The transport type.
   * A complete directions request includes the saddr, daddr, and dirflg parameters, but only the daddr parameter is required. If you don’t specify one of the documented transport type values, the dirflg parameter is ignored; if you don’t specify any value, Maps uses the user’s preferred transport type or the previous setting.
   * d (by car)
   * w (by foot)
   * r (by public transit)
   */
  dirflg: 'd' | 'w' | 'r';
  /**
   * The search location. You can specify the sll parameter by itself or in combination with the q parameter. For example, http://maps.apple.com/?sll=50.894967,4.341626&z=10&t=s is a valid query.
   * A comma-separated pair of floating point values that represent latitude and longitude (in that order).
   */
  sll: string;
  /**
   * The screen span. Use the sspn parameter to specify a span around the search location specified by the sll parameter.
   * A coordinate span (see [MKCoordinateSpan](https://developer.apple.com/documentation/mapkit/mkcoordinatespan)) denoting a latitudinal delta and a longitudinal delta.
   */
  sspn: string;
};

/** https://developers.google.com/maps/documentation/urls/get-started */
type GoogleMapParams = {
  /** 重要提示：参数 api=1 用于标识此网址适用的 Google 地图网址版本。每个请求中都必须包含此参数。唯一的有效值为 1。如果网址中不存在 api=1，系统会忽略所有参数，并在浏览器或 Google 地图移动应用中启动默认的 Google 地图应用（具体取决于所使用的平台，例如 https://www.google.com/maps）。 */
  api: '1';
  /**
   * 定义要在地图上突出显示的地点。所有搜索请求都必须包含此查询参数
   * 您可以通过地点名称、地址或以英文逗号分隔的经纬度坐标来指定位置。字符串应采用网址编码，因此“City Hall, New York, NY”等地址应转换为 City+Hall%2C+New+York%2C+NY。
   * 将常规搜索字词指定为网址编码字符串，例如 grocery+stores 或 restaurants+in+seattle+wa。
   */
  query: string;
};

/** https://lbs.amap.com/api/uri-api/gettingstarted */
type AMapParams = {
  /**
   * 位置点经纬度坐标，格式为: position=lon,lat
   * lon表示经度，lat表示纬度
   */
  position: string;
  /**
   * 用户自定义显示名称
   */
  name?: string;
  /**
   * 使用方来源信息
   */
  src?: string;

  /**
   * 坐标系参数coordinate=gaode,表示高德坐标（gcj02坐标），coordinate=wgs84,表示wgs84坐标（GPS原始坐标）
   * 默认为高德坐标系（gcj02坐标系）
   */
  coordinate?: 'gaode' | 'wgs84';
  /**
   * 是否尝试调起高德地图APP并在APP中查看，0表示不调起，1表示调起, 默认值为0
   * 该参数仅在移动端有效
   */
  callnative?: '0' | '1';
};

type BaiduMapParams = {
  /** 纬度,经度 */
  location: string;
  /** 所在位置名称 */
  title?: string;
  /** 所在位置的简介 */
  content?: string;
  output?: 'html';
};

/** https://lbs.qq.com/webApi/uriV1/uriGuide/uriWebGuide */
type TencentMapParams = {
  /**
   * search，地点/公交搜索，周边搜索；
   * routeplan，路线规划，包括公交、驾车；
   * geocoder，逆地址解析；
   * marker，地点标注；
   * streetview，街景展示。
   */
  // method: 'search' | 'routeplan' | 'geocoder' | 'marker' | 'streetview'
  /**
   * marker参数的格式：
   * marker=markerAttributesImarkerAttributesI…
   * 每个markerAttributes定义了一个标注的全部属性，markerAttributes之间以"I"分隔。
   * markerAttributes格式：
   * key:value;key:value…
   * key是属性名，key取值包括coord、title、addr、tel、uid等属性名，参见marker属性表。
   * value是属性值，如coord的value形式为"lat,lng"。各属性的取值说明请参考：marker属性表。
   * 各key和value之间用英文冒号分隔，各key/value对之间用英文分号分隔。
   * 注：目前PC端仅支持添加一个标注，也即只能有一个属性集。移动端支持多个点的标注，参考 [位置展示组件](https://lbs.qq.com/tool/component-marker.html)
   *
   * @example
   * marker=coord:39.892326,116.342763;title:超好吃冰激凌;addr:手帕口桥北铁路道口
   *
   * marker属性表
   * coord: 标注点的位置坐标： lat,lng 注意：纬度在前，经度在后，两值之间用英文逗号分隔。 coord:39.892326,116.342763
   * title: 标注点名称 title:超好吃冰激凌
   * addr: 地址 addr:北京市手帕口桥北铁路道口
   * tel?: 电话 tel:010-88888888
   * uid?: 该参数将指定一个POI的唯一标识，可根据id获取腾讯基础库中的POI详情 uid:11031837053015339230
   */
  marker: string;
  /**
   * 坐标类型，取值如下：
   * 1 GPS
   * 2 腾讯坐标（默认）
   * 如果用户指定该参数为非腾讯地图坐标系，则URI API自动进行坐标处理，以便准确对应到腾讯地图底图上。 coord_type=1
   */
  coord_type?: '1' | '2';
  /**
   * 调用来源，一般为您的应用名称，为了保障对您的服务，请务必填写！
   * referer=您的应用名
   */
  referer: string;
};
