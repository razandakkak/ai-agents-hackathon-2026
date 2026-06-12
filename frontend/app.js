const languageSelect = document.getElementById("language-select");
const landingView = document.getElementById("landing-view");
const bloodView = document.getElementById("blood-view");
const wheelchairView = document.getElementById("wheelchair-view");
const hearingView = document.getElementById("hearing-view");
const existsList = document.getElementById("exists-list");
const roadmapList = document.getElementById("roadmap-list");
const wheelchairList = document.getElementById("wheelchair-list");
const trackButtons = document.querySelectorAll("[data-track]");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatThread = document.getElementById("chat-thread");
const summaryLabel = document.getElementById("summary-label");
const summaryText = document.getElementById("summary-text");
const requestChips = document.getElementById("request-chips");
const verificationList = document.getElementById("verification-list");
const reasoningList = document.getElementById("reasoning-list");
const actionsList = document.getElementById("actions-list");
const donorMessage = document.getElementById("donor-message");
const sourcesList = document.getElementById("sources-list");
const demoDonorsList = document.getElementById("demo-donors-list");
const emailRecipient = document.getElementById("email-recipient");
const sendEmailButton = document.getElementById("send-email-button");
const sendEmailStatus = document.getElementById("send-email-status");
const volunteerName = document.getElementById("volunteer-name");
const volunteerBloodType = document.getElementById("volunteer-blood-type");
const volunteerCity = document.getElementById("volunteer-city");
const volunteerContact = document.getElementById("volunteer-contact");
const volunteerContactPreference = document.getElementById("volunteer-contact-preference");
const volunteerAvailability = document.getElementById("volunteer-availability");
const volunteerSignupButton = document.getElementById("volunteer-signup-button");
const volunteerSignupStatus = document.getElementById("volunteer-signup-status");
const hearingNeedInput = document.getElementById("hearing-need-input");
const hearingScopeInput = document.getElementById("hearing-scope-input");
const hearingInputLanguageSelect = document.getElementById("hearing-input-language-select");
const hearingTranscriptInput = document.getElementById("hearing-transcript-input");
const hearingReplyIntentInput = document.getElementById("hearing-reply-intent-input");
const hearingChannelSelect = document.getElementById("hearing-channel-select");
const hearingSearchButton = document.getElementById("hearing-search-button");
const hearingAnalyzeButton = document.getElementById("hearing-analyze-button");
const hearingListenButton = document.getElementById("hearing-listen-button");
const hearingSpeakButton = document.getElementById("hearing-speak-button");
const hearingVoiceModeSelect = document.getElementById("hearing-voice-mode-select");
const hearingVoiceSelect = document.getElementById("hearing-voice-select");
const hearingStyleSelect = document.getElementById("hearing-style-select");
const hearingStatus = document.getElementById("hearing-status");
const hearingReconstructedNeed = document.getElementById("hearing-reconstructed-need");
const hearingBarrier = document.getElementById("hearing-barrier");
const hearingBarrierList = document.getElementById("hearing-barrier-list");
const hearingSummary = document.getElementById("hearing-summary");
const hearingNextSteps = document.getElementById("hearing-next-steps");
const hearingReplyDraft = document.getElementById("hearing-reply-draft");
const hearingFollowUp = document.getElementById("hearing-follow-up");

const state = {
  messages: [],
  plan: null,
  structuredRequest: null,
  selectedDemoDonor: null,
  activeView: "landing",
  hearingResult: null,
  hearingListening: false,
  hearingRecognition: null,
  hearingAudioUrl: null
};

const views = {
  landing: landingView,
  blood: bloodView,
  wheelchair: wheelchairView,
  hearing: hearingView
};

