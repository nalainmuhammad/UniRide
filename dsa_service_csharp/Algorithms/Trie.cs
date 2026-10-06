namespace UniRide.DSA.Algorithms;

/// <summary>
/// Node in the Trie prefix tree.
/// </summary>
internal class TrieNode
{
    public Dictionary<char, TrieNode> Children { get; } = new();
    public bool IsEndOfWord { get; set; }
    public string? FullWord { get; set; }
    public int Frequency { get; set; } // For ranking popular stops higher
}

/// <summary>
/// In-memory Prefix Trie with Levenshtein fuzzy matching for stop autocomplete.
///
/// Features:
/// - O(L) exact prefix search where L = query length
/// - Fuzzy search with configurable edit distance tolerance
/// - Frequency-weighted result ranking
///
/// Used for: Instant bus stop, gate, and block search with typo tolerance.
/// </summary>
public class Trie
{
    private readonly TrieNode _root = new();
    private int _wordCount;

    public int WordCount => _wordCount;

    /// <summary>Insert a word into the trie with an optional frequency weight.</summary>
    public void Insert(string word, int frequency = 1)
    {
        if (string.IsNullOrWhiteSpace(word)) return;

        var normalized = word.Trim().ToLowerInvariant();
        var node = _root;

        foreach (var ch in normalized)
        {
            if (!node.Children.ContainsKey(ch))
                node.Children[ch] = new TrieNode();
            node = node.Children[ch];
        }

        if (!node.IsEndOfWord) _wordCount++;
        node.IsEndOfWord = true;
        node.FullWord = word.Trim(); // Preserve original casing
        node.Frequency = frequency;
    }

    /// <summary>Check if an exact word exists in the trie.</summary>
    public bool Contains(string word)
    {
        var node = FindNode(word.Trim().ToLowerInvariant());
        return node is { IsEndOfWord: true };
    }

    /// <summary>
    /// Get all words matching a given prefix, sorted by frequency (descending).
    /// </summary>
    public List<AutocompleteResult> SearchPrefix(string prefix, int maxResults = 10)
    {
        if (string.IsNullOrWhiteSpace(prefix)) return new List<AutocompleteResult>();

        var normalized = prefix.Trim().ToLowerInvariant();
        var node = FindNode(normalized);
        if (node == null) return new List<AutocompleteResult>();

        var results = new List<AutocompleteResult>();
        CollectWords(node, results, maxResults * 3); // Collect extra for sorting

        return results
            .OrderByDescending(r => r.Frequency)
            .ThenBy(r => r.Word.Length)
            .Take(maxResults)
            .ToList();
    }

    /// <summary>
    /// Fuzzy search using Levenshtein edit distance.
    /// Finds words within `maxDistance` edits of the query.
    /// </summary>
    public List<AutocompleteResult> FuzzySearch(string query, int maxDistance = 2, int maxResults = 10)
    {
        if (string.IsNullOrWhiteSpace(query)) return new List<AutocompleteResult>();

        var normalized = query.Trim().ToLowerInvariant();
        var results = new List<AutocompleteResult>();

        FuzzySearchHelper(_root, normalized, "", maxDistance, results);

        return results
            .OrderBy(r => r.EditDistance)
            .ThenByDescending(r => r.Frequency)
            .Take(maxResults)
            .ToList();
    }

    /// <summary>
    /// Combined search: first tries exact prefix, then falls back to fuzzy.
    /// </summary>
    public List<AutocompleteResult> SmartSearch(string query, int maxResults = 10)
    {
        var prefixResults = SearchPrefix(query, maxResults);
        if (prefixResults.Count >= 3) return prefixResults;

        // Combine prefix results with fuzzy results
        var fuzzyResults = FuzzySearch(query, maxDistance: 2, maxResults);
        var combined = prefixResults
            .Concat(fuzzyResults)
            .DistinctBy(r => r.Word.ToLowerInvariant())
            .Take(maxResults)
            .ToList();

        return combined;
    }

    private TrieNode? FindNode(string prefix)
    {
        var node = _root;
        foreach (var ch in prefix)
        {
            if (!node.Children.TryGetValue(ch, out var next))
                return null;
            node = next;
        }
        return node;
    }

    private void CollectWords(TrieNode node, List<AutocompleteResult> results, int limit)
    {
        if (results.Count >= limit) return;

        if (node.IsEndOfWord && node.FullWord != null)
        {
            results.Add(new AutocompleteResult(node.FullWord, node.Frequency, 0));
        }

        foreach (var child in node.Children.Values)
        {
            CollectWords(child, results, limit);
            if (results.Count >= limit) break;
        }
    }

    private void FuzzySearchHelper(TrieNode node, string target, string currentWord, int maxDist, List<AutocompleteResult> results)
    {
        if (node.IsEndOfWord && node.FullWord != null)
        {
            var dist = LevenshteinDistance(currentWord, target);
            if (dist <= maxDist)
                results.Add(new AutocompleteResult(node.FullWord, node.Frequency, dist));
        }

        foreach (var (ch, child) in node.Children)
        {
            // Pruning: if current prefix is already longer than target by more than maxDist, prune
            var newWord = currentWord + ch;
            if (newWord.Length - target.Length <= maxDist)
                FuzzySearchHelper(child, target, newWord, maxDist, results);
        }
    }

    /// <summary>
    /// Compute the Levenshtein (edit) distance between two strings.
    /// Operations: insert, delete, substitute — each costs 1.
    /// Time: O(m × n), Space: O(min(m, n)) using rolling array optimization.
    /// </summary>
    public static int LevenshteinDistance(string source, string target)
    {
        if (string.IsNullOrEmpty(source)) return target?.Length ?? 0;
        if (string.IsNullOrEmpty(target)) return source.Length;

        // Use the shorter string for the rolling array (space optimization)
        if (source.Length > target.Length)
            (source, target) = (target, source);

        var prev = new int[source.Length + 1];
        var curr = new int[source.Length + 1];

        for (int i = 0; i <= source.Length; i++) prev[i] = i;

        for (int j = 1; j <= target.Length; j++)
        {
            curr[0] = j;
            for (int i = 1; i <= source.Length; i++)
            {
                var cost = source[i - 1] == target[j - 1] ? 0 : 1;
                curr[i] = Math.Min(
                    Math.Min(curr[i - 1] + 1, prev[i] + 1),
                    prev[i - 1] + cost
                );
            }
            (prev, curr) = (curr, prev);
        }

        return prev[source.Length];
    }
}

/// <summary>
/// Result from autocomplete/fuzzy search.
/// </summary>
public record AutocompleteResult(string Word, int Frequency, int EditDistance);
