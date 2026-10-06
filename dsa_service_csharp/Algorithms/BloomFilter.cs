namespace UniRide.DSA.Algorithms;

/// <summary>
/// Probabilistic Bloom Filter for O(1) token/pass verification.
///
/// Guarantees:
/// - If MightContain returns FALSE → element is DEFINITELY NOT in the set (zero false negatives)
/// - If MightContain returns TRUE → element is PROBABLY in the set (configurable false positive rate)
///
/// Uses multiple independent hash functions (FNV-1a family) to set/check bits in a bit array.
/// At 5000 expected elements and 1% FPR, this uses ~6KB of memory vs. megabytes for a HashSet.
///
/// Used for:
/// - Instant rejection of invalid/expired QR tokens before hitting the database
/// - Duplicate boarding scan prevention
/// </summary>
public class BloomFilter
{
    private readonly byte[] _bitArray;
    private readonly int _bitSize;
    private readonly int _hashCount;
    private int _insertedCount;

    public int BitSize => _bitSize;
    public int HashCount => _hashCount;
    public int InsertedCount => _insertedCount;

    /// <summary>
    /// Create a Bloom Filter optimized for the expected number of elements and desired false positive rate.
    /// </summary>
    /// <param name="expectedElements">Expected number of unique tokens to store.</param>
    /// <param name="falsePositiveRate">Desired false positive probability (e.g., 0.01 = 1%).</param>
    public BloomFilter(int expectedElements = 5000, double falsePositiveRate = 0.01)
    {
        // Optimal bit array size: m = -(n * ln(p)) / (ln(2))^2
        _bitSize = (int)(-(expectedElements * Math.Log(falsePositiveRate)) / Math.Pow(Math.Log(2), 2));
        // Optimal hash count: k = (m / n) * ln(2)
        _hashCount = Math.Max(1, (int)((_bitSize / (double)expectedElements) * Math.Log(2)));
        _bitArray = new byte[(_bitSize + 7) / 8];
    }

    /// <summary>Add a token/card ID to the filter.</summary>
    public void Add(string item)
    {
        foreach (var hash in GetHashes(item))
        {
            var idx = (int)(hash % (uint)_bitSize);
            _bitArray[idx / 8] |= (byte)(1 << (idx % 8));
        }
        _insertedCount++;
    }

    /// <summary>
    /// Check if a token might be in the set.
    /// Returns FALSE → definitely not present.
    /// Returns TRUE → probably present (with configured FPR).
    /// </summary>
    public bool MightContain(string item)
    {
        foreach (var hash in GetHashes(item))
        {
            var idx = (int)(hash % (uint)_bitSize);
            if ((_bitArray[idx / 8] & (1 << (idx % 8))) == 0)
                return false; // Definitely not present
        }
        return true; // Probably present
    }

    /// <summary>Reset the filter, clearing all bits.</summary>
    public void Clear()
    {
        Array.Clear(_bitArray, 0, _bitArray.Length);
        _insertedCount = 0;
    }

    /// <summary>
    /// Generate k independent hash values using double hashing:
    /// h_i(x) = h1(x) + i * h2(x)
    /// where h1 = FNV-1a and h2 = DJB2 variant.
    /// </summary>
    private IEnumerable<uint> GetHashes(string key)
    {
        uint h1 = FNV1aHash(key);
        uint h2 = DJB2Hash(key);

        for (int i = 0; i < _hashCount; i++)
        {
            yield return h1 + (uint)i * h2;
        }
    }

    /// <summary>FNV-1a hash function — excellent avalanche properties.</summary>
    private static uint FNV1aHash(string str)
    {
        uint hash = 2166136261;
        foreach (char c in str)
        {
            hash ^= c;
            hash *= 16777619;
        }
        return hash;
    }

    /// <summary>DJB2 hash function variant — independent from FNV-1a for double hashing.</summary>
    private static uint DJB2Hash(string str)
    {
        uint hash = 5381;
        foreach (char c in str)
        {
            hash = ((hash << 5) + hash) ^ c;
        }
        return hash;
    }
}