const copy = {
  en: {
    eyebrow: "AI Agents Hackathon 2026",
    title: "Translating Your Needs",
    landingTitle: "Translating Your Needs",
    landingHeroText:
      "A multi-agent accessibility and emergency support project for Lebanon, starting with blood support and expanding into inclusive mobility and hearing-access assistance.",
    landingCardLabel: "Project vision",
    landingCardTitle: "One platform, multiple support tracks",
    landingCardText:
      "Users choose the support path they need, and each agent is designed around real local problems, practical actions, and safe next steps.",
    trackEyebrow: "Support Tracks",
    trackTitle: "Choose a track",
    statusLive: "Live now",
    statusSoon: "Coming next",
    bloodTrackTitle: "Blood support",
    bloodTrackText:
      "AI chat that collects urgent request details, checks official context, finds donor matches, and helps send outreach emails.",
    wheelchairTrackTitle: "Wheelchair accessibility",
    wheelchairTrackText:
      "A future assistant for discovering accessible places, entrances, and movement-friendly options across Lebanese cities.",
    hearingTrackTitle: "Hearing accessibility",
    hearingTrackText:
      "AI communication copilot that reconstructs messy input, summarizes phone-first instructions, and drafts text or spoken replies.",
    openBloodTrack: "Open blood agent",
    openWheelchairTrack: "View roadmap",
    openHearingTrack: "Open hearing copilot",
    existsEyebrow: "What exists today",
    existsTitle: "Already implemented",
    roadmapEyebrow: "What comes next",
    roadmapTitle: "Upcoming features",
    backHome: "Back to home",
    wheelchairEyebrow: "Track roadmap",
    wheelchairPlaceholderTitle: "Wheelchair accessibility assistant",
    wheelchairPlaceholderText:
      "This track is reserved for the upcoming accessibility agent. It will focus on suitable places, entrance information, and mobility-friendly planning.",
    hearingEyebrow: "Track roadmap",
    hearingPlaceholderTitle: "Hearing accessibility assistant",
    hearingPlaceholderText:
      "This copilot repairs messy communication, summarizes phone-first instructions, and drafts replies that can be spoken back in the demo.",
    hearingNeedTitle: "Describe the need",
    hearingNeedPlaceholder: "Example: I am deaf, I need an ENT appointment in Beirut, and they should reply by text not by phone.",
    hearingScopeTitle: "Search scope",
    hearingScopePlaceholder: "Example: clinics, schools, restaurants, restrooms, NGOs, public offices",
    hearingInputLanguageTitle: "Conversation language",
    hearingInputLanguageArabic: "Arabic",
    hearingInputLanguageMixed: "Lebanese mixed",
    hearingInputLanguageEnglish: "English",
    hearingSearchButton: "Search from written need",
    hearingTranscriptTitle: "What they said",
    hearingTranscriptPlaceholder: "Paste or capture the clinic side of the conversation here.",
    hearingReplyIntentTitle: "What you want to reply",
    hearingReplyIntentPlaceholder: "Example: I can come tomorrow afternoon, please confirm by text and tell me what documents I need.",
    hearingChannelTitle: "Preferred reply channel",
    hearingChannelText: "Text message",
    hearingChannelWhatsapp: "WhatsApp",
    hearingChannelEmail: "Email",
    hearingChannelSpoken: "Spoken reply",
    hearingAnalyzeButton: "Analyze with hearing copilot",
    hearingListenButton: "Start listening",
    hearingStopListeningButton: "Stop listening",
    hearingSpeakButton: "Speak reply",
    hearingVoiceModeAi: "AI natural voice",
    hearingVoiceModeBrowser: "Browser voice",
    hearingVoiceFemale: "Female voice",
    hearingVoiceMale: "Male voice",
    hearingVoiceWarm: "Warm premium voice",
    hearingVoiceCalm: "Calm premium voice",
    hearingStyleWarm: "Warm",
    hearingStyleClear: "Clear",
    hearingStyleFormal: "Formal",
    hearingStyleGentle: "Gentle",
    hearingResultNeedTitle: "Reconstructed need",
    hearingBarrierTitle: "Barrier detected",
    hearingSummaryTitle: "What it means",
    hearingNextStepsTitle: "Next steps",
    hearingReplyDraftTitle: "Reply draft",
    hearingFollowUpTitle: "Follow-up question",
    hearingIdle: "Use this demo to turn messy communication into a clear accessible reply.",
    hearingAnalyzing: "Analyzing with the hearing copilot...",
    hearingNoInput: "Add the need, a transcript, or a reply idea first.",
    hearingListenUnsupported: "Speech recognition is not supported in this browser.",
    hearingListeningStatus: "Listening to the simulated clinic side...",
    hearingStoppedStatus: "Stopped listening.",
    hearingAnalyzeError: "Hearing copilot analysis failed.",
    hearingSpeakUnsupported: "Text-to-speech is not supported in this browser.",
    hearingSpeaking: "Speaking the reply aloud...",
    hearingAiSpeaking: "Generating natural AI speech...",
    hearingAiSpeakError: "AI speech generation failed, so switch to browser voice or try again.",
    hearingReady: "Hearing copilot analysis is ready.",
    heroText:
      "A real AI blood-support chat for Lebanon that asks follow-up questions, generates grounded outreach help, and prefers official sources over fake inventory.",
    languageLabel: "Language",
    activeAgent: "Active agent",
    agentName: "Blood support chat",
    agentDescription:
      "Tell it what is happening, and it will ask for missing details before preparing a response plan.",
    chatEyebrow: "Live Chat",
    chatTitle: "Talk to the blood agent",
    chatPlaceholder: "Example: We need 2 units of O- blood in Beirut within 24 hours for surgery.",
    sendButton: "Send",
    planEyebrow: "Live Plan",
    planTitle: "What the agent knows",
    waitingLabel: "Waiting for enough details",
    waitingText: "Start chatting. The agent will ask for missing details, then prepare an action plan.",
    requestTitle: "Structured request",
    verificationTitle: "Verification status",
    reasoningTitle: "Reasoning",
    actionsTitle: "Recommended actions",
    messageTitle: "Donor outreach message",
    sendEmailButton: "Confirm and send email",
    emailPlaceholder: "recipient@example.com",
    emailIdle: "Paste a recipient email, then confirm send.",
    emailSending: "Sending email...",
    emailSent: "Email sent successfully.",
    emailMissingPlan: "Generate a plan first, then send the email.",
    emailMissingRecipient: "Add a recipient email first.",
    sourcesTitle: "Official sources",
    demoDonorsTitle: "Demo donor volunteer matches",
    contactDonorButton: "Contact them",
    contactDonorSending: "Contacting donor...",
    contactDonorNoEmail: "This volunteer did not provide an email address.",
    donorEmailSent: "Donor email sent successfully.",
    joinTitle: "Join us to save lives",
    joinButton: "Join us to save lives",
    joinName: "Your name",
    joinBloodType: "Blood type",
    joinCity: "City",
    joinContact: "Phone or email",
    joinAvailability: "Availability",
    joinIdle: "This signup feeds the future volunteer network roadmap.",
    joinMissing: "Fill in name, blood type, city, and contact first.",
    joinSending: "Saving your volunteer info...",
    joinSuccess: "You have been added to the future volunteer network.",
    welcome:
      "Tell me the blood type, city, urgency, and how many units you need. I can continue in English or Arabic.",
    preparingLabel: "Preparing plan",
    preparingText: "The agent is extracting details and checking official context.",
    noPlanText: "The agent still needs a few details before it can prepare the full plan.",
    sourceLive: "Live source",
    sourceStatic: "Official website",
    chipBloodType: "Blood type",
    chipCity: "City",
    chipUnits: "Units",
    chipUrgency: "Urgency",
    chipPatient: "Patient",
    chipContact: "Contact",
    availabilityLabel: "availability",
    contactPreferenceLabel: "contact preference",
    contactLabel: "contact",
    emailLabel: "email",
    notProvided: "Not provided",
    demoBadge: "DEMO",
    networkBadge: "NETWORK"
  },
  ar: {
    eyebrow: "هاكاثون وكلاء الذكاء الاصطناعي 2026",
    title: "Translating Your Needs",
    landingTitle: "Translating Your Needs",
    landingHeroText:
      "منصة متعددة الوكلاء للدعم الإنساني وإتاحة الوصول في لبنان، تبدأ بدعم الدم وتتوسع لاحقاً إلى التنقل الشامل ودعم ضعف السمع.",
    landingCardLabel: "رؤية المشروع",
    landingCardTitle: "منصة واحدة، مسارات دعم متعددة",
    landingCardText:
      "المستخدم يختار المسار الذي يحتاجه، وكل وكيل مصمم حول مشكلة محلية حقيقية وخطوات عملية وآمنة.",
    trackEyebrow: "مسارات الدعم",
    trackTitle: "اختاروا المسار",
    statusLive: "متاح الآن",
    statusSoon: "قريباً",
    bloodTrackTitle: "دعم الدم",
    bloodTrackText:
      "محادثة ذكاء اصطناعي تجمع تفاصيل الطلب العاجل، تتحقق من السياق الرسمي، تبحث عن مطابقات متبرعين، وتساعد في إرسال إيميلات التوعية.",
    wheelchairTrackTitle: "إتاحة الوصول بالكراسي المتحركة",
    wheelchairTrackText:
      "مساعد مستقبلي لاكتشاف الأماكن المناسبة، المداخل، وخيارات الحركة السهلة في المدن اللبنانية.",
    hearingTrackTitle: "إتاحة الوصول لضعف السمع",
    hearingTrackText:
      "مسار مستقبلي للأشخاص ذوي الإعاقة السمعية، يركز على التواصل المتاح واكتشاف الخدمات.",
    openBloodTrack: "افتحوا وكيل الدم",
    openWheelchairTrack: "اعرضوا الخطة",
    openHearingTrack: "افتحوا مساعد السمع",
    existsEyebrow: "الموجود اليوم",
    existsTitle: "ما تم تنفيذه",
    roadmapEyebrow: "القادم",
    roadmapTitle: "ميزات قادمة",
    backHome: "العودة للرئيسية",
    wheelchairEyebrow: "خريطة المسار",
    wheelchairPlaceholderTitle: "مساعد إتاحة الوصول بالكراسي المتحركة",
    wheelchairPlaceholderText:
      "هذا المسار محجوز للوكيل القادم. سيركز على الأماكن المناسبة، معلومات المداخل، وتخطيط الحركة السهل.",
    hearingEyebrow: "خريطة المسار",
    hearingPlaceholderTitle: "مساعد إتاحة الوصول لضعف السمع",
    hearingPlaceholderText:
      "هذا المساعد يصلح التواصل المربك، يلخص التعليمات الهاتفية، ويكتب رداً يمكن تشغيله صوتياً داخل العرض.",
    hearingNeedTitle: "اوصفوا الحاجة",
    hearingNeedPlaceholder: "مثال: أنا أصم وأحتاج موعد أنف أذن حنجرة ببيروت، وأريد الرد بالنص وليس بالمكالمة.",
    hearingScopeTitle: "نطاق البحث",
    hearingScopePlaceholder: "مثال: عيادات، مدارس، مطاعم، حمامات، جمعيات، دوائر رسمية",
    hearingInputLanguageTitle: "لغة المحادثة",
    hearingInputLanguageArabic: "العربية",
    hearingInputLanguageMixed: "لبناني مختلط",
    hearingInputLanguageEnglish: "الإنجليزية",
    hearingSearchButton: "ابحثوا من الحاجة المكتوبة",
    hearingTranscriptTitle: "ماذا قالوا",
    hearingTranscriptPlaceholder: "ألصقوا أو التقطوا كلام الجهة الأخرى هنا.",
    hearingReplyIntentTitle: "ماذا تريدون الرد",
    hearingReplyIntentPlaceholder: "مثال: أستطيع الحضور غداً بعد الظهر، رجاءً أكدوا الموعد بالنص وأخبروني بالأوراق المطلوبة.",
    hearingChannelTitle: "قناة الرد المفضلة",
    hearingChannelText: "رسالة نصية",
    hearingChannelWhatsapp: "واتساب",
    hearingChannelEmail: "إيميل",
    hearingChannelSpoken: "رد صوتي",
    hearingAnalyzeButton: "حللوا مع مساعد السمع",
    hearingListenButton: "ابدأوا الاستماع",
    hearingStopListeningButton: "أوقفوا الاستماع",
    hearingSpeakButton: "شغّلوا الرد صوتياً",
    hearingVoiceModeAi: "صوت ذكاء اصطناعي طبيعي",
    hearingVoiceModeBrowser: "صوت المتصفح",
    hearingVoiceFemale: "صوت نسائي",
    hearingVoiceMale: "صوت رجالي",
    hearingVoiceWarm: "صوت دافئ مميز",
    hearingVoiceCalm: "صوت هادئ مميز",
    hearingStyleWarm: "دافئ",
    hearingStyleClear: "واضح",
    hearingStyleFormal: "رسمي",
    hearingStyleGentle: "لطيف",
    hearingResultNeedTitle: "الحاجة بعد التوضيح",
    hearingBarrierTitle: "العائق المكتشف",
    hearingSummaryTitle: "ماذا يعني هذا",
    hearingNextStepsTitle: "الخطوات التالية",
    hearingReplyDraftTitle: "مسودة الرد",
    hearingFollowUpTitle: "سؤال متابعة",
    hearingIdle: "استخدموا هذا العرض لتحويل التواصل المربك إلى رد واضح ومتاح.",
    hearingAnalyzing: "عم نحلل مع مساعد السمع...",
    hearingNoInput: "أضيفوا الحاجة أو النص المسموع أو فكرة الرد أولاً.",
    hearingListenUnsupported: "التعرف على الصوت غير مدعوم في هذا المتصفح.",
    hearingListeningStatus: "عم نستمع للطرف الآخر في العرض...",
    hearingStoppedStatus: "تم إيقاف الاستماع.",
    hearingAnalyzeError: "فشل تحليل مساعد السمع.",
    hearingSpeakUnsupported: "تشغيل النص صوتياً غير مدعوم في هذا المتصفح.",
    hearingSpeaking: "عم نشغّل الرد صوتياً...",
    hearingAiSpeaking: "عم نولّد صوتاً طبيعياً بالذكاء الاصطناعي...",
    hearingAiSpeakError: "فشل توليد الصوت بالذكاء الاصطناعي، جربوا صوت المتصفح أو حاولوا مرة ثانية.",
    hearingReady: "تحليل مساعد السمع جاهز.",
    heroText:
      "محادثة فعلية مع وكيل دعم الدم في لبنان. يسأل عن التفاصيل الناقصة، يولد خطة مساعدة، ويفضل المصادر الرسمية بدل البيانات المفبركة.",
    languageLabel: "اللغة",
    activeAgent: "الوكيل الحالي",
    agentName: "محادثة دعم الدم",
    agentDescription:
      "احكوا شو صاير، والوكيل رح يطلب التفاصيل الناقصة قبل ما يجهز الخطة.",
    chatEyebrow: "محادثة مباشرة",
    chatTitle: "احكوا مع وكيل الدم",
    chatPlaceholder: "مثال: بدنا وحدتين O- ببيروت خلال 24 ساعة لعملية.",
    sendButton: "إرسال",
    planEyebrow: "الخطة المباشرة",
    planTitle: "شو عرف الوكيل",
    waitingLabel: "ننتظر تفاصيل كافية",
    waitingText: "ابدؤوا بالمحادثة. الوكيل سيطلب التفاصيل الناقصة ثم يجهز خطة.",
    requestTitle: "الطلب المنظم",
    verificationTitle: "حالة التحقق",
    reasoningTitle: "المنطق",
    actionsTitle: "الخطوات المقترحة",
    messageTitle: "رسالة جاهزة للمتبرعين",
    sendEmailButton: "أكد وأرسل الإيميل",
    emailPlaceholder: "recipient@example.com",
    emailIdle: "أدخلوا بريد المستلم ثم أكدوا الإرسال.",
    emailSending: "عم نرسل الإيميل...",
    emailSent: "تم إرسال الإيميل بنجاح.",
    emailMissingPlan: "جهزوا الخطة أولاً ثم أرسلوا الإيميل.",
    emailMissingRecipient: "أضيفوا بريد المستلم أولاً.",
    sourcesTitle: "مصادر رسمية",
    demoDonorsTitle: "مطابقات متبرعين",
    contactDonorButton: "تواصلوا معهم",
    contactDonorSending: "عم نتواصل مع المتبرع...",
    contactDonorNoEmail: "هذا المتطوع لم يضف عنوان إيميل.",
    donorEmailSent: "تم إرسال إيميل المتبرع بنجاح.",
    joinTitle: "انضموا إلينا لإنقاذ حياة",
    joinButton: "انضموا إلينا لإنقاذ حياة",
    joinName: "الاسم",
    joinBloodType: "فصيلة الدم",
    joinCity: "المدينة",
    joinContact: "الهاتف أو الإيميل",
    joinAvailability: "التوفر",
    joinIdle: "هذا التسجيل يغذي خريطة شبكة المتبرعين المستقبلية.",
    joinMissing: "املؤوا الاسم وفصيلة الدم والمدينة ووسيلة التواصل أولاً.",
    joinSending: "عم نحفظ معلومات التطوع...",
    joinSuccess: "تمت إضافتكم إلى شبكة المتطوعين المستقبلية.",
    welcome:
      "خبروني فصيلة الدم، المدينة، الاستعجال، وعدد الوحدات المطلوبة. فيني كمل بالعربي أو بالإنجليزي.",
    preparingLabel: "عم نجهز الخطة",
    preparingText: "الوكيل يستخرج التفاصيل ويتحقق من السياق الرسمي.",
    noPlanText: "بعد في شوية تفاصيل ناقصة قبل ما يجهز الوكيل الخطة الكاملة.",
    sourceLive: "مصدر حي",
    sourceStatic: "موقع رسمي",
    chipBloodType: "فصيلة الدم",
    chipCity: "المدينة",
    chipUnits: "الوحدات",
    chipUrgency: "الاستعجال",
    chipPatient: "الحالة",
    chipContact: "التواصل",
    availabilityLabel: "التوفر",
    contactPreferenceLabel: "أفضلية التواصل",
    contactLabel: "التواصل",
    emailLabel: "الإيميل",
    notProvided: "غير متوفر",
    demoBadge: "تجريبي",
    networkBadge: "شبكة"
  }
};

