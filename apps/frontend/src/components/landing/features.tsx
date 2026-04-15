'use client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowRight, Code, FileText, Layers, Palette, Zap } from 'lucide-react';

interface BentoGridItemProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const BentoGridItem = ({
  title,
  description,
  icon,
  className,
  size = 'small',
}: BentoGridItemProps) => {
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, damping: 25 },
    },
  };

  return (
    <motion.div
      variants={variants}
      className={cn(
        'group border-primary/10 bg-background hover:border-primary/30 relative flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border px-6 pt-6 pb-10 shadow-md transition-all duration-500',
        className,
      )}
    >
      <div className="absolute top-0 -right-1/2 z-0 size-full cursor-pointer bg-[linear-gradient(to_right,#3d16165e_1px,transparent_1px),linear-gradient(to_bottom,#3d16165e_1px,transparent_1px)] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-size-[24px_24px]"></div>

      <div className="text-primary/5 group-hover:text-primary/10 absolute right-1 bottom-3 scale-[6] transition-all duration-700 group-hover:scale-[6.2]">
        {icon}
      </div>

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <div className="bg-primary/10 text-primary shadow-primary/10 group-hover:bg-primary/20 group-hover:shadow-primary/20 mb-4 flex h-12 w-12 items-center justify-center rounded-full shadow transition-all duration-500">
            {icon}
          </div>
          <h3 className="mb-2 text-xl font-semibold tracking-tight">{title}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>

      </div>
      <div className="from-primary to-primary/30 absolute bottom-0 left-0 h-1 w-full bg-linear-to-r blur-2xl transition-all duration-500 group-hover:blur-lg" />
    </motion.div>
  );
};

const items = [
    {
        title: 'AI-Powered Clause Extraction',
        description:
            'Effortlessly identify and extract parties, key dates, obligations, and critical clauses from all your contracts. Our advanced AI pinpoints essential terms and summarizes complex documents—so you can focus on what matters most.',
        icon: <Zap className="size-6" />,
        size: 'large' as const,
    },
    {
        title: 'Human-in-the-Loop Review',
        description:
            'Never worry about AI confusion or ambiguity. If anything is unclear, Obligence invites a human review, letting your legal or business team make the final call—ensuring reliable results every time.',
        icon: <Layers className="size-6" />,
        size: 'small' as const,
    },
    {
        title: 'Real-Time Risk Analysis',
        description:
            'Stay ahead of potential issues with instant risk alerts. Obligence analyzes contracts for missing or risky clauses and highlights them for rapid action, helping you reduce exposure and make smarter decisions, fast.',
        icon: <Code className="size-6" />,
        size: 'medium' as const,
    },
    {
        title: 'Seamless Integration & Insights',
        description:
            'Connect Obligence with your workflow tools or export structured data with a click. Instantly generate easy-to-read reports and dashboards that empower your team, whether in legal, procurement, HR, or operations.',
        icon: <FileText className="size-6" />,
        size: 'medium' as const,
    },
];

export default function Features() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
              <div className="max-w-4xl mx-auto py-20 px-4 md:px-8 lg:px-10">
        <h2 className="text-lg md:text-7xl mb-4 max-w-4xl tracking-tighter text-balance ">
        Smart Features to Power Up Your <br/><span className="tracking-tighter text-balance text-transparent from-primary/10 via-foreground/85 to-foreground/50 bg-linear-to-tl bg-clip-text">Contract Management</span>
        </h2>
        <p className=" text-sm md:text-base max-w-sm">
Obligence combines advanced AI and dynamic analytics to make contract processing effortless. Discover the capabilities designed to save you time, reduce risk, and deliver instant clarity - for legal teams and every business professional.
        </p>
      </div>
      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
  

        {items.map((item, i) => (
          <BentoGridItem
            key={i}
            title={item.title}
            description={item.description}
            icon={item.icon}
            size={item.size}
            className={cn(
              item.size === 'large'
                ? 'col-span-4'
                : item.size === 'medium'
                  ? 'col-span-3'
                  : 'col-span-2',
              'h-full',
            )}
          />
        ))}
      </motion.div>
    </div>
  );
}
