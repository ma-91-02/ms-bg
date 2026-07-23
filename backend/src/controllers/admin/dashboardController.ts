import { Response } from 'express';
import { AuthRequest } from '../../types/express';
import prisma from '../../config/prisma';

/**
 * إحصائيات لوحة التحكم.
 *
 * كانت 15 عملية عدّ متسلسلة، كلٌّ منها ذهاب وإياب مستقل إلى قاعدة البيانات
 * (`await` داخل حرفيّ كائن ينفَّذ تتابعًا لا توازيًا). صارت معاملة واحدة
 * تُنفَّذ دفعةً واحدة.
 */
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح به. يجب تسجيل الدخول كمشرف',
      });
    }

    const adSelect = {
      id: true,
      category: true,
      ownerName: true,
      itemNumber: true,
      user: { select: { fullName: true } },
    } as const;

    const [
      usersCount,
      adsTotal,
      adsPending,
      adsApproved,
      adsResolved,
      adsLost,
      adsFound,
      matchesTotal,
      matchesPending,
      matchesApproved,
      matchesRejected,
      contactsTotal,
      contactsPending,
      contactsApproved,
      contactsRejected,
      latestPendingAds,
      latestMatches,
    ] = await prisma.$transaction([
      prisma.user.count(),
      prisma.advertisement.count(),
      prisma.advertisement.count({ where: { isApproved: false } }),
      prisma.advertisement.count({ where: { isApproved: true, isResolved: false } }),
      prisma.advertisement.count({ where: { isResolved: true } }),
      prisma.advertisement.count({ where: { type: 'lost' } }),
      prisma.advertisement.count({ where: { type: 'found' } }),
      prisma.advertisementMatch.count(),
      prisma.advertisementMatch.count({ where: { status: 'pending' } }),
      prisma.advertisementMatch.count({ where: { status: 'approved' } }),
      prisma.advertisementMatch.count({ where: { status: 'rejected' } }),
      prisma.contactRequest.count(),
      prisma.contactRequest.count({ where: { status: 'pending' } }),
      prisma.contactRequest.count({ where: { status: 'approved' } }),
      prisma.contactRequest.count({ where: { status: 'rejected' } }),
      prisma.advertisement.findMany({
        where: { isApproved: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { user: { select: { fullName: true, phoneNumber: true } } },
      }),
      prisma.advertisementMatch.findMany({
        where: { status: 'pending' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          lostAdvertisement: { select: adSelect },
          foundAdvertisement: { select: adSelect },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        usersCount,
        ads: {
          total: adsTotal,
          pending: adsPending,
          approved: adsApproved,
          resolved: adsResolved,
          lost: adsLost,
          found: adsFound,
        },
        matches: {
          total: matchesTotal,
          pending: matchesPending,
          approved: matchesApproved,
          rejected: matchesRejected,
        },
        contactRequests: {
          total: contactsTotal,
          pending: contactsPending,
          approved: contactsApproved,
          rejected: contactsRejected,
        },
        latestPendingAds,
        latestMatches,
      },
    });
  } catch (error: any) {
    console.error('خطأ في الحصول على إحصائيات لوحة التحكم:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ في الخادم',
    });
  }
};

/**
 * تطوّر الأرقام عبر الزمن.
 *
 * كانت اللوحة تستدعي هذا المسار وتتلقّى 404، فتسقط بصمت إلى
 * `generateMockTimelineData` المبنية على `Math.random()` — أي أن الرسم
 * البياني كان يعرض أرقامًا مُختلَقة تمامًا وكأنها حقيقية. عرض بيانات
 * مصنوعة أسوأ من عرض لا شيء: المشرف يبني قراره عليها.
 */
