const line2_part2  =`${ new Date().getFullYear() }`;

const langs =  {
   "bn": {
      "line1_part1": "#পরিকল্পনারঅংশ",
      "line1_part2": "আন্তর্জাতিক দিবস",
      "line2_part1": "জীববৈচিত্র্যের জন্য",
      "name": "নাম",
      "individual": "নাম",
      "collective": "সংগঠন"
    },
    "hy": {
      "line1_part1": "#Ծրագրիմիմասը",
      "line1_part2": "Միջազգային օր",
      "line2_part1": "կենսաբազմազանության համար",
      "name": "Անուն",
      "individual": "Անուն",
      "collective": "Կազմակերպություն"
    },
    "bs": {
      "line1_part1": "#DioPlana",
      "line1_part2": "Međunarodni dan",
      "line2_part1": "za biodiverzitet",
      "name": "Ime",
      "individual": "Ime",
      "collective": "Organizacija"
    },
    "az": {
      "line1_part1": "#PlanınHissəsi",
      "line1_part2": "Beynəlxalq gün",
      "line2_part1": "Biomüxtəliflik üçün",
      "name": "ad",
      "individual": "ad",
      "collective": "Təşkilat"
    },
    "am": {
      "line1_part1": "#የእቅዱአካል",
      "line1_part2": "ዓለም አቀፍ ቀን",
      "line2_part1": "ለብዝሀ ሕይወት",
      "name": "ስም",
      "individual": "ስም",
      "collective": "ድርጅት"
    },
    "eu": {
      "line1_part1": "#PlanarenZatiBat",
      "line1_part2": "Nazioarteko Eguna",
      "line2_part1": "Biodibertsitaterako",
      "name": "Izena",
      "individual": "Izena",
      "collective": "Antolaketa"
    },
    "bg": {
      "line1_part1": "#ЧастОтПлана",
      "line1_part2": "Международен ден",
      "line2_part1": "за биоразнообразието",
      "name": "Име",
      "individual": "Име",
      "collective": "Организация"
    },
    "hr": {
      "line1_part1": "#DioPlana",
      "line1_part2": "Međunarodni dan",
      "line2_part1": "za biološku raznolikost",
      "name": "Ime",
      "individual": "Ime",
      "collective": "Organizacija"
    },
    "ca": {
      "line1_part1": "#PartDelPla",
      "line1_part2": "Dia Internacional",
      "line2_part1": "per a la Biodiversitat",
      "name": "Nom",
      "individual": "Nom",
      "collective": "Organització"
    },
    "cs": {
      "line1_part1": "#ČástPlánu",
      "line1_part2": "Mezinárodní den",
      "line2_part1": "pro biologickou rozmanitost",
      "name": "název",
      "individual": "název",
      "collective": "Organizace"
    },
    "et": {
      "line1_part1": "#PlaanistOsa",
      "line1_part2": "Rahvusvaheline päev",
      "line2_part1": "bioloogilise mitmekesisuse jaoks",
      "name": "Nimi",
      "individual": "Nimi",
      "collective": "Organisatsioon"
    },
    "fi": {
      "line1_part1": "#OsaSuunnitelmasta",
      "line1_part2": "Kansainvälinen päivä",
      "line2_part1": "biologisen monimuotoisuuden puolesta",
      "name": "Nimi",
      "individual": "Nimi",
      "collective": "Organisaatio"
    },
    "de": {
      "line1_part1": "#TeilDesPlans",
      "line1_part2": "Internationaler Tag",
      "line2_part1": "für Biodiversität",
      "name": "Name",
      "individual": "Name",
      "collective": "Organisation"
    },
    "ka": {
      "line1_part1": "#გეგმისნაწილი",
      "line1_part2": "საერთაშორისო დღე",
      "line2_part1": "ბიომრავალფეროვნებისთვის",
      "name": "სახელი",
      "individual": "სახელი",
      "collective": "ორგანიზაცია"
    },
    "gl": {
      "line1_part1": "#ParteDelPlan",
      "line1_part2": "Día Internacional",
      "line2_part1": "para a Biodiversidade",
      "name": "Nome",
      "individual": "Nome",
      "collective": "Organización"
    },
    "el": {
      "line1_part1": "#ΜέροςτουΣχεδίου",
      "line1_part2": "Διεθνής Ημέρα",
      "line2_part1": "για τη βιοποικιλότητα",
      "name": "Ονομα",
      "individual": "Ονομα",
      "collective": "Οργάνωση"
    },
    "ht": {
      "line1_part1": "#PatiPlan",
      "line1_part2": "Jounen Entènasyonal",
      "line2_part1": "pou divèsite biyolojik",
      "name": "Non",
      "individual": "Non",
      "collective": "Òganizasyon"
    },
    "hi": {
      "line1_part1": "#योजनाकाभाग",
      "line1_part2": "अंतर्राष्ट्रीय दिवस",
      "line2_part1": "जैव विविधता के लिए",
      "name": "नाम",
      "individual": "नाम",
      "collective": "संगठन"
    },
    "hu": {
      "line1_part1": "#ATervRésze",
      "line1_part2": "Nemzetközi Nap",
      "line2_part1": "a biodiverzitásért",
      "name": "Név",
      "individual": "Név",
      "collective": "Szervezet"
    },
    "is": {
      "line1_part1": "#HlutiAfAætluninni",
      "line1_part2": "Alþjóðadagur",
      "line2_part1": "fyrir líffræðilegan fjölbreytileika",
      "name": "Nafn",
      "individual": "Nafn",
      "collective": "Skipulag"
    },
    "ga": {
      "line1_part1": "#CuiddenPlean",
      "line1_part2": "Lá Idirnáisiúnta",
      "line2_part1": "don Bhithéagsúlacht",
      "name": "Ainm",
      "individual": "Ainm",
      "collective": "Eagraíocht"
    },
    "it": {
      "line1_part1": "#PartedelPiano",
      "line1_part2": "Giornata internazionale",
      "line2_part1": "per la Biodiversità",
      "name": "Nome",
      "individual": "Nome",
      "collective": "Organizzazione"
    },
    "ja": {
      "line1_part1": "#計画の一部",
      "line1_part2": "国際デー",
      "line2_part1": "生物多様性のために",
      "name": "名前",
      "individual": "名前",
      "collective": "組織"
    },
    "ko": {
      "line1_part1": "#계획의일부",
      "line1_part2": "국제의 날",
      "line2_part1": "생물다양성을 위한",
      "name": "이름",
      "individual": "이름",
      "collective": "조직"
    },
    "lv": {
      "line1_part1": "#PlānaDaļa",
      "line1_part2": "Starptautiskā diena",
      "line2_part1": "bioloģiskajai daudzveidībai",
      "name": "Vārds",
      "individual": "Vārds",
      "collective": "Organizācija"
    },
    "lt": {
      "line1_part1": "#PlanoDalis",
      "line1_part2": "Tarptautinė diena",
      "line2_part1": "už biologinę įvairovę",
      "name": "vardas",
      "individual": "vardas",
      "collective": "Organizacija"
    },
    "ms": {
      "line1_part1": "#SebahagianDaripadaRancangan",
      "line1_part2": "Hari Antarabangsa",
      "line2_part1": "untuk Biodiversiti",
      "name": "Nama",
      "individual": "Nama",
      "collective": "Organisasi"
    },
    "mr": {
      "line1_part1": "#योजनेचाभाग",
      "line1_part2": "आंतरराष्ट्रीय दिवस",
      "line2_part1": "जैवविविधतेसाठी",
      "name": "नाव",
      "individual": "नाव",
      "collective": "संघटना"
    },
    "ne": {
      "line1_part1": "#योजनाकोअंश",
      "line1_part2": "अन्तर्राष्ट्रिय दिवस",
      "line2_part1": "जैविक विविधताको लागि",
      "name": "नाम",
      "individual": "नाम",
      "collective": "संगठन"
    },
    "pl": {
      "line1_part1": "#CzęśćPlanu",
      "line1_part2": "Międzynarodowy Dzień",
      "line2_part1": "dla różnorodności biologicznej",
      "name": "Nazwa",
      "individual": "Nazwa",
      "collective": "Organizacja"
    },
    "pt": {
      "line1_part1": "#ParteDoPlano",
      "line1_part2": "Dia Internacional",
      "line2_part1": "para a Biodiversidade",
      "name": "Nome",
      "individual": "Nome",
      "collective": "Organização"
    },
    "ro": {
      "line1_part1": "#OParteAPlanului",
      "line1_part2": "Ziua Internațională",
      "line2_part1": "pentru Biodiversitate",
      "name": "Nume",
      "individual": "Nume",
      "collective": "Organizare"
    },
    "sr": {
      "line1_part1": "#ПартОфТхеПлан",
      "line1_part2": "Међународни дан",
      "line2_part1": "за биодиверзитет",
      "name": "Име",
      "individual": "Име",
      "collective": "Организација"
    },
    "sk": {
      "line1_part1": "#ČasťPlánu",
      "line1_part2": "Medzinárodný deň",
      "line2_part1": "pre biodiverzitu",
      "name": "názov",
      "individual": "názov",
      "collective": "Organizácia"
    },
    "gd": {
      "line1_part1": "#PàirtdenPhlana",
      "line1_part2": "Latha Eadar-nàiseanta",
      "line2_part1": "airson Bith-iomadachd",
      "name": "Ainm",
      "individual": "Ainm",
      "collective": "Eagrachadh"
    },
    "tr": {
      "line1_part1": "#PlanınParçası",
      "line1_part2": "Uluslararası gün",
      "line2_part1": "Biyoçeşitlilik için",
      "name": "İsim",
      "individual": "İsim",
      "collective": "Organizasyon"
    },
    "sl": {
      "line1_part1": "#DelNačrta",
      "line1_part2": "Mednarodni dan",
      "line2_part1": "za biotsko raznovrstnost",
      "name": "Ime",
      "individual": "Ime",
      "collective": "Organizacija"
    },
    "uk": {
      "line1_part1": "#ЧастинаПлану",
      "line1_part2": "Міжнародний день",
      "line2_part1": "для біорізноманіття",
      "name": "Ім'я",
      "individual": "Ім'я",
      "collective": "організація"
    }
};

