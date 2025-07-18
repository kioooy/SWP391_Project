USE [master]
GO
CREATE DATABASE [BloodDonationDB]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'BloodDonationDB_Data', FILENAME = N'I:\System Apps\Development\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\BloodDonationDB.mdf' , SIZE = 14336KB , MAXSIZE = UNLIMITED, FILEGROWTH = 1024KB )
 LOG ON 
( NAME = N'BloodDonationDB_Log', FILENAME = N'I:\System Apps\Development\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\BloodDonationDB.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 10%)
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO
ALTER DATABASE [BloodDonationDB] SET COMPATIBILITY_LEVEL = 160
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [BloodDonationDB].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [BloodDonationDB] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [BloodDonationDB] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [BloodDonationDB] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [BloodDonationDB] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [BloodDonationDB] SET ARITHABORT OFF 
GO
ALTER DATABASE [BloodDonationDB] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [BloodDonationDB] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [BloodDonationDB] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [BloodDonationDB] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [BloodDonationDB] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [BloodDonationDB] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [BloodDonationDB] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [BloodDonationDB] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [BloodDonationDB] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [BloodDonationDB] SET  ENABLE_BROKER 
GO
ALTER DATABASE [BloodDonationDB] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [BloodDonationDB] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [BloodDonationDB] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [BloodDonationDB] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [BloodDonationDB] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [BloodDonationDB] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [BloodDonationDB] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [BloodDonationDB] SET RECOVERY FULL 
GO
ALTER DATABASE [BloodDonationDB] SET  MULTI_USER 
GO
ALTER DATABASE [BloodDonationDB] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [BloodDonationDB] SET DB_CHAINING OFF 
GO
ALTER DATABASE [BloodDonationDB] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [BloodDonationDB] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [BloodDonationDB] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [BloodDonationDB] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
EXEC sys.sp_db_vardecimal_storage_format N'BloodDonationDB', N'ON'
GO
ALTER DATABASE [BloodDonationDB] SET QUERY_STORE = ON
GO
ALTER DATABASE [BloodDonationDB] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [BloodDonationDB]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [Article](
	[ArticleId] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NOT NULL,
	[Title] [nvarchar](200) NOT NULL,
	[Content] [ntext] NOT NULL,
	[PublishedDate] [datetime] NULL,
	[UpdatedDate] [datetime] NULL,
	[ImageUrl] [nvarchar](max) NULL,
	[Status] [varchar](20) NOT NULL,
	[IsActive] [bit] NOT NULL,
 CONSTRAINT [PK__Article__9C6270E876CB1538] PRIMARY KEY CLUSTERED 
(
	[ArticleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [Blog](
	[PostId] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NOT NULL,
	[Title] [nvarchar](200) NOT NULL,
	[Content] [ntext] NOT NULL,
	[PublishedDate] [datetime] NULL,
	[UpdatedDate] [datetime] NULL,
	[ImageUrl] [nvarchar](max) NULL,
	[Status] [varchar](20) NOT NULL,
	[IsActive] [bit] NOT NULL,
 CONSTRAINT [PK__Blog__AA12601875D63E69] PRIMARY KEY CLUSTERED 
(
	[PostId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [BloodCompatibilityRules](
	[BloodRuleId] [int] IDENTITY(1,1) NOT NULL,
	[BloodGiveId] [int] NOT NULL,
	[BloodRecieveId] [int] NOT NULL,
	[IsCompatible] [bit] NOT NULL,
	[ComponentId] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[BloodRuleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [BloodComponents](
	[ComponentId] [int] IDENTITY(1,1) NOT NULL,
	[ComponentName] [nvarchar](50) NOT NULL,
	[Description] [nvarchar](500) NULL,
	[ShelfLifeDays] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ComponentId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[ComponentName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [BloodDonationPeriod](
	[PeriodId] [int] IDENTITY(1,1) NOT NULL,
	[PeriodName] [nvarchar](100) NOT NULL,
	[HospitalId] [int] NOT NULL,
	[Status] [varchar](20) NOT NULL,
	[PeriodDateFrom] [datetime] NOT NULL,
	[PeriodDateTo] [datetime] NOT NULL,
	[TargetQuantity] [int] NOT NULL,
	[CurrentQuantity] [int] NULL,
	[ImageUrl] [nvarchar](255) NULL,
	[IsActive] [bit] NOT NULL,
 CONSTRAINT [PK__BloodDon__E521BB1645A345CB] PRIMARY KEY CLUSTERED 
(
	[PeriodId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [BloodReservations](
	[ReservationId] [int] IDENTITY(1,1) NOT NULL,
	[BloodUnitId] [int] NOT NULL,
	[TransfusionId] [int] NOT NULL,
	[ReservedById] [int] NULL,
	[ReservedAt] [datetime] NOT NULL,
	[ExpireAt] [datetime] NOT NULL,
	[Status] [varchar](20) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[ReservationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [BloodTypes](
	[BloodTypeId] [int] IDENTITY(1,1) NOT NULL,
	[BloodTypeName] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[BloodTypeId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[BloodTypeName] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [BloodUnits](
	[BloodUnitId] [int] IDENTITY(1,1) NOT NULL,
	[MemberId] [int] NULL,
	[BloodTypeId] [int] NOT NULL,
	[ComponentId] [int] NOT NULL,
	[AddDate] [date] NULL,
	[ExpiryDate] [date] NOT NULL,
	[Volume] [int] NOT NULL,
	[BloodStatus] [varchar](20) NOT NULL,
	[RemainingVolume] [int] NOT NULL,
	[Notes] [nvarchar](max) NULL,
 CONSTRAINT [PK__BloodUni__AC1C2F8BF7F4315A] PRIMARY KEY CLUSTERED 
(
	[BloodUnitId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [DonationRequests](
	[DonationId] [int] IDENTITY(1,1) NOT NULL,
	[MemberId] [int] NOT NULL,
	[PeriodId] [int] NOT NULL,
	[ComponentId] [int] NOT NULL,
	[PreferredDonationDate] [date] NULL,
	[ResponsibleById] [int] NULL,
	[RequestDate] [datetime] NULL,
	[ApprovalDate] [datetime] NULL,
	[CompletionDate] [datetime] NULL,
	[CancelledDate] [datetime] NULL,
	[RejectedDate] [datetime] NULL,
	[DonationVolume] [int] NULL,
	[Status] [varchar](20) NOT NULL,
	[Notes] [nvarchar](500) NULL,
	[PatientCondition] [nvarchar](500) NULL,
	[IsActive] [bit] NOT NULL,
 CONSTRAINT [PK__Donation__C5082EFB50D12CB7] PRIMARY KEY CLUSTERED 
(
	[DonationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [Hospital](
	[HospitalId] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](255) NOT NULL,
	[Address] [nvarchar](500) NULL,
	[Phone] [nvarchar](50) NULL,
	[Email] [nvarchar](255) NULL,
	[Location] [geography] NULL,
	[CreatedAt] [datetime] NULL,
	[UpdatedAt] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[HospitalId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [Members](
	[UserId] [int] NOT NULL,
	[BloodTypeId] [int] NULL,
	[Weight] [int] NULL,
	[Height] [int] NULL,
	[LastDonationDate] [date] NULL,
	[RecoveryDueDate] [date] NULL,
	[IsDonor] [bit] NULL,
	[IsRecipient] [bit] NULL,
	[DonationCount] [int] NULL,
	[LastCheckupDate] [date] NULL,
	[Location] [geography] NULL,
PRIMARY KEY CLUSTERED 
(
	[UserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [Notifications](
	[NotificationId] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [int] NOT NULL,
	[Title] [nvarchar](100) NOT NULL,
	[Message] [nvarchar](500) NOT NULL,
	[CreatedAt] [datetime] NULL,
	[NotificationType] [varchar](50) NOT NULL,
	[IsActive] [bit] NOT NULL,
	[IsRead] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[NotificationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [Role](
	[RoleId] [int] NOT NULL,
	[Name] [nvarchar](10) NOT NULL,
 CONSTRAINT [PK__Role__8AFACE1B0F2A3C4D] PRIMARY KEY CLUSTERED 
(
	[RoleId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ__Role__737584F6A0B1D3C2] UNIQUE NONCLUSTERED 
(
	[Name] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [TransfusionRequestBloodUnits](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[TransfusionRequestId] [int] NOT NULL,
	[BloodUnitId] [int] NOT NULL,
	[AssignedVolume] [int] NOT NULL,
	[AssignedDate] [datetime] NULL,
	[Status] [varchar](20) NULL,
	[Notes] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[TransfusionRequestId] ASC,
	[BloodUnitId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [TransfusionRequests](
	[TransfusionId] [int] IDENTITY(1,1) NOT NULL,
	[MemberId] [int] NOT NULL,
	[BloodTypeId] [int] NOT NULL,
	[ComponentId] [int] NOT NULL,
	[ResponsibleById] [int] NULL,
	[IsEmergency] [bit] NULL,
	[TransfusionVolume] [int] NOT NULL,
	[PreferredReceiveDate] [datetime] NULL,
	[RequestDate] [datetime] NULL,
	[ApprovalDate] [datetime] NULL,
	[CompletionDate] [datetime] NULL,
	[CancelledDate] [datetime] NULL,
	[RejectedDate] [datetime] NULL,
	[Status] [varchar](20) NOT NULL,
	[Notes] [nvarchar](500) NULL,
	[PatientCondition] [nvarchar](500) NULL,
	[IsActive] [bit] NOT NULL,
 CONSTRAINT [PK__Transfus__36A644FE2FBCA9DA] PRIMARY KEY CLUSTERED 
(
	[TransfusionId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [UrgentBloodRequests](
	[UrgentRequestId] [int] IDENTITY(1,1) NOT NULL,
	[PatientName] [nvarchar](255) NOT NULL,
	[RequestedBloodTypeId] [int] NOT NULL,
	[Reason] [nvarchar](500) NULL,
	[CitizenNumber] [varchar](20) NOT NULL,
	[ContactName] [nvarchar](255) NOT NULL,
	[ContactPhone] [varchar](20) NOT NULL,
	[ContactEmail] [nvarchar](255) NULL,
	[EmergencyLocation] [nvarchar](500) NOT NULL,
	[Notes] [nvarchar](max) NULL,
	[RequestDate] [datetime] NOT NULL,
	[Status] [nvarchar](50) NOT NULL,
	[CompletionDate] [datetime] NULL,
	[IsActive] [bit] NOT NULL,
 CONSTRAINT [PK_UrgentBloodRequests_Id] PRIMARY KEY CLUSTERED 
(
	[UrgentRequestId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [Users](
	[UserId] [int] IDENTITY(1,1) NOT NULL,
	[PasswordHash] [nvarchar](255) NOT NULL,
	[FullName] [nvarchar](100) NOT NULL,
	[CitizenNumber] [varchar](20) NOT NULL,
	[Email] [nvarchar](100) NOT NULL,
	[PhoneNumber] [varchar](20) NULL,
	[DateOfBirth] [date] NULL,
	[Sex] [bit] NOT NULL,
	[Address] [nvarchar](255) NULL,
	[RoleId] [int] NOT NULL,
	[CreatedAt] [datetime] NULL,
	[UpdatedAt] [datetime] NULL,
	[IsActive] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[UserId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[PhoneNumber] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[Email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[CitizenNumber] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [Article] ADD  CONSTRAINT [DF__Article__Publish__59063A47]  DEFAULT (getdate()) FOR [PublishedDate]
GO
ALTER TABLE [Article] ADD  CONSTRAINT [DF__Article__IsActiv__59FA5E80]  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [Blog] ADD  CONSTRAINT [DF__Blog__PublishedD__60A75C0F]  DEFAULT (getdate()) FOR [PublishedDate]
GO
ALTER TABLE [Blog] ADD  CONSTRAINT [DF__Blog__IsActive__5FB337D6]  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [BloodCompatibilityRules] ADD  DEFAULT ((0)) FOR [IsCompatible]
GO
ALTER TABLE [BloodDonationPeriod] ADD  CONSTRAINT [DF__BloodDona__Curre__5DCAEF64]  DEFAULT ((0)) FOR [CurrentQuantity]
GO
ALTER TABLE [BloodDonationPeriod] ADD  CONSTRAINT [DF__BloodDona__IsAct__5EBF139D]  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [BloodReservations] ADD  DEFAULT (getdate()) FOR [ReservedAt]
GO
ALTER TABLE [BloodUnits] ADD  CONSTRAINT [DF__BloodUnit__AddDa__60A75C0F]  DEFAULT (getdate()) FOR [AddDate]
GO
ALTER TABLE [BloodUnits] ADD  CONSTRAINT [DF__BloodUnit__Remai__619B8048]  DEFAULT ((0)) FOR [RemainingVolume]
GO
ALTER TABLE [DonationRequests] ADD  CONSTRAINT [DF__DonationR__Reque__628FA481]  DEFAULT (getdate()) FOR [RequestDate]
GO
ALTER TABLE [DonationRequests] ADD  CONSTRAINT [DF__DonationR__IsAct__6383C8BA]  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [Hospital] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [Members] ADD  DEFAULT ((0)) FOR [IsDonor]
GO
ALTER TABLE [Members] ADD  DEFAULT ((0)) FOR [IsRecipient]
GO
ALTER TABLE [Members] ADD  DEFAULT ((0)) FOR [DonationCount]
GO
ALTER TABLE [Notifications] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [Notifications] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [Notifications] ADD  CONSTRAINT [DF_Notifications_IsRead]  DEFAULT ((0)) FOR [IsRead]
GO
ALTER TABLE [TransfusionRequestBloodUnits] ADD  DEFAULT (getdate()) FOR [AssignedDate]
GO
ALTER TABLE [TransfusionRequestBloodUnits] ADD  DEFAULT ('Assigned') FOR [Status]
GO
ALTER TABLE [TransfusionRequests] ADD  CONSTRAINT [DF__Transfusi__IsEme__6B24EA82]  DEFAULT ((0)) FOR [IsEmergency]
GO
ALTER TABLE [TransfusionRequests] ADD  CONSTRAINT [DF__Transfusi__Trans__6C190EBB]  DEFAULT ((1)) FOR [TransfusionVolume]
GO
ALTER TABLE [TransfusionRequests] ADD  CONSTRAINT [DF__Transfusi__Reque__6D0D32F4]  DEFAULT (getdate()) FOR [RequestDate]
GO
ALTER TABLE [TransfusionRequests] ADD  CONSTRAINT [DF__Transfusi__IsAct__6A30C649]  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [UrgentBloodRequests] ADD  CONSTRAINT [DF_UrgentBloodRequests_RequestDate_Current]  DEFAULT (getdate()) FOR [RequestDate]
GO
ALTER TABLE [UrgentBloodRequests] ADD  CONSTRAINT [DF_UrgentBloodRequests_IsActive]  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [Users] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [Users] ADD  DEFAULT (getdate()) FOR [UpdatedAt]
GO
ALTER TABLE [Users] ADD  DEFAULT ((1)) FOR [IsActive]
GO
ALTER TABLE [Article]  WITH CHECK ADD  CONSTRAINT [FK__Article__UserId__70DDC3D8] FOREIGN KEY([UserId])
REFERENCES [Users] ([UserId])
GO
ALTER TABLE [Article] CHECK CONSTRAINT [FK__Article__UserId__70DDC3D8]
GO
ALTER TABLE [Blog]  WITH CHECK ADD  CONSTRAINT [FK__Blog__UserId__7B5B524B] FOREIGN KEY([UserId])
REFERENCES [Users] ([UserId])
GO
ALTER TABLE [Blog] CHECK CONSTRAINT [FK__Blog__UserId__7B5B524B]
GO
ALTER TABLE [BloodCompatibilityRules]  WITH CHECK ADD FOREIGN KEY([BloodGiveId])
REFERENCES [BloodTypes] ([BloodTypeId])
GO
ALTER TABLE [BloodCompatibilityRules]  WITH CHECK ADD FOREIGN KEY([BloodRecieveId])
REFERENCES [BloodTypes] ([BloodTypeId])
GO
ALTER TABLE [BloodDonationPeriod]  WITH CHECK ADD  CONSTRAINT [FK__BloodDona__Hospi__43D61337] FOREIGN KEY([HospitalId])
REFERENCES [Hospital] ([HospitalId])
GO
ALTER TABLE [BloodDonationPeriod] CHECK CONSTRAINT [FK__BloodDona__Hospi__43D61337]
GO
ALTER TABLE [BloodReservations]  WITH CHECK ADD  CONSTRAINT [FK_BloodReservations_BloodUnit] FOREIGN KEY([BloodUnitId])
REFERENCES [BloodUnits] ([BloodUnitId])
GO
ALTER TABLE [BloodReservations] CHECK CONSTRAINT [FK_BloodReservations_BloodUnit]
GO
ALTER TABLE [BloodReservations]  WITH CHECK ADD  CONSTRAINT [FK_BloodReservations_Transfusion] FOREIGN KEY([TransfusionId])
REFERENCES [TransfusionRequests] ([TransfusionId])
GO
ALTER TABLE [BloodReservations] CHECK CONSTRAINT [FK_BloodReservations_Transfusion]
GO
ALTER TABLE [BloodReservations]  WITH CHECK ADD  CONSTRAINT [FK_BloodReservations_User] FOREIGN KEY([ReservedById])
REFERENCES [Users] ([UserId])
GO
ALTER TABLE [BloodReservations] CHECK CONSTRAINT [FK_BloodReservations_User]
GO
ALTER TABLE [BloodUnits]  WITH CHECK ADD  CONSTRAINT [FK__BloodUnit__Blood__787EE5A0] FOREIGN KEY([BloodTypeId])
REFERENCES [BloodTypes] ([BloodTypeId])
GO
ALTER TABLE [BloodUnits] CHECK CONSTRAINT [FK__BloodUnit__Blood__787EE5A0]
GO
ALTER TABLE [BloodUnits]  WITH CHECK ADD  CONSTRAINT [FK__BloodUnit__Compo__797309D9] FOREIGN KEY([ComponentId])
REFERENCES [BloodComponents] ([ComponentId])
GO
ALTER TABLE [BloodUnits] CHECK CONSTRAINT [FK__BloodUnit__Compo__797309D9]
GO
ALTER TABLE [BloodUnits]  WITH CHECK ADD  CONSTRAINT [FK__BloodUnit__Membe__778AC167] FOREIGN KEY([MemberId])
REFERENCES [Members] ([UserId])
ON DELETE CASCADE
GO
ALTER TABLE [BloodUnits] CHECK CONSTRAINT [FK__BloodUnit__Membe__778AC167]
GO
ALTER TABLE [DonationRequests]  WITH CHECK ADD  CONSTRAINT [FK__DonationR__Compo__7C4F7684] FOREIGN KEY([ComponentId])
REFERENCES [BloodComponents] ([ComponentId])
GO
ALTER TABLE [DonationRequests] CHECK CONSTRAINT [FK__DonationR__Compo__7C4F7684]
GO
ALTER TABLE [DonationRequests]  WITH CHECK ADD  CONSTRAINT [FK__DonationR__Membe__7A672E12] FOREIGN KEY([MemberId])
REFERENCES [Members] ([UserId])
ON DELETE CASCADE
GO
ALTER TABLE [DonationRequests] CHECK CONSTRAINT [FK__DonationR__Membe__7A672E12]
GO
ALTER TABLE [DonationRequests]  WITH CHECK ADD  CONSTRAINT [FK__DonationR__Perio__7B5B524B] FOREIGN KEY([PeriodId])
REFERENCES [BloodDonationPeriod] ([PeriodId])
GO
ALTER TABLE [DonationRequests] CHECK CONSTRAINT [FK__DonationR__Perio__7B5B524B]
GO
ALTER TABLE [DonationRequests]  WITH CHECK ADD  CONSTRAINT [FK__DonationR__Respo__7D439ABD] FOREIGN KEY([ResponsibleById])
REFERENCES [Users] ([UserId])
GO
ALTER TABLE [DonationRequests] CHECK CONSTRAINT [FK__DonationR__Respo__7D439ABD]
GO
ALTER TABLE [Members]  WITH CHECK ADD FOREIGN KEY([BloodTypeId])
REFERENCES [BloodTypes] ([BloodTypeId])
GO
ALTER TABLE [Members]  WITH CHECK ADD FOREIGN KEY([UserId])
REFERENCES [Users] ([UserId])
ON DELETE CASCADE
GO
ALTER TABLE [Notifications]  WITH CHECK ADD FOREIGN KEY([UserId])
REFERENCES [Users] ([UserId])
ON DELETE CASCADE
GO
ALTER TABLE [TransfusionRequestBloodUnits]  WITH CHECK ADD FOREIGN KEY([BloodUnitId])
REFERENCES [BloodUnits] ([BloodUnitId])
GO
ALTER TABLE [TransfusionRequestBloodUnits]  WITH CHECK ADD FOREIGN KEY([TransfusionRequestId])
REFERENCES [TransfusionRequests] ([TransfusionId])
ON DELETE CASCADE
GO
ALTER TABLE [TransfusionRequests]  WITH CHECK ADD  CONSTRAINT [FK__Transfusi__Blood__02FC7413] FOREIGN KEY([BloodTypeId])
REFERENCES [BloodTypes] ([BloodTypeId])
GO
ALTER TABLE [TransfusionRequests] CHECK CONSTRAINT [FK__Transfusi__Blood__02FC7413]
GO
ALTER TABLE [TransfusionRequests]  WITH CHECK ADD  CONSTRAINT [FK__Transfusi__Compo__03F0984C] FOREIGN KEY([ComponentId])
REFERENCES [BloodComponents] ([ComponentId])
GO
ALTER TABLE [TransfusionRequests] CHECK CONSTRAINT [FK__Transfusi__Compo__03F0984C]
GO
ALTER TABLE [TransfusionRequests]  WITH CHECK ADD  CONSTRAINT [FK__Transfusi__Membe__02084FDA] FOREIGN KEY([MemberId])
REFERENCES [Members] ([UserId])
ON DELETE CASCADE
GO
ALTER TABLE [TransfusionRequests] CHECK CONSTRAINT [FK__Transfusi__Membe__02084FDA]
GO
ALTER TABLE [TransfusionRequests]  WITH CHECK ADD  CONSTRAINT [FK__Transfusi__Respo__01142BA1] FOREIGN KEY([ResponsibleById])
REFERENCES [Users] ([UserId])
GO
ALTER TABLE [TransfusionRequests] CHECK CONSTRAINT [FK__Transfusi__Respo__01142BA1]
GO
ALTER TABLE [UrgentBloodRequests]  WITH CHECK ADD  CONSTRAINT [FK_UrgentBloodRequests_BloodTypes_Requested] FOREIGN KEY([RequestedBloodTypeId])
REFERENCES [BloodTypes] ([BloodTypeId])
GO
ALTER TABLE [UrgentBloodRequests] CHECK CONSTRAINT [FK_UrgentBloodRequests_BloodTypes_Requested]
GO
ALTER TABLE [Users]  WITH CHECK ADD FOREIGN KEY([RoleId])
REFERENCES [Role] ([RoleId])
GO
ALTER TABLE [Article]  WITH CHECK ADD  CONSTRAINT [CK__Article__Status__06CD04F7] CHECK  (([Status]='Published' OR [Status]='Draft'))
GO
ALTER TABLE [Article] CHECK CONSTRAINT [CK__Article__Status__06CD04F7]
GO
ALTER TABLE [Blog]  WITH CHECK ADD  CONSTRAINT [CK__Blog__Status__160F4887] CHECK  (([Status]='Published' OR [Status]='Draft'))
GO
ALTER TABLE [Blog] CHECK CONSTRAINT [CK__Blog__Status__160F4887]
GO
ALTER TABLE [BloodDonationPeriod]  WITH CHECK ADD  CONSTRAINT [CK__BloodDona__Statu__08B54D69] CHECK  (([Status]='Cancelled' OR [Status]='Completed' OR [Status]='Active'))
GO
ALTER TABLE [BloodDonationPeriod] CHECK CONSTRAINT [CK__BloodDona__Statu__08B54D69]
GO
ALTER TABLE [BloodReservations]  WITH CHECK ADD  CONSTRAINT [CK_BloodReservations_Status] CHECK  (([Status]='Fulfilled' OR [Status]='Cancelled' OR [Status]='Active'))
GO
ALTER TABLE [BloodReservations] CHECK CONSTRAINT [CK_BloodReservations_Status]
GO
ALTER TABLE [BloodUnits]  WITH CHECK ADD  CONSTRAINT [CK_BloodUnits_BloodStatus] CHECK  (([BloodStatus]='Reserved' OR [BloodStatus]='Available' OR [BloodStatus]='PartialUsed' OR [BloodStatus]='Used' OR [BloodStatus]='Expired' OR [BloodStatus]='Discarded'))
GO
ALTER TABLE [BloodUnits] CHECK CONSTRAINT [CK_BloodUnits_BloodStatus]
GO
ALTER TABLE [DonationRequests]  WITH CHECK ADD  CONSTRAINT [CK__DonationR__Statu__0B91BA14] CHECK  (([Status]='Cancelled' OR [Status]='Rejected' OR [Status]='Completed' OR [Status]='Approved' OR [Status]='Pending'))
GO
ALTER TABLE [DonationRequests] CHECK CONSTRAINT [CK__DonationR__Statu__0B91BA14]
GO
ALTER TABLE [TransfusionRequestBloodUnits]  WITH CHECK ADD CHECK  (([Status]='Cancelled' OR [Status]='Used' OR [Status]='Assigned'))
GO
ALTER TABLE [TransfusionRequests]  WITH CHECK ADD  CONSTRAINT [CK__Transfusi__Statu__0C85DE4D] CHECK  (([Status]='Cancelled' OR [Status]='Rejected' OR [Status]='Completed' OR [Status]='Approved' OR [Status]='Pending'))
GO
ALTER TABLE [TransfusionRequests] CHECK CONSTRAINT [CK__Transfusi__Statu__0C85DE4D]
GO
ALTER TABLE [UrgentBloodRequests]  WITH CHECK ADD  CONSTRAINT [CK_UrgentBloodRequests_Status] CHECK  (([Status]='Cancelled' OR [Status]='Fulfilled' OR [Status]='InProgress' OR [Status]='Pending'))
GO
ALTER TABLE [UrgentBloodRequests] CHECK CONSTRAINT [CK_UrgentBloodRequests_Status]
GO
USE [master]
GO
ALTER DATABASE [BloodDonationDB] SET  READ_WRITE 
GO
