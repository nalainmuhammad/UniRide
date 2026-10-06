using UniRide.DSA.Algorithms;
using UniRide.DSA.DTOs;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

// Register singleton algorithm instances (thread-safe for read operations)
builder.Services.AddSingleton<RouteGraph>();
builder.Services.AddSingleton<AVLTree<int, BusCapacityDTO>>();
builder.Services.AddSingleton<MaxHeap<WaitlistEntry>>();
builder.Services.AddSingleton<KDTree>();
builder.Services.AddSingleton<Trie>();
builder.Services.AddSingleton<BloomFilter>();

// CORS for Django backend communication
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();
app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// ═══════════════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════════════
app.MapGet("/api/dsa/health", () =>
    TypedResults.Ok(new HealthResponse("UniRide DSA Engine", "Healthy", "2.0.0", DateTime.UtcNow))
).WithTags("Health");

// ═══════════════════════════════════════════════════════════════════════════
// ROUTE OPTIMIZATION (Dijkstra / A*)
// ═══════════════════════════════════════════════════════════════════════════
app.MapPost("/api/dsa/graph/load", (GraphLoadRequest req, RouteGraph graph) =>
{
    foreach (var node in req.Nodes)
        graph.AddNode(node.Id, node.Latitude, node.Longitude);
    foreach (var edge in req.Edges)
        graph.AddEdge(edge.From, edge.To, edge.DistanceKm, edge.CongestionFactor);

    return TypedResults.Ok(new { loaded_nodes = req.Nodes.Count, loaded_edges = req.Edges.Count });
}).WithTags("Routing");

app.MapPost("/api/dsa/route/optimize", (RouteOptimizeRequest req, RouteGraph graph) =>
{
    var result = req.Algorithm.ToLowerInvariant() == "dijkstra"
        ? graph.FindShortestPathDijkstra(req.StartNode, req.GoalNode)
        : graph.FindOptimalPathAStar(req.StartNode, req.GoalNode);

    return TypedResults.Ok(new RouteOptimizeResponse(
        result.Path,
        result.TotalDistanceKm,
        result.EstimatedMinutes,
        req.Algorithm,
        result.Found
    ));
}).WithTags("Routing");

// ═══════════════════════════════════════════════════════════════════════════
// SEAT ALLOCATION (AVL Tree)
// ═══════════════════════════════════════════════════════════════════════════
app.MapPost("/api/dsa/seats/load", (CapacityLoadRequest req, AVLTree<int, BusCapacityDTO> tree) =>
{
    foreach (var bus in req.Buses)
        tree.Insert(bus.AvailableSeats * 1000 + bus.BusId, bus); // Composite key for uniqueness

    return TypedResults.Ok(new { loaded = req.Buses.Count });
}).WithTags("Seats");

app.MapPost("/api/dsa/seats/reserve", (SeatReserveRequest req, AVLTree<int, BusCapacityDTO> tree) =>
{
    var maxBus = tree.GetMax();
    if (maxBus == null || maxBus.AvailableSeats <= 0)
    {
        return TypedResults.Ok(new SeatReserveResponse(false, null, null, "No seats available on any bus."));
    }

    // Remove old entry, decrement, re-insert
    var oldKey = maxBus.AvailableSeats * 1000 + maxBus.BusId;
    tree.Delete(oldKey);
    var updatedBus = maxBus with { AvailableSeats = maxBus.AvailableSeats - 1 };
    var newKey = updatedBus.AvailableSeats * 1000 + updatedBus.BusId;
    tree.Insert(newKey, updatedBus);

    var seatNumber = updatedBus.TotalCapacity - updatedBus.AvailableSeats;
    return TypedResults.Ok(new SeatReserveResponse(true, updatedBus.BusId, seatNumber,
        $"Seat {seatNumber} reserved on Bus {updatedBus.BusId}."));
}).WithTags("Seats");

app.MapGet("/api/dsa/seats/status", (AVLTree<int, BusCapacityDTO> tree) =>
{
    var all = tree.InOrderTraversal().Select(e => e.Value).ToList();
    return TypedResults.Ok(new AllocationStatusResponse(all, all.Sum(b => b.AvailableSeats)));
}).WithTags("Seats");

// ═══════════════════════════════════════════════════════════════════════════
// WAITLIST (MaxHeap)
// ═══════════════════════════════════════════════════════════════════════════
app.MapPost("/api/dsa/waitlist/add", (WaitlistAddRequest req, MaxHeap<WaitlistEntry> heap) =>
{
    heap.Insert(new WaitlistEntry
    {
        StudentId = req.StudentId,
        BusId = req.BusId,
        RouteId = req.RouteId,
        PriorityScore = req.PriorityScore,
        RequestedAt = DateTime.UtcNow
    });

    return TypedResults.Ok(new WaitlistResponse(true, heap.Count, "Added to waitlist."));
}).WithTags("Waitlist");

