using GarmentsERP.API.Interfaces;
using System.Security.Cryptography;
using System.Text;

namespace GarmentsERP.API.Services
{
    /// <summary>
    /// Service for encrypting and decrypting sensitive financial data
    /// </summary>
    public class DataEncryptionService : IDataEncryptionService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<DataEncryptionService> _logger;
        private readonly byte[] _encryptionKey;
        private readonly byte[] _iv;

        public DataEncryptionService(IConfiguration configuration, ILogger<DataEncryptionService> logger)
        {
            _configuration = configuration;
            _logger = logger;

            // Get encryption key from configuration (should be stored securely in production)
            var keyString = _configuration["Encryption:Key"] ?? "DefaultKey123456789012345678901234"; // 32 chars for AES-256
            _encryptionKey = Encoding.UTF8.GetBytes(keyString.PadRight(32).Substring(0, 32));

            // Generate or get IV from configuration
            var ivString = _configuration["Encryption:IV"] ?? "DefaultIV12345678"; // 16 chars for AES
            _iv = Encoding.UTF8.GetBytes(ivString.PadRight(16).Substring(0, 16));
        }

        public string Encrypt(string plainText)
        {
            if (string.IsNullOrEmpty(plainText))
                return string.Empty;

            try
            {
                using var aes = Aes.Create();
                aes.Key = _encryptionKey;
                aes.IV = _iv;

                using var encryptor = aes.CreateEncryptor();
                using var msEncrypt = new MemoryStream();
                using var csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write);
                using var swEncrypt = new StreamWriter(csEncrypt);

                swEncrypt.Write(plainText);
                swEncrypt.Close();

                return Convert.ToBase64String(msEncrypt.ToArray());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error encrypting data");
                throw new InvalidOperationException("Failed to encrypt data", ex);
            }
        }

        public string Decrypt(string cipherText)
        {
            if (string.IsNullOrEmpty(cipherText))
                return string.Empty;

            try
            {
                var cipherBytes = Convert.FromBase64String(cipherText);

                using var aes = Aes.Create();
                aes.Key = _encryptionKey;
                aes.IV = _iv;

                using var decryptor = aes.CreateDecryptor();
                using var msDecrypt = new MemoryStream(cipherBytes);
                using var csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read);
                using var srDecrypt = new StreamReader(csDecrypt);

                return srDecrypt.ReadToEnd();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error decrypting data");
                throw new InvalidOperationException("Failed to decrypt data", ex);
            }
        }

        public string Hash(string plainText)
        {
            if (string.IsNullOrEmpty(plainText))
                return string.Empty;

            try
            {
                using var sha256 = SHA256.Create();
                var saltedText = plainText + _configuration["Encryption:Salt"];
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(saltedText));
                return Convert.ToBase64String(hashedBytes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error hashing data");
                throw new InvalidOperationException("Failed to hash data", ex);
            }
        }

        public bool VerifyHash(string plainText, string hash)
        {
            if (string.IsNullOrEmpty(plainText) || string.IsNullOrEmpty(hash))
                return false;

            try
            {
                var computedHash = Hash(plainText);
                return computedHash.Equals(hash, StringComparison.Ordinal);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying hash");
                return false;
            }
        }

        public string EncryptAmount(decimal amount)
        {
            try
            {
                var amountString = amount.ToString("F2"); // Format to 2 decimal places
                return Encrypt(amountString);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error encrypting amount");
                throw new InvalidOperationException("Failed to encrypt amount", ex);
            }
        }

        public decimal DecryptAmount(string encryptedAmount)
        {
            try
            {
                var decryptedString = Decrypt(encryptedAmount);
                return decimal.Parse(decryptedString);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error decrypting amount");
                throw new InvalidOperationException("Failed to decrypt amount", ex);
            }
        }

        public string GenerateSecureToken(int length = 32)
        {
            try
            {
                using var rng = RandomNumberGenerator.Create();
                var tokenBytes = new byte[length];
                rng.GetBytes(tokenBytes);
                return Convert.ToBase64String(tokenBytes).Replace("+", "-").Replace("/", "_").Replace("=", "");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating secure token");
                throw new InvalidOperationException("Failed to generate secure token", ex);
            }
        }

        public string MaskSensitiveData(string sensitiveData, int visibleChars = 2)
        {
            if (string.IsNullOrEmpty(sensitiveData))
                return string.Empty;

            if (sensitiveData.Length <= visibleChars * 2)
                return new string('*', sensitiveData.Length);

            var start = sensitiveData.Substring(0, visibleChars);
            var end = sensitiveData.Substring(sensitiveData.Length - visibleChars);
            var middle = new string('*', Math.Max(0, sensitiveData.Length - (visibleChars * 2)));

            return $"{start}{middle}{end}";
        }
    }
}