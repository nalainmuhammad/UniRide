namespace UniRide.DSA.Algorithms;

/// <summary>
/// A 2D point representing a bus stop with its GPS coordinates.
/// </summary>
public class SpatialPoint
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double DistanceTo { get; set; } // Populated during nearest-neighbor queries

    public double GetDimension(int axis) => axis == 0 ? Latitude : Longitude;
}

/// <summary>
/// Internal node of the KD-Tree.
/// </summary>
internal class KDNode
{
    public SpatialPoint Point { get; set; }
    public KDNode? Left { get; set; }
    public KDNode? Right { get; set; }
    public int Depth { get; set; }

    public KDNode(SpatialPoint point, int depth)
    {
        Point = point;
        Depth = depth;
    }
}

/// <summary>
/// 2D K-Dimensional Tree for spatial nearest-stop indexing.
/// Alternates splitting on latitude (axis 0) and longitude (axis 1).
///
/// Operations:
/// - Build: O(n log n) from sorted stop list
/// - Nearest Neighbor: O(log n) average case
/// - K-Nearest Neighbors: O(n^(1-1/k) + k) average case
/// - Range Search: O(n^(1-1/k) + m) where m = results count
///
/// Used for:
/// - Finding the nearest bus stop to a student's GPS coordinates
/// - Geofenced driver shift check-in verification
/// </summary>
public class KDTree
{
    private KDNode? _root;

    /// <summary>Build the KD-Tree from a list of spatial points.</summary>
    public void Build(List<SpatialPoint> points)
    {
        _root = BuildTree(points, 0);
    }

    private KDNode? BuildTree(List<SpatialPoint> points, int depth)
    {
        if (points.Count == 0) return null;

        int axis = depth % 2; // Alternate between lat (0) and lng (1)
        points.Sort((a, b) => a.GetDimension(axis).CompareTo(b.GetDimension(axis)));

        int median = points.Count / 2;
        var node = new KDNode(points[median], depth)
        {
            Left = BuildTree(points.GetRange(0, median), depth + 1),
            Right = median + 1 < points.Count
                ? BuildTree(points.GetRange(median + 1, points.Count - median - 1), depth + 1)
                : null
        };

        return node;
    }

    /// <summary>Find the single nearest stop to the given coordinates.</summary>
    public SpatialPoint? FindNearest(double latitude, double longitude)
    {
        if (_root == null) return null;

        var target = new SpatialPoint { Latitude = latitude, Longitude = longitude };
        SpatialPoint? best = null;
        double bestDist = double.MaxValue;

        NearestSearch(_root, target, ref best, ref bestDist);

        if (best != null)
            best.DistanceTo = Math.Round(bestDist, 4);

        return best;
    }

    /// <summary>Find the K nearest stops to the given coordinates.</summary>
    public List<SpatialPoint> FindKNearest(double latitude, double longitude, int k)
    {
        if (_root == null) return new List<SpatialPoint>();

        var target = new SpatialPoint { Latitude = latitude, Longitude = longitude };
        // Use a max-heap bounded at size k (worst candidate on top)
        var candidates = new SortedList<double, SpatialPoint>();
        KNearestSearch(_root, target, k, candidates);

        return candidates.Values
            .Select(p =>
            {
                p.DistanceTo = Math.Round(HaversineKm(target, p), 4);
                return p;
            })
            .OrderBy(p => p.DistanceTo)
            .ToList();
    }

    /// <summary>Find all stops within a given radius (in km).</summary>
    public List<SpatialPoint> RangeSearch(double latitude, double longitude, double radiusKm)
    {
        var target = new SpatialPoint { Latitude = latitude, Longitude = longitude };
        var results = new List<SpatialPoint>();
        RangeSearchHelper(_root, target, radiusKm, results);

        return results
            .Select(p =>
            {
                p.DistanceTo = Math.Round(HaversineKm(target, p), 4);
                return p;
            })
            .OrderBy(p => p.DistanceTo)
            .ToList();
    }

    private void NearestSearch(KDNode? node, SpatialPoint target, ref SpatialPoint? best, ref double bestDist)
    {
        if (node == null) return;

        var dist = HaversineKm(target, node.Point);
        if (dist < bestDist)
        {
            bestDist = dist;
            best = node.Point;
        }

        int axis = node.Depth % 2;
        double diff = target.GetDimension(axis) - node.Point.GetDimension(axis);

        var first = diff < 0 ? node.Left : node.Right;
        var second = diff < 0 ? node.Right : node.Left;

        NearestSearch(first, target, ref best, ref bestDist);

        // Check if we need to explore the other subtree
        // Approximate axis distance in km for pruning
        double axisDist = Math.Abs(diff) * 111.32; // ~111.32 km per degree at equator
        if (axisDist < bestDist)
            NearestSearch(second, target, ref best, ref bestDist);
    }

    private void KNearestSearch(KDNode? node, SpatialPoint target, int k, SortedList<double, SpatialPoint> candidates)
    {
        if (node == null) return;

        var dist = HaversineKm(target, node.Point);

        // Add a tiny unique offset to avoid duplicate keys in SortedList
        var key = dist + node.Point.Id * 1e-10;

        if (candidates.Count < k)
        {
            candidates.Add(key, node.Point);
        }
        else if (dist < candidates.Keys[candidates.Count - 1])
        {
            candidates.RemoveAt(candidates.Count - 1);
            candidates.Add(key, node.Point);
        }

        int axis = node.Depth % 2;
        double diff = target.GetDimension(axis) - node.Point.GetDimension(axis);

        var first = diff < 0 ? node.Left : node.Right;
        var second = diff < 0 ? node.Right : node.Left;

        KNearestSearch(first, target, k, candidates);

        double axisDist = Math.Abs(diff) * 111.32;
        double worstBest = candidates.Count < k ? double.MaxValue : candidates.Keys[candidates.Count - 1];
        if (axisDist < worstBest)
            KNearestSearch(second, target, k, candidates);
    }

    private void RangeSearchHelper(KDNode? node, SpatialPoint target, double radiusKm, List<SpatialPoint> results)
    {
        if (node == null) return;

        var dist = HaversineKm(target, node.Point);
        if (dist <= radiusKm)
            results.Add(node.Point);

        int axis = node.Depth % 2;
        double diff = target.GetDimension(axis) - node.Point.GetDimension(axis);
        double axisDist = Math.Abs(diff) * 111.32;

        if (diff < 0 || axisDist <= radiusKm) RangeSearchHelper(node.Left, target, radiusKm, results);
        if (diff >= 0 || axisDist <= radiusKm) RangeSearchHelper(node.Right, target, radiusKm, results);
    }

    /// <summary>Haversine formula for great-circle distance in kilometers.</summary>
    private static double HaversineKm(SpatialPoint a, SpatialPoint b)
    {
        const double R = 6371.0;
        var dLat = (b.Latitude - a.Latitude) * Math.PI / 180.0;
        var dLon = (b.Longitude - a.Longitude) * Math.PI / 180.0;

        var sinLat = Math.Sin(dLat / 2);
        var sinLon = Math.Sin(dLon / 2);

        var h = sinLat * sinLat +
                Math.Cos(a.Latitude * Math.PI / 180.0) *
                Math.Cos(b.Latitude * Math.PI / 180.0) *
                sinLon * sinLon;

        return R * 2.0 * Math.Atan2(Math.Sqrt(h), Math.Sqrt(1.0 - h));
    }
}
