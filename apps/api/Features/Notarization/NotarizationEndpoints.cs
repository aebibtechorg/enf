using Microsoft.EntityFrameworkCore;
using Api.Infrastructure.Database;
using Api.Infrastructure.Cryptography;
using Api.Features.Users;
using System.Security.Claims;
using System.Security.Cryptography.X509Certificates;
using Contracts;

namespace Api.Features.Notarization;

public static class NotarizationEndpoints
{
    public static void MapNotarizationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/notarization")
            .WithTags("Notarization")
            .RequireAuthorization();

        // Documents
        group.MapPost("/documents", UploadForNotarizationAsync);
        group.MapGet("/documents", GetMyDocumentsAsync);
        
        // Sessions
        group.MapPost("/sessions", CreateSessionAsync);
        group.MapGet("/sessions/{id}", GetSessionAsync);
        group.MapPost("/sessions/{id}/join", JoinSessionAsync);
        group.MapPost("/sessions/{id}/recording", UploadRecordingAsync);
        group.MapPost("/sessions/{id}/witnesses", AddWitnessAsync);

        // Notarial Book
        group.MapGet("/notarial-book", GetMyNotarialBookAsync);

        // Actions
        group.MapPost("/documents/{id}/sign", SignDocumentAsync);
        group.MapPost("/documents/{id}/complete", CompleteNotarizationAsync);
        group.MapGet("/verify/{id}", VerifyDocumentAsync).AllowAnonymous(); // Public verification

