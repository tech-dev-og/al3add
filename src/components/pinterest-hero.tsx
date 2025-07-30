import { Calendar, Heart, GraduationCap, Baby, Plane, Heart as Ring, Briefcase, Gift, Sparkles } from "lucide-react";

interface LifeEvent {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  bgGradient: string;
  textColor: string;
  size: 'small' | 'medium' | 'large';
}

const LIFE_EVENTS: LifeEvent[] = [
  {
    id: '1',
    title: 'عيد الفطر',
    subtitle: 'الاحتفال المبارك',
    icon: <Sparkles className="h-6 w-6" />,
    bgGradient: 'from-emerald-500 to-teal-600',
    textColor: 'text-white',
    size: 'large'
  },
  {
    id: '2', 
    title: 'عيد الميلاد',
    subtitle: 'يوم خاص',
    icon: <Gift className="h-5 w-5" />,
    bgGradient: 'from-pink-500 to-rose-600',
    textColor: 'text-white',
    size: 'medium'
  },
  {
    id: '3',
    title: 'الزواج',
    subtitle: 'بداية جديدة',
    icon: <Heart className="h-5 w-5" />,
    bgGradient: 'from-purple-500 to-indigo-600',
    textColor: 'text-white',
    size: 'small'
  },
  {
    id: '4',
    title: 'التخرج',
    subtitle: 'إنجاز عظيم',
    icon: <GraduationCap className="h-6 w-6" />,
    bgGradient: 'from-blue-500 to-cyan-600',
    textColor: 'text-white',
    size: 'large'
  },
  {
    id: '5',
    title: 'السفر',
    subtitle: 'مغامرة جديدة',
    icon: <Plane className="h-5 w-5" />,
    bgGradient: 'from-orange-500 to-amber-600',
    textColor: 'text-slate-800',
    size: 'medium'
  },
  {
    id: '6',
    title: 'مولود جديد',
    subtitle: 'بركة وفرحة',
    icon: <Baby className="h-4 w-4" />,
    bgGradient: 'from-green-500 to-emerald-600',
    textColor: 'text-white',
    size: 'small'
  },
  {
    id: '7',
    title: 'بداية العمل',
    subtitle: 'خطوة مهمة',
    icon: <Briefcase className="h-4 w-4" />,
    bgGradient: 'from-slate-500 to-gray-600',
    textColor: 'text-white',
    size: 'small'
  },
  {
    id: '8',
    title: 'عيد الحب',
    subtitle: 'لحظات رومانسية',
    icon: <Heart className="h-5 w-5" />,
    bgGradient: 'from-red-500 to-pink-600',
    textColor: 'text-white',
    size: 'medium'
  },
  {
    id: '9',
    title: 'رمضان',
    subtitle: 'شهر الخير',
    icon: <Calendar className="h-6 w-6" />,
    bgGradient: 'from-indigo-500 to-purple-600',
    textColor: 'text-white',
    size: 'large'
  }
];

const getTileClassName = (size: string) => {
  switch (size) {
    case 'large':
      return 'col-span-2 row-span-2 h-40 sm:h-48';
    case 'medium': 
      return 'col-span-1 sm:col-span-2 h-32 sm:h-28';
    case 'small':
      return 'col-span-1 h-28 sm:h-24';
    default:
      return 'col-span-1 h-28 sm:h-24';
  }
};

export function PinterestHero() {
  return (
    <div className="relative container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
          مرحباً بك في تطبيق العد التنازلي
        </h2>
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          احتفل بلحظاتك المميزة واجعل كل حدث له عدّ تنازلي خاص به
        </p>
      </div>
      
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 auto-rows-auto">
          {LIFE_EVENTS.map((event) => (
            <div
              key={event.id}
              className={`
                ${getTileClassName(event.size)}
                bg-gradient-to-br ${event.bgGradient}
                rounded-xl sm:rounded-2xl p-3 sm:p-4 ${event.textColor} relative overflow-hidden
                hover:scale-[1.02] transition-all duration-300
                cursor-pointer shadow-md hover:shadow-lg
                flex flex-col justify-center items-center text-center
                min-h-0
              `}
            >
              {/* Decorative pattern overlay */}
              <div className="absolute inset-0 bg-white/10 opacity-50" 
                   style={{
                     backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), 
                                      radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)`
                   }}
              />
              
              <div className="relative z-10 flex flex-col items-center justify-center gap-2 text-center px-2">
                <div className="bg-white/20 p-2 rounded-full mb-1 flex items-center justify-center">
                  {event.icon}
                </div>
                <h3 className="font-bold text-sm sm:text-base leading-tight">{event.title}</h3>
                <p className={`text-xs sm:text-sm leading-tight ${event.textColor === 'text-slate-800' ? 'text-slate-700' : 'text-white/90'}`}>{event.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}