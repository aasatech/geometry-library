declare class MathUtil {
    /**
     * The earth's radius, in meters.
     * Mean radius as defined by IUGG.
     * https://developers.google.com/maps/documentation/javascript/reference/geometry
     * Utility functions for computing geodesic angles, distances and areas.
     * The default radius is Earth's radius of 6378137 meters.
     * 2022-01-04 - Earth's radius updated in accordance with Google Maps JavaScript API;
     */
    static get EARTH_RADIUS(): number;
    /**
     * Restrict x to the range [low, high].
     */
    static clamp(x: number, low: number, high: number): number;
    /**
     * Wraps the given value into the inclusive-exclusive interval between min and max.
     * @param n   The value to wrap.
     * @param min The minimum.
     * @param max The maximum.
     */
    static wrap(n: number, min: number, max: number): number;
    /**
     * Returns the non-negative remainder of x / m.
     * @param x The operand.
     * @param m The modulus.
     */
    static mod(x: number, m: number): number;
    /**
     * Returns mercator Y corresponding to latitude.
     * See http://en.wikipedia.org/wiki/Mercator_projection .
     */
    static mercator(lat: number): number;
    /**
     * Returns latitude from mercator Y.
     */
    static inverseMercator(y: number): number;
    /**
     * Returns haversine(angle-in-radians).
     * hav(x) == (1 - cos(x)) / 2 == sin(x / 2)^2.
     */
    static hav(x: number): number;
    /**
     * Computes inverse haversine. Has good numerical stability around 0.
     * arcHav(x) == acos(1 - 2 * x) == 2 * asin(sqrt(x)).
     * The argument must be in [0, 1], and the result is positive.
     */
    static arcHav(x: number): number;
    static sinFromHav(h: number): number;
    static havFromSin(x: number): number;
    static sinSumFromHav(x: number, y: number): number;
    /**
     * Returns hav() of distance from (lat1, lng1) to (lat2, lng2) on the unit sphere.
     */
    static havDistance(lat1: number, lat2: number, dLng: number): number;
}
export default MathUtil;
