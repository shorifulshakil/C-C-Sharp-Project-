using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Data.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable("categories");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasColumnType("uuid");
        builder.Property(c => c.Name).HasMaxLength(128).IsRequired();
        builder.Property(c => c.Description);
        builder.Property(c => c.ParentCategoryId).HasColumnType("uuid");
        builder.Property(c => c.CreatedAt).HasDefaultValueSql("now()").IsRequired();
        builder.Property(c => c.UpdatedAt).HasDefaultValueSql("now()").IsRequired();

        builder.HasIndex(c => c.Name).IsUnique();
        builder.HasOne(c => c.ParentCategory).WithMany(c => c.SubCategories).HasForeignKey(c => c.ParentCategoryId);
    }
}