const listCopy = {
  en: {
    exists: [
      "Blood-support AI chat with follow-up questions and structured triage.",
      "Official-source context checks from Lebanese institutions when reachable.",
      "Volunteer-network signups that persist and can appear in future matching.",
      "Demo and network donor cards with direct email outreach through SMTP.",
      "Multilingual interface in English and Arabic for the blood workflow."
    ],
    roadmap: [
      "Wheelchair-access track for accessible places, entrances, and route planning.",
      "Hearing-access track for accessible communication and service discovery.",
      "Broader hospital and blood-bank coverage across Lebanon.",
      "Future messaging integrations such as WhatsApp after hackathon demo stage.",
      "Richer donor-network verification and smarter matching confidence."
    ],
    wheelchair: [
      "Accessible place discovery by city and category.",
      "Entrance and elevator notes collected from trusted sources and community input.",
      "Mobility-friendly route suggestions between key destinations.",
      "A shared data layer your teammate can plug into later."
    ],
    hearing: [
      "Directory of hearing-friendly clinics, centers, and support services.",
      "Accessible communication guidance for hospitals, municipalities, and NGOs.",
      "Emergency-ready phrasing, text-first contact options, and support navigation.",
      "A future AI assistant that turns confusing service info into simple next steps."
    ]
  },
  ar: {
    exists: [
      "وكيل دم بالمحادثة يسأل أسئلة متابعة ويبني طلباً منظماً.",
      "تحقق من السياق عبر مصادر لبنانية رسمية عندما تكون متاحة.",
      "تسجيلات شبكة متبرعين تُحفظ ويمكن أن تظهر لاحقاً في المطابقات.",
      "بطاقات متبرعين تجريبية ومن الشبكة مع تواصل مباشر عبر الإيميل باستخدام SMTP.",
      "واجهة متعددة اللغات بالعربية والإنجليزية لمسار الدم."
    ],
    roadmap: [
      "مسار للكراسي المتحركة يركز على الأماكن المناسبة والمداخل وتخطيط الحركة.",
      "مسار لضعف السمع يركز على التواصل المتاح واكتشاف الخدمات.",
      "توسيع تغطية المستشفيات وبنوك الدم في لبنان.",
      "دمج مراسلة لاحقاً مثل واتساب بعد مرحلة عرض الهاكاثون.",
      "تحقق أغنى لشبكة المتبرعين ومطابقة أذكى بثقة أعلى."
    ],
    wheelchair: [
      "اكتشاف الأماكن المناسبة بحسب المدينة والفئة.",
      "ملاحظات عن المداخل والمصاعد من مصادر موثوقة ومدخلات المجتمع.",
      "اقتراحات حركة أسهل بين الوجهات الأساسية.",
      "طبقة بيانات مشتركة يمكن لشريكتكم وصلها لاحقاً."
    ],
    hearing: [
      "دليل لعيادات ومراكز وخدمات مناسبة لضعف السمع.",
      "إرشاد تواصل متاح مع المستشفيات والبلديات والجمعيات.",
      "خيارات تواصل نصية ورسائل جاهزة للمواقف الطارئة.",
      "وكيل مستقبلي يحول معلومات الخدمات المعقدة إلى خطوات بسيطة."
    ]
  }
};

