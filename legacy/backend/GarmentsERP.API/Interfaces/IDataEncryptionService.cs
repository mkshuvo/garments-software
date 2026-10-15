namespace GarmentsERP.API.Interfaces
{
    /// <summary>
    /// Interface for data encryption service
    /// </summary>
    public interface IDataEncryptionService
    {
        /// <summary>
        /// Encrypt sensitive data
        /// </summary>
        string Encrypt(string plainText);

        /// <summary>
        /// Decrypt sensitive data
        /// </summary>
        string Decrypt(string cipherText);

        /// <summary>
        /// Hash sensitive data (one-way)
        /// </summary>
        string Hash(string plainText);

        /// <summary>
        /// Verify hashed data
        /// </summary>
        bool VerifyHash(string plainText, string hash);

        /// <summary>
        /// Encrypt financial amounts for storage
        /// </summary>
        string EncryptAmount(decimal amount);

        /// <summary>
        /// Decrypt financial amounts from storage
        /// </summary>
        decimal DecryptAmount(string encryptedAmount);

        /// <summary>
        /// Generate a secure token for sensitive operations
        /// </summary>
        string GenerateSecureToken(int length = 32);

        /// <summary>
        /// Mask sensitive data for logging (e.g., show only first and last characters)
        /// </summary>
        string MaskSensitiveData(string sensitiveData, int visibleChars = 2);
    }
}