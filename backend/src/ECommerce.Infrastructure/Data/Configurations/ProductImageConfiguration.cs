using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Data.Configurations;

public class ProductImageConfiguration : IEntityTypeConfiguration<ProductImage>
{
    public void Configure(EntityTypeBuilder<ProductImage> builder)
    {
        builder.ToTable("product_images");
        builder.HasKey(i => i.Id);
        builder.Property(i => i.Id).HasColumnType("uuid");
        builder.Property(i => i.ImageUrl).IsRequired();
        builder.Property(i => i.DisplayOrder).HasDefaultValue(0);
        builder.Property(i => i.ProductId).HasColumnType("uuid").IsRequired();
        builder.Property(i => i.CreatedAt).HasDefaultValueSql("now()").IsRequired();
        builder.Property(i => i.UpdatedAt).HasDefaultValueSql("now()").IsRequired();

        builder.HasOne(i => i.Product).WithMany(p => p.Images).HasForeignKey(i => i.ProductId);
    }
}