function currentLanguage() {
  return languageSelect.value === "ar" ? "ar" : "en";
}

function setDirection(language) {
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  document.body.classList.toggle("rtl", language === "ar");
}

function renderStaticLists() {
  const language = currentLanguage();
  renderList(existsList, listCopy[language].exists);
  renderList(roadmapList, listCopy[language].roadmap);
  renderList(wheelchairList, listCopy[language].wheelchair);
}

function applyTranslations() {
  const language = currentLanguage();
  const dictionary = copy[language];

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = dictionary[element.dataset.i18n];
  });

  document.querySelectorAll("[data-placeholder-key]").forEach((element) => {
    element.placeholder = dictionary[element.dataset.placeholderKey];
  });

  emailRecipient.placeholder = dictionary.emailPlaceholder;
  volunteerName.placeholder = dictionary.joinName;
  volunteerCity.placeholder = dictionary.joinCity;
  volunteerContact.placeholder = dictionary.joinContact;
  volunteerAvailability.placeholder = dictionary.joinAvailability;
  hearingScopeInput.placeholder = dictionary.hearingScopePlaceholder;
  hearingListenButton.textContent = state.hearingListening
    ? dictionary.hearingStopListeningButton
    : dictionary.hearingListenButton;

  if (!state.plan) {
    sendEmailStatus.textContent = dictionary.emailIdle;
  }

  volunteerSignupStatus.textContent = dictionary.joinIdle;
  hearingStatus.textContent = state.hearingResult ? hearingStatus.textContent : dictionary.hearingIdle;
  renderStaticLists();
  setDirection(language);
}

