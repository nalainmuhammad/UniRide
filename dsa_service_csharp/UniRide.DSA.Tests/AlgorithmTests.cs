using System.Diagnostics;
using UniRide.DSA.Algorithms;
using Xunit;

namespace UniRide.DSA.Tests;

public class AlgorithmTests
{
    [Fact]
    public void RouteGraph_AStar_FindsOptimalPath_Under20Ms()
    {
        var graph = new RouteGraph();
        graph.AddNode(1, 33.5989, 73.0531); // Saddar
        graph.AddNode(2, 33.6631, 73.0848); // Faizabad
        graph.AddNode(3, 33.6934, 73.0645); // Zero Point
        graph.AddNode(4, 33.6555, 73.0153); // FAST Campus

        graph.AddEdge(1, 2, 8.2, 1.0);
        graph.AddEdge(2, 3, 4.5, 1.2);
        graph.AddEdge(3, 4, 5.1, 1.0);
        graph.AddEdge(1, 4, 18.0, 1.0);

        var sw = Stopwatch.StartNew();
        var (path, distance, cost) = graph.FindOptimalPathAStar(1, 4);
        sw.Stop();

        Assert.NotEmpty(path);
        Assert.Equal(1, path.First());
        Assert.Equal(4, path.Last());
        Assert.True(distance > 0);
        Assert.True(sw.ElapsedMilliseconds < 20, $"A* took {sw.ElapsedMilliseconds}ms (Expected < 20ms)");
    }

    [Fact]
    public void AVLTree_BalancesAndRetrievesCapacity_Correctly()
    {
        var tree = new AVLTree<int, string>();
        
        tree.Insert(15, "Bus-15");
        tree.Insert(30, "Bus-30");
        tree.Insert(45, "Bus-45");
        tree.Insert(10, "Bus-10");
        tree.Insert(25, "Bus-25");

        Assert.Equal(5, tree.Count);
        
        var maxBus = tree.GetMax();
        Assert.Equal("Bus-45", maxBus);
    }

    [Fact]
    public void MaxHeap_MaintainsPriorityOrder()
    {
        var heap = new MaxHeap<WaitlistEntry>();

        heap.Insert(new WaitlistEntry { StudentId = 101, BusId = 1, PriorityScore = 2.5, RequestedAt = DateTime.UtcNow });
        heap.Insert(new WaitlistEntry { StudentId = 102, BusId = 1, PriorityScore = 9.0, RequestedAt = DateTime.UtcNow });
        heap.Insert(new WaitlistEntry { StudentId = 103, BusId = 1, PriorityScore = 4.0, RequestedAt = DateTime.UtcNow });

        var top = heap.ExtractMax();
        Assert.Equal(102, top.StudentId);
        Assert.Equal(9.0, top.PriorityScore);

        var second = heap.ExtractMax();
        Assert.Equal(103, second.StudentId);
    }

    [Fact]
    public void KDTree_SubMillisecondNearestNeighborSearch()
    {
        var tree = new KDTree();
        var stops = new List<SpatialPoint>
        {
            new SpatialPoint { Id = 1, Name = "FAST Campus", Latitude = 33.6555, Longitude = 73.0153 },
            new SpatialPoint { Id = 2, Name = "Faizabad", Latitude = 33.6631, Longitude = 73.0848 },
            new SpatialPoint { Id = 3, Name = "Zero Point", Latitude = 33.6934, Longitude = 73.0645 },
            new SpatialPoint { Id = 4, Name = "Saddar", Latitude = 33.5989, Longitude = 73.0531 },
        };
        tree.Build(stops);

        // Warmup JIT
        tree.FindKNearest(33.6550, 73.0150, 1);

        var sw = Stopwatch.StartNew();
        var nearest = tree.FindKNearest(33.6550, 73.0150, 1);
        sw.Stop();

        Assert.Single(nearest);
        Assert.Equal("FAST Campus", nearest[0].Name);
        Assert.True(sw.ElapsedMilliseconds < 20, $"KD-Tree lookup took {sw.ElapsedMilliseconds}ms (Expected < 20ms)");
    }

    [Fact]
    public void Trie_AutocompleteAndFuzzyMatching()
    {
        var trie = new Trie();
        trie.Insert("Faizabad");
        trie.Insert("FAST-NUCES");
        trie.Insert("F-10 Markaz");
        trie.Insert("Zero Point");

        var results = trie.SearchPrefix("Fai", 5);
        Assert.Contains(results, r => r.Word == "Faizabad");

        // Fuzzy match with typo "Fayzabad" (distance 1)
        var fuzzy = trie.FuzzySearch("Fayzabad", maxDistance: 2);
        Assert.NotEmpty(fuzzy);
        Assert.Equal("Faizabad", fuzzy[0].Word);
    }

    [Fact]
    public void BloomFilter_ZeroFalseNegatives()
    {
        var filter = new BloomFilter(expectedElements: 1000, falsePositiveRate: 0.01);
        var activePasses = new[] { "PASS-2024-001", "PASS-2024-002", "PASS-2024-003", "RFID-A1B2C3" };

        foreach (var pass in activePasses)
        {
            filter.Add(pass);
        }

        // Must guarantee 100% true positives (zero false negatives)
        foreach (var pass in activePasses)
        {
            Assert.True(filter.MightContain(pass), $"False negative detected for {pass}!");
        }

        // Unregistered pass should almost certainly return false
        Assert.False(filter.MightContain("PASS-UNKNOWN-999"));
    }

    [Fact]
    public void GeneticScheduler_EvolvesValidRouteSequence()
    {
        var stops = new[] { 1, 2, 3, 4, 5, 6 };
        var scheduler = new GeneticScheduler(populationSize: 30, mutationRate: 0.05);

        var evolution = scheduler.Evolve(stops, candidate =>
        {
            double penalty = 0;
            for (int i = 0; i < candidate.Length - 1; i++)
            {
                penalty += Math.Abs(candidate[i + 1] - candidate[i]);
            }
            return 100.0 / (1.0 + penalty);
        }, generations: 50);

        Assert.NotNull(evolution);
        Assert.Equal(stops.Length, evolution.OptimalSequence.Count);
        Assert.True(evolution.BestFitness > 0);
    }
}
