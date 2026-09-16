using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Data.Configurations;

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.ToTable("order_items");
        builder.HasKey(oi => oi.Id);
        builder.Property(oi => oi.Id).HasColumnType("uuid");
        builder.Property(oi => oi.OrderId).HasColumnType("uuid").IsRequired();
        builder.Property(oi => oi.ProductId).HasColumnType("uuid").IsRequired();
        builder.Property(oi => oi.DealerId).HasColumnType("uuid").IsRequired();
        builder.Property(oi => oi.Quantity).IsRequired();
        builder.Property(oi => oi.UnitPriceAtPurchase).HasColumnType("decimal(10,2)").IsRequired();
        builder.Property(oi => oi.Subtotal).HasColumnType("decimal(12,2)").IsRequired();

        builder.HasIndex(oi => oi.OrderId);
        builder.HasIndex(oi => oi.DealerId);

        builder.HasOne(oi => oi.Order)
            .WithMany(o => o.Items)
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(oi => oi.Product)
            .WithMany(p => p.OrderItems)
            .HasForeignKey(oi => oi.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(oi => oi.Dealer)
            .WithMany(d => d.OrderItems)
            .HasForeignKey(oi => oi.DealerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