function setActiveView(viewName) {
  state.activeView = viewName;
  Object.entries(views).forEach(([key, element]) => {
    element.classList.toggle("hidden", key !== viewName);
    element.classList.toggle("active", key === viewName);
  });
  window.location.hash = viewName === "landing" ? "" : viewName;
}

function routeToTrack(track) {
  if (track === "home") {
    setActiveView("landing");
    return;
  }

  setActiveView(track);
}

function addMessage(role, text) {
  state.messages.push({ role, text });
  renderChat();
}

function renderChat() {
  chatThread.innerHTML = "";

  state.messages.forEach((message) => {
    const bubble = document.createElement("article");
    bubble.className = `chat-bubble ${message.role}`;

    const role = document.createElement("span");
    role.className = "chat-role";
    role.textContent = currentLanguage() === "ar"
      ? (message.role === "user" ? "أنت" : "الوكيل")
      : (message.role === "user" ? "You" : "Agent");

    const text = document.createElement("p");
    text.textContent = message.text;

    bubble.appendChild(role);
    bubble.appendChild(text);
    chatThread.appendChild(bubble);
  });

  chatThread.scrollTop = chatThread.scrollHeight;
}

function renderList(element, items) {
  if (!element) {
    return;
  }

  element.innerHTML = "";

  items.forEach((itemText) => {
    const item = document.createElement("li");
    item.textContent = itemText;
    element.appendChild(item);
  });
}

function renderHearingResult(result) {
  const labels = copy[currentLanguage()];
  state.hearingResult = result;

  if (!result) {
    hearingReconstructedNeed.textContent = "";
    hearingBarrier.textContent = "";
    hearingSummary.textContent = "";
    hearingFollowUp.textContent = "";
    hearingReplyDraft.value = "";
    renderList(hearingBarrierList, []);
    renderList(hearingNextSteps, []);
    hearingStatus.textContent = labels.hearingIdle;
    return;
  }

  hearingReconstructedNeed.textContent = result.reconstructedNeed || "";
  hearingBarrier.textContent = result.communicationBarrier || "";
  hearingSummary.textContent = result.simpleSummary || "";
  hearingFollowUp.textContent = result.followUpQuestion || "";
  hearingReplyDraft.value = result.replyDraft || result.spokenReply || "";
  renderList(hearingBarrierList, result.barrierSignals || []);
  renderList(hearingNextSteps, result.nextSteps || []);
  hearingStatus.textContent = labels.hearingReady;
}

