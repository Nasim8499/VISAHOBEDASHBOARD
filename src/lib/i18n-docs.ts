// Lightweight i18n dictionary scoped to printable documents.
export type DocLang = "en" | "hi" | "bn" | "ar";

export const DOC_LANGS: { code: DocLang; label: string; native: string; rtl?: boolean; font: string }[] = [
  { code: "en", label: "English", native: "English", font: "'Inter', system-ui, sans-serif" },
  { code: "hi", label: "Hindi", native: "हिन्दी", font: "'Noto Sans Devanagari', 'Inter', sans-serif" },
  { code: "bn", label: "Bengali", native: "বাংলা", font: "'Noto Sans Bengali', 'Inter', sans-serif" },
  { code: "ar", label: "Arabic", native: "العربية", rtl: true, font: "'Noto Naskh Arabic', 'Inter', sans-serif" },
];

type Dict = Record<string, Record<DocLang, string>>;

export const t: Dict = {
  document: { en: "Document", hi: "दस्तावेज़", bn: "ডকুমেন্ট", ar: "وثيقة" },
  preparedFor: { en: "Prepared for", hi: "के लिए तैयार", bn: "প্রস্তুত করা হয়েছে", ar: "أُعدّ لـ" },
  preparedBy: { en: "Prepared by", hi: "के द्वारा तैयार", bn: "প্রস্তুতকারী", ar: "أعده" },
  date: { en: "Date", hi: "तारीख़", bn: "তারিখ", ar: "التاريخ" },
  reference: { en: "Reference", hi: "संदर्भ", bn: "রেফারেন্স", ar: "المرجع" },
  category: { en: "Category", hi: "श्रेणी", bn: "বিভাগ", ar: "الفئة" },
  size: { en: "Size", hi: "आकार", bn: "আকার", ar: "الحجم" },
  status: { en: "Status", hi: "स्थिति", bn: "স্ট্যাটাস", ar: "الحالة" },
  summary: { en: "Summary", hi: "सारांश", bn: "সারাংশ", ar: "ملخص" },
  summaryBody: {
    en: "This document is part of the official records for the workspace listed above. Please review carefully and contact the project manager with any questions.",
    hi: "यह दस्तावेज़ ऊपर सूचीबद्ध कार्यक्षेत्र के आधिकारिक रिकॉर्ड का हिस्सा है। कृपया ध्यान से समीक्षा करें और किसी भी प्रश्न के लिए प्रोजेक्ट प्रबंधक से संपर्क करें।",
    bn: "এই ডকুমেন্টটি উপরে তালিকাভুক্ত ওয়ার্কস্পেসের অফিসিয়াল রেকর্ডের অংশ। অনুগ্রহ করে যত্ন সহকারে পর্যালোচনা করুন এবং কোনো প্রশ্ন থাকলে প্রজেক্ট ম্যানেজারের সাথে যোগাযোগ করুন।",
    ar: "هذه الوثيقة جزء من السجلات الرسمية لمساحة العمل المذكورة أعلاه. يرجى مراجعتها بعناية والتواصل مع مدير المشروع لأي استفسار.",
  },
  page: { en: "Page", hi: "पृष्ठ", bn: "পৃষ্ঠা", ar: "صفحة" },
  of: { en: "of", hi: "का", bn: "এর", ar: "من" },
  confidential: {
    en: "Confidential — for internal use only",
    hi: "गोपनीय — केवल आंतरिक उपयोग के लिए",
    bn: "গোপনীয় — শুধুমাত্র অভ্যন্তরীণ ব্যবহারের জন্য",
    ar: "سري — للاستخدام الداخلي فقط",
  },
  download: { en: "Download PDF", hi: "PDF डाउनलोड", bn: "PDF ডাউনলোড", ar: "تنزيل PDF" },
  preview: { en: "Print Preview", hi: "प्रिंट पूर्वावलोकन", bn: "প্রিন্ট প্রিভিউ", ar: "معاينة الطباعة" },
  close: { en: "Close", hi: "बंद करें", bn: "বন্ধ করুন", ar: "إغلاق" },
};

export const tr = (key: keyof typeof t, lang: DocLang) => t[key]?.[lang] ?? t[key]?.en ?? key;
