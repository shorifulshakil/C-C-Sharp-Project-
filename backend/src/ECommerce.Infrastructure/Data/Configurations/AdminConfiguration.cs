using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Data.Configurations;

public class AdminConfiguration : IEntityTypeConfiguration<Admin>
{
    public void Configure(EntityTypeBuilder<Admin> builder)
    {
        builder.ToTable("admins");
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id).HasColumnType("uuid");
        builder.Property(a => a.Email).HasMaxLength(256).IsRequired();
        builder.Property(a => a.PasswordHash).IsRequired();
        builder.Property(a => a.FullName).HasMaxLength(256).IsRequired();
        builder.Property(a => a.Phone).HasMaxLength(32);
        builder.Property(a => a.AvatarUrl);
        builder.Property(a => a.IsActive).HasDefaultValue(true);
        builder.Property(a => a.CreatedAt).HasDefaultValueSql("now()").IsRequired();
        builder.Property(a => a.UpdatedAt).HasDefaultValueSql("now()").IsRequired();

        builder.HasIndex(a => a.Email).IsUnique();
    }
}
