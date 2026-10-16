namespace Garments.Ledger;

/// <summary>Machine-readable reasons a proposed posting is not valid.</summary>
/// <remarks>
/// Codes, not messages, so a client can translate them and a test can assert on them. The legacy
/// validator returned free-text strings and, worse, several different notions of "balanced" at once:
/// exact equality in some places and a ±0.01 tolerance in others, so an entry could save successfully
/// and then be reported as unbalanced by the next screen reading the same rows.
/// </remarks>
public enum PostingErrorCode
{
    /// <summary>Nothing was proposed. An empty posting is a bug, not a zero-amount entry.</summary>
    NoLines,

    /// <summary>
    /// Only one line. Rejected outright: this is the exact defect that made the legacy trial balance
    /// unable to balance, because the cash-book path wrote a single-sided entry straight to the ledger.
    /// </summary>
    SingleSided,

    /// <summary>A line has both sides, or neither.</summary>
    LineSides,

    /// <summary>A line has a zero amount on whichever side it uses.</summary>
    ZeroAmount,

    /// <summary>Total debits do not equal total credits. No tolerance is applied, ever.</summary>
    Unbalanced,

    /// <summary>
    /// Within one transaction currency the foreign-currency amounts do not offset. A ledger can be
    /// balanced in functional currency while remaining unbalanced in the currency actually invoiced,
    /// which is how an FX difference disappears without an entry recording it.
    /// </summary>
    UnbalancedInCurrency,

    /// <summary>Lines were proposed in more than one functional currency.</summary>
    MixedFunctionalCurrency,

    /// <summary>An exchange rate of zero or less, which cannot be inverted or explained.</summary>
    InvalidExchangeRate,
}
