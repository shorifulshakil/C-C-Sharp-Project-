using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Data.Configurations;

public class DealerConfiguration : IEntityTypeConfiguration<Dealer>
{
    public void Configure(EntityTypeBuilder<Dealer> builder)
    {
        builder.ToTable("dealers");
        builder.HasKey(d => d.Id);
        builder.Property(d => d.Id).HasColumnType("uuid");
        builder.Property(d => d.Email).HasMaxLength(256).IsRequired();
        builder.Property(d => d.PasswordHash).IsRequired();
        builder.Property(d => d.FullName).HasMaxLength(256).IsRequired();
        builder.Property(d => d.Phone).HasMaxLength(32);
        builder.Property(d => d.AvatarUrl);
        builder.Property(d => d.ShopName).HasMaxLength(256).IsRequired();
        builder.Property(d => d.ShopDescription);
        builder.Property(d => d.ShopCategory).HasMaxLength(128).IsRequired();
        builder.Property(d => d.Address).IsRequired();
        builder.Property(d => d.LogoUrl);
        builder.Property(d => d.IsApproved).HasDefaultValue(false);
        builder.Property(d => d.IsActive).HasDefaultValue(true);
        builder.Property(d => d.CreatedAt).HasDefaultValueSql("now()").IsRequired();
        builder.Property(d => d.UpdatedAt).HasDefaultValueSql("now()").IsRequired();

        builder.HasIndex(d => d.Email).IsUnique();
    }
}
