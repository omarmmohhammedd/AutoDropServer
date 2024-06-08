"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProvince = exports.translateCity = exports.cities = void 0;
exports.cities = {
    'قلوه': 'Qilwah',
    'الرياض': 'Riyadh',
    'جدة': 'Jeddah',
    'مكة': 'Makkah',
    'المدينة المنورة': 'Medina',
    'الدمام': 'Dammam',
    'الأحساء': 'Hofuf',
    'القطيف': 'Al Qatif',
    'خميس مشيط': 'Khamis Mushait',
    'المظيلف': 'Almuzaylif',
    'تبوك': 'Tabuk',
    'الهفوف': 'Hofuf',
    'المبرز': 'Al Mubarraz',
    'نجران': 'Najran',
    'حفر الباطن': 'Hafar Al Batin',
    'الجبيل': 'Al Jubail',
    'الطائف': 'Taif',
    'ضبا': 'Duba',
    'الخرج': 'Al-Kharj',
    'الثقبة': 'Al Khobar',
    'ينبع': 'Yanbu',
    'عرعر': 'Arar',
    'الحوية (الطائف)': 'Hawiyah',
    'عنيزة': 'Unayzah',
    'الخبر': 'Al Khobar',
    'سكاكا': 'Sakaka',
    'جازان': 'Gizan',
    'القريات': 'Al Qurayyat',
    'الظهران': 'Dhahran',
    'الزلفي': 'Az Zulfi',
    'الرس': 'Ar Rass',
    'وادي الدواسر': 'Wadi Al Dawasir',
    'الباحة': 'Al Baha',
    'بيشة': 'Bisha',
    'سيهات': 'Saihat',
    'شرورة': 'Sharorah',
    'تاروت': 'Tarout',
    'صبيا': 'Sabya',
    'أحد رفيدة': 'Ahad Rafidah',
    'الفريش': 'Al Furaysh',
    'الدوادمي': 'Al Duwadimi',
    'بارق': 'Bariq',
    'الحوطة': 'Howtat Bani Tamim',
    'الهدا': 'Alhuda',
    'بريدة': 'Buraydah',
    'المذنب': 'Al Mithnab',
    'البكيرية': 'Al Bukayriyah',
    'البدائع': 'Al Badayea',
    'الهفوف والمبرز': 'Al Mubarraz',
    'النبهانية': 'An Nabhaniyah',
    'رياض الخبراء': 'Riyadh Al Khabra',
    'الشماسية': 'Ash Shimasiyah',
    'الغاط': 'Al Ghat',
    'عيون الجواء': 'Uyun Al Jawa',
    'سراة عبيدة': 'Sarat Abidah',
    'المجمعة': 'Al Majmaah',
    'عفيف': 'Afif',
    'الدرعية': 'Ad Diriyah',
    'شقراء': 'Shaqra',
    'حوطة بني تميم': 'Howtat Bani Tamim',
    'ضرما': 'Dhurma',
    'حريملاء': 'Huraymila',
    'السليل': 'As Sulayyil',
    'المزاحمية': 'Al-Muzahmiya',
    'رابغ': 'Rabigh',
    'ثول': 'Thuwal',
    'القنفذة': 'Al Qunfudhah',
    'العلا': 'AlUla',
    'أبها': 'Abha',
    'الليث': 'Al Lith',
    'النماص': 'Al Namas',
    'بلجرشي': 'Baljurashi',
    'المخواة': 'Al Makhwah',
    'تربة': 'Turbah',
    'أبو عريش': 'Abu Arish',
    'العريش': 'Aldhabyah',
    'الخفجي': 'Khafji',
    'الخرمة': 'Al Khurma',
    'حائل': 'Hail',
    'خريص': 'Khurais',
    'املج': 'Umluj',
    'بدر': 'Badr',
    'دومة الجندل': 'Dumah Al Jandal',
    'ليلى': 'Layla',
    'الجموم': 'Al Jumum',
    'المندق': 'Almandaq',
    'خليص': 'Khulais',
    'خيبر': 'Khaybar',
    'رأس تنورة': 'Ras Tanura',
    'صامطة': 'Samtah',
    'رجال المع': 'Rijal Alma',
    'رنية': 'Ranyah',
    'ظهران الجنوب': 'Dhahran Al Janub',
    'مهد الذهب': 'Mahd Al Thahab',
    'جزيرة فرسان': 'Farasan',
    'الدلم': 'Ad Dilam',
    'صفوى': 'Safwa',
    'البديع الشمالي': 'Al-Badie Al-Shamali',
    'البديع الجنوبي': 'Al-Badie Al-Janobi',
    'الهدار': 'Al Haddar',
    'الأرطاوية': 'Al Artawiyah',
    'الحاير': 'Riyadh',
    'الحريق': 'Al Hariq',
    'القويعية': 'Al Quwaiiyah',
    'الهياثم': 'Al-Kharj',
    'تمير': 'Tumair',
    'ثادق': 'Thadiq',
    'حوطة سدير': 'Hautat Sudair',
    'رماح': 'Rumah',
    'ساجر': 'Sajir',
    'مرات': 'Marat',
    'العقيق': 'Al Aqiq',
    'قلوة': 'Qilwah',
    'صوير': 'Suwayr',
    'طبرجل': 'Tubarjal',
    'العويقيلة': 'Al Uwayqilah',
    'رفحاء': 'Rafha',
    'طريف': 'Turaif',
    'الخبراء': 'Al Khabra',
    'الثمد': 'Al Thamad',
    'الحناكية': 'Al Henakiyah',
    'العيص': 'Al Ais',
    'المحفر': 'Hibran',
    'البطحاء': 'Al Batha',
    'بقيق': 'Buqayq',
    'الوجه': 'Al Wajh',
    'تيماء': 'Tayma',
    'حقل': 'Haql',
    'ابو السلع': 'Alsilaa',
    'أحد المسارحة': 'Ahad Al Masarihah',
    'البديع والقرفي': 'Abu Arish',
    'الجرادية': 'Al Jaradiyah',
    'الحسيني': 'Al Husayni',
    'الدائر': 'Addayer',
    'الدرب': 'Ad Darb',
    'الشقيري': 'Alshuqayri',
    'الطوال': 'Al Tuwal',
    'المضايا': 'Al Madaya',
    'المطعن': 'Al-Matan',
    'بيش': 'Baish',
    'ضمد': 'Damad',
    'مزهرة': 'Mizhirah',
    'مسلية': 'Masliyah',
    'الحائط': 'Al Hait',
    'الشنان': 'Ash Shinan',
    'الاثنين': 'Al-Ithnayn',
    'المجاردة': 'Almajaridah',
    'تثليث': 'Tathleeth',
    'تنومة (عسير)': 'Tanomah',
    'طريب': 'Tareeb',
    'محايل عسير': 'Muhayil',
    'محايل': 'Muhayil',
    'القوز': 'AlQouz',
    'عشيرة': 'Ashayrah',
    'مستورة': 'Mastorah',
    'المشعلية': 'Al Mishaliah',
    'حبونا': 'Hubuna',
    'عنك': 'Anak',
    'النعيرية': 'Nairyah',
    'بحره': 'Bahrah',
    'وادي ابن هشبل': 'Wadi Ibn Hashbal',
    'خيبر الجنوب': 'Khaiber Al-Janoub',
    'المضة': 'Al Madha',
    'سبت العلاية': 'Sabt Alalayah',
    'دخنة': 'Duhknah',
    'شواق': 'Alshwaaq',
    'مدائن صالح': 'Madain Saleh',
    'فضلا': 'Fadhla',
    'حزم الجلاميد': 'Hazem Aljalamid',
    'ميقوع': 'Meegowa',
    'الرايس': 'Ar Rayis',
    'أبيار علي': 'Abiar Al Mashi',
    'المويه الجديدة': 'New Muwayh',
    'يدمة': 'Yadamah',
    'الوديعة': 'Sharorah',
    'أم الملح': 'Al Kharkhir',
    'الخرخير': 'Al Kharkhir',
    'ذعبلوتن': 'Al Kharkhir',
    'الشلفا': 'Al Hafayer',
    'الرين': 'Ar Rayn',
    'الرويضة': 'Ar Ruwaidhah',
    'عقلة الصقور': 'Uglat Asugour',
    'القيصومة': 'Al Qaisumah',
    'قبه': 'Qbah',
    'لينه': 'Linah',
    'بقعاء': 'Baqaa',
    'القاعد': 'Al Qaid',
    'الغزالة': 'Al Ghazalah',
    'أسبطر': 'Asbtar',
    'الشملي': 'Ash Shamli',
    'الحليفة السفلى': 'Al Hulayfah As Sufla',
    'العشاش': 'Al Eshash',
    'مدينة الملك عبدالله الاقتصادية': 'King Abdullah Economic City',
    'ذهبان': 'Dahaban',
    'عين قحطان': 'Al Amoah',
    'فيفاء': 'Fayfa',
    'السعدية': 'Alsadyah',
    'الصبيخة': 'Al Subaykhah',
    'المرامية': 'Al Marameh',
    'رأس الخير': 'Ras Al Khair',
    'سلوى': 'Salwa',
    'الشيحية': 'Ash Shihyah',
    'مكة المكرمة': 'Makkah'
};
const Provinces = {
    'Qilwah': 'Bahah',
    'Ash Shihyah': 'Al Qassim',
    'Al-Mudhayli': 'Makkah',
    'Salwa': 'Eastern',
    'Ras Al Khair': 'Eastern',
    'Al Marameh': 'Madinah',
    'Al Subaykhah': 'Aseer',
    'Alsadyah': 'Makkah',
    'Al Amoah': 'Aseer',
    'Dahaban': 'Makkah',
    'Faifa': 'Gizan',
    "King Abdullah Economic City": 'Makkah',
    'Al Eshash': 'Madinah',
    'Al Hulayfah As Sufla': 'Hail',
    'Al Qaid': 'Hail',
    'Ash Shamli': 'Hail',
    'Asbtar': 'Hail',
    'Al-Shamli': 'Hail',
    'Baqaa': 'Hail',
    'Linah': 'Northern Borders',
    'Qbah': 'Al Qassim',
    'Al Qaisumah': 'Eastern',
    'Uglat Asugour': 'Al Qassim',
    'Ar Ruwaidhah': 'Riyadh',
    'Al Hafayer': 'Riyadh',
    'Ar Rayn': 'Riyadh',
    'Al Kharkhir': 'Najran',
    'Yadamah': 'Najran',
    'New Muwayh': 'Makkah',
    'Abiar Al Mashi': 'Madinah',
    'Ar Rayis': 'Madinah',
    'Meegowa': 'Makkah',
    'Hazem Aljalamid': 'Northern Borders',
    'Fadhla': 'Madinah',
    'Madain Saleh': 'Madinah',
    'Alshwaaq': 'Makkah',
    'Duhknah': 'Al Qassim',
    'Sabt Alalayah': 'Aseer',
    'Al Madha': 'Aseer',
    'Khaiber Al-Janoub': 'Aseer',
    'Wadi Ibn Hashbal': 'Aseer',
    'Bahrah': 'Makkah',
    'Nairyah': 'Eastern',
    'Anak': 'Eastern',
    'Hubuna': 'Najran',
    'Al Mishaliah': 'Najran',
    'Mastorah': 'Makkah',
    'Ashayrah': 'Riyadh',
    'AlQouz': 'Makkah',
    'Muhayil': 'Aseer',
    'Tareeb': 'Aseer',
    'Tanomah': 'Aseer',
    'Triangulation': 'Aseer',
    'Tathleeth': 'Aseer',
    'Almajaridah': 'Aseer',
    'Al-Ithnayn': 'Hail',
    'Ash Shinan': 'Gizan',
    'Al Hait': 'Hail',
    'Mizhirah': 'Gizan',
    'Damad': 'Gizan',
    'Baish': 'Gizan',
    'Al-Matan': 'Gizan',
    'Al Madaya': 'Gizan',
    'Al Tuwal': 'Gizan',
    'Alshuqayri': 'Gizan',
    'Ad Darb': 'Gizan',
    'Addayer': 'Gizan',
    'Al Husayni': 'Gizan',
    'Al Jaradiyah': 'Gizan',
    'Ahad Al Masarihah': 'Gizan',
    'Alsilaa': 'Gizan',
    'Haql': 'Tabuk',
    'Tayma': 'Tabuk',
    'Al Wajh': 'Tabuk',
    'Buqayq': 'Eastern',
    'Al Batha': 'Eastern',
    'Hibran': 'Makkah',
    'Al Ais': 'Madinah',
    'Al Henakiyah': 'Madinah',
    'Al-Thamd': 'Madinah',
    'Al Khabra': 'Al Qassim',
    'Rumah': 'Northern Borders',
    'Tubarjal': 'Al Jouf',
    'Shoot': 'Al Jouf',
    'Tumair': 'Riyadh',
    'Al-Kharj': 'Riyadh',
    'Al Quwaiiyah': 'Riyadh',
    'Al Hariq': 'Riyadh',
    'Artawiya': 'Riyadh',
    'Al Haddar': 'Riyadh',
    'Al-Badie Al-Shamali': 'Riyadh',
    'Al-Badie Al-Janobi': 'Riyadh',
    'Safwa': 'Eastern',
    'Al-Awiqila': 'Northern Borders',
    'Qalwa': 'Bahah',
    'Agate': 'Bahah',
    'Marat': 'Riyadh',
    'Spears': 'Riyadh',
    'Sajir': 'Riyadh',
    'Thadiq': 'Riyadh',
    'Hautat Sudair': 'Riyadh',
    'Ad Dilam': 'Riyadh',
    'Farasan': 'Gizan',
    'Mahd Al Thahab': 'Madinah',
    'Dhahran Al Janub': 'Aseer',
    'Ranyah': 'Makkah',
    'Rijal Alma': 'Aseer',
    'Samtah': 'Gizan',
    'Ras Tanura': 'Eastern',
    'Khaybar': 'Madinah',
    "Khulais": 'Makkah',
    'Almandaq': 'Bahah',
    'Al Jumum': 'Makkah',
    'Layla': 'Riyadh',
    'Dumah Al Jandal': 'Al Jouf',
    'Badr': 'Madinah',
    'Umluj': 'Tabuk',
    'Khurais': 'Eastern',
    'Hail': 'Hail',
    'Al Khurma': 'Makkah',
    'Khafji': 'Eastern',
    'Aldhabyah': 'Gizan',
    'Abu Arish': 'Gizan',
    'Turbah': 'Makkah',
    'Al Makhwah': 'Bahah',
    'Al Namas': 'Aseer',
    'Al Lith': 'Makkah',
    'Abha': 'Aseer',
    'AlUla': 'Madinah',
    'Al Qunfudhah': 'Makkah',
    'Thuwal': 'Makkah',
    'Rabigh': 'Makkah',
    'Al-Muzahmiya': 'Riyadh',
    'As Sulayyil': 'Riyadh',
    'Huraymila': 'Riyadh',
    'Dhurma': 'Riyadh',
    'Howtat Bani Tamim': 'Riyadh',
    'Shaqra': 'Riyadh',
    'Ad Diriyah': 'Riyadh',
    'Afif': 'Riyadh',
    'Al Majmaah': 'Riyadh',
    'Sarat Abidah': 'Aseer',
    'Uyun Al Jawa': 'Al Qassim',
    'Al Ghat': 'Riyadh',
    'AshShimasiyah': 'Al Qassim',
    'Riyadh Al Khabra': 'Al Qassim',
    'An Nabhaniyah': 'Al Qassim',
    'Al Mubarraz': 'Eastern',
    'Al Badayea': 'Al Qassim',
    'Al Bukayriyah': 'Al Qassim',
    'Al Mithnab': 'Al Qassim',
    'Buraydah': 'Al Qassim',
    'Alhuda': 'Makkah',
    'Bariq': 'Aseer',
    'Al Duwadimi': 'Riyadh',
    'Al Furaysh': 'Madinah',
    'Ahad Rafidah': 'Aseer',
    'Sabya': 'Gizan',
    'Tarout': 'Eastern',
    'Sharorah': 'Najran',
    'Saihat': 'Eastern',
    'Bisha': 'Aseer',
    'Al Baha': 'Bahah',
    'Wadi Al Dawasir': 'Riyadh',
    'Ar Rass': 'Al Qassim',
    'Az Zulfi': 'Riyadh',
    'Dhahran': 'Eastern',
    'Al Qurayyat': 'Al Jouf',
    'Gizan': 'Gizan',
    'Sakaka': 'Al Jouf',
    'Al Khobar': 'Eastern',
    'Unayzah': 'Al Qassim',
    'Hawiyah': 'Makkah',
    'Arar': 'Northern Borders',
    'Yanbu': 'Madinah',
    'Duba': 'Tabuk',
    'Taif': 'Makkah',
    'Al Jubail': 'Eastern',
    'Hafar Al Batin': 'Eastern',
    'Najran': 'Najran',
    'Hofuf': 'Eastern',
    'Tabuk': 'Tabuk',
    'Almuzaylif': 'Makkah',
    'Khamis Mushait': 'Khamis Mushait',
    'Al Qatif': 'Eastern',
    'Dammam': 'Eastern',
    'Medina': 'Madinah',
    'Makkah': 'Makkah',
    'Jeddah': 'Makkah',
    'Riyadh': 'Riyadh',
    'Turaif': 'Northern Borders'
};
const translateCity = (city) => {
    return exports.cities[city];
};
exports.translateCity = translateCity;
function getProvince(cityName) {
    return Provinces[cityName];
}
exports.getProvince = getProvince;