function cleanupHearingAudioUrl() {
  if (!state.hearingAudioUrl) {
    return;
  }

  URL.revokeObjectURL(state.hearingAudioUrl);
  state.hearingAudioUrl = null;
}

function getHearingInputLanguage() {
  return hearingInputLanguageSelect.value || "ar";
}

function getRecognitionLocale() {
  const inputLanguage = getHearingInputLanguage();

  if (inputLanguage === "en") {
    return "en-US";
  }

  if (inputLanguage === "mixed") {
    return "ar-SA";
  }

  return "ar-SA";
}

function createSpeechRecognition() {
  if (state.hearingRecognition) {
    state.hearingRecognition.lang = getRecognitionLocale();
    return state.hearingRecognition;
  }

  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    return null;
  }

  const recognition = new Recognition();
  recognition.lang = getRecognitionLocale();
  recognition.continuous = true;
  recognition.interimResults = true;
  state.hearingRecognition = recognition;
  return state.hearingRecognition;
}

function renderRequest(request) {
  requestChips.innerHTML = "";

  if (!request) {
    return;
  }

  const labels = copy[currentLanguage()];
  const chips = [
    [labels.chipBloodType, request.bloodType],
    [labels.chipCity, request.city],
    [labels.chipUnits, request.unitsNeeded || ""],
    [labels.chipUrgency, request.urgency],
    [labels.chipPatient, request.patientType],
    [labels.chipContact, request.contactMethod]
  ];

  chips
    .filter(([, value]) => value)
    .forEach(([label, value]) => {
      const chip = document.createElement("div");
      chip.className = "chip";
      chip.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
      requestChips.appendChild(chip);
    });
}

function renderSources(plan) {
  sourcesList.innerHTML = "";
  const labels = copy[currentLanguage()];

  if (!plan) {
    return;
  }

  (plan.officialInstitutions || []).forEach((source) => {
    const card = document.createElement("article");
    card.className = "source-card";
    const contactLines = source.contact
      ? Object.entries(source.contact)
        .filter(([, value]) => value)
        .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
        .join("")
      : "";
    card.innerHTML = `
      <h4>${source.name}</h4>
      <p>${source.city} - ${source.area}</p>
      <p>${labels.sourceStatic}: <a href="${source.officialUrl}" target="_blank" rel="noreferrer">${source.officialUrl}</a></p>
      <p>${source.notes}</p>
      ${contactLines}
    `;
    sourcesList.appendChild(card);
  });

  const redCross = plan.liveContext && plan.liveContext.redCross;
  if (redCross) {
    const live = document.createElement("article");
    live.className = "source-card live";
    const details = redCross.fetched
      ? [
        redCross.stats && redCross.stats.bloodUnitsDelivered ? `bloodUnitsDelivered: ${redCross.stats.bloodUnitsDelivered}` : "",
        redCross.contacts && redCross.contacts.hotline ? `hotline: ${redCross.contacts.hotline}` : "",
        redCross.contacts && redCross.contacts.emergency ? `emergency: ${redCross.contacts.emergency}` : "",
        redCross.contacts && redCross.contacts.headquartersPhone ? `headquartersPhone: ${redCross.contacts.headquartersPhone}` : "",
        redCross.contacts && redCross.contacts.infoEmail ? `infoEmail: ${redCross.contacts.infoEmail}` : ""
      ].filter(Boolean).join(" | ")
      : `fetch failed: ${redCross.error}`;
    live.innerHTML = `
      <h4>${redCross.source}</h4>
      <p>${labels.sourceLive}: <a href="${redCross.url}" target="_blank" rel="noreferrer">${redCross.url}</a></p>
      <p>${details}</p>
    `;
    sourcesList.appendChild(live);
  }

  const aubmc = plan.liveContext && plan.liveContext.aubmc;
  if (aubmc) {
    const live = document.createElement("article");
    live.className = "source-card live";
    const details = aubmc.fetched
      ? [
        aubmc.contacts && aubmc.contacts.mainPhone ? `mainPhone: ${aubmc.contacts.mainPhone}` : "",
        aubmc.contacts && aubmc.contacts.bloodBankPhone ? `bloodBankPhone: ${aubmc.contacts.bloodBankPhone}` : "",
        aubmc.contacts && aubmc.contacts.bloodBankRoom ? `bloodBankRoom: ${aubmc.contacts.bloodBankRoom}` : "",
        aubmc.contacts && aubmc.contacts.email ? `email: ${aubmc.contacts.email}` : ""
      ].filter(Boolean).join(" | ")
      : `fetch failed: ${aubmc.error}`;
    live.innerHTML = `
      <h4>${aubmc.source}</h4>
      <p>${labels.sourceLive}: <a href="${aubmc.url}" target="_blank" rel="noreferrer">${aubmc.url}</a></p>
      <p>${details}</p>
    `;
    sourcesList.appendChild(live);
  }
}

