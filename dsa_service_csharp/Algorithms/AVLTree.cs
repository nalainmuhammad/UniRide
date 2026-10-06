namespace UniRide.DSA.Algorithms;

/// <summary>
/// Node in the AVL Tree storing a key-value pair with height metadata.
/// </summary>
public class AVLNode<TKey, TValue> where TKey : IComparable<TKey>
{
    public TKey Key { get; set; }
    public TValue Value { get; set; }
    public int Height { get; set; } = 1;
    public AVLNode<TKey, TValue>? Left { get; set; }
    public AVLNode<TKey, TValue>? Right { get; set; }

    public AVLNode(TKey key, TValue value)
    {
        Key = key;
        Value = value;
    }
}

/// <summary>
/// Self-Balancing AVL Binary Search Tree.
/// Used for O(log n) seat reservation management — buses are keyed by available capacity,
/// enabling instant lookup of the most/least available bus for optimal load balancing.
///
/// Operations: Insert O(log n), Delete O(log n), Search O(log n), Min/Max O(log n)
/// Balance invariant: |Height(Left) - Height(Right)| ≤ 1 for every node.
/// </summary>
public class AVLTree<TKey, TValue> where TKey : IComparable<TKey>
{
    private AVLNode<TKey, TValue>? _root;

    public int Count { get; private set; }

    private static int GetHeight(AVLNode<TKey, TValue>? node) => node?.Height ?? 0;

    private static int GetBalance(AVLNode<TKey, TValue>? node) =>
        node == null ? 0 : GetHeight(node.Left) - GetHeight(node.Right);

    private static void UpdateHeight(AVLNode<TKey, TValue> node) =>
        node.Height = 1 + Math.Max(GetHeight(node.Left), GetHeight(node.Right));

    /// <summary>Right rotation — fixes Left-Left imbalance.</summary>
    private static AVLNode<TKey, TValue> RotateRight(AVLNode<TKey, TValue> y)
    {
        var x = y.Left!;
        var t2 = x.Right;

        x.Right = y;
        y.Left = t2;

        UpdateHeight(y);
        UpdateHeight(x);
        return x;
    }

    /// <summary>Left rotation — fixes Right-Right imbalance.</summary>
    private static AVLNode<TKey, TValue> RotateLeft(AVLNode<TKey, TValue> x)
    {
        var y = x.Right!;
        var t2 = y.Left;

        y.Left = x;
        x.Right = t2;

        UpdateHeight(x);
        UpdateHeight(y);
        return y;
    }

    /// <summary>Rebalance a node after insertion or deletion.</summary>
    private static AVLNode<TKey, TValue> Rebalance(AVLNode<TKey, TValue> node, TKey key)
    {
        var balance = GetBalance(node);

        // Left-Left
        if (balance > 1 && key.CompareTo(node.Left!.Key) < 0)
            return RotateRight(node);

        // Right-Right
        if (balance < -1 && key.CompareTo(node.Right!.Key) > 0)
            return RotateLeft(node);

        // Left-Right
        if (balance > 1 && key.CompareTo(node.Left!.Key) > 0)
        {
            node.Left = RotateLeft(node.Left);
            return RotateRight(node);
        }

        // Right-Left
        if (balance < -1 && key.CompareTo(node.Right!.Key) < 0)
        {
            node.Right = RotateRight(node.Right);
            return RotateLeft(node);
        }

        return node;
    }

    public void Insert(TKey key, TValue value)
    {
        _root = InsertNode(_root, key, value);
        Count++;
    }

    private static AVLNode<TKey, TValue> InsertNode(AVLNode<TKey, TValue>? node, TKey key, TValue value)
    {
        if (node == null) return new AVLNode<TKey, TValue>(key, value);

        var cmp = key.CompareTo(node.Key);
        if (cmp < 0)
            node.Left = InsertNode(node.Left, key, value);
        else if (cmp > 0)
            node.Right = InsertNode(node.Right, key, value);
        else
        {
            node.Value = value; // Update existing key
            return node;
        }

        UpdateHeight(node);
        return Rebalance(node, key);
    }

    public void Delete(TKey key)
    {
        var prevCount = Count;
        _root = DeleteNode(_root, key);
        if (Count != prevCount) Count--;
    }

    private AVLNode<TKey, TValue>? DeleteNode(AVLNode<TKey, TValue>? node, TKey key)
    {
        if (node == null) return null;

        var cmp = key.CompareTo(node.Key);
        if (cmp < 0)
            node.Left = DeleteNode(node.Left, key);
        else if (cmp > 0)
            node.Right = DeleteNode(node.Right, key);
        else
        {
            Count--; // Will be offset by outer decrement handling
            if (node.Left == null) return node.Right;
            if (node.Right == null) return node.Left;

            // In-order successor
            var successor = FindMin(node.Right);
            node.Key = successor.Key;
            node.Value = successor.Value;
            node.Right = DeleteNode(node.Right, successor.Key);
            Count++; // Undo recursive decrement for successor
        }

        UpdateHeight(node);

        var balance = GetBalance(node);

        if (balance > 1 && GetBalance(node.Left) >= 0) return RotateRight(node);
        if (balance > 1 && GetBalance(node.Left) < 0)
        {
            node.Left = RotateLeft(node.Left!);
            return RotateRight(node);
        }
        if (balance < -1 && GetBalance(node.Right) <= 0) return RotateLeft(node);
        if (balance < -1 && GetBalance(node.Right) > 0)
        {
            node.Right = RotateRight(node.Right!);
            return RotateLeft(node);
        }

        return node;
    }

    /// <summary>Find the node with the minimum key (leftmost leaf).</summary>
    private static AVLNode<TKey, TValue> FindMin(AVLNode<TKey, TValue> node)
    {
        while (node.Left != null) node = node.Left;
        return node;
    }

    /// <summary>Get the bus with maximum available capacity (rightmost node).</summary>
    public TValue? GetMax()
    {
        if (_root == null) return default;
        var node = _root;
        while (node.Right != null) node = node.Right;
        return node.Value;
    }

    /// <summary>Get the bus with minimum available capacity (leftmost node).</summary>
    public TValue? GetMin()
    {
        if (_root == null) return default;
        return FindMin(_root).Value;
    }

    /// <summary>Search for a specific key.</summary>
    public TValue? Search(TKey key)
    {
        var node = _root;
        while (node != null)
        {
            var cmp = key.CompareTo(node.Key);
            if (cmp == 0) return node.Value;
            node = cmp < 0 ? node.Left : node.Right;
        }
        return default;
    }

    /// <summary>In-order traversal returning all entries sorted by key.</summary>
    public List<(TKey Key, TValue Value)> InOrderTraversal()
    {
        var result = new List<(TKey, TValue)>();
        InOrderHelper(_root, result);
        return result;
    }

    private static void InOrderHelper(AVLNode<TKey, TValue>? node, List<(TKey, TValue)> result)
    {
        if (node == null) return;
        InOrderHelper(node.Left, result);
        result.Add((node.Key, node.Value));
        InOrderHelper(node.Right, result);
    }
}
