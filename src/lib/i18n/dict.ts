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
  "Customers": "مشتریان",
  "Leads": "سرنخ‌ها",
  "Clients": "مشتری‌ها",
  "Calendar": "تقویم",
  "New Quote": "پیش‌فاکتور جدید",
  "Quotes": "پیش‌فاکتورها",
  "Connections": "اتصال‌ها",
  "Settings": "تنظیمات",
  // Short (bottom tab bar) — "New" is defined once below with the statuses.
  "Home": "خانه",
  "Cal": "تقویم",
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
  "Ops": "پنل",
  "Open": "باز کن",
  "Awaiting approval": "منتظر تأیید",
  "Search name, phone, area…": "جستجوی نام، تلفن، منطقه…",
  "+ Lead": "+ سرنخ",
  "When": "زمان",
  "Overdue": "عقب‌افتاده",
  "Today": "امروز",
  "No follow-ups due — everyone is up to date.": "پیگیری سررسیدی نیست — همه به‌روزند.",
  "Unscheduled": "بدون زمان‌بندی",
  "No jobs in this window.": "در این بازه کاری نیست.",
  "Crew": "اجرا",
  "Scheduled": "زمان‌بندی‌شده",
  "In progress": "در حال انجام",
  "Cancelled": "لغوشده",
  "Total leads": "کل سرنخ‌ها",
  "Won leads": "سرنخ‌های برده‌شده",
  "Conversion": "نرخ تبدیل",
  "By source": "بر اساس منبع",
  "By status": "بر اساس وضعیت",
  "Created": "ساخته‌شده",
  "Revenue": "درآمد",
  "Pricing": "قیمت‌گذاری",
  "Truck capacity": "ظرفیت ماشین",
  "Rate / yd³": "نرخ / یارد مکعب",
  "Minimum job": "حداقل کار",
  "Packing": "ضریب بسته‌بندی",
  "Open settings to edit": "باز کردن تنظیمات برای ویرایش",
  "Team chat is coming next — it needs its own store, which is the following step.":
    "گفتگوی تیمی قدم بعدی است — به جدول اختصاصی خودش نیاز دارد که مرحلهٔ بعد اضافه می‌شود.",
  // Drawers / quick-add / board
  "New lead": "سرنخ جدید",
  "Lead": "سرنخ",
  "Table": "جدول",
  "Board": "برد",
  "What they said": "چه گفتند",
  "Why lost?": "چرا ازدست رفت؟",
  "A few words": "چند کلمه",
  "Mark lost": "ثبت به‌عنوان ازدست‌رفته",
  "Unassigned": "بدون مسئول",
  "Next follow-up": "پیگیری بعدی",
  "Add a note": "افزودن یادداشت",
  "Call result, next step, anything…": "نتیجهٔ تماس، قدم بعدی، هرچیزی…",
  "Save note": "ذخیرهٔ یادداشت",
  "Customer name": "نام مشتری",
  "Paste the inbound message here…": "پیام ورودی مشتری را اینجا بچسبان…",
  "Add lead": "افزودن سرنخ",
  "Saving…": "در حال ذخیره…",

  // Control queue extras
  "Resolve this before it can be approved.": "قبل از تأیید، این را حل کن.",
  "e.g. send after 2pm, or why you're rejecting": "مثلاً بعد از ساعت ۲ بفرست، یا دلیل ردکردن",
  "Resolve the block first": "اول مانع را حل کن",
  "The approval queue table isn’t in the database yet. Run the v3 migration in Neon and this fills in.":
    "جدول صف تأیید هنوز در دیتابیس نیست. migration نسخهٔ ۳ را در Neon اجرا کن تا پر شود:",

  // Quote builder
  "Photos": "عکس‌ها",
  "Photo assist is off — set": "دستیار عکس خاموش است — مقدار",
  "on the deployment. Pick items from the catalog instead.": "را روی سرور تنظیم کن. فعلاً اقلام را از کاتالوگ انتخاب کن.",
  "Complex job — price manually.": "کار پیچیده — قیمت را دستی بزن.",
  "These photos need a person to look at them.": "این عکس‌ها را باید یک نفر ببیند.",
  "Items": "اقلام",
  "Search the catalog — sofa, mattress, fridge…": "جستجوی کاتالوگ — مبل، تشک، یخچال…",
  "Search the item catalog": "جستجوی کاتالوگ اقلام",
  "No items yet. Search the catalog above, or add a custom line.": "هنوز قلمی نیست. از کادر بالا جستجو کن یا یک ردیف دستی اضافه کن.",
  "Item name": "نام قلم",
  "Quantity": "تعداد",
  "from photos": "از روی عکس",
  "Add custom item": "افزودن قلم دستی",
  "Access & labor": "دسترسی و کار",
  "Stairs (flights)": "پله (طبقه)",
  "Carry distance": "فاصلهٔ حمل",
  "Standard": "معمولی",
  "Long carry (over 15 m)": "حمل طولانی (بیش از ۱۵ متر)",
  "Disassembly (items)": "دمونتاژ (تعداد)",
  "Packing factor": "ضریب بسته‌بندی",
  "Air between the items. 10–30%.": "فضای خالی بین اقلام. ۱۰ تا ۳۰٪.",
  "Heavy material — price by weight": "مواد سنگین — قیمت بر اساس وزن",
  "Soil, concrete, tile, shingles. Replaces volume pricing entirely.": "خاک، بتن، سرامیک، شینگل. کاملاً جایگزین قیمت حجمی می‌شود.",
  "Material": "جنس",
  "Estimated weight (kg)": "وزن تخمینی (کیلوگرم)",
  "Estimate": "برآورد",
  "Priced by weight": "قیمت بر اساس وزن",
  "packed": "بسته‌بندی‌شده",
  "minimum job": "حداقل کار",
  "Adjusted to published tier floor": "به کف نرخ منتشرشده تنظیم شد",
  "truckloads": "بار کامیون",
  "Internal — do not share": "داخلی — به‌اشتراک نگذارید",
  "Est. weight": "وزن تخمینی",
  "Disposal": "هزینهٔ تخلیه",
  "Fuel": "سوخت",
  "Cost": "هزینه",
  "Margin": "حاشیهٔ سود",
  "None": "هیچ",
  "Percent": "درصد",
  "Amount ($)": "مبلغ (دلار)",
  "Reason": "دلیل",
  "Repeat customer, neighbour rate…": "مشتری قبلی، نرخ همسایه…",
  "Link to client": "اتصال به مشتری",
  "Files the quote on their profile and updates lifetime value.": "پیش‌فاکتور را در پروفایل مشتری ثبت و ارزش کل را به‌روز می‌کند.",
  "Not linked": "بدون اتصال",
  "Link to lead": "اتصال به سرنخ",
  "Moves the pipeline card to Quoted on save.": "با ذخیره، کارت قیف را به «قیمت‌داده‌شده» می‌برد.",
  "Save draft": "ذخیرهٔ پیش‌نویس",
  "Mark sent": "ثبت ارسال‌شده",
  "Copied": "کپی شد",
  "Copy customer text": "کپی متن مشتری",
  "That did not save.": "ذخیره نشد.",
  "Could not reach the clipboard. Long-press the price panel to copy manually.": "دسترسی به کلیپ‌بورد ممکن نشد. برای کپی دستی، روی کادر قیمت نگه دار.",
  // Engine breakdown labels ("Minimum job" is defined once in the cockpit block)
  "Volume": "حجم",
  "Item surcharges": "اضافه‌بهای اقلام",
  "Labor adders": "هزینه‌های کار",
  "Published tier floor": "کف نرخ منتشرشده",
  "Heavy material": "مواد سنگین",
  "Discount": "تخفیف",
  "of": "از",
  "decided": "نهایی‌شده",
  // Item flags
  "mattress": "تشک",
  "freon": "فریون",
  "tire": "لاستیک",
  "tv": "تلویزیون",
  "piano": "پیانو",
  "hazmat": "مواد خطرناک",
  "heavy": "سنگین",
  // Heavy materials
  "soil": "خاک",
  "concrete": "بتن",
  "tile": "سرامیک",
  "shingles": "شینگل",

  // Lists / filters
  "lead": "سرنخ",
  "leads": "سرنخ",
  "Name or phone": "نام یا تلفن",
  "All": "همه",
  "Stage": "مرحله",
  "Filter": "فیلتر",
  "Clear": "پاک‌کردن",
  "No leads yet": "هنوز سرنخی نیست",
  "Website enquiries land here automatically the moment the form posts. You can also add one by hand after a phone call.":
    "درخواست‌های وب‌سایت لحظه‌ای که فرم ثبت شود خودکار اینجا می‌آیند. بعد از تماس تلفنی هم می‌توانی دستی یکی اضافه کنی.",
  "Add the first lead": "افزودن اولین سرنخ",
  "That move did not save.": "جابه‌جایی ذخیره نشد.",
  "Nothing here.": "اینجا چیزی نیست.",
  "Move to another stage": "انتقال به مرحلهٔ دیگر",
  "Worth a line — it is the only way the lost column tells you anything later.":
    "یک خط ارزش دارد — تنها راهی است که ستون «ازدست‌رفته» بعداً چیزی به تو می‌گوید.",
  "Price, timing, went elsewhere…": "قیمت، زمان‌بندی، جای دیگر رفت…",

  // CRM shared bits
  "Note": "یادداشت",
  "Status": "وضعیت",
  "Call": "تماس",
  "SMS": "پیامک",
  "System": "سیستم",
  "Unnamed lead": "سرنخ بی‌نام",
  "No area": "بدون منطقه",
  "Nothing logged yet. Calls, notes and status changes land here.": "هنوز چیزی ثبت نشده. تماس‌ها، یادداشت‌ها و تغییر وضعیت‌ها اینجا می‌آیند.",

  // Settings form
  "Pricing rules": "قواعد قیمت‌گذاری",
  "These drive every quote.": "این‌ها مبنای هر پیش‌فاکتورند.",
  "items in the catalog.": "قلم در کاتالوگ.",
  "Save settings": "ذخیرهٔ تنظیمات",
  "Confirm the truck measurement.": "اندازهٔ ماشین را تأیید کن.",
  "Capacity is seeded at": "ظرفیت اولیه روی",
  "the measured dump box. Confirm it against a real full load, adjust if needed, and save once; the banner clears on save.":
    "تنظیم شده (اندازهٔ جعبهٔ اندازه‌گیری‌شده). با یک بار کامل واقعی بسنج، در صورت نیاز تغییر بده و یک‌بار ذخیره کن؛ با ذخیره این هشدار می‌رود.",
  "Currently set to": "در حال حاضر روی",
  "Volume pricing": "قیمت‌گذاری حجمی",
  "Truck capacity (ft³)": "ظرفیت ماشین (فوت³)",
  "Usable box volume.": "حجم قابل‌استفادهٔ جعبه.",
  "Rate per cubic yard": "نرخ هر یارد مکعب",
  "Packing factor (%)": "ضریب بسته‌بندی (٪)",
  "10–30. Air between the items.": "۱۰ تا ۳۰. فضای خالی بین اقلام.",
  "Range spread (%)": "پهنای بازه (٪)",
  "Half-width either side of the subtotal.": "نصف پهنا در هر طرف جمع.",
  "Published tier floors": "کف نرخ‌های منتشرشده",
  "The low end of a quote is held up to whichever tier the load falls into, so a quote never lands under the ladder the site advertises. Blank a name to drop a bracket.":
    "کف قیمت هر پیش‌فاکتور تا رده‌ای که بار در آن می‌افتد نگه داشته می‌شود تا هیچ قیمتی زیر نردبان منتشرشدهٔ سایت نرود. برای حذف یک رده، نامش را خالی بگذار.",
  "Tier": "رده",
  "Up to (fraction of truck)": "تا (کسری از ماشین)",
  "Floor": "کف",
  "Charged once per unit of a flagged item.": "برای هر واحد از قلمِ نشان‌دار یک‌بار دریافت می‌شود.",
  "Per flight of stairs": "هر طبقه پله",
  "Per disassembly": "هر دمونتاژ",
  "Charged per tonne": "دریافت هر تن",
  "Internal cost model — never shown to a customer": "مدل هزینهٔ داخلی — هرگز به مشتری نشان داده نمی‌شود",
  "Tipping fee per tonne": "هزینهٔ تخلیه هر تن",
  "Placeholder — check the current North Shore rate.": "موقت — نرخ فعلی North Shore را چک کن.",
  "Crew rate per hour": "نرخ اکیپ هر ساعت",
  "Fuel, flat": "سوخت، ثابت",
  "Avg density (kg/yd³)": "چگالی متوسط (کیلوگرم/یارد³)",
  "Used to estimate disposal weight.": "برای تخمین وزن تخلیه استفاده می‌شود.",
  "Saved. New quotes price from these values.": "ذخیره شد. پیش‌فاکتورهای جدید از این مقادیر قیمت می‌گیرند.",

  // Lead sources
  "Website": "وب‌سایت",
  "Google": "گوگل",
  "Referral": "معرفی",
  "Repeat": "مشتری قبلی",
  "Ads": "تبلیغات",
  "Walk-in": "مراجعهٔ حضوری",
  "Other": "سایر",
};

export function translate(s: string, lang: Lang): string {
  if (lang === "en") return s;
  return FA[s] ?? s;
}
