namespace UniRide.DSA.Algorithms;

/// <summary>
/// Represents a single fleet schedule candidate (chromosome) in the genetic algorithm.
/// Each chromosome encodes a permutation of stop assignments across buses.
/// </summary>
public class ScheduleChromosome
{
    public int[] StopSequence { get; set; }
    public double Fitness { get; set; }

    public ScheduleChromosome(int[] stops)
    {
        StopSequence = stops;
    }

    public ScheduleChromosome Clone() => new(StopSequence.ToArray()) { Fitness = Fitness };
}

/// <summary>
/// Multi-Objective Genetic Algorithm for fleet scheduling optimization.
///
/// Solves a variant of the Capacitated Vehicle Routing Problem with Time Windows (CVRPTW),
/// an NP-hard combinatorial optimization problem.
///
/// Algorithm:
/// 1. Initialize random population of candidate schedules
/// 2. Evaluate fitness using multi-objective function (fuel, wait time, utilization)
/// 3. Select parents via tournament selection
/// 4. Create offspring via Order Crossover (OX) preserving valid permutations
/// 5. Apply swap mutation with configurable rate
/// 6. Elitism: preserve best candidate across generations
/// 7. Repeat for N generations
///
/// Time: O(G × P × S) where G=generations, P=population, S=stops
/// </summary>
public class GeneticScheduler
{
    private readonly Random _rng;
    private readonly int _populationSize;
    private readonly double _mutationRate;
    private readonly int _tournamentSize;

    public GeneticScheduler(int populationSize = 100, double mutationRate = 0.05, int tournamentSize = 5, int? seed = null)
    {
        _populationSize = populationSize;
        _mutationRate = mutationRate;
        _tournamentSize = tournamentSize;
        _rng = seed.HasValue ? new Random(seed.Value) : new Random();
    }

    /// <summary>
    /// Evolve an optimal schedule over multiple generations.
    /// </summary>
    /// <param name="allStops">Array of all stop IDs to be routed.</param>
    /// <param name="fitnessFunction">Evaluation function that scores a stop sequence (higher = better).</param>
    /// <param name="generations">Number of evolutionary generations.</param>
    /// <returns>The best schedule found and evolution statistics.</returns>
    public EvolutionResult Evolve(int[] allStops, Func<int[], double> fitnessFunction, int generations = 200)
    {
        var population = InitializePopulation(allStops);
        var stats = new List<GenerationStats>();
        ScheduleChromosome? globalBest = null;

        for (int gen = 0; gen < generations; gen++)
        {
            // Evaluate fitness
            foreach (var individual in population)
                individual.Fitness = fitnessFunction(individual.StopSequence);

            population = population.OrderByDescending(x => x.Fitness).ToList();

            var best = population[0];
            if (globalBest == null || best.Fitness > globalBest.Fitness)
                globalBest = best.Clone();

            stats.Add(new GenerationStats(
                gen,
                Math.Round(best.Fitness, 4),
                Math.Round(population.Average(p => p.Fitness), 4)
            ));

            // Create next generation
            var nextGen = new List<ScheduleChromosome>
            {
                globalBest.Clone() // Elitism: always carry the best forward
            };

            while (nextGen.Count < _populationSize)
            {
                var parent1 = TournamentSelect(population);
                var parent2 = TournamentSelect(population);
                var child = OrderCrossover(parent1, parent2);
                SwapMutate(child);
                nextGen.Add(child);
            }

            population = nextGen;
        }

        return new EvolutionResult(
            globalBest!.StopSequence.ToList(),
            Math.Round(globalBest.Fitness, 4),
            generations,
            stats
        );
    }

    private List<ScheduleChromosome> InitializePopulation(int[] stops)
    {
        return Enumerable.Range(0, _populationSize)
            .Select(_ =>
            {
                var shuffled = stops.ToArray();
                FisherYatesShuffle(shuffled);
                return new ScheduleChromosome(shuffled);
            })
            .ToList();
    }

    private ScheduleChromosome TournamentSelect(List<ScheduleChromosome> population)
    {
        ScheduleChromosome? best = null;
        for (int i = 0; i < _tournamentSize; i++)
        {
            var candidate = population[_rng.Next(population.Count)];
            if (best == null || candidate.Fitness > best.Fitness)
                best = candidate;
        }
        return best!;
    }

    /// <summary>
    /// Order Crossover (OX): preserves relative ordering of stops.
    /// 1. Copy a random segment from parent1
    /// 2. Fill remaining positions with stops from parent2 in order
    /// This guarantees a valid permutation (no duplicate stops).
    /// </summary>
    private ScheduleChromosome OrderCrossover(ScheduleChromosome p1, ScheduleChromosome p2)
    {
        int len = p1.StopSequence.Length;
        int a = _rng.Next(len), b = _rng.Next(len);
        int start = Math.Min(a, b), end = Math.Max(a, b);

        var childStops = new int[len];
        Array.Fill(childStops, -1);

        // Copy segment from parent1
        var usedStops = new HashSet<int>();
        for (int i = start; i <= end; i++)
        {
            childStops[i] = p1.StopSequence[i];
            usedStops.Add(childStops[i]);
        }

        // Fill from parent2 in order
        int p2Idx = 0;
        for (int i = 0; i < len; i++)
        {
            if (childStops[i] != -1) continue;
            while (usedStops.Contains(p2.StopSequence[p2Idx])) p2Idx++;
            childStops[i] = p2.StopSequence[p2Idx];
            usedStops.Add(childStops[i]);
            p2Idx++;
        }

        return new ScheduleChromosome(childStops);
    }

    /// <summary>Swap mutation: randomly swaps two positions with probability = mutationRate.</summary>
    private void SwapMutate(ScheduleChromosome individual)
    {
        if (_rng.NextDouble() >= _mutationRate) return;

        int i = _rng.Next(individual.StopSequence.Length);
        int j = _rng.Next(individual.StopSequence.Length);
        (individual.StopSequence[i], individual.StopSequence[j]) =
            (individual.StopSequence[j], individual.StopSequence[i]);
    }

    private void FisherYatesShuffle(int[] arr)
    {
        for (int i = arr.Length - 1; i > 0; i--)
        {
            int j = _rng.Next(i + 1);
            (arr[i], arr[j]) = (arr[j], arr[i]);
        }
    }
}

public record GenerationStats(int Generation, double BestFitness, double AvgFitness);

public record EvolutionResult(
    List<int> OptimalSequence,
    double BestFitness,
    int TotalGenerations,
    List<GenerationStats> EvolutionHistory
);
