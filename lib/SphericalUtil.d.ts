export declare type Path = {
    lat: number;
    lng: number;
};
export declare function deg2rad(degrees: number): number;
export declare function rad2deg(radians: number): number;
declare class SphericalUtil {
    /**
     * Returns the heading from one LatLng to another LatLng. Headings are
     * expressed in degrees clockwise from North within the range [-180,180).
     * @return The heading in degrees clockwise from north.
     */
    static computeHeading(from: Path, to: Path): number;
    /**
     * Returns the LatLng resulting from moving a distance from an origin
     * in the specified heading (expressed in degrees clockwise from north).
     * @param from     The LatLng from which to start.
     * @param distance The distance to travel.
     * @param heading  The heading in degrees clockwise from north.
     */
    static computeOffset(from: Path, distance: number, heading: number): {
        lat: number;
        lng: number;
    };
    /**
     * Returns the location of origin when provided with a LatLng destination,
     * meters travelled and original heading. Headings are expressed in degrees
     * clockwise from North. This function returns null when no solution is
     * available.
     * @param to       The destination LatLng.
     * @param distance The distance travelled, in meters.
     * @param heading  The heading in degrees clockwise from north.
     */
    static computeOffsetOrigin(to: Path, distance: number, heading: number): {
        lat: number;
        lng: number;
    } | null;
    /**
     * Returns the LatLng which lies the given fraction of the way between the
     * origin LatLng and the destination LatLng.
     * @param from     The LatLng from which to start.
     * @param to       The LatLng toward which to travel.
     * @param fraction A fraction of the distance to travel.
     * @return The interpolated LatLng.
     */
    static interpolate(from: Path, to: Path, fraction: number): Path;
    /**
     * Returns distance on the unit sphere; the arguments are in radians.
     */
    static distanceRadians(lat1: number, lng1: number, lat2: number, lng2: number): number;
    /**
     * Returns the angle between two LatLngs, in radians. This is the same as the distance
     * on the unit sphere.
     */
    static computeAngleBetween(from: Path, to: Path): number;
    /**
     * Returns the distance between two LatLngs, in meters.
     */
    static computeDistanceBetween(from: Path, to: Path): number;
    /**
     * Returns the length of the given path, in meters, on Earth.
     */
    static computeLength(path: Path[]): number;
    /**
     * Returns the area of a closed path on Earth.
     * @param path A closed path.
     * @return The path's area in square meters.
     */
    static computeArea(path: Path[]): number;
    /**
     * Returns the signed area of a closed path on Earth. The sign of the area may be used to
     * determine the orientation of the path.
     * "inside" is the surface that does not contain the South Pole.
     * @param path A closed path.
     * @return The loop's area in square meters.
     */
    static computeSignedArea(path: Path[]): number;
    /**
     * Returns the signed area of a closed path on a sphere of given radius.
     * The computed area uses the same units as the radius squared.
     * Used by SphericalUtilTest.
     */
    static computeSignedAreaP(path: Path[], radius: number): number;
    /**
     * Returns the signed area of a triangle which has North Pole as a vertex.
     * Formula derived from "Area of a spherical triangle given two edges and the included angle"
     * as per "Spherical Trigonometry" by Todhunter, page 71, section 103, point 2.
     * See http://books.google.com/books?id=3uBHAAAAIAAJ&pg=PA71
     * The arguments named "tan" are tan((pi/2 - latitude)/2).
     */
    static polarTriangleArea(tan1: number, lng1: number, tan2: number, lng2: number): number;
}
export default SphericalUtil;