export const getTimelineStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'غير مصرح به' });
    }

    const period = (req.query.period as string) || 'week';
    const days = period === 'year' ? 365 : period === 'month' ? 30 : 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // تجميع يومي في استعلام واحد بدل استعلام لكل يوم
    const rows = await prisma.$queryRaw<
      Array<{
        date: string;
        users: bigint;
        advertisements: bigint;
        pending: bigint;
        approved: bigint;
        resolved: bigint;
      }>
    >`
      WITH days AS (
        SELECT generate_series(
          date_trunc('day', ${since}::timestamp),
          date_trunc('day', now()),
          '1 day'
        )::date AS day
      )
      SELECT
        to_char(d.day, 'YYYY-MM-DD') AS date,
        (SELECT count(*) FROM users u WHERE u.created_at::date <= d.day) AS users,
        (SELECT count(*) FROM advertisements a WHERE a.created_at::date <= d.day) AS advertisements,
        (SELECT count(*) FROM advertisements a WHERE a.created_at::date <= d.day AND a.is_approved = false) AS pending,
        (SELECT count(*) FROM advertisements a WHERE a.created_at::date <= d.day AND a.is_approved = true) AS approved,
        (SELECT count(*) FROM advertisements a WHERE a.created_at::date <= d.day AND a.is_resolved = true) AS resolved
      FROM days d
      ORDER BY d.day
    `;

    return res.status(200).json({
      success: true,
      data: rows.map((r) => ({
        date: r.date,
        users: Number(r.users),
        advertisements: Number(r.advertisements),
        pendingAds: Number(r.pending),
        approvedAds: Number(r.approved),
        resolvedAds: Number(r.resolved),
      })),
    });
  } catch (error: any) {
    console.error('خطأ في جلب البيانات الزمنية:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

/** آخر ما جرى في النظام — مجمّع من الإعلانات وطلبات التواصل والمطابقات */
export const getRecentActivity = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'غير مصرح به' });
    }

    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

    const [ads, contacts, matches] = await prisma.$transaction([
      prisma.advertisement.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          type: true,
          category: true,
          status: true,
          createdAt: true,
          user: { select: { id: true, fullName: true } },
        },
      }),
      prisma.contactRequest.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          status: true,
          createdAt: true,
          user: { select: { id: true, fullName: true } },
        },
      }),
      prisma.advertisementMatch.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { id: true, matchScore: true, status: true, createdAt: true },
      }),
    ]);

    const activities = [
      ...ads.map((a) => ({
        id: a.id,
        type: a.status === 'approved' ? 'document_approved' : 'document_added',
        message: `إعلان ${a.type === 'lost' ? 'مفقود' : 'موجود'} من نوع ${a.category}`,
        timestamp: a.createdAt,
        userId: a.user?.id,
        userName: a.user?.fullName ?? undefined,
        documentId: a.id,
        documentType: a.category,
      })),
      ...contacts.map((c) => ({
        id: c.id,
        type: 'contact_request',
        message: 'طلب تواصل جديد',
        timestamp: c.createdAt,
        userId: c.user?.id,
        userName: c.user?.fullName ?? undefined,
      })),
      ...matches.map((m) => ({
        id: m.id,
        type: 'match_found',
        message: `مطابقة محتملة بدرجة ${m.matchScore}%`,
        timestamp: m.createdAt,
      })),
    ]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    return res.status(200).json({ success: true, data: activities });
  } catch (error: any) {
    console.error('خطأ في جلب النشاط الحديث:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};

/** أكثر المستخدمين نشاطًا — مقاسًا بعدد الإعلانات وطلبات التواصل */
export const getActiveUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'غير مصرح به' });
    }

    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 5));

    const users = await prisma.user.findMany({
      where: { isDeleted: false },
      include: {
        _count: { select: { advertisements: true, contactRequests: true } },
      },
    });

    const ranked = users
      .map((u) => ({
        id: u.id,
        name: u.fullName || u.phoneNumber,
        email: u.email || 'غير متوفر',
        profileImage: u.profileImage,
        activityCount: u._count.advertisements + u._count.contactRequests,
        lastActive: u.updatedAt,
      }))
      .sort((a, b) => b.activityCount - a.activityCount)
      .slice(0, limit);

    return res.status(200).json({ success: true, data: ranked });
  } catch (error: any) {
    console.error('خطأ في جلب المستخدمين النشطين:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
};
