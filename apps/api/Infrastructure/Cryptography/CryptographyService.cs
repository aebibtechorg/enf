using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Text;

namespace Api.Infrastructure.Cryptography;

public interface ICryptographyService
{
    byte[] SignData(string data, X509Certificate2 certificate);
    bool VerifySignature(string data, byte[] signature, X509Certificate2 certificate);
    X509Certificate2 GenerateUserCertificate(string commonName);
}

public class CryptographyService : ICryptographyService
{
    public byte[] SignData(string data, X509Certificate2 certificate)
    {
        using var rsa = certificate.GetRSAPrivateKey();
        if (rsa == null) throw new InvalidOperationException("Certificate does not have a private key.");

        var dataBytes = Encoding.UTF8.GetBytes(data);
        return rsa.SignData(dataBytes, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);
    }

    public bool VerifySignature(string data, byte[] signature, X509Certificate2 certificate)
    {
        using var rsa = certificate.GetRSAPublicKey();
        if (rsa == null) return false;

        var dataBytes = Encoding.UTF8.GetBytes(data);
        return rsa.VerifyData(dataBytes, signature, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);
    }

    public X509Certificate2 GenerateUserCertificate(string commonName)
    {
        // For prototype purposes: Generate a self-signed certificate representing a CA-issued cert
        using var rsa = RSA.Create(2048);
        var request = new CertificateRequest(
            $"CN={commonName}", 
            rsa, 
            HashAlgorithmName.SHA256, 
            RSASignaturePadding.Pkcs1);

        request.CertificateExtensions.Add(
            new X509BasicConstraintsExtension(false, false, 0, false));

        request.CertificateExtensions.Add(
            new X509KeyUsageExtension(
                X509KeyUsageFlags.DigitalSignature | X509KeyUsageFlags.NonRepudiation, 
                false));

        var certificate = request.CreateSelfSigned(
            DateTimeOffset.Now.AddDays(-1), 
            DateTimeOffset.Now.AddYears(1));

        // In a real app, this would be exported and stored securely (e.g. Key Vault)
        return certificate;
    }
}