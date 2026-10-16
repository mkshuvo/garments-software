namespace Garments.Ledger;

/// <summary>
/// What a source document is asking the ledger to record, before anyone has chosen an entry id, a
/// number or a period.
/// </summary>
/// <remarks>
/// Separate from <see cref="GlEntry"/> on purpose. An entry is a fact that has already been written;
/// this is a request that can still be refused, and the refusal has to name what was wrong rather than
/// leave a half-built row in a change tracker. The legacy build had no line here at all — its cash-book
/// path constructed a posted <c>JournalEntry</c> directly, which is how a single-sided row reached the
/// general ledger with a status of <c>Posted</c> already on it.
///
/// <see cref="Iteration"/> is what makes a retry safe. A payment page that posts, times out, and is
/// pressed again must not become two postings; the same document at the same revision resolves to the
/// same entry.
/// </remarks>
public sealed record PostingRequest
{
    /// <summary>The journal this belongs to, by the code the tenant owns.</summary>
    public required string JournalCode { get; init; }

    public required DateOnly PostingDate { get; init; }

    /// <summary>What produced this posting: <c>cash.receipt</c>, <c>sales.invoice</c>, <c>manual</c>.</summary>
    public required string SourceType { get; init; }

    /// <summary>The id of that source document. Null only for a manual journal, which has no source row.</summary>
    public Guid? SourceId { get; init; }

    /// <summary>The source document's revision. A corrected document raises this; a retry does not.</summary>
    public int Iteration { get; init; } = 1;

    public string Memo { get; init; } = string.Empty;

    public required IReadOnlyList<PostingLine> Lines { get; init; }
}
