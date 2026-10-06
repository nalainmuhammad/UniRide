namespace UniRide.DSA.Algorithms;

/// <summary>
/// Represents a weighted directed edge in the campus road network graph.
/// CongestionFactor dynamically scales distance to reflect live traffic conditions.
/// </summary>
public readonly record struct WeightedEdge(int TargetNode, double DistanceKm, double CongestionFactor)
{
    public double EffectiveCost => DistanceKm * CongestionFactor;
}

/// <summary>
/// High-performance geospatial road network graph supporting:
/// - Dijkstra's shortest-path algorithm (exact, O(E log V))
/// - A* search with Haversine great-circle heuristic (optimal, O(E log V))
/// - Dynamic congestion weight updates for real-time route recalculation
/// </summary>
public class RouteGraph
{
    private readonly Dictionary<int, List<WeightedEdge>> _adjacencyList = new();
    private readonly Dictionary<int, (double Lat, double Lng)> _nodeCoordinates = new();

    public int NodeCount => _nodeCoordinates.Count;
    public int EdgeCount => _adjacencyList.Values.Sum(edges => edges.Count);

    public void AddNode(int nodeId, double lat, double lng)
    {
        _nodeCoordinates[nodeId] = (lat, lng);
        if (!_adjacencyList.ContainsKey(nodeId))
            _adjacencyList[nodeId] = new List<WeightedEdge>();
    }

    public void AddEdge(int fromNode, int toNode, double distanceKm, double congestionFactor = 1.0)
    {
        if (!_adjacencyList.ContainsKey(fromNode))
            _adjacencyList[fromNode] = new List<WeightedEdge>();

        _adjacencyList[fromNode].Add(new WeightedEdge(toNode, distanceKm, congestionFactor));
    }

    /// <summary>
    /// Updates congestion factor on all edges originating from a given node.
    /// Called when live traffic data arrives from Redis cache.
    /// </summary>
    public void UpdateCongestion(int fromNode, int toNode, double newCongestionFactor)
    {
        if (!_adjacencyList.TryGetValue(fromNode, out var edges)) return;

        for (int i = 0; i < edges.Count; i++)
        {
            if (edges[i].TargetNode == toNode)
            {
                edges[i] = new WeightedEdge(toNode, edges[i].DistanceKm, newCongestionFactor);
                break;
            }
        }
    }

    /// <summary>
    /// Dijkstra's algorithm — computes exact shortest path without heuristic.
    /// Best for when coordinate data is unavailable or exact cost is needed.
    /// Time: O(E log V) with priority queue.
    /// </summary>
    public PathResult FindShortestPathDijkstra(int startNode, int goalNode)
    {
        var dist = new Dictionary<int, double>();
        var cameFrom = new Dictionary<int, int>();
        var pq = new PriorityQueue<int, double>();

        dist[startNode] = 0;
        pq.Enqueue(startNode, 0);

        while (pq.Count > 0)
        {
            var current = pq.Dequeue();
            if (current == goalNode)
                return BuildResult(cameFrom, dist, startNode, goalNode);

            if (!_adjacencyList.TryGetValue(current, out var edges)) continue;

            foreach (var edge in edges)
            {
                var newDist = dist[current] + edge.EffectiveCost;
                if (!dist.ContainsKey(edge.TargetNode) || newDist < dist[edge.TargetNode])
                {
                    dist[edge.TargetNode] = newDist;
                    cameFrom[edge.TargetNode] = current;
                    pq.Enqueue(edge.TargetNode, newDist);
                }
            }
        }

        return PathResult.NoPath();
    }

    /// <summary>
    /// A* search — uses Haversine great-circle distance as admissible heuristic.
    /// Faster than Dijkstra when goal coordinates are known.
    /// Time: O(E log V), typically explores fewer nodes than Dijkstra.
    /// </summary>
    public PathResult FindOptimalPathAStar(int startNode, int goalNode)
    {
        if (!_nodeCoordinates.ContainsKey(startNode) || !_nodeCoordinates.ContainsKey(goalNode))
            return PathResult.NoPath();

        var gScore = new Dictionary<int, double> { [startNode] = 0 };
        var fScore = new Dictionary<int, double>();
        var cameFrom = new Dictionary<int, int>();
        var pq = new PriorityQueue<int, double>();

        fScore[startNode] = HaversineDistance(startNode, goalNode);
        pq.Enqueue(startNode, fScore[startNode]);

        while (pq.Count > 0)
        {
            var current = pq.Dequeue();
            if (current == goalNode)
                return BuildResult(cameFrom, gScore, startNode, goalNode);

            if (!_adjacencyList.TryGetValue(current, out var edges)) continue;

            foreach (var edge in edges)
            {
                var tentativeG = gScore[current] + edge.EffectiveCost;
                if (!gScore.ContainsKey(edge.TargetNode) || tentativeG < gScore[edge.TargetNode])
                {
                    cameFrom[edge.TargetNode] = current;
                    gScore[edge.TargetNode] = tentativeG;
                    var f = tentativeG + HaversineDistance(edge.TargetNode, goalNode);
                    fScore[edge.TargetNode] = f;
                    pq.Enqueue(edge.TargetNode, f);
                }
            }
        }

        return PathResult.NoPath();
    }

    /// <summary>
    /// Haversine formula — computes great-circle distance between two GPS coordinates.
    /// Used as an admissible, consistent heuristic for A* (never overestimates).
    /// </summary>
    private double HaversineDistance(int nodeA, int nodeB)
    {
        var (lat1, lon1) = _nodeCoordinates[nodeA];
        var (lat2, lon2) = _nodeCoordinates[nodeB];

        const double R = 6371.0; // Earth radius in km
        var dLat = ToRadians(lat2 - lat1);
        var dLon = ToRadians(lon2 - lon1);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        return R * 2.0 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1.0 - a));
    }

    private static double ToRadians(double degrees) => degrees * Math.PI / 180.0;

    private PathResult BuildResult(
        Dictionary<int, int> cameFrom,
        Dictionary<int, double> costs,
        int start,
        int goal)
    {
        var path = new List<int> { goal };
        var current = goal;

        while (cameFrom.ContainsKey(current))
        {
            current = cameFrom[current];
            path.Insert(0, current);
        }

        if (path[0] != start) return PathResult.NoPath();

        var totalDistance = costs.GetValueOrDefault(goal, 0);
        // Estimate ETA at ~30 km/h average campus speed
        var etaMinutes = (totalDistance / 30.0) * 60.0;

        return new PathResult(path, Math.Round(totalDistance, 3), Math.Round(etaMinutes, 1));
    }
}

/// <summary>
/// Immutable result of a pathfinding computation.
/// </summary>
public record PathResult(List<int> Path, double TotalDistanceKm, double EstimatedMinutes)
{
    public bool Found => Path.Count > 0;
    public static PathResult NoPath() => new(new List<int>(), 0, 0);
}
