import { Path } from "./SphericalUtil";
declare class PolyUtil {
    static get DEFAULT_TOLERANCE(): number;
    /**
     * Returns tan(latitude-at-lng3) on the great circle (lat1, lng1) to (lat2, lng2). lng1==0.
     * See http://williams.best.vwh.net/avform.htm .
     */
    static tanLatGC(lat1: number, lat2: number, lng2: number, lng3: number): number;
    /**
     * Returns mercator(latitude-at-lng3) on the Rhumb line (lat1, lng1) to (lat2, lng2). lng1==0.
     */
    static mercatorLatRhumb(lat1: number, lat2: number, lng2: number, lng3: number): number;
    /**
     * Computes whether the vertical segment (lat3, lng3) to South Pole intersects the segment
     * (lat1, lng1) to (lat2, lng2).
     * Longitudes are offset by -lng1; the implicit lng1 becomes 0.
     */
    static intersects(lat1: number, lat2: number, lng2: number, lat3: number, lng3: number, geodesic: boolean): boolean;
    /**
     * Computes whether the given point lies inside the specified polygon.
     * The polygon is always cosidered closed, regardless of whether the last point equals
     * the first or not.
     * Inside is defined as not containing the South Pole -- the South Pole is always outside.
     * The polygon is formed of great circle segments if geodesic is true, and of rhumb
     * (loxodromic) segments otherwise.
     */
    static containsLocation(point: Path, polygon: Path[], geodesic?: boolean): boolean;
    /**
     * Computes whether the given point lies on or near the edge of a polygon, within a specified
     * tolerance in meters. The polygon edge is composed of great circle segments if geodesic
     * is true, and of Rhumb segments otherwise. The polygon edge is implicitly closed -- the
     * closing segment between the first point and the last point is included.
     */
    static isLocationOnEdge(point: Path, polygon: Path[], tolerance?: number, geodesic?: boolean): boolean;
    /**
     * Computes whether the given point lies on or near a polyline, within a specified
     * tolerance in meters. The polyline is composed of great circle segments if geodesic
     * is true, and of Rhumb segments otherwise. The polyline is not closed -- the closing
     * segment between the first point and the last point is not included.
     */
    static isLocationOnPath(point: Path, polyline: Path[], tolerance?: number, geodesic?: boolean): boolean;
    static isLocationOnEdgeOrPath(point: Path, poly: Path[], closed: boolean, geodesic: any, toleranceEarth: number): boolean;
    /**
     * Returns sin(initial bearing from (lat1,lng1) to (lat3,lng3) minus initial bearing
     * from (lat1, lng1) to (lat2,lng2)).
     */
    static sinDeltaBearing(lat1: number, lng1: number, lat2: number, lng2: number, lat3: number, lng3: number): number;
    static isOnSegmentGC(lat1: number, lng1: number, lat2: number, lng2: number, lat3: number, lng3: number, havTolerance: number): boolean;
    /**
     * Computes the distance on the sphere between the point p and the line segment start to end.
     *
     * @param p the point to be measured
     * @param start the beginning of the line segment
     * @param end the end of the line segment
     * @return the distance in meters (assuming spherical earth)
     */
    static distanceToLine(p: Path, start: Path, end: Path): number;
    /**
     * Decodes an encoded path string into a sequence of LatLngs.
     */
    static decode(encodedPath: string, precision?: number): {
        lat: number;
        lng: number;
    }[];
    /**
     * Encodes a sequence of LatLngs into an encoded path string.
     */
    static encode(path: Path[], precision?: number): string;
}
export default PolyUtil;
