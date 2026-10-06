namespace UniRide.DSA.DTOs;

// ─────────────────────────── Route Optimization ───────────────────────────

public record RouteOptimizeRequest(int StartNode, int GoalNode, string Algorithm = "astar");
public record RouteOptimizeResponse(
    List<int> Path,
    double TotalDistanceKm,
    double EstimatedMinutes,
    string AlgorithmUsed,
    bool Found
);

public record GraphLoadRequest(
    List<NodeDTO> Nodes,
    List<EdgeDTO> Edges
);

public record NodeDTO(int Id, double Latitude, double Longitude, string? Name = null);
public record EdgeDTO(int From, int To, double DistanceKm, double CongestionFactor = 1.0);

// ──────────────────────── Seat Allocation (AVL) ───────────────────────────

public record SeatReserveRequest(int StudentId, int BusId, int RouteId, double PriorityScore = 1.0);
public record SeatReserveResponse(bool Success, int? AssignedBusId, int? SeatNumber, string Message);

public record BusCapacityDTO(int BusId, int AvailableSeats, int TotalCapacity);
public record CapacityLoadRequest(List<BusCapacityDTO> Buses);
public record AllocationStatusResponse(List<BusCapacityDTO> Buses, int TotalAvailableSeats);

// ────────────────────── Waitlist (MaxHeap) ─────────────────────────────────

public record WaitlistAddRequest(int StudentId, int BusId, int RouteId, double PriorityScore);
public record WaitlistResponse(bool Success, int? Position, string Message);
public record WaitlistStatusResponse(int QueueSize, List<WaitlistEntryDTO> TopEntries);
public record WaitlistEntryDTO(int StudentId, int BusId, double PriorityScore, DateTime RequestedAt);

// ─────────────────────── Nearest Stop (KD-Tree) ───────────────────────────

public record NearestStopRequest(double Latitude, double Longitude, int K = 5, double? RadiusKm = null);
public record NearestStopResponse(List<StopResultDTO> Stops);
public record StopResultDTO(int Id, string Name, double Latitude, double Longitude, double DistanceKm);

public record StopsLoadRequest(List<StopDTO> Stops);
public record StopDTO(int Id, string Name, double Latitude, double Longitude);

// ─────────────────────── Autocomplete (Trie) ──────────────────────────────

public record AutocompleteRequest(string Query, int MaxResults = 10, bool FuzzyEnabled = true);
public record AutocompleteResponse(List<AutocompleteMatch> Matches, int TotalIndexed);
public record AutocompleteMatch(string Text, int Frequency, int EditDistance);

public record TrieLoadRequest(List<TrieEntryDTO> Entries);
public record TrieEntryDTO(string Text, int Frequency = 1);

// ─────────────────────── Bloom Filter ─────────────────────────────────────

public record BloomCheckRequest(string TokenId);
public record BloomCheckResponse(bool MightBeValid, int FilterSize, int HashFunctions);

public record BloomLoadRequest(List<string> ValidTokens);
public record BloomLoadResponse(int LoadedCount, int BitArraySize, int HashFunctions);

// ─────────────────── Genetic Scheduler ────────────────────────────────────

public record ScheduleEvolveRequest(
    List<int> StopIds,
    int Generations = 200,
    int PopulationSize = 100,
    double MutationRate = 0.05
);

public record ScheduleEvolveResponse(
    List<int> OptimalSequence,
    double FitnessScore,
    int TotalGenerations,
    List<GenStatsDTO> EvolutionHistory
);

public record GenStatsDTO(int Generation, double BestFitness, double AvgFitness);

// ──────────────────────── Health Check ─────────────────────────────────────

public record HealthResponse(string Service, string Status, string Version, DateTime Timestamp);
