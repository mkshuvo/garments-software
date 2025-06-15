namespace GarmentsERP.API.Services.Models
{
    /// <summary>
    /// Result object for authentication operations
    /// </summary>
    public class AuthResult
    {
        /// <summary>
        /// Indicates if the operation was successful
        /// </summary>
        public bool IsSuccess { get; set; }

        /// <summary>
        /// Message describing the result
        /// </summary>
        public string Message { get; set; } = string.Empty;

        /// <summary>
        /// Additional data returned with the result
        /// </summary>
        public object? Data { get; set; }

        /// <summary>
        /// Create a successful authentication result
        /// </summary>
        /// <param name="message">Success message</param>
        /// <param name="data">Optional data to return</param>
        /// <returns>Successful AuthResult</returns>
        public static AuthResult Success(string message, object? data = null)
        {
            return new AuthResult { IsSuccess = true, Message = message, Data = data };
        }

        /// <summary>
        /// Create a failed authentication result
        /// </summary>
        /// <param name="message">Error message</param>
        /// <returns>Failed AuthResult</returns>
        public static AuthResult Failed(string message)
        {
            return new AuthResult { IsSuccess = false, Message = message };
        }
    }
}
