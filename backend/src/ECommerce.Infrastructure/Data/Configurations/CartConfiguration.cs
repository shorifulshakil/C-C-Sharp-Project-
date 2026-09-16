using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Data.Configurations;

public class CartConfiguration : IEntityTypeConfiguration<Cart>
{
    public void Configure(EntityTypeBuilder<Cart> builder)
    {
        builder.ToTable("carts");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasColumnType("uuid");
        builder.Property(c => c.CustomerId).HasColumnType("uuid").IsRequired();
        builder.Property(c => c.CreatedAt).HasDefaultValueSql("now()").IsRequired();
        builder.Property(c => c.UpdatedAt).HasDefaultValueSql("now()").IsRequired();

        builder.HasIndex(c => c.CustomerId).IsUnique();
        builder.HasOne(c => c.Customer).WithOne(cu => cu.Cart).HasForeignKey<Cart>(c => c.CustomerId);
    }
}