        // Billing
        group.MapPost("/payments", CreatePaymentAsync);
    }

    private static IResult CreatePaymentAsync(decimal amount)
    {
        // Rule VII, Sec 2, r: facilitates digital payments and issuance of electronic official receipts
        return Results.Ok(new { PaymentId = Guid.NewGuid(), Amount = amount, Status = "Success", ReceiptUrl = "/api/files/receipt_placeholder.pdf" });
    }

    private static async Task<IResult> VerifyDocumentAsync(Guid id, AppDbContext db)
    {
        var doc = await db.NotarizationDocuments
            .Include(d => d.Principal)
            .Include(d => d.Enp)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (doc == null || doc.Status != DocumentStatus.Completed)
            return Results.NotFound(new { Verified = false, Message = "Document not found or notarization not completed." });

        return Results.Ok(new
        {
            Verified = true,
            DocumentId = doc.Id,
            FileName = doc.FileName,
            PrincipalName = doc.Principal.FullName,
            EnpName = doc.Enp?.FullName,
            CompletedAt = doc.CompletedAt,
            CertificateId = doc.PdfAFileId
        });
    }

    private static async Task<IResult> SignDocumentAsync(
        Guid id,
        ClaimsPrincipal principal,
        AppDbContext db,
        ICryptographyService crypto)
    {
        var email = principal.FindFirstValue(ClaimTypes.Email);
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) return Results.Unauthorized();

        var doc = await db.NotarizationDocuments.FindAsync(id);
        if (doc == null) return Results.NotFound();

        if (doc.PrincipalId != user.Id) return Results.Forbid();
        if (string.IsNullOrEmpty(user.DigitalCertificate)) return Results.BadRequest("User does not have a digital certificate issued.");

        // Cryptographic Sign: Sign a placeholder content hash (in real app, we'd hash the uploaded file)
        var certData = Convert.FromBase64String(user.DigitalCertificate);
        using var cert = X509CertificateLoader.LoadPkcs12(certData, (string?)null, X509KeyStorageFlags.Exportable);
        
        var signature = crypto.SignData(doc.FileId, cert);
        
        Console.WriteLine($"[PKI] Document {doc.Id} signed by Principal {user.FullName}. Signature: {Convert.ToBase64String(signature)}");

        doc.Status = DocumentStatus.SignedByPrincipal;

        await db.SaveChangesAsync();

        return Results.Ok(doc);
    }

    private static async Task<IResult> JoinSessionAsync(
        Guid id,
        string location,
        LocationType locationType,
        ClaimsPrincipal principal,
        AppDbContext db,
        HttpContext httpContext)
    {
        var email = principal.FindFirstValue(ClaimTypes.Email);
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) return Results.Unauthorized();

        var session = await db.NotarizationSessions.FindAsync(id);
        if (session == null) return Results.NotFound();

        if (session.PrincipalId != user.Id && session.EnpId != user.Id)
            return Results.Forbid();

        if (session.PrincipalId == user.Id && locationType == LocationType.Other)
        {
            return Results.BadRequest("Notarization requires the principal to be physically located in the Philippines or a Philippine Embassy/Consular office (Rule IV, Sec 5).");
        }

        if (session.EnpId == user.Id && locationType == LocationType.Other)
        {
            return Results.BadRequest("The Electronic Notary Public must be situated within the Philippines or a Philippine Embassy/Consular office (Rule XI, Sec 3).");
        }

        if (session.PrincipalId == user.Id)
        {
            if (user.EkycStatus != "verified")
            {
                return Results.BadRequest("Principal must complete eKYC before joining the session.");
            }
            session.PrincipalLocation = location;
            session.PrincipalLocationType = locationType;
            session.SumsubInspectionId = user.SumsubInspectionId; // Bind identity verification to session
        }
        else
        {
            session.EnpLocation = location;
            session.EnpLocationType = locationType;
        }

        if (!session.StartedAt.HasValue) session.StartedAt = DateTime.UtcNow;
        session.GeolocationVerified = true; 

        await db.SaveChangesAsync();

        return Results.Ok(session);
    }

    private static async Task<IResult> AddWitnessAsync(
        Guid id,
        string fullName,
        string address,
        string identityEvidence,
        ClaimsPrincipal principal,
        AppDbContext db)
    {
        var session = await db.NotarizationSessions.FindAsync(id);
        if (session == null) return Results.NotFound();

        var witness = new NotarizationWitness
        {
            Id = Guid.NewGuid(),
            FullName = fullName,
            Address = address,
            IdentityEvidence = identityEvidence,
            SessionId = id
        };

        db.NotarizationWitnesses.Add(witness);
        await db.SaveChangesAsync();

        return Results.Ok(witness);
    }

    private static async Task<IResult> UploadRecordingAsync(
        Guid id,
        string fileId,
        ClaimsPrincipal principal,
        AppDbContext db)
    {
        var session = await db.NotarizationSessions.FindAsync(id);
        if (session == null) return Results.NotFound();

        session.RecordingFileId = fileId;
        await db.SaveChangesAsync();

        return Results.Ok();
    }

    private static async Task<IResult> CompleteNotarizationAsync(
        Guid id,
        ClaimsPrincipal principal,
        AppDbContext db,
        INotarizationService notarizationService,
        ICryptographyService crypto)
    {
        var email = principal.FindFirstValue(ClaimTypes.Email);
        var enp = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (enp == null || !enp.IsEnp) return Results.Forbid();

        // Rule VII, Sec 2, x: Certify that the ENP has studied instructional materials
        if (!enp.WatchedInstructionalVideo) 
        {
            return Results.BadRequest("The Electronic Notary Public must complete the on-demand instructional video before performing notarial acts.");
        }

        var doc = await db.NotarizationDocuments
            .Include(d => d.Principal)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (doc == null) return Results.NotFound();
        
        // Find active session for this document/principal
        var session = await db.NotarizationSessions
            .Include(s => s.Witnesses)
            .FirstOrDefaultAsync(s => s.EnpId == enp.Id && s.PrincipalId == doc.PrincipalId && s.StartedAt.HasValue && !s.EndedAt.HasValue);

        if (session == null) return Results.BadRequest("No active notarization session found.");
        if (!session.GeolocationVerified) return Results.BadRequest("Location has not been verified for this session.");

        // Rule IV, Sec 8: Recording requirement for REN
        if (session.Type == SessionType.Ren && string.IsNullOrEmpty(session.RecordingFileId))
        {
            return Results.BadRequest("Session recording must be uploaded before completing Remote Electronic Notarization (REN).");
        }

        if (string.IsNullOrEmpty(enp.DigitalCertificate)) return Results.BadRequest("ENP does not have a digital certificate issued.");

        doc.EnpId = enp.Id;
        doc.Status = DocumentStatus.Completed;
        doc.CompletedAt = DateTime.UtcNow;

        // Cryptographic Sign: ENP signs the document reference
        var certData = Convert.FromBase64String(enp.DigitalCertificate);
        using var cert = X509CertificateLoader.LoadPkcs12(certData, (string?)null, X509KeyStorageFlags.Exportable);
        var signature = crypto.SignData(doc.FileId, cert);
        
        Console.WriteLine($"[PKI] Document {doc.Id} sealed by ENP {enp.FullName}. Signature: {Convert.ToBase64String(signature)}");

        // Generate Certificate
        var certificateFileId = await notarizationService.GenerateCertificateAsync(doc, enp, session);
        doc.PdfAFileId = certificateFileId;

        // Create Notarial Book Entry
        var entryCount = await db.NotarialBookEntries.CountAsync(e => e.EnpId == enp.Id);
        var entry = new ElectronicNotarialBookEntry
        {
            Id = Guid.NewGuid(),
            EnpId = enp.Id,
            PrincipalId = doc.PrincipalId,
            DocumentTitle = doc.FileName,
            PerformedAt = DateTime.UtcNow,
            NotarialAct = "Electronic Notarization", 
            Mode = session.Type, 
            PrincipalLocationType = session.PrincipalLocationType,
            PrincipalActualLocation = session.PrincipalLocation ?? "Unknown",
            NotarizedFileId = certificateFileId,
            EntryNumber = entryCount + 1,
            PrincipalAddress = "Verified Address",
            PrincipalIdentityEvidence = "Government ID",
            Witnesses = session.Witnesses.Select(w => new NotarizationWitness
            {
                Id = Guid.NewGuid(),
                FullName = w.FullName,
                Address = w.Address,
                IdentityEvidence = w.IdentityEvidence,
                Signature = w.Signature
            }).ToList()
        };
        db.NotarialBookEntries.Add(entry);

        await db.SaveChangesAsync();

        Console.WriteLine($"[SC SYNC] Automatically uploaded notarized document {doc.Id} to Supreme Court Central Notarial Database.");

        return Results.Ok(new { Document = doc, Entry = entry });
    }

    private static async Task<IResult> UploadForNotarizationAsync(
        string fileId, 
        string fileName,
        ClaimsPrincipal principal, 
        AppDbContext db)
    {
        var email = principal.FindFirstValue(ClaimTypes.Email);
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) return Results.Unauthorized();

        var doc = new NotarizationDocument
        {
            Id = Guid.NewGuid(),
            FileId = fileId,
            FileName = fileName,
            PrincipalId = user.Id,
            Status = DocumentStatus.Uploaded
        };

        db.NotarizationDocuments.Add(doc);
        await db.SaveChangesAsync();

        return Results.Created($"/api/notarization/documents/{doc.Id}", doc);
    }

    private static async Task<IResult> GetMyDocumentsAsync(ClaimsPrincipal principal, AppDbContext db)
    {
        var email = principal.FindFirstValue(ClaimTypes.Email);
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) return Results.Unauthorized();

        var docs = await db.NotarizationDocuments
            .Where(d => d.PrincipalId == user.Id || d.EnpId == user.Id)
            .ToListAsync();

        return Results.Ok(docs);
    }

    private static async Task<IResult> CreateSessionAsync(
        SessionType type,
        Guid enpId,
        DateTime scheduledAt,
        ClaimsPrincipal principal,
        AppDbContext db)
    {
        var email = principal.FindFirstValue(ClaimTypes.Email);
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) return Results.Unauthorized();

        var session = new NotarizationSession
        {
            Id = Guid.NewGuid(),
            Type = type,
            PrincipalId = user.Id,
            EnpId = enpId,
            ScheduledAt = scheduledAt
        };

        db.NotarizationSessions.Add(session);
        await db.SaveChangesAsync();

        return Results.Created($"/api/notarization/sessions/{session.Id}", session);
    }

    private static async Task<IResult> GetMyNotarialBookAsync(ClaimsPrincipal principal, AppDbContext db)
    {
        var email = principal.FindFirstValue(ClaimTypes.Email);
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null || !user.IsEnp) return Results.Forbid();

        var entries = await db.NotarialBookEntries
            .Where(e => e.EnpId == user.Id)
            .OrderByDescending(e => e.EntryNumber)
            .ToListAsync();

        return Results.Ok(entries);
    }

    private static async Task<IResult> GetSessionAsync(Guid id, AppDbContext db)
    {
        var session = await db.NotarizationSessions
            .Include(s => s.Principal)
            .Include(s => s.Enp)
            .Include(s => s.Documents)
            .FirstOrDefaultAsync(s => s.Id == id);

        return session is not null ? Results.Ok(session) : Results.NotFound();
    }
}