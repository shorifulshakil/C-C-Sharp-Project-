using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Data.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("products");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasColumnType("uuid");
        builder.Property(p => p.Name).HasMaxLength(256).IsRequired();
        builder.Property(p => p.Description);
        builder.Property(p => p.Price).HasColumnType("decimal(10,2)").IsRequired();
        builder.Property(p => p.StockQuantity).IsRequired();
        builder.Property(p => p.Sku).HasMaxLength(128);
        builder.Property(p => p.ApprovalStatus).HasConversion<string>().HasMaxLength(50).IsRequired();
        builder.Property(p => p.RejectionReason);
        builder.Property(p => p.PublishedAt);
        builder.Property(p => p.DealerId).HasColumnType("uuid").IsRequired();
        builder.Property(p => p.CategoryId).HasColumnType("uuid").IsRequired();
        builder.Property(p => p.CreatedAt).HasDefaultValueSql("now()").IsRequired();
        builder.Property(p => p.UpdatedAt).HasDefaultValueSql("now()").IsRequired();

        builder.HasIndex(p => new { p.ApprovalStatus, p.CategoryId });
        builder.HasIndex(p => p.DealerId);
        builder.HasIndex(p => p.Sku).IsUnique();

        builder.HasOne(p => p.Dealer).WithMany(d => d.Products).HasForeignKey(p => p.DealerId);
        builder.HasOne(p => p.Category).WithMany(c => c.Products).HasForeignKey(p => p.CategoryId);
    }
}
