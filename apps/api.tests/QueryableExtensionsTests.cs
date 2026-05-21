using Api.Shared.Extensions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Api.Tests;

public class QueryableExtensionsTests
{
    public class TestEntity
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    private class TestDbContext : DbContext
    {
        public TestDbContext(DbContextOptions<TestDbContext> options) : base(options) { }
        public DbSet<TestEntity> Entities => Set<TestEntity>();
    }

    [Fact]
    public async Task ToPaginatedResponseAsync_ReturnsCorrectPage()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(databaseName: "TestDb")
            .Options;

        using var context = new TestDbContext(options);
        if (!context.Entities.Any())
        {
            for (int i = 1; i <= 50; i++)
            {
                context.Entities.Add(new TestEntity { Id = i, Name = $"Entity {i}" });
            }
            await context.SaveChangesAsync();
        }

        // Act
        var response = await context.Entities.ToPaginatedResponseAsync(page: 2, pageSize: 10);

        // Assert
        Assert.Equal(2, response.Page);
        Assert.Equal(10, response.Items.Count);
        Assert.Equal(50, response.TotalCount);
        Assert.Equal(5, response.TotalPages);
        Assert.True(response.HasNextPage);
        Assert.True(response.HasPreviousPage);
        Assert.Equal("Entity 11", response.Items[0].Name);
    }
}
