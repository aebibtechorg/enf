using Microsoft.EntityFrameworkCore;
using Api.Features.Users;
using Api.Features.Billing;
using Api.Features.Notarization;

namespace Api.Infrastructure.Database;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<NotarizationDocument> NotarizationDocuments => Set<NotarizationDocument>();
    public DbSet<NotarizationSession> NotarizationSessions => Set<NotarizationSession>();
    public DbSet<ElectronicNotarialBookEntry> NotarialBookEntries => Set<ElectronicNotarialBookEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.HasIndex(e => e.Email).IsUnique();

            entity.Property(e => e.CommissionNumber).HasMaxLength(100);
            entity.Property(e => e.RollNumber).HasMaxLength(100);
            entity.Property(e => e.IbpNumber).HasMaxLength(100);
            entity.Property(e => e.RegularPlaceOfBusiness).HasMaxLength(500);
            entity.Property(e => e.EkycStatus).HasMaxLength(50).HasDefaultValue("none");
        });

        modelBuilder.Entity<Subscription>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne<User>().WithMany().HasForeignKey(e => e.UserId);
        });

        modelBuilder.Entity<NotarizationDocument>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Principal).WithMany().HasForeignKey(e => e.PrincipalId);
            entity.HasOne(e => e.Enp).WithMany().HasForeignKey(e => e.EnpId);
        });

        modelBuilder.Entity<NotarizationSession>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Principal).WithMany().HasForeignKey(e => e.PrincipalId);
            entity.HasOne(e => e.Enp).WithMany().HasForeignKey(e => e.EnpId);
        });

        modelBuilder.Entity<ElectronicNotarialBookEntry>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Principal).WithMany().HasForeignKey(e => e.PrincipalId);
            entity.HasOne(e => e.Enp).WithMany().HasForeignKey(e => e.EnpId);
            entity.HasIndex(e => new { e.EnpId, e.EntryNumber }).IsUnique();
        });
    }
}
