namespace GarmentsERP.API.Interfaces
{
    /// <summary>
    /// Rate limit information
    /// </summary>
    public class RateLimitInfo
    {
        public int MaxRequests { get; set; }
        public int RemainingRequests { get; set; }
        public DateTime WindowStart { get; set; }
        public DateTime WindowEnd { get; set; }
        public TimeSpan TimeWindow { get; set; }
        public bool IsAllowed { get; set; }
    }
}