app.MapPost("/api/dsa/waitlist/pop", (MaxHeap<WaitlistEntry> heap) =>
{
    if (heap.IsEmpty)
        return TypedResults.Ok(new WaitlistResponse(false, null, "Waitlist is empty."));

    var next = heap.ExtractMax();
    return TypedResults.Ok(new WaitlistResponse(true, null,
        $"Student {next.StudentId} dequeued with priority {next.PriorityScore:F2}."));
}).WithTags("Waitlist");

app.MapGet("/api/dsa/waitlist/status", (MaxHeap<WaitlistEntry> heap) =>
{
    var top = heap.PeekAll()
        .Take(10)
        .Select(e => new WaitlistEntryDTO(e.StudentId, e.BusId, e.PriorityScore, e.RequestedAt))
        .ToList();

    return TypedResults.Ok(new WaitlistStatusResponse(heap.Count, top));
}).WithTags("Waitlist");

// ═══════════════════════════════════════════════════════════════════════════
// NEAREST STOP (KD-Tree)
// ═══════════════════════════════════════════════════════════════════════════
app.MapPost("/api/dsa/stops/load", (StopsLoadRequest req, KDTree tree) =>
{
    var points = req.Stops.Select(s => new SpatialPoint
    {
        Id = s.Id, Name = s.Name, Latitude = s.Latitude, Longitude = s.Longitude
    }).ToList();

    tree.Build(points);
    return TypedResults.Ok(new { loaded = points.Count });
}).WithTags("Stops");

app.MapPost("/api/dsa/stops/nearest", (NearestStopRequest req, KDTree tree) =>
{
    List<SpatialPoint> results;

    if (req.RadiusKm.HasValue)
    {
        results = tree.RangeSearch(req.Latitude, req.Longitude, req.RadiusKm.Value);
    }
    else
    {
        results = tree.FindKNearest(req.Latitude, req.Longitude, req.K);
    }

    var stops = results.Select(p => new StopResultDTO(p.Id, p.Name, p.Latitude, p.Longitude, p.DistanceTo)).ToList();
    return TypedResults.Ok(new NearestStopResponse(stops));
}).WithTags("Stops");

// ═══════════════════════════════════════════════════════════════════════════
// AUTOCOMPLETE (Trie)
// ═══════════════════════════════════════════════════════════════════════════
app.MapPost("/api/dsa/trie/load", (TrieLoadRequest req, Trie trie) =>
{
    foreach (var entry in req.Entries)
        trie.Insert(entry.Text, entry.Frequency);

    return TypedResults.Ok(new { loaded = req.Entries.Count, total = trie.WordCount });
}).WithTags("Autocomplete");

app.MapPost("/api/dsa/autocomplete", (AutocompleteRequest req, Trie trie) =>
{
    var results = req.FuzzyEnabled
        ? trie.SmartSearch(req.Query, req.MaxResults)
        : trie.SearchPrefix(req.Query, req.MaxResults);

    var matches = results.Select(r => new AutocompleteMatch(r.Word, r.Frequency, r.EditDistance)).ToList();
    return TypedResults.Ok(new AutocompleteResponse(matches, trie.WordCount));
}).WithTags("Autocomplete");

// ═══════════════════════════════════════════════════════════════════════════
// BLOOM FILTER (Token Verification)
// ═══════════════════════════════════════════════════════════════════════════
app.MapPost("/api/dsa/bloom/load", (BloomLoadRequest req, BloomFilter bloom) =>
{
    bloom.Clear();
    foreach (var token in req.ValidTokens)
        bloom.Add(token);

    return TypedResults.Ok(new BloomLoadResponse(req.ValidTokens.Count, bloom.BitSize, bloom.HashCount));
}).WithTags("BloomFilter");

app.MapPost("/api/dsa/bloom/check", (BloomCheckRequest req, BloomFilter bloom) =>
{
    var result = bloom.MightContain(req.TokenId);
    return TypedResults.Ok(new BloomCheckResponse(result, bloom.BitSize, bloom.HashCount));
}).WithTags("BloomFilter");

// ═══════════════════════════════════════════════════════════════════════════
// GENETIC SCHEDULER
// ═══════════════════════════════════════════════════════════════════════════
app.MapPost("/api/dsa/schedule/evolve", (ScheduleEvolveRequest req) =>
{
    var scheduler = new GeneticScheduler(req.PopulationSize, req.MutationRate);

    // Fitness function: minimize total inter-stop distances
    // In production, Django sends real distance matrix; here we use positional proximity
    Func<int[], double> fitness = sequence =>
    {
        double score = 0;
        for (int i = 0; i < sequence.Length - 1; i++)
            score -= Math.Abs(sequence[i] - sequence[i + 1]); // Penalize large jumps
        return score;
    };

    var result = scheduler.Evolve(req.StopIds.ToArray(), fitness, req.Generations);

    var response = new ScheduleEvolveResponse(
        result.OptimalSequence,
        result.BestFitness,
        result.TotalGenerations,
        result.EvolutionHistory.Select(s => new GenStatsDTO(s.Generation, s.BestFitness, s.AvgFitness)).ToList()
    );

    return TypedResults.Ok(response);
}).WithTags("Scheduler");

app.Run();