const ands = { "hy": { "and": "և" }, "bs": { "and": "i" }, "am": { "and": "እና" }, "az": { "and": "və" }, "eu": { "and": "eta" }, "bn": { "and": "এবং" }, "bg": { "and": "и" }, "cs": { "and": "a" }, "ca": { "and": "i" }, "et": { "and": "ja" }, "hr": { "and": "i" }, "fi": { "and": "ja" }, "gl": { "and": "e" }, "ka": { "and": "და" }, "ht": { "and": "epi" }, "de": { "and": "Und" }, "el": { "and": "και" }, "hi": { "and": "और" }, "hu": { "and": "és" }, "ga": { "and": "agus" }, "is": { "and": "og" }, "it": { "and": "E" }, "lv": { "and": "un" }, "ja": { "and": "そして" }, "ko": { "and": "그리고" }, "ms": { "and": "dan" }, "lt": { "and": "ir" }, "mr": { "and": "आणि" }, "pl": { "and": "I" }, "ne": { "and": "र" }, "pt": { "and": "e" }, "sl": { "and": "in" }, "ro": { "and": "și" }, "sr": { "and": "и" }, "gd": { "and": "agus" }, "sk": { "and": "a" }, "tr": { "and": "Ve" }, "uk": { "and": "і" } };

export default addAnds(addLine());

function addLine(){
  for (let lang in langs) {
    langs[lang].line2_part2 = line2_part2;
  }

  return langs;
}

function addAnds(languages){
  for (let lang in languages) {
    languages[lang].and = ands[lang].and || "and";
  }

  return languages;
}