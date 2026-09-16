using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Data.Configurations;

public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("customers");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasColumnType("uuid");
        builder.Property(c => c.Email).HasMaxLength(256).IsRequired();
        builder.Property(c => c.PasswordHash).IsRequired();
        builder.Property(c => c.FullName).HasMaxLength(256).IsRequired();
        builder.Property(c => c.Phone).HasMaxLength(32);
        builder.Property(c => c.AvatarUrl);
        builder.Property(c => c.ShippingAddress);
        builder.Property(c => c.IsActive).HasDefaultValue(true);
        builder.Property(c => c.CreatedAt).HasDefaultValueSql("now()").IsRequired();
        builder.Property(c => c.UpdatedAt).HasDefaultValueSql("now()").IsRequired();

        builder.HasIndex(c => c.Email).IsUnique();
    }
}
