namespace UniRide.DSA.Algorithms;

/// <summary>
/// Entry in the priority waitlist heap.
/// </summary>
public class WaitlistEntry : IComparable<WaitlistEntry>
{
    public int StudentId { get; set; }
    public int BusId { get; set; }
    public int RouteId { get; set; }
    public double PriorityScore { get; set; }
    public DateTime RequestedAt { get; set; }

    public int CompareTo(WaitlistEntry? other)
    {
        if (other == null) return 1;
        // Higher priority score = higher priority
        var cmp = PriorityScore.CompareTo(other.PriorityScore);
        if (cmp != 0) return cmp;
        // Earlier request = higher priority (tie-breaking)
        return other.RequestedAt.CompareTo(RequestedAt);
    }
}

/// <summary>
/// Binary Max-Heap priority queue for student waitlist allocation.
/// The student with the highest priority score is always at the top.
///
/// Operations: Insert O(log n), ExtractMax O(log n), Peek O(1)
///
/// Priority scoring considers:
/// - Distance from campus (longer commute = higher priority)
/// - Attendance rate (consistent riders = higher priority)
/// - Time waiting in queue (prevents starvation)
/// </summary>
public class MaxHeap<T> where T : IComparable<T>
{
    private readonly List<T> _data = new();

    public int Count => _data.Count;
    public bool IsEmpty => _data.Count == 0;

    /// <summary>Insert an element and bubble it up to maintain heap property.</summary>
    public void Insert(T item)
    {
        _data.Add(item);
        BubbleUp(_data.Count - 1);
    }

    /// <summary>View the maximum element without removing it.</summary>
    public T Peek()
    {
        if (_data.Count == 0)
            throw new InvalidOperationException("Heap is empty.");
        return _data[0];
    }

    /// <summary>Remove and return the maximum element, then restore heap property.</summary>
    public T ExtractMax()
    {
        if (_data.Count == 0)
            throw new InvalidOperationException("Heap is empty.");

        var max = _data[0];
        var lastIdx = _data.Count - 1;
        _data[0] = _data[lastIdx];
        _data.RemoveAt(lastIdx);

        if (_data.Count > 0) BubbleDown(0);

        return max;
    }

    /// <summary>Build a heap from an unsorted collection in O(n) time.</summary>
    public void BuildHeap(IEnumerable<T> items)
    {
        _data.Clear();
        _data.AddRange(items);

        // Start from last non-leaf node and bubble down
        for (int i = (_data.Count / 2) - 1; i >= 0; i--)
            BubbleDown(i);
    }

    /// <summary>Return all elements as a sorted list (descending) without modifying the heap.</summary>
    public List<T> PeekAll()
    {
        return _data.OrderByDescending(x => x).ToList();
    }

    private void BubbleUp(int index)
    {
        while (index > 0)
        {
            int parent = (index - 1) / 2;
            if (_data[index].CompareTo(_data[parent]) <= 0) break;
            (_data[index], _data[parent]) = (_data[parent], _data[index]);
            index = parent;
        }
    }

    private void BubbleDown(int index)
    {
        int size = _data.Count;
        while (true)
        {
            int largest = index;
            int left = 2 * index + 1;
            int right = 2 * index + 2;

            if (left < size && _data[left].CompareTo(_data[largest]) > 0)
                largest = left;
            if (right < size && _data[right].CompareTo(_data[largest]) > 0)
                largest = right;

            if (largest == index) break;

            (_data[index], _data[largest]) = (_data[largest], _data[index]);
            index = largest;
        }
    }
}
