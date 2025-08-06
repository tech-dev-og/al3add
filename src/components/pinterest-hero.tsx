import { Calendar, Heart, GraduationCap, Baby, Plane, Heart as Ring, Briefcase, Gift, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LifeEvent {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  bgGradient: string;
  textColor: string;
  size: 'small' | 'medium' | 'large';
}


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

interface PinterestHeroProps {
  onTileClick: () => void;
}

export function PinterestHero({ onTileClick }: PinterestHeroProps) {
  const { t } = useTranslation();

  const LIFE_EVENTS: LifeEvent[] = [
    {
      id: '1',
      title: t('hero.lifeEvents.eidFitr'),
      subtitle: t('hero.lifeEvents.eidFitrSub'),
      icon: <Sparkles className="h-6 w-6" />,
      bgGradient: 'from-emerald-400 to-green-500',
      textColor: 'text-white',
      size: 'large'
    },
    {
      id: '2', 
      title: t('hero.lifeEvents.birthday'),
      subtitle: t('hero.lifeEvents.birthdaySub'),
      icon: <Gift className="h-5 w-5" />,
      bgGradient: 'from-amber-200 to-yellow-300',
      textColor: 'text-slate-800',
      size: 'medium'
    },
    {
      id: '3',
      title: t('hero.lifeEvents.marriage'),
      subtitle: t('hero.lifeEvents.marriageSub'),
      icon: <Heart className="h-5 w-5" />,
      bgGradient: 'from-purple-500 to-indigo-600',
      textColor: 'text-white',
      size: 'small'
    },
    {
      id: '4',
      title: t('hero.lifeEvents.graduation'),
      subtitle: t('hero.lifeEvents.graduationSub'),
      icon: <GraduationCap className="h-6 w-6" />,
      bgGradient: 'from-blue-500 to-cyan-600',
      textColor: 'text-white',
      size: 'large'
    },
    {
      id: '5',
      title: t('hero.lifeEvents.travel'),
      subtitle: t('hero.lifeEvents.travelSub'),
      icon: <Plane className="h-5 w-5" />,
      bgGradient: 'from-orange-200 to-amber-300',
      textColor: 'text-slate-800',
      size: 'medium'
    },
    {
      id: '6',
      title: t('hero.lifeEvents.newborn'),
      subtitle: t('hero.lifeEvents.newbornSub'),
      icon: <Baby className="h-4 w-4" />,
      bgGradient: 'from-green-500 to-emerald-600',
      textColor: 'text-white',
      size: 'small'
    },
    {
      id: '7',
      title: t('hero.lifeEvents.workStart'),
      subtitle: t('hero.lifeEvents.workStartSub'),
      icon: <Briefcase className="h-4 w-4" />,
      bgGradient: 'from-slate-500 to-gray-600',
      textColor: 'text-white',
      size: 'small'
    },
    {
      id: '8',
      title: t('hero.lifeEvents.valentine'),
      subtitle: t('hero.lifeEvents.valentineSub'),
      icon: <Heart className="h-5 w-5" />,
      bgGradient: 'from-pink-300 to-rose-400',
      textColor: 'text-slate-800',
      size: 'medium'
    },
    {
      id: '9',
      title: t('hero.lifeEvents.ramadan'),
      subtitle: t('hero.lifeEvents.ramadanSub'),
      icon: <Calendar className="h-6 w-6" />,
      bgGradient: 'from-indigo-500 to-purple-600',
      textColor: 'text-white',
      size: 'large'
    }
  ];
  return (
    <div className="relative container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
          {t('hero.welcomeTitle')}
        </h2>
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          {t('hero.welcomeSubtitle')}
        </p>
      </div>
      
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 auto-rows-auto">
          {LIFE_EVENTS.map((event) => (
            <div
              key={event.id}
              onClick={onTileClick}
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