function renderDemoDonors(plan) {
  demoDonorsList.innerHTML = "";
  const labels = copy[currentLanguage()];

  if (!plan || !Array.isArray(plan.demoDonorMatches) || !plan.demoDonorMatches.length) {
    return;
  }

  plan.demoDonorMatches.forEach((donor) => {
    const card = document.createElement("article");
    card.className = "source-card live";
    const donorEmail = donor.email || "";
    const donorArea = donor.area || "Lebanon";
    const donorBadge = donor.sourceType === "network" ? labels.networkBadge : labels.demoBadge;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "contact-donor-button";
    button.textContent = labels.contactDonorButton;
    button.disabled = !donorEmail;
    button.addEventListener("click", async () => {
      if (!donorEmail) {
        sendEmailStatus.textContent = labels.contactDonorNoEmail;
        return;
      }

      emailRecipient.value = donor.email;
      state.selectedDemoDonor = donor;
      sendEmailStatus.textContent = labels.contactDonorSending;
      button.disabled = true;

      try {
        await sendEmailMessage();
      } finally {
        button.disabled = false;
      }
    });

    card.innerHTML = `
      <h4>${donor.name} <span class="demo-badge">${donorBadge}</span></h4>
      <p>${donor.bloodType} - ${donor.city}, ${donorArea}</p>
      <p>${labels.availabilityLabel}: ${donor.availability}</p>
      <p>${labels.contactPreferenceLabel}: ${donor.contactPreference}</p>
      <p>${labels.contactLabel}: ${donor.contact}</p>
      <p>${labels.emailLabel}: ${donorEmail || labels.notProvided}</p>
    `;
    card.appendChild(button);
    demoDonorsList.appendChild(card);
  });
}

function renderPlan(plan, structuredRequest) {
  const labels = copy[currentLanguage()];

  state.plan = plan;
  state.structuredRequest = structuredRequest;
  state.selectedDemoDonor = null;
  renderRequest(structuredRequest);

  if (!plan) {
    summaryLabel.textContent = labels.waitingLabel;
    summaryText.textContent = labels.noPlanText;
    renderList(reasoningList, []);
    renderList(verificationList, []);
    renderList(actionsList, []);
    donorMessage.value = "";
    sendEmailStatus.textContent = labels.emailIdle;
    renderSources(null);
    renderDemoDonors(null);
    return;
  }

  summaryLabel.textContent = `${plan.priorityLabel} ${currentLanguage() === "ar" ? "الأولوية" : "priority"}`;
  summaryText.textContent = plan.summary;
  renderList(verificationList, plan.verificationSummary || []);
  renderList(reasoningList, plan.reasoning || []);
  renderList(actionsList, plan.recommendedActions || []);
  donorMessage.value = plan.donorMessage || "";
  sendEmailStatus.textContent = labels.emailIdle;
  renderSources(plan);
  renderDemoDonors(plan);
}

function buildEmailSubject(request, language) {
  const bloodType = request && request.bloodType ? request.bloodType : "blood";
  const city = request && request.city ? request.city : "Lebanon";

  if (language === "ar") {
    return `طلب دم عاجل ${bloodType} - ${city}`;
  }

  return `Urgent blood request ${bloodType} - ${city}`;
}

async function sendMessage(event) {
  event.preventDefault();

  const text = chatInput.value.trim();
  if (!text) {
    return;
  }

  addMessage("user", text);
  chatInput.value = "";

  const labels = copy[currentLanguage()];
  summaryLabel.textContent = labels.preparingLabel;
  summaryText.textContent = labels.preparingText;

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      language: currentLanguage(),
      messages: state.messages
    })
  });

  const result = await response.json();

  if (!response.ok) {
    addMessage("assistant", result.error || "Something went wrong.");
    return;
  }

  addMessage("assistant", result.assistantMessage);
  renderPlan(result.readyForPlan ? result.plan : null, result.structuredRequest);
}

async function sendEmailMessage() {
  const labels = copy[currentLanguage()];

  if (!state.plan || !state.structuredRequest || !donorMessage.value.trim()) {
    sendEmailStatus.textContent = labels.emailMissingPlan;
    return;
  }

  if (!emailRecipient.value.trim()) {
    sendEmailStatus.textContent = labels.emailMissingRecipient;
    return;
  }

  sendEmailStatus.textContent = labels.emailSending;

  const response = await fetch("/api/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      to: emailRecipient.value.trim(),
      subject: state.selectedDemoDonor
        ? `${buildEmailSubject(state.structuredRequest, currentLanguage())} - Donor outreach to ${state.selectedDemoDonor.name}`
        : buildEmailSubject(state.structuredRequest, currentLanguage()),
      text: state.selectedDemoDonor
        ? `${donorMessage.value}\n\nDonor target:\nName: ${state.selectedDemoDonor.name}\nBlood type: ${state.selectedDemoDonor.bloodType}\nCity: ${state.selectedDemoDonor.city}\nPreferred contact: ${state.selectedDemoDonor.contactPreference}\nEmail: ${state.selectedDemoDonor.email || "N/A"}\nPhone: ${state.selectedDemoDonor.contact}`
        : donorMessage.value
    })
  });

  const result = await response.json();

  if (!response.ok) {
    sendEmailStatus.textContent = result.error || "Email send failed.";
    return;
  }

  sendEmailStatus.textContent = `${
    state.selectedDemoDonor ? labels.donorEmailSent : labels.emailSent
  } ${result.messageId || ""}`.trim();
}

async function submitVolunteerSignup() {
  const labels = copy[currentLanguage()];

  if (
    !volunteerName.value.trim() ||
    !volunteerBloodType.value.trim() ||
    !volunteerCity.value.trim() ||
    !volunteerContact.value.trim()
  ) {
    volunteerSignupStatus.textContent = labels.joinMissing;
    return;
  }

  volunteerSignupStatus.textContent = labels.joinSending;

  const response = await fetch("/api/volunteer-signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: volunteerName.value.trim(),
      bloodType: volunteerBloodType.value.trim(),
      city: volunteerCity.value.trim(),
      contact: volunteerContact.value.trim(),
      contactPreference: volunteerContactPreference.value.trim(),
      availability: volunteerAvailability.value.trim()
    })
  });

  const result = await response.json();

  if (!response.ok) {
    volunteerSignupStatus.textContent = result.error || "Signup failed.";
    return;
  }

  volunteerSignupStatus.textContent = labels.joinSuccess;
  volunteerName.value = "";
  volunteerBloodType.value = "";
  volunteerCity.value = "";
  volunteerContact.value = "";
  volunteerAvailability.value = "";
}

