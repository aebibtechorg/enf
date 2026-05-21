using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Api.Features.Users;
using Api.Infrastructure.Storage;

namespace Api.Features.Notarization;

public interface INotarizationService
{
    Task<string> GenerateCertificateAsync(NotarizationDocument document, User enp, CancellationToken ct = default);
}

public class NotarizationService : INotarizationService
{
    private readonly IFileStorage _storage;

    public NotarizationService(IFileStorage storage)
    {
        _storage = storage;
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public async Task<string> GenerateCertificateAsync(NotarizationDocument document, User enp, CancellationToken ct = default)
    {
        var documentTitle = document.FileName;
        var enpName = enp.FullName;
        var rollNumber = enp.RollNumber;
        var commissionNumber = enp.CommissionNumber;
        var commissionExpiry = enp.CommissionExpiry?.ToString("MMMM dd, row") ?? "N/A";
        var ibpNumber = enp.IbpNumber;
        var businessAddress = enp.RegularPlaceOfBusiness;

        var pdfData = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(1, Unit.Inch);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(12).FontFamily(Fonts.TimesNewRoman));

                page.Header().Text("ELECTRONIC NOTARIAL CERTIFICATE").SemiBold().FontSize(16).AlignCenter();

                page.Content().PaddingVertical(20).Column(col =>
                {
                    col.Spacing(10);
                    col.Item().Text($"This is to certify that the electronic document titled \"{documentTitle}\" was notarized electronically on {DateTime.UtcNow:MMMM dd, yyyy}.");
                    
                    col.Item().PaddingTop(10).Text("ELECTRONIC NOTARY PUBLIC DETAILS").SemiBold();
                    col.Item().Text($"Name: {enpName}");
                    col.Item().Text($"Roll of Attorneys No.: {rollNumber}");
                    col.Item().Text($"Commission No.: {commissionNumber}");
                    col.Item().Text($"Commission Valid Until: {commissionExpiry}");
                    col.Item().Text($"IBP Membership No.: {ibpNumber}");
                    col.Item().Text($"Place of Business: {businessAddress}");
                    
                    // Visual Seal Representation (1.5" x 3" as per Rule IX)
                    col.Item().PaddingTop(20).Border(1).Width(3, Unit.Inch).Height(1.5f, Unit.Inch).Padding(10).Row(row =>
                    {
                        row.RelativeItem().Column(sealCol =>
                        {
                            sealCol.Item().Text(enpName).Bold();
                            sealCol.Item().Text($"Roll No. {rollNumber}");
                            sealCol.Item().Text("Electronic Notary Public");
                            sealCol.Item().Text("Republic of the Philippines");
                        });
                        
                        // Placeholder for QR Code
                        row.ConstantItem(60).Height(60).Background(Colors.Grey.Lighten3).AlignCenter().AlignMiddle().Text("QR CODE");
                    });
                });

                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Page ");
                    x.CurrentPageNumber();
                });
            });
        }).GeneratePdf();

        var certificateFileName = $"Certificate_{document.Id}.pdf";
        using var stream = new MemoryStream(pdfData);
        return await _storage.UploadAsync(certificateFileName, stream, ct);
    }
}