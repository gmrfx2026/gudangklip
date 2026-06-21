import { PrismaClient, Role, Category, CampaignStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminHash = await bcrypt.hash("admin123", 12);
  const brandHash = await bcrypt.hash("brand123", 12);
  const agencyHash = await bcrypt.hash("agency123", 12);
  const creatorHash = await bcrypt.hash("creator123", 12);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@gudangklip.com" },
    update: { passwordHash: adminHash },
    create: {
      name: "Admin GudangKlip",
      email: "admin@gudangklip.com",
      passwordHash: adminHash,
      role: "ADMIN",
      referralCode: "ADMIN001",
      trustScore: 100,
    },
  });

  // Create Brands
  const brand1 = await prisma.user.upsert({
    where: { email: "brand1@gudangklip.com" },
    update: { passwordHash: brandHash },
    create: {
      name: "Brand Satu",
      email: "brand1@gudangklip.com",
      passwordHash: brandHash,
      role: "BRAND",
      referralCode: "BRAND001",
    },
  });

  const brand2 = await prisma.user.upsert({
    where: { email: "brand2@gudangklip.com" },
    update: { passwordHash: brandHash },
    create: {
      name: "Brand Dua",
      email: "brand2@gudangklip.com",
      passwordHash: brandHash,
      role: "BRAND",
      referralCode: "BRAND002",
    },
  });

  // Create Agency
  const agencyOwner = await prisma.user.upsert({
    where: { email: "agency@gudangklip.com" },
    update: { passwordHash: agencyHash },
    create: {
      name: "Agency Pro Indonesia",
      email: "agency@gudangklip.com",
      passwordHash: agencyHash,
      role: "AGENCY",
      referralCode: "AGCY001",
    },
  });

  const agency = await prisma.agency.upsert({
    where: { ownerId: agencyOwner.id },
    update: {},
    create: {
      name: "Agency Pro Indonesia",
      ownerId: agencyOwner.id,
      commissionRate: 10,
    },
  });

  // Create Creators
  const creatorData = [
    { name: "Creator Satu", email: "creator1@gudangklip.com", trustScore: 95, totalViews: 25000000, totalEarnings: 75000000, walletBalance: 2500000 },
    { name: "Creator Dua", email: "creator2@gudangklip.com", trustScore: 82, totalViews: 12000000, totalEarnings: 36000000, walletBalance: 1800000 },
    { name: "Creator Tiga", email: "creator3@gudangklip.com", trustScore: 91, totalViews: 18000000, totalEarnings: 62000000, walletBalance: 3200000 },
    { name: "Creator Empat", email: "creator4@gudangklip.com", trustScore: 88, totalViews: 15000000, totalEarnings: 51000000, walletBalance: 1500000 },
    { name: "Creator Lima", email: "creator5@gudangklip.com", trustScore: 85, totalViews: 12000000, totalEarnings: 51000000, walletBalance: 4100000 },
    { name: "Creator Enam", email: "creator6@gudangklip.com", trustScore: 82, totalViews: 9000000, totalEarnings: 27000000, walletBalance: 900000 },
    { name: "Creator Tujuh", email: "creator7@gudangklip.com", trustScore: 62, totalViews: 5000000, totalEarnings: 15000000, walletBalance: 700000 },
    { name: "Creator Delapan", email: "creator8@gudangklip.com", trustScore: 55, totalViews: 2500000, totalEarnings: 7500000, walletBalance: 350000 },
    { name: "Creator Sembilan", email: "creator9@gudangklip.com", trustScore: 48, totalViews: 800000, totalEarnings: 2400000, walletBalance: 120000 },
    { name: "Creator Sepuluh", email: "creator10@gudangklip.com", trustScore: 40, totalViews: 300000, totalEarnings: 900000, walletBalance: 50000 },
  ];

  const createdCreators = [];
  for (let i = 0; i < creatorData.length; i++) {
    const d = creatorData[i];
    const creator = await prisma.user.upsert({
      where: { email: d.email },
      update: { passwordHash: creatorHash },
      create: {
        name: d.name,
        email: d.email,
        passwordHash: creatorHash,
        role: "CREATOR",
        referralCode: `CREATOR${String(i + 1).padStart(3, "0")}`,
        trustScore: d.trustScore,
        totalViews: d.totalViews,
        totalEarnings: d.totalEarnings,
        walletBalance: d.walletBalance,
        agencyId: i < 3 ? agency.id : null,
      },
    });
    createdCreators.push(creator);

    // Create social accounts
    const platforms = ["TIKTOK", "INSTAGRAM", "YOUTUBE"] as const;
    for (const platform of platforms.slice(0, Math.floor(Math.random() * 2) + 1)) {
      await prisma.socialAccount.upsert({
        where: { userId_platform: { userId: creator.id, platform } },
        update: {},
        create: {
          userId: creator.id,
          platform,
          username: `@${creator.name.toLowerCase().replace(/\s/g, "")}`,
          verified: true,
          followersCount: Math.floor(Math.random() * 100000),
        },
      });
    }
  }

  // Create Campaigns
  const campaigns = [
    {
      title: "Adiw - Untuk Apa Kucintai",
      description: "Campaign clipping untuk lagu terbaru Adiw - Untuk Apa Kucintai. Buat konten kreatif dengan lagu ini dan dapatkan cuan dari setiap views!",
      brief: "Gunakan lagu Adiw - Untuk Apa Kucintai sebagai background music. Buat konten storytelling, reaction, atau lipsync yang relate dengan lirik lagu.",
      category: "MUSIC" as Category,
      totalBudget: 51000000,
      cpmRate: 3000,
      minViewsToClaim: 1000,
      maxViewsPerVideo: 500000,
      brandId: brand1.id,
    },
    {
      title: "Film - Jangan Buang Ibu",
      description: "Campaign clipping untuk film terbaru Jangan Buang Ibu. Review, reaction, atau bahas film ini dan dapatkan cuan!",
      brief: "Buat konten review atau reaction film Jangan Buang Ibu. Bisa juga buat konten behind-the-scenes atau fakta menarik tentang film.",
      category: "FILM" as Category,
      totalBudget: 40000000,
      cpmRate: 500,
      minViewsToClaim: 1000,
      maxViewsPerVideo: null,
      brandId: brand1.id,
    },
    {
      title: "Nyemil Saji - Launch Campaign",
      description: "Campaign launching produk baru Nyemil Saji. Makanan ringan kekinian untuk anak muda.",
      brief: "Buat konten ASMR, mukbang, atau review produk Nyemil Saji. Tonjolkan rasa enak dan kemasan yang instagrammable.",
      category: "BRAND" as Category,
      totalBudget: 20000000,
      cpmRate: 1000,
      minViewsToClaim: 500,
      maxViewsPerVideo: 200000,
      brandId: brand2.id,
    },
    {
      title: "Angga Elza - New Single 2026",
      description: "Single terbaru dari Angga Elza! Buat konten dengan lagu ini dan raup cuan.",
      brief: "Gunakan lagu terbaru Angga Elza. Genre pop akustik, cocok untuk konten aesthetic, senja-senja, atau storytelling personal.",
      category: "MUSIC" as Category,
      totalBudget: 19000000,
      cpmRate: 2000,
      minViewsToClaim: 1000,
      maxViewsPerVideo: null,
      brandId: brand2.id,
    },
    {
      title: "Ternakklip Interviews Eps. 5",
      description: "Podcast episode spesial dengan guest star! Clip momen terbaik dan dapatkan cuan.",
      brief: "Clip momen-momen lucu, insightful, atau kontroversial dari podcast Ternakklip Interviews. Durasi ideal 30-90 detik.",
      category: "ENTERTAINMENT" as Category,
      totalBudget: 10000000,
      cpmRate: 5000,
      minViewsToClaim: 500,
      maxViewsPerVideo: 100000,
      brandId: brand1.id,
    },
  ];

  const createdCampaigns = [];
  for (const campaign of campaigns) {
    const c = await prisma.campaign.create({
      data: {
        ...campaign,
        remainingBudget: campaign.totalBudget,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "ACTIVE" as CampaignStatus,
      },
    });
    createdCampaigns.push(c);
  }

  // Join creators to campaigns and create submissions with ViewLogs
  for (const campaign of createdCampaigns) {
    const participantCount = Math.floor(Math.random() * 5) + 3;
    for (let i = 0; i < participantCount && i < createdCreators.length; i++) {
      const creator = createdCreators[i];

      await prisma.campaignParticipant.upsert({
        where: { campaignId_creatorId: { campaignId: campaign.id, creatorId: creator.id } },
        update: {},
        create: {
          campaignId: campaign.id,
          creatorId: creator.id,
        },
      });

      const statuses: ("PENDING" | "APPROVED" | "REJECTED")[] = ["PENDING", "APPROVED", "APPROVED", "REJECTED"];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const submission = await prisma.submission.create({
        data: {
          campaignId: campaign.id,
          creatorId: creator.id,
          platform: "TIKTOK",
          platformLink: "https://tiktok.com/@user/video/123456789",
          status,
          submittedAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
          reviewedAt: status !== "PENDING" ? new Date() : null,
        },
      });

      if (status === "APPROVED") {
        const viewCount = Math.floor(Math.random() * 500000) + 10000;
        const dayCount = Math.floor(Math.random() * 5) + 1;
        let remainingViews = viewCount;

        for (let d = 0; d < dayCount; d++) {
          const dayViews = d === dayCount - 1
            ? remainingViews
            : Math.floor(Math.random() * (remainingViews * 0.6)) + 1000;
          remainingViews -= dayViews;

          const payoutAmount = Math.round(dayViews * campaign.cpmRate / 1000);

          await prisma.viewLog.create({
            data: {
              submissionId: submission.id,
              views: dayViews,
              date: new Date(Date.now() - (dayCount - d) * 24 * 60 * 60 * 1000),
              isBotFiltered: false,
              payoutAmount,
            },
          });
        }
      } else if (status === "PENDING" && Math.random() > 0.5) {
        const viewCount = Math.floor(Math.random() * 5000) + 100;
        await prisma.viewLog.create({
          data: {
            submissionId: submission.id,
            views: viewCount,
            date: new Date(Date.now() - 24 * 60 * 60 * 1000),
            isBotFiltered: false,
            payoutAmount: null,
          },
        });
      }
    }
  }

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