async function analyzeHearingSupport() {
  const labels = copy[currentLanguage()];
  const payload = {
    language: currentLanguage(),
    inputLanguage: getHearingInputLanguage(),
    userNeed: hearingNeedInput.value.trim(),
    searchScope: hearingScopeInput.value.trim(),
    incomingTranscript: hearingTranscriptInput.value.trim(),
    replyIntent: hearingReplyIntentInput.value.trim(),
    preferredChannel: hearingChannelSelect.value
  };

  if (!payload.userNeed && !payload.searchScope && !payload.incomingTranscript && !payload.replyIntent) {
    hearingStatus.textContent = labels.hearingNoInput;
    return;
  }

  hearingStatus.textContent = labels.hearingAnalyzing;

  const response = await fetch("/api/hearing-assist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();

  if (!response.ok) {
    hearingStatus.textContent = result.error || labels.hearingAnalyzeError;
    return;
  }

  renderHearingResult(result);
}

function toggleHearingListening() {
  const labels = copy[currentLanguage()];
  const recognition = createSpeechRecognition();

  if (!recognition) {
    hearingStatus.textContent = labels.hearingListenUnsupported;
    return;
  }

  if (state.hearingListening) {
    state.hearingListening = false;
    hearingListenButton.textContent = labels.hearingListenButton;
    recognition.stop();
    hearingStatus.textContent = labels.hearingStoppedStatus;
    return;
  }

  hearingTranscriptInput.value = "";
  state.hearingListening = true;
  hearingListenButton.textContent = labels.hearingStopListeningButton;
  hearingStatus.textContent = labels.hearingListeningStatus;

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join(" ")
      .trim();

    hearingTranscriptInput.value = transcript;
  };

  recognition.onerror = () => {
    state.hearingListening = false;
    hearingListenButton.textContent = labels.hearingListenButton;
    hearingStatus.textContent = labels.hearingStoppedStatus;
  };

  recognition.onend = () => {
    state.hearingListening = false;
    hearingListenButton.textContent = labels.hearingListenButton;
  };

  recognition.start();
}

async function speakWithAiVoice(text) {
  const labels = copy[currentLanguage()];
  hearingStatus.textContent = labels.hearingAiSpeaking;

  const response = await fetch("/api/hearing-speak", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text,
      language: currentLanguage(),
      voice: hearingVoiceSelect.value,
      style: hearingStyleSelect.value
    })
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || labels.hearingAiSpeakError);
  }

  cleanupHearingAudioUrl();
  const mimeType = result.mimeType || "audio/mpeg";
  const bytes = Uint8Array.from(atob(result.audioBase64), (char) => char.charCodeAt(0));
  const blob = new Blob([bytes], { type: mimeType });
  const url = URL.createObjectURL(blob);
  state.hearingAudioUrl = url;

  const audio = new Audio(url);
  audio.onended = () => {
    hearingStatus.textContent = labels.hearingReady;
    cleanupHearingAudioUrl();
  };
  audio.onerror = () => {
    hearingStatus.textContent = labels.hearingAiSpeakError;
    cleanupHearingAudioUrl();
  };
  await audio.play();
}

function speakWithBrowserVoice(text) {
  const labels = copy[currentLanguage()];

  if (!window.speechSynthesis) {
    hearingStatus.textContent = labels.hearingSpeakUnsupported;
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = currentLanguage() === "ar" ? "ar-LB" : "en-US";
  const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
  if (currentLanguage() === "ar" && Array.isArray(voices) && voices.length) {
    const preferredArabicVoice = voices.find((voice) => /^ar(-|_)/i.test(voice.lang))
      || voices.find((voice) => /arab/i.test(`${voice.name} ${voice.lang}`));
    if (preferredArabicVoice) {
      utterance.voice = preferredArabicVoice;
      utterance.lang = preferredArabicVoice.lang || "ar";
    }
  }
  hearingStatus.textContent = labels.hearingSpeaking;
  utterance.onend = () => {
    hearingStatus.textContent = labels.hearingReady;
  };
  window.speechSynthesis.speak(utterance);
}

async function speakHearingReply() {
  const labels = copy[currentLanguage()];
  const text = (hearingReplyDraft.value || "").trim();

  if (!text) {
    hearingStatus.textContent = labels.hearingNoInput;
    return;
  }

  if (hearingVoiceModeSelect.value === "browser") {
    speakWithBrowserVoice(text);
    return;
  }

  try {
    await speakWithAiVoice(text);
  } catch (error) {
    hearingStatus.textContent = error.message || labels.hearingAiSpeakError;
  }
}

function initializeRoute() {
  const hash = window.location.hash.replace("#", "");
  if (hash && views[hash]) {
    setActiveView(hash);
    return;
  }

  setActiveView("landing");
}

languageSelect.addEventListener("change", () => {
  applyTranslations();
  renderChat();
  renderPlan(state.plan, state.structuredRequest);
  renderHearingResult(state.hearingResult);
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
});

trackButtons.forEach((button) => {
  button.addEventListener("click", () => {
    routeToTrack(button.dataset.track);
  });
});

chatForm.addEventListener("submit", sendMessage);
sendEmailButton.addEventListener("click", sendEmailMessage);
volunteerSignupButton.addEventListener("click", submitVolunteerSignup);
hearingSearchButton.addEventListener("click", analyzeHearingSupport);
hearingAnalyzeButton.addEventListener("click", analyzeHearingSupport);
hearingListenButton.addEventListener("click", toggleHearingListening);
hearingSpeakButton.addEventListener("click", speakHearingReply);

applyTranslations();
initializeRoute();
renderHearingResult(null);
addMessage("assistant", copy[currentLanguage()].welcome);
