using Microsoft.EntityFrameworkCore;
using Blood_Donation_Support.Model;

namespace Blood_Donation_Support.Data;

public partial class BloodDonationSupportContext : DbContext
{
    public BloodDonationSupportContext()
    {
    }

    public BloodDonationSupportContext(DbContextOptions<BloodDonationSupportContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Blog> Blogs { get; set; }

    public virtual DbSet<Article> Articles { get; set; }

    public virtual DbSet<BloodCompatibilityRule> BloodCompatibilityRules { get; set; }

    public virtual DbSet<BloodComponent> BloodComponents { get; set; }

    public virtual DbSet<BloodDonationPeriod> BloodDonationPeriods { get; set; }

    public virtual DbSet<BloodType> BloodTypes { get; set; }

    public virtual DbSet<BloodUnit> BloodUnits { get; set; }

    public virtual DbSet<BloodReservation> BloodReservations { get; set; }

    public virtual DbSet<DonationRequest> DonationRequests { get; set; }

    public virtual DbSet<Member> Members { get; set; }

    public virtual DbSet<Role> Role { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<TransfusionRequest> TransfusionRequests { get; set; }

    public virtual DbSet<TransfusionRequestBloodUnit> TransfusionRequestBloodUnits { get; set; }

    public virtual DbSet<Hospital> Hospitals { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UrgentBloodRequest> UrgentBloodRequests { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
//#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        // => optionsBuilder.UseSqlServer("Server=localhost;Database=BloodDonationDB;Trusted_Connection=True;TrustServerCertificate=True;");
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Blog>(entity =>
        {
            entity.HasKey(e => e.PostId).HasName("PK__Blog__AA12601851852CFB");

            entity.ToTable("Blog");

            entity.Property(e => e.Content).HasColumnType("ntext");
            entity.Property(e => e.ImageUrl).HasMaxLength(255);
            entity.Property(e => e.PublishedDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");

            entity.HasOne(d => d.User).WithMany(p => p.Blogs)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Blog__UserId__5EBF139D");
        });

        modelBuilder.Entity<Article>(entity =>
        {
            entity.HasKey(e => e.ArticleId).HasName("PK__Article__9C6270E828DBB88A");

            entity.ToTable("Article");

            entity.Property(e => e.Content).HasColumnType("ntext");
            entity.Property(e => e.ImageUrl).HasMaxLength(255);
            entity.Property(e => e.PublishedDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");

            entity.HasOne(d => d.User).WithMany(p => p.Articles)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Article__UserId__0D7A0286");
        });

        modelBuilder.Entity<BloodCompatibilityRule>(entity =>
        {
            entity.HasKey(e => e.BloodRuleId).HasName("PK__BloodCom__B064ABB35D6040FE");

            entity.HasOne(d => d.BloodGive).WithMany(p => p.BloodCompatibilityRuleBloodGives)
                .HasForeignKey(d => d.BloodGiveId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BloodComp__Blood__5FB337D6");

            entity.HasOne(d => d.BloodRecieve).WithMany(p => p.BloodCompatibilityRuleBloodRecieves)
                .HasForeignKey(d => d.BloodRecieveId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BloodComp__Blood__60A75C0F");

            entity.HasOne(d => d.Component)
                .WithMany()
                .HasForeignKey(d => d.ComponentId)
                .HasConstraintName("FK_BloodCompatibilityRules_BloodComponents_ComponentId");
        });

        modelBuilder.Entity<BloodComponent>(entity =>
        {
            entity.HasKey(e => e.ComponentId).HasName("PK__BloodCom__D79CF04EF81C774D");

            entity.HasIndex(e => e.ComponentName, "UQ__BloodCom__DB06D1C1797E03E4").IsUnique();

            entity.Property(e => e.ComponentName).HasMaxLength(50);
            entity.Property(e => e.Description).HasMaxLength(500);
        });

        modelBuilder.Entity<BloodDonationPeriod>(entity =>
        {
            entity.HasKey(e => e.PeriodId).HasName("PK__BloodDon__E521BB1638A97A10");

            entity.ToTable("BloodDonationPeriod");

            entity.Property(e => e.CurrentQuantity).HasDefaultValue(0);
            entity.Property(e => e.ImageUrl).HasMaxLength(255);

            entity.HasOne(d => d.Hospital).WithMany(p => p.BloodDonationPeriod)
                .HasForeignKey(d => d.HospitalId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BloodDona__Hospi__43D61337");

            entity.Property(e => e.PeriodDateFrom).HasColumnType("datetime");
            entity.Property(e => e.PeriodDateTo).HasColumnType("datetime");
            entity.Property(e => e.PeriodName).HasMaxLength(100);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false);
        });

        modelBuilder.Entity<BloodType>(entity =>
        {
            entity.HasKey(e => e.BloodTypeId).HasName("PK__BloodTyp__B489BA63BCFBE24A");

            entity.HasIndex(e => e.BloodTypeName, "UQ__BloodTyp__3323606B027AB6F8").IsUnique();

            entity.Property(e => e.BloodTypeName)
                .HasMaxLength(10)
                .IsUnicode(false);
        });

        modelBuilder.Entity<BloodUnit>(entity =>
        {
            entity.HasKey(e => e.BloodUnitId).HasName("PK__BloodUni__AC1C2F8B34CD649A");

            entity.Property(e => e.AddDate).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.BloodStatus)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.Notes).HasColumnType("nvarchar(max)");

            entity.HasOne(d => d.BloodType).WithMany(p => p.BloodUnits)
                .HasForeignKey(d => d.BloodTypeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BloodUnit__Blood__619B8048");

            entity.HasOne(d => d.Component).WithMany(p => p.BloodUnits)
                .HasForeignKey(d => d.ComponentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BloodUnit__Compo__628FA481");

            entity.HasOne(d => d.Member).WithMany(p => p.BloodUnits)
                .HasForeignKey(d => d.MemberId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BloodUnit__Membe__1332DBDC");

            // Navigation property cũ đã xóa
            // entity.HasMany(d => d.TransfusionRequests).WithOne(p => p.BloodUnit)
            //     .HasForeignKey(d => d.BloodUnitId)
            //     .HasConstraintName("FK__Transfusi__Blood__6FE99F9F");
        });

        modelBuilder.Entity<DonationRequest>(entity =>
        {
            entity.HasKey(e => e.DonationId).HasName("PK__Donation__C5082EFBE2E54925");

            entity.Property(e => e.CompletionDate).HasColumnType("datetime");
            entity.Property(e => e.CancelledDate).HasColumnType("datetime");
            entity.Property(e => e.RejectedDate).HasColumnType("datetime");
            entity.Property(e => e.Notes).HasMaxLength(500);
            entity.Property(e => e.PatientCondition).HasMaxLength(500);
            entity.Property(e => e.RequestDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false);

            entity.HasOne(d => d.Component).WithMany(p => p.DonationRequests)
                .HasForeignKey(d => d.ComponentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DonationR__Compo__66603565");

            entity.HasOne(d => d.Member).WithMany(p => p.DonationRequests)
                .HasForeignKey(d => d.MemberId)
                .HasConstraintName("FK__DonationR__Membe__6477ECF3");

            entity.HasOne(d => d.Period).WithMany(p => p.DonationRequests)
                .HasForeignKey(d => d.PeriodId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__DonationR__Perio__656C112C");

            entity.HasOne(d => d.ResponsibleBy).WithMany(p => p.DonationRequests)
                .HasForeignKey(d => d.ResponsibleById)
                .HasConstraintName("FK__DonationR__Respo__6754599E");
        });

        modelBuilder.Entity<Member>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Members__1788CC4CC461D059");

            entity.Property(e => e.UserId).ValueGeneratedNever();
            entity.Property(e => e.DonationCount).HasDefaultValue(0);
            entity.Property(e => e.IsDonor).HasDefaultValue(false);
            entity.Property(e => e.IsRecipient).HasDefaultValue(false);

            entity.HasOne(d => d.BloodType).WithMany(p => p.Members)
                .HasForeignKey(d => d.BloodTypeId)
                .HasConstraintName("FK__Members__BloodTy__6B24EA82");

            entity.HasOne(d => d.User).WithOne(p => p.Member)
                .HasForeignKey<Member>(d => d.UserId)
                .HasConstraintName("FK__Members__UserId__6A30C649");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Role__8AFACE1B0F2A3C4D");
            
            entity.HasIndex(e => e.Name, "UQ__Role__737584F6A0B1D3C2").IsUnique();

            entity.Property(e => e.Name)
                .HasMaxLength(10)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationId).HasName("PK__Notifica__C90E2B1038E88F93");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Message).HasColumnType("nvarchar(max)");
            entity.Property(e => e.IsRead).HasColumnType("bit");
            entity.Property(e => e.NotificationType)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Title).HasMaxLength(100);

            entity.HasOne(d => d.User).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__Notificat__UserI__6C190EBB");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Role__8AFACE1B0F2A3C4D");

            entity.ToTable("Role");

            entity.HasIndex(e => e.Name, "UQ__Role__737584F6A0B1D3C2").IsUnique();

            entity.Property(e => e.RoleId).ValueGeneratedNever();

            entity.Property(e => e.Name).HasMaxLength(10);
        });

        modelBuilder.Entity<TransfusionRequest>(entity =>
        {
            entity.HasKey(e => e.TransfusionId).HasName("PK__Transfus__36A644FEFE95DAC4");

            entity.Property(e => e.ApprovalDate).HasColumnType("datetime");
            entity.Property(e => e.CompletionDate).HasColumnType("datetime");
            entity.Property(e => e.CancelledDate).HasColumnType("datetime");
            entity.Property(e => e.RejectedDate).HasColumnType("datetime");
            entity.Property(e => e.IsEmergency).HasDefaultValue(false);
            entity.Property(e => e.Notes).HasMaxLength(500);
            entity.Property(e => e.PatientCondition).HasMaxLength(500);
            entity.Property(e => e.PreferredReceiveDate).HasColumnType("datetime");
            entity.Property(e => e.RequestDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.TransfusionVolume).HasDefaultValue(1);

            entity.HasOne(d => d.BloodType).WithMany(p => p.TransfusionRequests)
                .HasForeignKey(d => d.BloodTypeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Transfusi__Blood__6E01572D");

            // entity.HasOne(d => d.BloodUnit).WithMany(p => p.TransfusionRequests)  // Đã xóa khỏi database
            //     .HasForeignKey(d => d.BloodUnitId)
            //     .HasConstraintName("FK__Transfusi__Blood__6FE99F9F");

            entity.HasOne(d => d.Component).WithMany(p => p.TransfusionRequests)
                .HasForeignKey(d => d.ComponentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Transfusi__Compo__6EF57B66");

            entity.HasOne(d => d.Member).WithMany(p => p.TransfusionRequests)
                .HasForeignKey(d => d.MemberId)
                .HasConstraintName("FK__Transfusi__Membe__6D0D32F4");

            entity.HasOne(d => d.ResponsibleBy).WithMany(p => p.TransfusionRequests)
                .HasForeignKey(d => d.ResponsibleById)
                .HasConstraintName("FK__Transfusi__Respo__70DDC3D8");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CC4C897D904A");

            entity.HasIndex(e => e.PhoneNumber, "UQ__Users__85FB4E382215A452").IsUnique();

            entity.HasIndex(e => e.Email, "UQ__Users__A9D10534423BF159").IsUnique();

            entity.HasIndex(e => e.CitizenNumber, "UQ__Users__B2F0D91E87CE2AD8").IsUnique();

            entity.Property(e => e.Address).HasMaxLength(255);

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                  .HasForeignKey(d => d.RoleId)
                  .HasConstraintName("FK__Users__RoleId__17036CC0");

            entity.Property(e => e.CitizenNumber)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.FullName).HasMaxLength(100);
            entity.Property(e => e.PasswordHash).HasMaxLength(255);
            entity.Property(e => e.PhoneNumber)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true);
        });

        modelBuilder.Entity<UrgentBloodRequest>(entity =>
        {
            entity.HasKey(e => e.UrgentRequestId).HasName("PK_UrgentBloodRequests_Id");

            entity.ToTable("UrgentBloodRequests");

            entity.Property(e => e.PatientName).HasMaxLength(255);
            entity.Property(e => e.Reason).HasMaxLength(500);
            entity.Property(e => e.ContactName).HasMaxLength(255);
            entity.Property(e => e.ContactPhone).HasMaxLength(20).IsUnicode(false);
            entity.Property(e => e.ContactEmail).HasMaxLength(255);
            entity.Property(e => e.EmergencyLocation).HasMaxLength(500);
            entity.Property(e => e.Notes).HasColumnType("nvarchar(max)");
            entity.Property(e => e.RequestDate)
                .HasColumnType("datetime")
                .HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.CompletionDate).HasColumnType("datetime");
            entity.Property(e => e.IsActive).HasDefaultValue(true);

            entity.HasOne(d => d.BloodType)
                .WithMany()
                .HasForeignKey(d => d.RequestedBloodTypeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_UrgentBloodRequests_BloodTypes_Requested");

            entity.HasOne(d => d.RelatedTransfusionRequest)
                .WithMany()
                .HasForeignKey(d => d.RelatedTransfusionRequestId)
                .HasConstraintName("FK_UrgentBloodRequests_TransfusionRequests_Related");

            entity.HasOne(d => d.CreatedByUser)
                .WithMany()
                .HasForeignKey(d => d.CreatedByUserId)
                .HasConstraintName("FK_UrgentBloodRequests_CreatedByUser");
        });

        modelBuilder.Entity<Hospital>(entity =>
        {
            entity.HasKey(e => e.HospitalId).HasName("PK__Hospital__BA9C464811D44BF0");

            entity.Property(e => e.Address).HasMaxLength(255);
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.Location).HasColumnType("geography");
        });

        modelBuilder.Entity<BloodReservation>(entity =>
        {
            entity.HasKey(e => e.ReservationId).HasName("PK__BloodRes__B9756D8A29A26A4A");

            entity.Property(e => e.ReservedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.ExpireAt).HasColumnType("datetime");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false);
        });

        modelBuilder.Entity<TransfusionRequestBloodUnit>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_TransfusionRequestBloodUnits_Id");

            entity.ToTable("TransfusionRequestBloodUnits");

            entity.Property(e => e.AssignedDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.Notes).HasMaxLength(500);

            entity.HasOne(d => d.TransfusionRequest).WithMany(p => p.TransfusionRequestBloodUnits)
                .HasForeignKey(d => d.TransfusionRequestId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_TransfusionRequestBloodUnits_TransfusionRequests");

            entity.HasOne(d => d.BloodUnit)
                .WithMany(bu => bu.TransfusionRequestBloodUnits)
                .HasForeignKey(d => d.BloodUnitId)
                .OnDelete(DeleteBehavior.NoAction)
                .HasConstraintName("FK_TransfusionRequestBloodUnits_BloodUnits");

            // Đảm bảo không trùng lặp
            entity.HasIndex(e => new { e.TransfusionRequestId, e.BloodUnitId })
                .IsUnique()
                .HasDatabaseName("UQ_TransfusionRequestBloodUnits_Request_Unit");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
