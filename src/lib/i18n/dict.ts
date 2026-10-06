/**
 * Panel translations.
 *
 * English is the key: every user-facing string in the panel is written in
 * English in the source, and this maps each one to its Persian. A string with
 * no entry falls back to the English, so the panel always renders — a missing
 * translation is untranslated text, never a crash or a blank.
 *
 * `t("Dashboard")` in a server component (via getT) or a client one (via
 * useT) returns the English unchanged when the language is English, and the
 * Persian when it is Persian.
 */

export const LANGS = ["en", "fa"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "en";

/** Cookie name — kept here (client-safe) so client code never imports the
 * server module (which pulls in next/headers). */
export const LANG_COOKIE = "np_admin_lang";

export function isLang(value: unknown): value is Lang {
  return value === "en" || value === "fa";
}

export function dir(lang: Lang): "ltr" | "rtl" {
  return lang === "fa" ? "rtl" : "ltr";
}

/** English → Persian. Anything absent falls back to the English key. */
export const FA: Record<string, string> = {
  // Shell / chrome
  "NorthPeak Ops": "پنل NorthPeak",
  "Internal · v1": "داخلی · نسخهٔ ۱",
  "Internal tool. Customers never see this.": "ابزار داخلی. مشتری‌ها هرگز این را نمی‌بینند.",
  "Signed in as": "واردشده به‌عنوان",
  "Log out": "خروج",
  "Dashboard": "داشبورد",
  "Control": "مرکز کنترل",
  "Leads": "سرنخ‌ها",
  "Clients": "مشتریان",
  "Calendar": "تقویم",
  "New Quote": "پیش‌فاکتور جدید",
  "Quotes": "پیش‌فاکتورها",
  "Connections": "اتصال‌ها",
  "Settings": "تنظیمات",
  // Short (bottom tab bar)
  "Home": "خانه",
  "Cal": "تقویم",
  "New": "جدید",
  "Links": "اتصال‌ها",

  // Common
  "New quote": "پیش‌فاکتور جدید",
  "View all": "همه",
  "Save": "ذخیره",
  "Cancel": "انصراف",
  "Add": "افزودن",
  "Edit": "ویرایش",
  "Delete": "حذف",
  "Back": "بازگشت",
  "Loading…": "در حال بارگذاری…",
  "Customer": "مشتری",
  "Area": "منطقه",
  "Range": "بازه",
  "Status": "وضعیت",
  "By": "توسط",
  "Date": "تاریخ",
  "Phone": "تلفن",
  "Email": "ایمیل",
  "Name": "نام",
  "Notes": "یادداشت‌ها",
  "Note (optional)": "یادداشت (اختیاری)",
  "Source": "منبع",
  "Owner": "مسئول",

  // Dashboard
  "This month": "این ماه",
  "Quotes this month": "پیش‌فاکتورهای این ماه",
  "Win rate": "نرخ برد",
  "No quotes decided yet": "هنوز پیش‌فاکتوری نهایی نشده",
  "Revenue won": "درآمد برده‌شده",
  "Sum of won quote midpoints": "جمع میانگین پیش‌فاکتورهای برده‌شده",
  "Avg quote value": "میانگین ارزش پیش‌فاکتور",
  "Midpoint, all quotes this month": "میانگین، همهٔ پیش‌فاکتورهای این ماه",
  "Open leads": "سرنخ‌های باز",
  "New through Booked": "از «جدید» تا «رزرو‌شده»",
  "Jobs today": "کارهای امروز",
  "Overdue follow-ups": "پیگیری‌های عقب‌افتاده",
  "Someone is waiting on a call": "یک نفر منتظر تماس است",
  "All caught up": "همه‌چیز به‌روز است",
  "Pipeline": "قیف فروش",
  "Latest quotes": "آخرین پیش‌فاکتورها",
  "No quotes yet. Start with": "هنوز پیش‌فاکتوری نیست. شروع کن با",
  "a new quote": "یک پیش‌فاکتور جدید",

  // Pipeline / statuses
  "New": "جدید",
  "Contacted": "تماس‌گرفته‌شده",
  "Quoted": "قیمت‌داده‌شده",
  "Booked": "رزرو‌شده",
  "Won": "برنده",
  "Lost": "ازدست‌رفته",
  "Draft": "پیش‌نویس",
  "Sent": "ارسال‌شده",

  // Control Center
  "Control Center": "مرکز کنترل",
  "Waiting on you": "منتظر تو",
  "to review": "برای بررسی",
  "Activity history": "تاریخچهٔ فعالیت",
  "Nothing yet.": "فعلاً چیزی نیست.",
  "AI budget & stop": "بودجهٔ هوش مصنوعی و توقف",
  "How the assistant behaves": "دستیار چطور رفتار می‌کند",
  "Approve": "تأیید",
  "Defer": "تعویق",
  "Reject": "رد",
  "Something went wrong.": "مشکلی پیش آمد.",
  "Nothing is waiting on you. When the assistant drafts something, it appears here for approval.":
    "چیزی منتظر تو نیست. وقتی دستیار چیزی پیش‌نویس کند، همین‌جا برای تأیید ظاهر می‌شود.",
  "Approving records your decision. It does not send anything on its own — outside connections come later.":
    "تأیید فقط تصمیم تو را ثبت می‌کند. خودش چیزی ارسال نمی‌کند — اتصال‌های بیرونی بعداً اضافه می‌شوند.",
  "A spend cap on the assistant and a global stop switch arrive with the outside connections (Phase 2). Until then nothing the assistant drafts can act on its own.":
    "سقف هزینهٔ دستیار و یک کلید توقف سراسری همراه اتصال‌های بیرونی (فاز ۲) می‌آیند. تا آن موقع هیچ پیش‌نویس دستیار به‌تنهایی اجرا نمی‌شود.",
  // Guardrails
  "The assistant only suggests. A person approves before anything is sent.":
    "دستیار فقط پیشنهاد می‌دهد. قبل از ارسال هر چیزی، یک انسان تأیید می‌کند.",
  "Weight and volume are never guessed — they are confirmed by a person.":
    "وزن و حجم هیچ‌وقت حدس زده نمی‌شوند — یک انسان آن‌ها را تأیید می‌کند.",
  "The software never signs off load safety or towing. A person decides that.":
    "نرم‌افزار هرگز ایمنی بار یا یدک‌کشی را تأیید نمی‌کند. تصمیمش با انسان است.",
  "Tax is not computed here. The owner or accountant confirms the rule.":
    "مالیات اینجا محاسبه نمی‌شود. مالک یا حسابدار قاعده‌اش را تأیید می‌کند.",
  "“Paid” is recorded only by the owner's manual check, never by the assistant.":
    "«پرداخت‌شده» فقط با بررسی دستی مالک ثبت می‌شود، هرگز توسط دستیار.",
  "Nothing is sent, booked, published or charged until you approve it.":
    "تا تأیید نکنی، چیزی ارسال، رزرو، منتشر یا دریافت نمی‌شود.",

  // AI action kinds / statuses
  "Send estimate to customer": "ارسال برآورد به مشتری",
  "Send message to customer": "ارسال پیام به مشتری",
  "Publish Instagram draft": "انتشار پیش‌نویس اینستاگرام",
  "Start Google Ads campaign": "شروع کمپین Google Ads",
  "Intake summary": "خلاصهٔ ورودی",
  "Marketing draft": "پیش‌نویس بازاریابی",
  "Action": "اقدام",
  "Awaiting you": "منتظر تو",
  "Approved": "تأییدشده",
  "Rejected": "ردشده",
  "Deferred": "به‌تعویق‌افتاده",
  "Blocked": "مسدود",
  "Done": "انجام‌شده",

  // Intake assistant
  "Intake assistant": "دستیار ورودی",
  "Read message": "خواندن پیام",
  "Re-read message": "خواندن دوباره",
  "Reading…": "در حال خواندن…",
  "No inbound message on this lead to read.": "پیام ورودی‌ای روی این سرنخ برای خواندن نیست.",
  "Items mentioned": "اقلام ذکرشده",
  "qty not stated": "تعداد گفته‌نشده",
  "Address": "آدرس",
  "Access": "دسترسی",
  "Preferred time": "زمان ترجیحی",
  "not stated": "گفته‌نشده",
  "Weight / volume": "وزن / حجم",
  "Not estimated — confirmed on site by a person.": "برآورد نشده — در محل توسط یک انسان تأیید می‌شود.",
  "Draft question for the customer": "سؤال پیش‌نویس برای مشتری",
  "Send to approval queue": "فرستادن به صف تأیید",
  "Added to approval queue ✓": "به صف تأیید اضافه شد ✓",
  "It will only reach the customer once approved on the Control page.":
    "فقط بعد از تأیید در صفحهٔ مرکز کنترل به مشتری می‌رسد.",
  "Could not reach the assistant.": "دسترسی به دستیار ممکن نشد.",
  "Could not queue the question.": "افزودن سؤال به صف ممکن نشد.",
  "Pull the stated facts out of the customer's message and draft a question for anything missing. The assistant never guesses weight or volume.":
    "واقعیت‌های گفته‌شده را از پیام مشتری درمی‌آورد و برای هر چیز ناقص یک سؤال پیش‌نویس می‌کند. دستیار هیچ‌وقت وزن یا حجم را حدس نمی‌زند.",
  "Ask the customer a clarifying question": "پرسیدن یک سؤال روشن‌کننده از مشتری",

  // Connections
  "What the panel is wired to": "پنل به چه چیزهایی وصل است",
  "not connected": "متصل نیست",
  "Connected": "متصل",
  "Not connected": "متصل نیست",
  "Off": "خاموش",
  "JunkQ pricing engine": "موتور قیمت JunkQ",
  "Built in. Volume-based quoting lives in this panel.": "داخلی. قیمت‌گذاری حجمی داخل همین پنل است.",
  "Database (Neon)": "دیتابیس (Neon)",
  "All panel data — leads, quotes, jobs, the approval queue.":
    "همهٔ دادهٔ پنل — سرنخ‌ها، پیش‌فاکتورها، کارها، صف تأیید.",
  "Photo & intake assist (Anthropic)": "دستیار عکس و ورودی (Anthropic)",
  "Reads job photos and customer messages. Suggestions only.":
    "عکس‌های کار و پیام مشتری را می‌خواند. فقط پیشنهاد.",
  "Set ANTHROPIC_API_KEY to turn on photo and intake assist.":
    "برای روشن‌کردن دستیار عکس و ورودی، ANTHROPIC_API_KEY را ست کن.",
  "Field-service scheduling. Phase 2.": "زمان‌بندی سرویس میدانی. فاز ۲.",
  "Gmail + Calendar for sending quotes and booking. Phase 2.":
    "Gmail و تقویم برای ارسال پیش‌فاکتور و رزرو. فاز ۲.",
  "Publishing marketing posts. Phase 2.": "انتشار پست‌های بازاریابی. فاز ۲.",
  "Running campaigns. Phase 2.": "اجرای کمپین‌ها. فاز ۲.",
  "Nothing connects to an outside service without you turning it on.":
    "بدون اینکه خودت روشنش کنی، چیزی به سرویس بیرونی وصل نمی‌شود.",

  // Login
  "Sign in": "ورود",
  "Password": "رمز عبور",
  "Your name": "نام شما",

  // Cockpit (single-page panel)
  "Follow-ups": "پیگیری‌ها",
  "Jobs": "کارها",
  "Jobs / Dispatch": "کارها / اعزام",
  "Reports": "گزارش‌ها",
  "Team": "تیم",
  "Team Chat": "گفتگوی تیمی",
  "This section is being built.": "این بخش در حال ساخت است.",
  "Open the full page": "باز کردن صفحهٔ کامل",
  "The approval queue table isn’t ready yet.": "جدول صف تأیید هنوز آماده نیست.",
};

export function translate(s: string, lang: Lang): string {
  if (lang === "en") return s;
  return FA[s] ?? s;
}
